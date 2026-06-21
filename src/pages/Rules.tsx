import { useState } from 'react';
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
} from 'lucide-react';
import type { Rule } from '@/types';

export default function Rules() {
  const { rules, addRule, updateRule, deleteRule } = useRuleStore();
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
