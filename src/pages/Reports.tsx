import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/common/Card';
import { Table } from '@/components/common/Table';
import { Button } from '@/components/common/Button';
import { StatusTag } from '@/components/common/StatusTag';
import { mockStorePerformance, mockDailyStats, mockAlerts } from '@/mock';
import { useStoreStore } from '@/store/useStoreStore';
import {
  BarChart3,
  Download,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  MapPin,
  AlertTriangle,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#0f766e', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Reports() {
  const { stores } = useStoreStore();
  const [dateRange, setDateRange] = useState('week');
  const [selectedCity, setSelectedCity] = useState('');

  const cityData = stores.reduce((acc, store) => {
    const existing = acc.find(item => item.city === store.city);
    if (existing) {
      existing.value += store.currentLoad;
    } else {
      acc.push({ city: store.city, value: store.currentLoad });
    }
    return acc;
  }, [] as { city: string; value: number }[]);

  return (
    <PageContainer
      title="经营报表"
      subtitle="多维度数据分析，助力经营决策"
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter size={14} className="mr-1" />
            筛选
          </Button>
          <Button size="sm">
            <Download size={14} className="mr-1" />
            导出报表
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
            {[
              { value: 'today', label: '今日' },
              { value: 'week', label: '近7天' },
              { value: 'month', label: '近30天' },
              { value: 'quarter', label: '本季度' },
            ].map(item => (
              <button
                key={item.value}
                onClick={() => setDateRange(item.value)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  dateRange === item.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <select
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            className="h-9 px-3 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white"
          >
            <option value="">全部城市</option>
            {cityData.map(c => (
              <option key={c.city} value={c.city}>{c.city}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <Card.Body>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">总线索量</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {mockStorePerformance.reduce((sum, s) => sum + s.totalClues, 0)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <BarChart3 size={20} />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-sm">
                <TrendingUp size={14} className="text-emerald-500" />
                <span className="text-emerald-600 font-medium">+12.5%</span>
                <span className="text-gray-400">较上期</span>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">承接率</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {Math.round((mockStorePerformance.reduce((sum, s) => sum + s.acceptedCount, 0) /
                      mockStorePerformance.reduce((sum, s) => sum + s.totalClues, 0)) * 100)}%
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-sm">
                <TrendingUp size={14} className="text-emerald-500" />
                <span className="text-emerald-600 font-medium">+3.2%</span>
                <span className="text-gray-400">较上期</span>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">平均响应时间</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {Math.round(mockStorePerformance.reduce((sum, s) => sum + s.avgResponseTime, 0) / mockStorePerformance.length)} 分钟
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock size={20} />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-sm">
                <TrendingDown size={14} className="text-emerald-500" />
                <span className="text-emerald-600 font-medium">-1.5分钟</span>
                <span className="text-gray-400">较上期</span>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">到院转化率</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">28.6%</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Calendar size={20} />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3 text-sm">
                <TrendingUp size={14} className="text-emerald-500" />
                <span className="text-emerald-600 font-medium">+5.1%</span>
                <span className="text-gray-400">较上期</span>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <Card.Header>
              <h3 className="font-semibold text-gray-900">线索趋势</h3>
            </Card.Header>
            <Card.Body>
              <div className="h-72">
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
                    <Legend />
                    <Line type="monotone" dataKey="clueCount" name="新增线索" stroke="#0f766e" strokeWidth={2} dot={{ fill: '#0f766e', r: 3 }} />
                    <Line type="monotone" dataKey="acceptedCount" name="已承接" stroke="#14b8a6" strokeWidth={2} dot={{ fill: '#14b8a6', r: 3 }} />
                    <Line type="monotone" dataKey="visitedCount" name="到院数" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h3 className="font-semibold text-gray-900">城市分布</h3>
            </Card.Header>
            <Card.Body>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={cityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {cityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </div>

        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">门店经营排名</h3>
              <span className="text-xs text-gray-500">按承接量排序</span>
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Cell header className="w-10">排名</Table.Cell>
                  <Table.Cell header>门店名称</Table.Cell>
                  <Table.Cell header>城市</Table.Cell>
                  <Table.Cell header>总线索</Table.Cell>
                  <Table.Cell header>已承接</Table.Cell>
                  <Table.Cell header>承接率</Table.Cell>
                  <Table.Cell header>平均响应</Table.Cell>
                  <Table.Cell header>门店饱和度</Table.Cell>
                  <Table.Cell header>转派数</Table.Cell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {mockStorePerformance
                  .sort((a, b) => b.acceptedCount - a.acceptedCount)
                  .map((store, index) => (
                    <Table.Row key={store.storeId}>
                      <Table.Cell>
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                          index === 0 ? 'bg-amber-100 text-amber-700' :
                          index === 1 ? 'bg-gray-200 text-gray-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {index + 1}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-teal-500" />
                          <span className="text-sm font-medium text-gray-900">{store.storeName}</span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-gray-600">{store.city}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-gray-700">{store.totalClues}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm font-medium text-gray-900">{store.acceptedCount}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                            <div
                              className="h-full bg-teal-500 rounded-full"
                              style={{ width: `${(store.acceptedCount / store.totalClues) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {Math.round((store.acceptedCount / store.totalClues) * 100)}%
                          </span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className={`text-sm ${
                          store.avgResponseTime <= 15 ? 'text-emerald-600' :
                          store.avgResponseTime <= 30 ? 'text-amber-600' :
                          'text-red-600'
                        }`}>
                          {store.avgResponseTime} 分钟
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                            <div
                              className={`h-full rounded-full ${
                                store.saturationRate > 80 ? 'bg-red-500' :
                                store.saturationRate > 60 ? 'bg-amber-500' :
                                'bg-emerald-500'
                              }`}
                              style={{ width: `${store.saturationRate}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{store.saturationRate}%</span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-gray-600">{store.transferCount}</span>
                      </Table.Cell>
                    </Table.Row>
                  ))}
              </Table.Body>
            </Table>
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" />
                预警提醒
              </h3>
              <span className="text-xs text-red-500 font-medium">{mockAlerts.length} 条待处理</span>
            </div>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockAlerts.map(alert => (
                <div key={alert.id} className={`p-4 rounded-lg border ${
                  alert.level === 'danger' ? 'bg-red-50 border-red-200' :
                  'bg-amber-50 border-amber-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className={alert.level === 'danger' ? 'text-red-500' : 'text-amber-500'} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{alert.storeName}</span>
                        <StatusTag status={alert.level} />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    </div>
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
