import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/common/Card';
import { Table } from '@/components/common/Table';
import { StatusTag } from '@/components/common/StatusTag';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { mockCustomers, mockClues } from '@/mock';
import { formatPhone, formatDateTime } from '@/utils/format';
import {
  Users,
  Search,
  Merge,
  AlertTriangle,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Check,
  X,
} from 'lucide-react';

export default function DuplicateCustomer() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const duplicateCustomers = mockCustomers.filter(c => c.isDuplicate);

  const getCustomerClues = (customerId: string) => {
    return mockClues.filter(c => c.customerId === customerId);
  };

  const getDuplicateCustomer = (duplicateWith?: string) => {
    if (!duplicateWith) return null;
    return mockCustomers.find(c => c.id === duplicateWith);
  };

  const handleMerge = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setShowMergeModal(true);
  };

  const confirmMerge = () => {
    setShowMergeModal(false);
  };

  return (
    <PageContainer
      title="重复客户识别"
      subtitle={`发现 ${duplicateCustomers.length} 组重复客户，建议合并管理`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FileText size={14} className="mr-1" />
            导出报告
          </Button>
          <Button size="sm">
            <Merge size={14} className="mr-1" />
            一键去重
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <Users size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">总客户数</p>
                <p className="text-xl font-semibold text-gray-900">{mockCustomers.length}</p>
              </div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">重复客户</p>
                <p className="text-xl font-semibold text-gray-900">{duplicateCustomers.length}</p>
              </div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">美团来源</p>
                <p className="text-xl font-semibold text-gray-900">
                  {mockCustomers.filter(c => c.sourcePlatform === 'meituan').length}
                </p>
              </div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
                <Users size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">新氧来源</p>
                <p className="text-xl font-semibold text-gray-900">
                  {mockCustomers.filter(c => c.sourcePlatform === 'xinyang').length}
                </p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">重复客户列表</h3>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索手机号、姓名..."
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                className="w-56 h-9 pl-9 pr-4 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
              />
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Cell header>客户信息</Table.Cell>
                <Table.Cell header>手机号</Table.Cell>
                <Table.Cell header>来源平台</Table.Cell>
                <Table.Cell header>所在城市</Table.Cell>
                <Table.Cell header>关联线索数</Table.Cell>
                <Table.Cell header>首次咨询</Table.Cell>
                <Table.Cell header className="text-right">操作</Table.Cell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {duplicateCustomers.map(customer => {
                const clues = getCustomerClues(customer.id);
                const duplicateCustomer = getDuplicateCustomer(customer.duplicateWith);
                
                return (
                  <Table.Row key={customer.id}>
                    <Table.Cell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-sm font-medium">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            {customer.name}
                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-50 text-red-600 rounded border border-red-200">
                              重复
                            </span>
                          </div>
                          {duplicateCustomer && (
                            <div className="text-xs text-gray-400 mt-0.5">
                              与 {duplicateCustomer.name} 手机号重复
                            </div>
                          )}
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-gray-700 font-mono">{formatPhone(customer.phone)}</span>
                    </Table.Cell>
                    <Table.Cell>
                      <StatusTag status={customer.sourcePlatform} />
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPin size={14} className="text-gray-400" />
                        {customer.city}
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-gray-700">{clues.length} 条</span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar size={14} className="text-gray-400" />
                        {formatDateTime(customer.createdAt)}
                      </div>
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="outline" className="h-7 px-2">
                          查看详情
                        </Button>
                        <Button size="sm" className="h-7 px-2" onClick={() => handleMerge(customer.id)}>
                          <Merge size={14} className="mr-1" />
                          合并
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>

          {duplicateCustomers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Check size={40} className="mb-2 text-emerald-300" />
              <p className="text-sm">暂无重复客户</p>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal
        isOpen={showMergeModal}
        onClose={() => setShowMergeModal(false)}
        title="合并客户档案"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowMergeModal(false)}>取消</Button>
            <Button onClick={confirmMerge}>确认合并</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">合并后将保留以下信息</p>
                <ul className="text-xs text-amber-700 mt-2 space-y-1">
                  <li>· 合并两个客户的所有咨询记录和聊天历史</li>
                  <li>· 保留最新的联系方式和个人信息</li>
                  <li>· 记录全部来源平台（美团+新氧）</li>
                  <li>· 合并后不可撤销，请谨慎操作</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex-1 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-lg font-medium mb-2">
                刘
              </div>
              <p className="text-sm font-medium text-gray-900">刘女士</p>
              <p className="text-xs text-gray-500">美团 · 北京</p>
              <StatusTag status="meituan" className="mt-2" />
            </div>

            <div className="px-4">
              <Merge size={24} className="text-teal-500" />
            </div>

            <div className="flex-1 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-lg font-medium mb-2">
                陈
              </div>
              <p className="text-sm font-medium text-gray-900">陈小姐</p>
              <p className="text-xs text-gray-500">新氧 · 北京</p>
              <StatusTag status="xinyang" className="mt-2" />
            </div>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
