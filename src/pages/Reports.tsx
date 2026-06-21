import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/common/Card';
import { Table } from '@/components/common/Table';
import { Button } from '@/components/common/Button';
import { StatusTag } from '@/components/common/StatusTag';
import { Modal } from '@/components/common/Modal';
import { mockStorePerformance, mockDailyStats, mockAlerts } from '@/mock';
import { useStoreStore } from '@/store/useStoreStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useExportStore } from '@/store/useExportStore';
import type { ExportType } from '@/types';
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
  Shield,
  Check,
  FileText,
  Lock,
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
  const { user } = useAuthStore();
  const { canExport, requestExport, pendingRequests } = useExportStore();
  const [dateRange, setDateRange] = useState('week');
  const [selectedCity, setSelectedCity] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [exportReason, setExportReason] = useState('');

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
          <Button size="sm" onClick={() => setShowExportModal(true)}>
            <Download size={14} className="mr-1" />
            导出报表
            {pendingRequests.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-amber-500 text-white rounded-full">
                {pendingRequests.length}
              </span>
            )}
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

      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="导出经营报表"
        size="md"
      >
        {(() => {
          const reportsPermission = canExport('reports', user?.role);
          const cluesPermission = canExport('clues', user?.role);
          const customersPermission = canExport('customers', user?.role);

          const handleExport = (type: ExportType, perm: { canExport: boolean; requireApproval: boolean; reason: string }) => {
            if (!perm.canExport) {
              alert(perm.reason);
              return;
            }
            if (perm.requireApproval && !exportReason.trim()) {
              alert('请填写导出原因');
              return;
            }
            const result = requestExport({
              type,
              reason: exportReason,
              requesterName: user?.name || '用户',
              requesterRole: user?.role || 'consultant',
              storeId: user?.storeId,
            });
            if (result.approved) {
              setSuccessMessage('导出成功！已按数据安全规范对敏感字段进行脱敏处理');
            } else {
              setSuccessMessage('已提交导出申请，等待总部审批');
            }
            setShowExportModal(false);
            setShowSuccessModal(true);
            setExportReason('');
          };

          return (
            <div className="space-y-4">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg flex items-start gap-2">
                <Shield size={18} className="text-teal-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-teal-700">
                  <p className="font-medium">数据安全提示</p>
                  <p className="mt-0.5">涉及客户手机号、聊天内容等敏感信息时，系统将自动脱敏或需审批后导出</p>
                </div>
              </div>

              {!reportsPermission.canExport && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-2">
                  <Lock size={14} />
                  {reportsPermission.reason}
                </div>
              )}

              {reportsPermission.canExport && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">导出类型</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { type: 'reports' as ExportType, label: '经营报表', icon: BarChart3, perm: reportsPermission, desc: '统计数据' },
                        { type: 'clues' as ExportType, label: '线索明细', icon: FileText, perm: cluesPermission, desc: '含客户信息' },
                        { type: 'customers' as ExportType, label: '客户档案', icon: Shield, perm: customersPermission, desc: '高敏感数据' },
                      ].map(item => (
                        <button
                          key={item.type}
                          onClick={() => handleExport(item.type, item.perm)}
                          disabled={!item.perm.canExport}
                          className={`p-4 rounded-lg border text-left transition-all ${
                            item.perm.canExport
                              ? 'border-gray-200 hover:border-teal-400 hover:bg-teal-50/50'
                              : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <item.icon size={20} className="text-teal-600 mb-2" />
                          <div className="text-sm font-medium text-gray-900">{item.label}</div>
                          <div className="text-[11px] text-gray-500 mt-0.5">{item.desc}</div>
                          {item.perm.requireApproval && item.perm.canExport && (
                            <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-600">
                              <Lock size={10} />
                              需审批
                            </div>
                          )}
                          {!item.perm.canExport && (
                            <div className="mt-2 flex items-center gap-1 text-[10px] text-red-500">
                              <Lock size={10} />
                              无权限
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(reportsPermission.requireApproval || cluesPermission.requireApproval) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">导出原因（申请必填）</label>
                      <textarea
                        value={exportReason}
                        onChange={e => setExportReason(e.target.value)}
                        rows={3}
                        placeholder="请详细说明导出用途和使用范围..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 resize-none"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button variant="outline" onClick={() => setShowExportModal(false)}>取消</Button>
              </div>
            </div>
          );
        })()}
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
