import { useState, useMemo } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/common/Card';
import { Table } from '@/components/common/Table';
import { StatusTag } from '@/components/common/StatusTag';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { useCustomerStore } from '@/store/useCustomerStore';
import { useClueStore } from '@/store/useClueStore';
import { formatPhone, formatDateTime } from '@/utils/format';
import type { Customer, Clue } from '@/types';
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
  Sparkles,
  Link,
} from 'lucide-react';

export default function DuplicateCustomer() {
  const { customers, searchCustomers, getDuplicateCustomers, mergeCustomers } = useCustomerStore();
  const { clues } = useClueStore();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [selectedPrimaryId, setSelectedPrimaryId] = useState('');
  const [selectedDuplicateId, setSelectedDuplicateId] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const duplicateGroups = getDuplicateCustomers();

  const filteredDuplicates = useMemo(() => {
    if (!searchKeyword.trim()) {
      return duplicateGroups;
    }
    const result = searchCustomers(searchKeyword.trim());
    return duplicateGroups.filter(group =>
      result.some(r => group.primary.id === r.id || group.duplicates.some(d => d.id === r.id))
    );
  }, [duplicateGroups, searchKeyword, searchCustomers]);

  const getCustomerClues = (customerId: string) => {
    return clues.filter(c => c.customerId === customerId);
  };

  const getClueCount = (customer: Customer) => {
    const duplicateOf = duplicateGroups.find(g => g.primary.id === customer.id || g.duplicates.some(d => d.id === customer.id));
    if (!duplicateOf) return getCustomerClues(customer.id).length;
    const allIds = [duplicateOf.primary.id, ...duplicateOf.duplicates.map(d => d.id)];
    return clues.filter(c => allIds.includes(c.customerId)).length;
  };

  const handleMerge = (primaryId: string, duplicateId: string) => {
    setSelectedPrimaryId(primaryId);
    setSelectedDuplicateId(duplicateId);
    setShowMergeModal(true);
  };

  const confirmMerge = () => {
    if (!selectedPrimaryId || !selectedDuplicateId) return;
    mergeCustomers(selectedPrimaryId, selectedDuplicateId);
    setShowMergeModal(false);
    setShowSuccessModal(true);
  };

  const findGroup = (customerId: string) => {
    return duplicateGroups.find(g => g.primary.id === customerId || g.duplicates.some(d => d.id === customerId));
  };

  return (
    <PageContainer
      title="重复客户识别"
      subtitle={`发现 ${duplicateGroups.length} 组重复客户（相同手机号跨平台），建议合并管理`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FileText size={14} className="mr-1" />
            导出报告
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
                <p className="text-xl font-semibold text-gray-900">{customers.length}</p>
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
                <p className="text-xs text-gray-500">重复客户组</p>
                <p className="text-xl font-semibold text-gray-900">{duplicateGroups.length}</p>
              </div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">美团来源</p>
                <p className="text-xl font-semibold text-gray-900">
                  {customers.filter(c => c.sourcePlatform === 'meituan').length}
                </p>
              </div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">新氧来源</p>
                <p className="text-xl font-semibold text-gray-900">
                  {customers.filter(c => c.sourcePlatform === 'xinyang').length}
                </p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      <Card>
        <Card.Header>
          <div className="flex items-center justify-between w-full">
            <h3 className="font-semibold text-gray-900">重复客户列表</h3>
            <div className="relative w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索姓名或手机号..."
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                className="w-full h-9 pl-9 pr-4 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
              />
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {filteredDuplicates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Check size={40} className="mb-2 text-emerald-300" />
              <p className="text-sm">{searchKeyword ? '未找到匹配的重复客户' : '暂无重复客户'}</p>
            </div>
          ) : (
            filteredDuplicates.map((group, groupIdx) => (
              <div key={group.primary.id} className="border-b border-gray-100 last:border-b-0">
                <div className="px-4 py-2 bg-amber-50/50 border-b border-amber-100 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-500" />
                  <span className="text-xs font-medium text-amber-700">
                    第 {groupIdx + 1} 组 · 手机号 {formatPhone(group.phone)} 重复 · 关联线索 {group.totalClueCount} 条
                  </span>
                </div>
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
                    <Table.Row className="bg-emerald-50/30">
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm font-medium">
                            {group.primary.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              {group.primary.name}
                              <span className="px-1.5 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-700 rounded border border-emerald-200">
                                主档案
                              </span>
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">将保留此档案信息</div>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-gray-700 font-mono">{formatPhone(group.primary.phone)}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <StatusTag status={group.primary.sourcePlatform} />
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <MapPin size={14} className="text-gray-400" />
                          {group.primary.city}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-gray-700">{getClueCount(group.primary)} 条</span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Calendar size={14} className="text-gray-400" />
                          {formatDateTime(group.primary.createdAt)}
                        </div>
                      </Table.Cell>
                      <Table.Cell className="text-right">
                        <span className="text-xs text-gray-400">主档案</span>
                      </Table.Cell>
                    </Table.Row>

                    {group.duplicates.map(dup => (
                      <Table.Row key={dup.id}>
                        <Table.Cell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-sm font-medium">
                              {dup.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                {dup.name}
                                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-50 text-red-600 rounded border border-red-200">
                                  重复
                                </span>
                              </div>
                              <div className="text-xs text-gray-400 mt-0.5">
                                <Link size={10} className="inline mr-1" />
                                与主档案手机号重复
                              </div>
                            </div>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <span className="text-sm text-gray-700 font-mono">{formatPhone(dup.phone)}</span>
                        </Table.Cell>
                        <Table.Cell>
                          <StatusTag status={dup.sourcePlatform} />
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <MapPin size={14} className="text-gray-400" />
                            {dup.city}
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <span className="text-sm text-gray-700">{getCustomerClues(dup.id).length} 条</span>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Calendar size={14} className="text-gray-400" />
                            {formatDateTime(dup.createdAt)}
                          </div>
                        </Table.Cell>
                        <Table.Cell className="text-right">
                          <Button size="sm" className="h-7 px-2" onClick={() => handleMerge(group.primary.id, dup.id)}>
                            <Merge size={14} className="mr-1" />
                            合并到主档案
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>
            ))
          )}
        </Card.Body>
      </Card>

      <Modal
        isOpen={showMergeModal}
        onClose={() => setShowMergeModal(false)}
        title="合并客户档案"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowMergeModal(false)}>取消</Button>
            <Button onClick={confirmMerge}>
              <Merge size={14} className="mr-1" />
              确认合并
            </Button>
          </>
        }
      >
        {(() => {
          const primary = customers.find(c => c.id === selectedPrimaryId);
          const duplicate = customers.find(c => c.id === selectedDuplicateId);
          const primaryClues = getCustomerClues(selectedPrimaryId);
          const dupClues = getCustomerClues(selectedDuplicateId);
          if (!primary || !duplicate) return null;

          return (
            <div className="space-y-5">
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">合并后将保留以下信息（不可撤销）</p>
                    <ul className="text-xs text-amber-700 mt-2 space-y-1">
                      <li>· 合并后共 {primaryClues.length + dupClues.length} 条线索关联到主档案</li>
                      <li>· 保留主档案 {primary.name} 的个人信息</li>
                      <li>· 合并两个平台的来源记录（{primary.sourcePlatform === 'meituan' ? '美团' : '新氧'} + {duplicate.sourcePlatform === 'meituan' ? '美团' : '新氧'}）</li>
                      <li>· 重复标记将被清除</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                <div className="p-4 bg-emerald-50 rounded-lg border-2 border-emerald-300">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-700 rounded border border-emerald-200">
                      主档案（保留）
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-lg font-medium">
                      {primary.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-900">{primary.name}</p>
                      <StatusTag status={primary.sourcePlatform} />
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p><Phone size={12} className="inline mr-1" />{formatPhone(primary.phone)}</p>
                    <p><MapPin size={12} className="inline mr-1" />{primary.city} · {primary.age}岁</p>
                    <p><FileText size={12} className="inline mr-1" />{primaryClues.length} 条线索</p>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <Merge size={28} className="text-teal-500" />
                  <span className="text-xs text-gray-400 mt-1">合并</span>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-red-50 text-red-600 rounded border border-red-200">
                      待合并（清除）
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-lg font-medium">
                      {duplicate.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-900">{duplicate.name}</p>
                      <StatusTag status={duplicate.sourcePlatform} />
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p><Phone size={12} className="inline mr-1" />{formatPhone(duplicate.phone)}</p>
                    <p><MapPin size={12} className="inline mr-1" />{duplicate.city} · {duplicate.age}岁</p>
                    <p><FileText size={12} className="inline mr-1" />{dupClues.length} 条线索</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>

      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="合并成功"
        size="sm"
        footer={
          <Button onClick={() => setShowSuccessModal(false)}>确定</Button>
        }
      >
        <div className="flex items-center gap-3 py-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
            <Check size={24} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">客户档案合并成功</p>
            <p className="text-xs text-gray-500 mt-0.5">关联线索和平台信息已同步到主档案</p>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
