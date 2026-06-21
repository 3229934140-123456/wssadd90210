import { useParams, useNavigate } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { StatusTag } from '@/components/common/StatusTag';
import { Drawer } from '@/components/common/Drawer';
import { Modal } from '@/components/common/Modal';
import { useClueStore } from '@/store/useClueStore';
import { useStoreStore } from '@/store/useStoreStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppointmentStore } from '@/store/useAppointmentStore';
import { useTransferStore } from '@/store/useTransferStore';
import { useCustomerStore } from '@/store/useCustomerStore';
import { mockMessages, mockDoctors } from '@/mock';
import { formatPhone, formatDateTime, timeAgo } from '@/utils/format';
import type { AppointmentType, AppointmentTimeSlot } from '@/types';
import {
  ArrowLeft,
  Phone,
  MapPin,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Wrench,
  MessageSquare,
  FileText,
  Star,
  ArrowRightLeft,
  CalendarCheck,
  AlertCircle,
  Check,
  X,
  Store,
  Shield,
  GitBranch,
  CalendarDays,
  Link,
  Layers,
} from 'lucide-react';
import { useState } from 'react';

export default function ClueDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClueById, acceptClue } = useClueStore();
  const { getStoreById, stores } = useStoreStore();
  const { user, hasPermission } = useAuthStore();
  const { createAppointment } = useAppointmentStore();
  const { createTransfer } = useTransferStore();
  const { getCustomerArchive, getEffectiveCustomerId } = useCustomerStore();
  const [showScheduleDrawer, setShowScheduleDrawer] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<AppointmentTimeSlot | ''>('');
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('consult');
  const [appointmentNotes, setAppointmentNotes] = useState('');

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferStoreId, setTransferStoreId] = useState('');
  const [transferReason, setTransferReason] = useState('');

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const clue = getClueById(id || '');
  const store = clue ? getStoreById(clue.storeId) : null;
  const customerArchive = clue ? getCustomerArchive(clue.customerId) : null;

  const sourceLabel = (p: string) => p === 'meituan' ? '美团' : p === 'xinyang' ? '新氧' : p;

  if (!clue) {
    return (
      <PageContainer title="线索详情">
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <AlertCircle size={48} className="mb-3" />
          <p>线索不存在</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/clues')}>
            返回线索池
          </Button>
        </div>
      </PageContainer>
    );
  }

  const canAccept = clue.status === 'pending' && hasPermission(['consultant', 'storeManager']);
  const canTransfer = clue.status !== 'lost' && clue.status !== 'transferring' && hasPermission(['consultant', 'storeManager']);
  const canSchedule = clue.status === 'accepted' && hasPermission(['scheduler', 'storeManager', 'admin']);

  const handleAccept = () => {
    acceptClue(clue.id, user?.name || '咨询师');
  };

  const availableDoctors = mockDoctors.filter(d => d.storeId === clue.storeId);

  const timeSlots: AppointmentTimeSlot[] = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  const handleConfirmAppointment = () => {
    if (!selectedDoctor) { alert('请选择医生'); return; }
    if (!selectedDate) { alert('请选择预约日期'); return; }
    if (!selectedTimeSlot) { alert('请选择预约时段'); return; }

    const doctor = mockDoctors.find(d => d.id === selectedDoctor);
    const appointment = createAppointment({
      clueId: clue.id,
      customerName: clue.customer.name,
      customerPhone: clue.customer.phone,
      storeId: clue.storeId,
      doctorId: selectedDoctor,
      doctorName: doctor?.name || '医生',
      date: selectedDate,
      timeSlot: selectedTimeSlot as AppointmentTimeSlot,
      type: appointmentType,
      notes: appointmentNotes || undefined,
      designatedDoctor: clue.designatedDoctor,
      designatedEquipment: clue.designatedEquipment,
    }, user?.name || '排班员');

    setSuccessMessage(`预约成功！${doctor?.name} 医生 ${selectedDate} ${selectedTimeSlot}`);
    setShowScheduleDrawer(false);
    setShowSuccessModal(true);

    setSelectedDoctor('');
    setSelectedDate('');
    setSelectedTimeSlot('');
    setAppointmentType('consult');
    setAppointmentNotes('');
  };

  const handleConfirmTransfer = () => {
    if (!transferStoreId || !transferReason) {
      alert('请填写完整转派信息');
      return;
    }
    const fromStore = getStoreById(clue.storeId);
    const toStore = getStoreById(transferStoreId);
    if (!fromStore || !toStore) return;

    createTransfer({
      clueId: clue.id,
      clue,
      fromStoreId: fromStore.id,
      fromStoreName: fromStore.name,
      toStoreId: toStore.id,
      toStoreName: toStore.name,
      reason: transferReason,
    });

    setSuccessMessage(`已申请转派至 ${toStore.name}，等待审批中`);
    setShowTransferModal(false);
    setShowSuccessModal(true);
  };

  return (
    <PageContainer
      title="线索详情"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/clues')}>
            <ArrowLeft size={14} className="mr-1" />
            返回
          </Button>
          {canAccept && (
            <Button size="sm" onClick={handleAccept}>
              <Star size={14} className="mr-1" />
              立即承接
            </Button>
          )}
          {canTransfer && (
            <Button variant="outline" size="sm" onClick={() => setShowTransferModal(true)}>
              <ArrowRightLeft size={14} className="mr-1" />
              申请转派
            </Button>
          )}
          {canSchedule && (
            <Button size="sm" onClick={() => setShowScheduleDrawer(true)}>
              <CalendarCheck size={14} className="mr-1" />
              预约到院
            </Button>
          )}
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <Card.Header>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <User size={16} className="text-teal-600" />
                客户信息
              </h3>
            </Card.Header>
            <Card.Body>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-xl font-medium">
                  {clue.customer.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{clue.customer.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusTag status={clue.customer.sourcePlatform} />
                    {clue.customer.isDuplicate && (
                      <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded border border-red-200">
                        重复客户
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-gray-700">{formatPhone(clue.customer.phone)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-gray-700">{clue.customer.city}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-gray-700">{clue.customer.age}岁 · {clue.customer.gender === 'female' ? '女' : '男'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-gray-500">{timeAgo(clue.createdAt)} 创建</span>
                </div>
              </div>
            </Card.Body>
          </Card>

          {customerArchive && customerArchive.duplicateIds.length > 0 && (
            <Card>
              <Card.Header>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Shield size={16} className="text-teal-600" />
                  合并档案
                  <span className="text-xs font-normal text-gray-400 ml-1">
                    已聚合 {customerArchive.allCustomerIds.length} 条客户记录
                  </span>
                </h3>
              </Card.Header>
              <Card.Body>
                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-gray-500">来源平台</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {customerArchive.sources.map(s => (
                        <span key={s} className={`px-2 py-0.5 text-xs font-medium rounded ${
                          s === 'meituan' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 'bg-pink-50 text-pink-700 border border-pink-200'
                        }`}>
                          {sourceLabel(s)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                    <div className="text-center p-2 bg-gray-50 rounded-md">
                      <FileText size={14} className="text-teal-600 mx-auto mb-1" />
                      <p className="text-lg font-semibold text-gray-900">{customerArchive.clueCount}</p>
                      <p className="text-[10px] text-gray-500">线索</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-md">
                      <GitBranch size={14} className="text-amber-600 mx-auto mb-1" />
                      <p className="text-lg font-semibold text-gray-900">{customerArchive.transferCount}</p>
                      <p className="text-[10px] text-gray-500">转派</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-md">
                      <CalendarDays size={14} className="text-emerald-600 mx-auto mb-1" />
                      <p className="text-lg font-semibold text-gray-900">{customerArchive.appointmentCount}</p>
                      <p className="text-[10px] text-gray-500">预约</p>
                    </div>
                  </div>

                  {customerArchive.clues.length > 1 && (
                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500 block mb-1.5">关联线索</span>
                      {customerArchive.clues.slice(0, 5).map(c => (
                        <div key={c.id} className="flex items-center gap-2 text-xs py-1 border-b border-gray-50 last:border-0">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                            c.customer.sourcePlatform === 'meituan' ? 'bg-yellow-50 text-yellow-700' : 'bg-pink-50 text-pink-700'
                          }`}>
                            {sourceLabel(c.customer.sourcePlatform)}
                          </span>
                          <span className="text-gray-700">{c.project}</span>
                          <span className="text-gray-400 ml-auto">{c.customer.city}</span>
                        </div>
                      ))}
                      {customerArchive.clues.length > 5 && (
                        <div className="text-xs text-gray-400 pt-1">还有 {customerArchive.clues.length - 5} 条...</div>
                      )}
                    </div>
                  )}

                  {customerArchive.transfers.length > 0 && (
                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500 block mb-1.5">转派记录</span>
                      {customerArchive.transfers.slice(0, 3).map(t => (
                        <div key={t.id} className="flex items-center gap-2 text-xs py-1 border-b border-gray-50 last:border-0">
                          <GitBranch size={10} className="text-amber-500" />
                          <span className="text-gray-600">{t.fromStoreName} → {t.toStoreName}</span>
                          <StatusTag status={t.status} />
                        </div>
                      ))}
                    </div>
                  )}

                  {customerArchive.appointments.length > 0 && (
                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500 block mb-1.5">预约记录</span>
                      {customerArchive.appointments.slice(0, 3).map(a => (
                        <div key={a.id} className="flex items-center gap-2 text-xs py-1 border-b border-gray-50 last:border-0">
                          <CalendarDays size={10} className="text-emerald-500" />
                          <span className="text-gray-600">{a.doctorName} {a.date} {a.timeSlot}</span>
                          <StatusTag status={a.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          )}

          <Card>
            <Card.Header>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FileText size={16} className="text-teal-600" />
                咨询信息
              </h3>
            </Card.Header>
            <Card.Body>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500">意向项目</span>
                  <p className="text-base font-medium text-gray-900 mt-1">{clue.project}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">意向程度</span>
                  <div className="mt-1">
                    <StatusTag status={clue.intentionLevel} />
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-500">线索状态</span>
                  <div className="mt-1">
                    <StatusTag status={clue.status} />
                  </div>
                </div>
                {clue.consultantName && (
                  <div>
                    <span className="text-xs text-gray-500">承接咨询师</span>
                    <p className="text-sm text-gray-900 mt-1">{clue.consultantName}</p>
                  </div>
                )}
                {clue.responseTime && (
                  <div>
                    <span className="text-xs text-gray-500">响应时间</span>
                    <p className="text-sm text-emerald-600 mt-1 font-medium">{clue.responseTime} 分钟</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Star size={16} className="text-teal-600" />
                顾客偏好
              </h3>
            </Card.Header>
            <Card.Body>
              <div className="flex flex-wrap gap-2">
                {clue.preferences.map(pref => (
                  <span key={pref} className="px-2.5 py-1 text-xs font-medium bg-teal-50 text-teal-700 rounded-full border border-teal-200">
                    {pref}
                  </span>
                ))}
              </div>
            </Card.Body>
          </Card>

          {(clue.designatedDoctor || clue.designatedEquipment) && (
            <Card>
              <Card.Header>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Stethoscope size={16} className="text-teal-600" />
                  指定需求
                </h3>
              </Card.Header>
              <Card.Body>
                <div className="space-y-2">
                  {clue.designatedDoctor && (
                    <div className="flex items-center gap-2 text-sm">
                      <Stethoscope size={14} className="text-amber-500" />
                      <span className="text-gray-700">指定医生：{clue.designatedDoctor}</span>
                    </div>
                  )}
                  {clue.designatedEquipment && (
                    <div className="flex items-center gap-2 text-sm">
                      <Wrench size={14} className="text-amber-500" />
                      <span className="text-gray-700">指定设备：{clue.designatedEquipment}</span>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          )}

          <Card>
            <Card.Header>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <MapPin size={16} className="text-teal-600" />
                归属门店
              </h3>
            </Card.Header>
            <Card.Body>
              {store ? (
                <div>
                  <p className="text-sm font-medium text-gray-900">{store.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{store.address}</p>
                  <p className="text-xs text-gray-400 mt-2">店长：{store.manager} · {store.phone}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-400">暂无门店信息</p>
              )}
            </Card.Body>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <Card.Header>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare size={16} className="text-teal-600" />
                  聊天记录
                </h3>
                <span className="text-xs text-gray-400">{mockMessages.length} 条消息</span>
              </div>
            </Card.Header>
            <Card.Body className="flex-1 overflow-hidden">
              <div className="space-y-4 h-full overflow-y-auto pr-2">
                {mockMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.senderType === 'customer' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] ${msg.senderType === 'customer' ? 'order-2' : 'order-1'}`}>
                      <div className={`text-xs text-gray-400 mb-1 ${msg.senderType === 'customer' ? 'text-left' : 'text-right'}`}>
                        {msg.sender} · {msg.timestamp}
                      </div>
                      <div
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.senderType === 'customer'
                            ? 'bg-gray-100 text-gray-800 rounded-bl-sm'
                            : 'bg-teal-600 text-white rounded-br-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
            <Card.Footer>
              <div className="flex items-end gap-2">
                <textarea
                  placeholder="输入回复内容..."
                  rows={2}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 resize-none"
                />
                <Button className="h-auto py-2">发送</Button>
              </div>
            </Card.Footer>
          </Card>
        </div>
      </div>

      <Drawer
        isOpen={showScheduleDrawer}
        onClose={() => setShowScheduleDrawer(false)}
        title="预约到院"
        width="w-[440px]"
      >
        <div className="p-5 space-y-5">
          {(clue.designatedDoctor || clue.designatedEquipment) && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="text-sm font-medium text-amber-800 mb-1">客户有指定需求</div>
              <div className="space-y-1">
                {clue.designatedDoctor && (
                  <div className="flex items-center gap-2 text-xs text-amber-700">
                    <Stethoscope size={12} />
                    指定医生：{clue.designatedDoctor}（已自动带入预约信息）
                  </div>
                )}
                {clue.designatedEquipment && (
                  <div className="flex items-center gap-2 text-xs text-amber-700">
                    <Wrench size={12} />
                    指定设备：{clue.designatedEquipment}（已自动带入预约信息）
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">选择医生</label>
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {availableDoctors.map(doctor => (
                <button
                  key={doctor.id}
                  onClick={() => setSelectedDoctor(doctor.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                    selectedDoctor === doctor.id
                      ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-500/20'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${
                    clue.designatedDoctor && doctor.name.includes(clue.designatedDoctor)
                      ? 'ring-2 ring-amber-300 border-amber-400'
                      : ''
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-sm font-medium">
                    {doctor.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{doctor.name}</span>
                      {clue.designatedDoctor && doctor.name.includes(clue.designatedDoctor) && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded border border-amber-200">
                          指定
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{doctor.title} · {doctor.specialty}</div>
                  </div>
                  {selectedDoctor === doctor.id && (
                    <Check size={18} className="text-teal-600" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">预约日期</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">预约时段</label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map(time => (
                <button
                  key={time}
                  onClick={() => setSelectedTimeSlot(time)}
                  className={`py-2 text-xs border rounded-md transition-colors ${
                    selectedTimeSlot === time
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'border-gray-200 hover:border-teal-500 hover:text-teal-600'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">预约类型</label>
            <select
              value={appointmentType}
              onChange={e => setAppointmentType(e.target.value as AppointmentType)}
              className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white"
            >
              <option value="consult">到院咨询</option>
              <option value="treatment">治疗预约</option>
              <option value="surgery">手术预约</option>
              <option value="review">复查</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">备注</label>
            <textarea
              value={appointmentNotes}
              onChange={e => setAppointmentNotes(e.target.value)}
              rows={3}
              placeholder="请输入预约备注..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 resize-none"
            />
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-2">
            <Button className="w-full" onClick={handleConfirmAppointment}>
              <CalendarCheck size={16} className="mr-1.5" />
              确认预约
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setShowScheduleDrawer(false)}>
              取消
            </Button>
          </div>
        </div>
      </Drawer>

      <Modal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        title="申请转派"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowTransferModal(false)}>取消</Button>
            <Button onClick={handleConfirmTransfer}>确认转派</Button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">转派至门店</label>
            <select
              value={transferStoreId}
              onChange={e => setTransferStoreId(e.target.value)}
              className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white"
            >
              <option value="">请选择目标门店</option>
              {stores
                .filter(s => s.id !== clue.storeId)
                .map(store => (
                  <option key={store.id} value={store.id}>
                    {store.name} - {store.city}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">转派原因</label>
            <textarea
              value={transferReason}
              onChange={e => setTransferReason(e.target.value)}
              rows={3}
              placeholder="请输入转派原因..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 resize-none"
            />
          </div>

          <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-sm text-teal-700">
            <Store size={16} className="inline mr-2" />
            提交后聊天摘要、顾客偏好、指定医生/设备将自动同步至目标门店
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="操作成功"
        size="sm"
        footer={
          <Button onClick={() => setShowSuccessModal(false)}>确定</Button>
        }
      >
        <div className="flex items-center gap-3 py-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <Check size={24} className="text-emerald-600" />
          </div>
          <p className="text-sm text-gray-700">{successMessage}</p>
        </div>
      </Modal>
    </PageContainer>
  );
}
