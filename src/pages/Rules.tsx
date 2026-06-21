import { useState, useMemo } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/common/Card';
import { Table } from '@/components/common/Table';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { useRuleStore } from '@/store/useRuleStore';
import { useStoreStore } from '@/store/useStoreStore';
import { cities, projects } from '@/mock';
import {
  Settings,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  Shield,
  GripVertical,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Search,
  Building2,
  BarChart3,
  CheckCircle,
  Eye,
  Layers,
  TrendingUp,
} from 'lucide-react';
import type { Rule, Store } from '@/types';

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

const getSaturationScore = (rate: number) => {
  if (rate < 40) return { label: '低', color: 'emerald', value: rate };
  if (rate < 70) return { label: '中', color: 'amber', value: rate };
  return { label: '高', color: 'red', value: rate };
};

export default function Rules() {
  const { rules, addRule, updateRule, deleteRule, getRuleByCityAndProject } = useRuleStore();
  const { stores } = useStoreStore();
  const [activeTab, setActiveTab] = useState<'assignment' | 'transfer' | 'security'>('assignment');
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [formData, setFormData] = useState({
    city: '',
    project: '',
    defaultStoreId: '',
    autoAssignRadius: 5,
    requireApproval: false,
    responseTimeLimit: 30,
  });

  const [simCity, setSimCity] = useState('北京');
  const [simProject, setSimProject] = useState('光子嫩肤');

  const handleAdd = () => {
    setEditingRule(null);
    setFormData({
      city: '',
      project: '',
      defaultStoreId: '',
      autoAssignRadius: 5,
      requireApproval: false,
      responseTimeLimit: 30,
    });
    setShowModal(true);
  };

  const handleEdit = (rule: Rule) => {
    setEditingRule(rule);
    setFormData({
      city: rule.city,
      project: rule.project,
      defaultStoreId: rule.defaultStoreId,
      autoAssignRadius: rule.autoAssignRadius,
      requireApproval: rule.requireApproval,
      responseTimeLimit: rule.responseTimeLimit,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    const defaultStoreName = stores.find(s => s.id === formData.defaultStoreId)?.name || '';
    
    if (editingRule) {
      updateRule(editingRule.id, { ...formData, defaultStoreName });
    } else {
      addRule({ ...formData, defaultStoreName });
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条规则吗？')) {
      deleteRule(id);
    }
  };

  const simResult = useMemo(() => {
    const rule = getRuleByCityAndProject(simCity, simProject);
    const sameCityStores = stores.filter(s => s.city === simCity);
    if (sameCityStores.length === 0) return [];

    const centerLat = sameCityStores.reduce((s, x) => s + x.lat, 0) / sameCityStores.length;
    const centerLng = sameCityStores.reduce((s, x) => s + x.lng, 0) / sameCityStores.length;

    const mapped = sameCityStores.map(store => {
      const distance = Math.max(0.1, Math.round(calculateDistance(centerLat, centerLng, store.lat, store.lng) * 10) / 10);
      const saturation = (store.id === 's1' ? 64 : store.id === 's2' ? 70 : store.id === 's3' ? 75 : store.id === 's4' ? 67 : store.id === 's5' ? 69 : 84) as number;
      const isDefault = rule?.defaultStoreId === store.id;
      let score = 0;
      const reasons: string[] = [];
      if (isDefault) { score += 100; reasons.push('总部规则指定默认门店'); }
      if (distance < 2) { score += 50; reasons.push('距离最近'); }
      else if (distance < rule?.autoAssignRadius) { score += 30; reasons.push('在分配半径内'); }
      if (saturation < 50) { score += 30; reasons.push('饱和度低承接能力强'); }
      else if (saturation < 70) { score += 15; reasons.push('饱和度适中'); }
      else { score += 0; reasons.push('饱和度较高'); }

      return {
        store,
        distance,
        saturation,
        isDefault,
        score,
        reasons,
      };
    });

    return mapped.sort((a, b) => b.score - a.score);
  }, [simCity, simProject, stores, getRuleByCityAndProject]);

  const matchedRule = getRuleByCityAndProject(simCity, simProject);

  return (
    <PageContainer
      title="总部规则"
      subtitle="配置线索分配、转派审批和数据安全规则"
      actions={
        activeTab === 'assignment' && (
          <Button onClick={handleAdd}>
            <Plus size={14} className="mr-1" />
            新增规则
          </Button>
        )
      }
    >
      <Card>
        <Card.Header className="py-3">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('assignment')}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'assignment'
                  ? 'text-teal-600 border-teal-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              <MapPin size={16} />
              分配规则
            </button>
            <button
              onClick={() => setActiveTab('transfer')}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'transfer'
                  ? 'text-teal-600 border-teal-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              <GripVertical size={16} />
              转派流程
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'security'
                  ? 'text-teal-600 border-teal-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              <Shield size={16} />
              数据安全
            </button>
          </div>
        </Card.Header>
        <Card.Body>
          {activeTab === 'assignment' && (
            <div className="space-y-6">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Cell header>城市</Table.Cell>
                    <Table.Cell header>项目</Table.Cell>
                    <Table.Cell header>默认归属门店</Table.Cell>
                    <Table.Cell header>自动分配半径</Table.Cell>
                    <Table.Cell header>响应时限</Table.Cell>
                    <Table.Cell header>转派需审批</Table.Cell>
                    <Table.Cell header className="text-right">操作</Table.Cell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {rules.map(rule => (
                    <Table.Row key={rule.id}>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-teal-500" />
                          <span className="text-sm font-medium text-gray-900">{rule.city}</span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-gray-700">{rule.project}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-gray-700">{rule.defaultStoreName}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-gray-700">{rule.autoAssignRadius} 公里</span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Clock size={14} className="text-gray-400" />
                          <span className="text-gray-700">{rule.responseTimeLimit} 分钟</span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        {rule.requireApproval ? (
                          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">是</span>
                        ) : (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">否</span>
                        )}
                      </Table.Cell>
                      <Table.Cell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleEdit(rule)}>
                            <Edit2 size={14} />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" onClick={() => handleDelete(rule.id)}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>

              <div className="border-t border-gray-100 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">智能推荐规则试算</h3>
                    <p className="text-xs text-gray-500">选择城市和项目，预览各门店得分与排序，修改规则后即时刷新无需刷新页面</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">顾客城市</label>
                      <select
                        value={simCity}
                        onChange={e => setSimCity(e.target.value)}
                        className="h-9 px-3 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                      >
                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">意向项目</label>
                      <select
                        value={simProject}
                        onChange={e => setSimProject(e.target.value)}
                        className="h-9 px-3 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                      >
                        {projects.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="flex-1 flex items-end">
                      {matchedRule ? (
                        <div className="flex items-center gap-2 text-xs bg-teal-50 border border-teal-200 rounded-md px-3 py-2">
                          <CheckCircle size={14} className="text-teal-600" />
                          <span className="text-teal-800">
                            命中规则：
                            <span className="font-medium">{matchedRule.defaultStoreName}</span>
                            为默认门店
                            <span className="mx-1.5 text-teal-500">·</span>
                            分配半径 {matchedRule.autoAssignRadius}km
                            <span className="mx-1.5 text-teal-500">·</span>
                            响应 {matchedRule.responseTimeLimit}分钟
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                          <Eye size={14} className="text-amber-600" />
                          <span className="text-amber-800">
                            该城市/项目未配置规则，将按距离和饱和度推荐
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {simResult.length === 0 ? (
                  <div className="py-10 text-center text-gray-400 text-sm">
                    {simCity}暂无门店
                  </div>
                ) : (
                  <div className="space-y-2">
                    {simResult.map((item, idx) => {
                      const sat = getSaturationScore(item.saturation);
                      return (
                        <div
                          key={item.store.id}
                          className={`flex items-center gap-4 p-3 rounded-lg border ${
                            idx === 0
                              ? 'border-teal-300 bg-teal-50/60'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                            idx === 0
                              ? 'bg-teal-600 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">{item.store.name}</span>
                              {item.isDefault && (
                                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-teal-600 text-white rounded">
                                  默认门店
                                </span>
                              )}
                              {idx === 0 && !item.isDefault && (
                                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-emerald-500 text-white rounded">
                                  推荐
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPin size={11} />
                                距离 {item.distance} km
                              </span>
                              <span className={`flex items-center gap-1 ${
                                sat.color === 'emerald' ? 'text-emerald-600' :
                                sat.color === 'amber' ? 'text-amber-600' : 'text-red-600'
                              }`}>
                                <Layers size={11} />
                                饱和度 {item.saturation}%（{sat.label}）
                              </span>
                              <span className="flex items-center gap-1">
                                <TrendingUp size={11} />
                                综合得分 {item.score}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.reasons.map(r => (
                                <span key={r} className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded">
                                  {r}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'transfer' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">跨城市转派</h4>
                    <button className="text-teal-600">
                      <ToggleRight size={24} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">允许门店将客户转派到其他城市的门店</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">同城转派</h4>
                    <button className="text-teal-600">
                      <ToggleRight size={24} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">允许同城市内不同门店之间互转线索</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">店长审批</h4>
                    <button className="text-gray-300">
                      <ToggleLeft size={24} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">同城转派是否需要店长审批</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">总部审批</h4>
                    <button className="text-teal-600">
                      <ToggleRight size={24} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">跨城市转派是否需要总部审批</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">转派自动携带信息</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['聊天摘要', '顾客偏好', '指定医生', '指定设备'].map(item => (
                    <label key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                      {item}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="p-4 border border-red-200 bg-red-50/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">敏感数据保护</h4>
                    <p className="text-sm text-gray-500 mt-1">以下设置用于保护客户隐私数据，修改前请谨慎评估</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">手机号脱敏展示</h4>
                    <p className="text-sm text-gray-500 mt-0.5">门店接待员查看客户手机号时中间四位显示为星号</p>
                  </div>
                  <button className="text-teal-600">
                    <ToggleRight size={24} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">导出门店数据需审批</h4>
                    <p className="text-sm text-gray-500 mt-0.5">门店导出客户数据需要总部管理员审批</p>
                  </div>
                  <button className="text-teal-600">
                    <ToggleRight size={24} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">禁止批量导出手机号</h4>
                    <p className="text-sm text-gray-500 mt-0.5">导出报表时不包含完整手机号信息</p>
                  </div>
                  <button className="text-teal-600">
                    <ToggleRight size={24} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">操作日志记录</h4>
                    <p className="text-sm text-gray-500 mt-0.5">记录所有敏感数据查看和导出操作</p>
                  </div>
                  <button className="text-teal-600">
                    <ToggleRight size={24} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingRule ? '编辑分配规则' : '新增分配规则'}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)}>取消</Button>
            <Button onClick={handleSave}>保存</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">城市</label>
              <select
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white"
              >
                <option value="">请选择城市</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">项目</label>
              <select
                value={formData.project}
                onChange={e => setFormData({ ...formData, project: e.target.value })}
                className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white"
              >
                <option value="">请选择项目</option>
                {projects.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">默认归属门店</label>
            <select
              value={formData.defaultStoreId}
              onChange={e => setFormData({ ...formData, defaultStoreId: e.target.value })}
              className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white"
            >
              <option value="">请选择门店</option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>{store.name} - {store.city}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">自动分配半径（公里）</label>
              <input
                type="number"
                value={formData.autoAssignRadius}
                onChange={e => setFormData({ ...formData, autoAssignRadius: Number(e.target.value) })}
                className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">响应时限（分钟）</label>
              <input
                type="number"
                value={formData.responseTimeLimit}
                onChange={e => setFormData({ ...formData, responseTimeLimit: Number(e.target.value) })}
                className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.requireApproval}
                onChange={e => setFormData({ ...formData, requireApproval: e.target.checked })}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700">转派需要审批</span>
            </label>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
