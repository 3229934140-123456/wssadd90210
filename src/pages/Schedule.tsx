import { useState, useMemo } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { StatusTag } from '@/components/common/StatusTag';
import { Modal } from '@/components/common/Modal';
import { mockDoctors } from '@/mock';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppointmentStore } from '@/store/useAppointmentStore';
import { formatDateTime, formatPhone } from '@/utils/format';
import type { Appointment, AppointmentStatus } from '@/types';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Stethoscope,
  Plus,
  CalendarCheck,
  X,
  Check,
  Wrench,
  Phone,
  FileText,
} from 'lucide-react';

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
const typeText: Record<string, string> = {
  consult: '到院咨询',
  treatment: '治疗预约',
  surgery: '手术预约',
  review: '复查',
};
const typeColor: Record<string, string> = {
  consult: 'bg-teal-100 border-teal-200 text-teal-800',
  treatment: 'bg-blue-100 border-blue-200 text-blue-800',
  surgery: 'bg-purple-100 border-purple-200 text-purple-800',
  review: 'bg-amber-100 border-amber-200 text-amber-800',
};

export default function Schedule() {
  const { user, hasPermission } = useAuthStore();
  const { appointments, getAppointmentsByDoctorAndDate, getTodayAppointments, updateAppointmentStatus } = useAppointmentStore();
  const [currentWeek, setCurrentWeek] = useState(0);
  const [selectedDoctor, setSelectedDoctor] = useState(mockDoctors[0].id);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const canManage = hasPermission(['admin', 'scheduler', 'storeManager']);
  const storeId = user?.storeId;
  const isAdmin = hasPermission(['admin']);

  const displayDoctors = useMemo(() => {
    if (isAdmin) return mockDoctors;
    return mockDoctors.filter(d => d.storeId === storeId);
  }, [isAdmin, storeId]);

  const getWeekDates = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    const day = today.getDay() || 7;
    startOfWeek.setDate(today.getDate() - day + 1 + currentWeek * 7);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  const doctor = mockDoctors.find(d => d.id === selectedDoctor);
  const todayAppointments = getTodayAppointments(storeId || undefined);

  const formatDateStr = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const handleCellClick = (date: Date, time: string) => {
    const dateStr = formatDateStr(date);
    const appointment = getAppointmentsByDoctorAndDate(selectedDoctor, dateStr)
      .find(a => a.timeSlot === time && a.status !== 'cancelled');
    if (appointment) {
      setSelectedAppointment(appointment);
      setShowDetailModal(true);
    }
  };

  const handleUpdateStatus = (status: AppointmentStatus) => {
    if (!selectedAppointment) return;
    updateAppointmentStatus(selectedAppointment.id, status, user?.name || '操作人');
    setShowDetailModal(false);
  };

  return (
    <PageContainer
      title="预约排班"
      subtitle="管理医生档期和顾客预约"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <CalendarCheck size={14} className="mr-1" />
            预约列表
          </Button>
          {canManage && (
            <Button size="sm">
              <Plus size={14} className="mr-1" />
              新增预约
            </Button>
          )}
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <Card.Header>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Stethoscope size={16} className="text-teal-600" />
                医生列表
              </h3>
            </Card.Header>
            <Card.Body className="p-2">
              <div className="space-y-1">
                {displayDoctors.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDoctor(d.id)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all ${
                      selectedDoctor === d.id
                        ? 'bg-teal-50 border border-teal-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      {d.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{d.name}</div>
                      <div className="text-xs text-gray-500 truncate">{d.title} · {d.specialty}</div>
                    </div>
                  </button>
                ))}
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h3 className="font-semibold text-gray-900 text-sm">今日预约 ({todayAppointments.length})</h3>
            </Card.Header>
            <Card.Body>
              {todayAppointments.length === 0 ? (
                <div className="py-4 text-center text-xs text-gray-400">
                  <CalendarDays size={20} className="mx-auto mb-1 opacity-30" />
                  今日暂无预约
                </div>
              ) : (
                <div className="space-y-2">
                  {todayAppointments.map(apt => (
                    <div
                      key={apt.id}
                      onClick={() => { setSelectedAppointment(apt); setShowDetailModal(true); }}
                      className="p-2.5 bg-gray-50 rounded-lg cursor-pointer hover:bg-teal-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{apt.customerName}</span>
                        <StatusTag status={apt.status} />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>{apt.timeSlot} · {typeText[apt.type]}</span>
                      </div>
                      {(apt.designatedDoctor || apt.designatedEquipment) && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {apt.designatedDoctor && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded border border-amber-200">
                              指定医生
                            </span>
                          )}
                          {apt.designatedEquipment && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded border border-amber-200">
                              指定设备
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="h-full">
            <Card.Header>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900">{doctor?.name} · 排班表</h3>
                  <span className="text-xs text-gray-500">{doctor?.title} · {doctor?.specialty}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setCurrentWeek(currentWeek - 1)}>
                    <ChevronLeft size={16} />
                  </Button>
                  <span className="text-sm text-gray-700 font-medium min-w-[120px] text-center">
                    {weekDates[0].getMonth() + 1}月{weekDates[0].getDate()}日 - {weekDates[6].getMonth() + 1}月{weekDates[6].getDate()}日
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentWeek(currentWeek + 1)}>
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                        时间
                      </th>
                      {weekDates.map((date, idx) => {
                        const isToday = date.toDateString() === new Date().toDateString();
                        return (
                          <th key={idx} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                            <div>{weekDays[idx]}</div>
                            <div className={`text-sm mt-1 ${isToday ? 'text-teal-600 font-semibold' : 'text-gray-900'}`}>
                              {date.getMonth() + 1}/{date.getDate()}
                              {isToday && <span className="ml-1 text-xs">今天</span>}
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {timeSlots.map(time => (
                      <tr key={time}>
                        <td className="px-4 py-4 text-xs text-gray-500 bg-gray-50/50">
                          {time}
                        </td>
                        {weekDates.map((date, idx) => {
                          const isToday = date.toDateString() === new Date().toDateString();
                          const dateStr = formatDateStr(date);
                          const aptList = getAppointmentsByDoctorAndDate(selectedDoctor, dateStr);
                          const apt = aptList.find(a => a.timeSlot === time && a.status !== 'cancelled');
                          
                          return (
                            <td key={idx} className={`px-2 py-2 ${isToday ? 'bg-teal-50/30' : ''}`}>
                              {apt ? (
                                <div
                                  onClick={() => handleCellClick(date, time)}
                                  className={`p-2 border rounded-md cursor-pointer hover:opacity-80 transition-opacity ${typeColor[apt.type]}`}
                                >
                                  <div className="flex items-center justify-between mb-0.5">
                                    <div className="text-xs font-medium truncate">{apt.customerName}</div>
                                    {apt.status === 'completed' && <Check size={12} />}
                                    {apt.status === 'cancelled' && <X size={12} />}
                                  </div>
                                  <div className="text-[10px] opacity-75 mt-0.5 line-clamp-1">
                                    {typeText[apt.type]}
                                  </div>
                                  {(apt.designatedDoctor || apt.designatedEquipment) && (
                                    <div className="mt-1 w-2 h-2 rounded-full bg-amber-400" />
                                  )}
                                </div>
                              ) : (
                                <div className="p-2 border border-dashed border-gray-200 rounded-md text-center text-gray-300 text-xs hover:border-teal-300 hover:bg-teal-50/30 cursor-pointer transition-all">
                                  可预约
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-gray-100 flex items-center gap-6 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-teal-100 border border-teal-200" />
                  <span>咨询</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200" />
                  <span>治疗</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-purple-100 border border-purple-200" />
                  <span>手术</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>有指定需求</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded border border-dashed border-gray-300" />
                  <span>可预约</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="预约详情"
        size="md"
        footer={
          selectedAppointment?.status === 'scheduled' && canManage ? (
            <>
              <Button variant="outline" onClick={() => handleUpdateStatus('cancelled')}>
                <X size={14} className="mr-1" />
                取消预约
              </Button>
              <Button onClick={() => handleUpdateStatus('completed')}>
                <Check size={14} className="mr-1" />
                标记已到院
              </Button>
            </>
          ) : (
            <Button onClick={() => setShowDetailModal(false)}>关闭</Button>
          )
        }
      >
        {selectedAppointment && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-lg font-medium">
                {selectedAppointment.customerName.charAt(0)}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{selectedAppointment.customerName}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <StatusTag status={selectedAppointment.status} />
                  <span className="text-xs text-gray-500">{formatDateTime(selectedAppointment.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-gray-400" />
                <span className="text-gray-500">手机号：</span>
                <span className="text-gray-900 font-medium">{formatPhone(selectedAppointment.customerPhone)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope size={14} className="text-gray-400" />
                <span className="text-gray-500">医生：</span>
                <span className="text-gray-900 font-medium">{selectedAppointment.doctorName}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays size={14} className="text-gray-400" />
                <span className="text-gray-500">日期：</span>
                <span className="text-gray-900 font-medium">{selectedAppointment.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-gray-400" />
                <span className="text-gray-500">时段：</span>
                <span className="text-gray-900 font-medium">{selectedAppointment.timeSlot}</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <FileText size={14} className="text-gray-400" />
                <span className="text-gray-500">类型：</span>
                <span className={`px-2 py-0.5 text-xs rounded border ${typeColor[selectedAppointment.type]}`}>
                  {typeText[selectedAppointment.type]}
                </span>
              </div>
            </div>

            {(selectedAppointment.designatedDoctor || selectedAppointment.designatedEquipment) && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1.5">
                <div className="text-xs font-medium text-amber-800 mb-1">客户指定需求</div>
                {selectedAppointment.designatedDoctor && (
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <Stethoscope size={14} />
                    指定医生：{selectedAppointment.designatedDoctor}
                  </div>
                )}
                {selectedAppointment.designatedEquipment && (
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <Wrench size={14} />
                    指定设备：{selectedAppointment.designatedEquipment}
                  </div>
                )}
              </div>
            )}

            {selectedAppointment.notes && (
              <div>
                <div className="text-xs text-gray-500 mb-1">预约备注</div>
                <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded-md border border-gray-200">
                  {selectedAppointment.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </PageContainer>
  );
}
