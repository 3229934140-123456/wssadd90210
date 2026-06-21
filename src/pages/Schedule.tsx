import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { StatusTag } from '@/components/common/StatusTag';
import { mockAppointments, mockDoctors } from '@/mock';
import { useAuthStore } from '@/store/useAuthStore';
import { formatDateTime } from '@/utils/format';
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
} from 'lucide-react';

const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export default function Schedule() {
  const { user, hasPermission } = useAuthStore();
  const [currentWeek, setCurrentWeek] = useState(0);
  const [selectedDoctor, setSelectedDoctor] = useState(mockDoctors[0].id);

  const canManage = hasPermission(['admin', 'scheduler', 'storeManager']);

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
                {mockDoctors.map(d => (
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
              <h3 className="font-semibold text-gray-900 text-sm">今日预约</h3>
            </Card.Header>
            <Card.Body>
              <div className="space-y-2">
                {mockAppointments.slice(0, 3).map(apt => (
                  <div key={apt.id} className="p-2.5 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{apt.customerName}</span>
                      <StatusTag status={apt.status} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock size={12} />
                      <span>{apt.type}</span>
                    </div>
                  </div>
                ))}
              </div>
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
                          const hasAppointment = idx === 1 && time === '10:00';
                          const isAvailable = !(idx === 2 && time === '14:00');
                          
                          return (
                            <td key={idx} className={`px-2 py-2 ${isToday ? 'bg-teal-50/30' : ''}`}>
                              {hasAppointment ? (
                                <div className="p-2 bg-teal-100 border border-teal-200 rounded-md cursor-pointer hover:bg-teal-200/70 transition-colors">
                                  <div className="text-xs font-medium text-teal-800 truncate">陈小姐</div>
                                  <div className="text-[10px] text-teal-600 mt-0.5">全切双眼皮</div>
                                </div>
                              ) : isAvailable ? (
                                <div className="p-2 border border-dashed border-gray-200 rounded-md text-center text-gray-300 text-xs hover:border-teal-300 hover:bg-teal-50/30 cursor-pointer transition-all">
                                  可预约
                                </div>
                              ) : (
                                <div className="p-2 bg-gray-100 rounded-md text-center text-gray-400 text-xs">
                                  已约满
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
                  <span>已预约</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded border border-dashed border-gray-300" />
                  <span>可预约</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gray-100" />
                  <span>已约满</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
