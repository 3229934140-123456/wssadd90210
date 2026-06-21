import { PageContainer } from '@/components/layout/PageContainer';
import { StatCard } from '@/components/business/StatCard';
import { Card } from '@/components/common/Card';
import { StatusTag } from '@/components/common/StatusTag';
import { Button } from '@/components/common/Button';
import {
  Receipt,
  Clock,
  Users,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import { useClueStore } from '@/store/useClueStore';
import { useStoreStore } from '@/store/useStoreStore';
import { mockDailyStats, mockAlerts, mockStorePerformance } from '@/mock';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { timeAgo } from '@/utils/format';

export default function Dashboard() {
  const navigate = useNavigate();
  const { clues, getPendingCount } = useClueStore();
  const { stores } = useStoreStore();
  const { user, hasPermission } = useAuthStore();

  const storeId = user?.storeId;
  const filteredClues = storeId ? clues.filter(c => c.storeId === storeId) : clues;
  const pendingCount = getPendingCount(storeId);
  const todayCount = filteredClues.filter(c => new Date(c.createdAt).toDateString() === new Date().toDateString()).length;
  const acceptedCount = filteredClues.filter(c => c.status === 'accepted' || c.status === 'visited').length;
  const transferCount = filteredClues.filter(c => c.status === 'transferring').length;

  const isAdmin = hasPermission(['admin']);

  return (
    <PageContainer
      title="工作台"
      subtitle={`欢迎回来，${user?.name}！今天是 ${new Date().toLocaleDateString('zh-CN', { weekday: 'long', month: 'long', day: 'numeric' })}`}
      actions={
        <Button onClick={() => navigate('/clues')}>
          <Receipt size={16} className="mr-1.5" />
          查看线索池
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="今日新增线索"
            value={todayCount}
            icon={Receipt}
            trend={12.5}
            trendLabel="较昨日"
            color="teal"
          />
          <StatCard
            title="待承接线索"
            value={pendingCount}
            icon={Clock}
            trend={-5.2}
            trendLabel="较昨日"
            color="amber"
          />
          <StatCard
            title="已承接总数"
            value={acceptedCount}
            icon={Users}
            trend={8.3}
            trendLabel="较上周"
            color="blue"
          />
          <StatCard
            title="转派中"
            value={transferCount}
            icon={TrendingUp}
            trend={2.1}
            trendLabel="较昨日"
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <Card.Header>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">线索趋势</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">近7天</span>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockDailyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Line type="monotone" dataKey="clueCount" name="新增线索" stroke="#0f766e" strokeWidth={2} dot={{ fill: '#0f766e', r: 4 }} />
                    <Line type="monotone" dataKey="visitedCount" name="到院数" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">预警提醒</h3>
                <span className="text-xs text-red-500 font-medium">{mockAlerts.length}条</span>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="space-y-3">
                {mockAlerts.map(alert => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      alert.level === 'danger' ? 'bg-red-100 text-red-600' :
                      alert.level === 'warning' ? 'bg-amber-100 text-amber-600' :
                      'bg-emerald-100 text-emerald-600'
                    }`}>
                      <AlertTriangle size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 truncate">{alert.storeName}</span>
                        <StatusTag status={alert.level} />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{alert.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{timeAgo(alert.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </div>

        {isAdmin && (
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">门店经营概览</h3>
                <Button variant="ghost" size="sm" onClick={() => navigate('/reports')}>
                  查看报表
                  <ArrowRight size={14} className="ml-1" />
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockStorePerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis dataKey="storeName" type="category" tick={{ fontSize: 12 }} stroke="#9ca3af" width={120} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="totalClues" name="总线索" fill="#0f766e" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="acceptedCount" name="已承接" fill="#14b8a6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
                {stores.map(store => (
                  <div key={store.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={14} className="text-teal-600" />
                      <span className="text-sm font-medium text-gray-700 truncate">{store.name}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-lg font-semibold text-gray-900">{store.currentLoad}</span>
                      <span className="text-xs text-gray-400">/ {store.capacity}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2">
                      <div
                        className={`h-full rounded-full transition-all ${
                          (store.currentLoad / store.capacity) > 0.8 ? 'bg-red-500' :
                          (store.currentLoad / store.capacity) > 0.6 ? 'bg-amber-500' :
                          'bg-teal-500'
                        }`}
                        style={{ width: `${(store.currentLoad / store.capacity) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        )}

        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">最新线索</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/clues')}>
                查看全部
                <ArrowRight size={14} className="ml-1" />
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredClues.slice(0, 4).map(clue => (
                <div key={clue.id} className="p-4 border border-gray-100 rounded-lg hover:border-teal-200 hover:bg-teal-50/30 transition-all cursor-pointer" onClick={() => navigate(`/clues/${clue.id}`)}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{clue.customer.name}</span>
                    <StatusTag status={clue.status} />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{clue.project}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <MapPin size={12} />
                    <span>{clue.customer.city}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      </div>
    </PageContainer>
  );
}
