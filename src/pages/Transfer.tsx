import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/common/Card';
import { Table } from '@/components/common/Table';
import { StatusTag } from '@/components/common/StatusTag';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { useAuthStore } from '@/store/useAuthStore';
import { useTransferStore } from '@/store/useTransferStore';
import { formatDateTime, formatPhone } from '@/utils/format';
import {
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  FileText,
  MessageSquare,
  User,
  Stethoscope,
  Wrench,
  Shield,
} from 'lucide-react';

export default function Transfer() {
  const { hasPermission, user } = useAuthStore();
  const { transfers, approveTransfer, rejectTransfer, getPendingCount } = useTransferStore();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedTransferId, setSelectedTransferId] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const canApprove = hasPermission(['admin', 'storeManager']);
  const storeId = user?.storeId;

  const pendingTransfers = transfers.filter(t => {
    if (t.status !== 'pending') return false;
    if (storeId && t.fromStoreId !== storeId && t.toStoreId !== storeId && !hasPermission(['admin'])) return false;
    return true;
  });

  const historyTransfers = transfers.filter(t => {
    if (t.status === 'pending') return false;
    if (storeId && t.fromStoreId !== storeId && t.toStoreId !== storeId && !hasPermission(['admin'])) return false;
    return true;
  });

  const displayTransfers = activeTab === 'pending' ? pendingTransfers : historyTransfers;

  const handleApprove = (id: string) => {
    if (!confirm('确定通过该转派申请？通过后线索将归属到目标门店。')) return;
    approveTransfer(id, user?.name || '审批人');
  };

  const handleReject = (id: string) => {
    setSelectedTransferId(id);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) {
      alert('请填写驳回原因');
      return;
    }
    rejectTransfer(selectedTransferId, user?.name || '审批人', rejectReason);
    setShowRejectModal(false);
    setRejectReason('');
  };

  return (
    <PageContainer
      title="跨店转派"
      subtitle={`待审批 ${pendingTransfers.length} 条转派申请`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FileText size={14} className="mr-1" />
            导出记录
          </Button>
        </div>
      }
    >
      <Card>
        <Card.Header className="py-3">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('pending')}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                activeTab === 'pending'
                  ? 'text-teal-600 border-teal-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              待审批
              {pendingTransfers.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {pendingTransfers.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'text-teal-600 border-teal-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              转派历史
            </button>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {displayTransfers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <ArrowRightLeft size={40} className="mb-2 opacity-30" />
              <p className="text-sm">{activeTab === 'pending' ? '暂无待审批转派' : '暂无转派历史'}</p>
            </div>
          ) : (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Cell header className="w-10"></Table.Cell>
                  <Table.Cell header>客户信息</Table.Cell>
                  <Table.Cell header>意向项目</Table.Cell>
                  <Table.Cell header>转出门店</Table.Cell>
                  <Table.Cell header>转入门店</Table.Cell>
                  <Table.Cell header>申请时间</Table.Cell>
                  <Table.Cell header>状态</Table.Cell>
                  {canApprove && activeTab === 'pending' && (
                    <Table.Cell header className="text-right">操作</Table.Cell>
                  )}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {displayTransfers.map(transfer => (
                  <>
                    <Table.Row
                      key={transfer.id}
                      className="cursor-pointer"
                      onClick={() => setExpandedId(expandedId === transfer.id ? null : transfer.id)}
                    >
                      <Table.Cell>
                        {expandedId === transfer.id ? (
                          <ChevronUp size={16} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={16} className="text-gray-400" />
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-sm font-medium">
                            {transfer.clue.customer.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{transfer.clue.customer.name}</div>
                            <div className="text-xs text-gray-400">
                              {transfer.clue.customer.city} · {formatPhone(transfer.clue.customer.phone)}
                            </div>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-gray-700">{transfer.clue.project}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-gray-700">{transfer.fromStoreName}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-1.5">
                          <ArrowRightLeft size={14} className="text-teal-500" />
                          <span className="text-sm text-gray-700">{transfer.toStoreName}</span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-gray-500">{formatDateTime(transfer.createdAt)}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <StatusTag status={transfer.status} />
                      </Table.Cell>
                      {canApprove && activeTab === 'pending' && (
                        <Table.Cell className="text-right">
                          <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                            <Button
                              size="sm"
                              className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => handleApprove(transfer.id)}
                            >
                              <Check size={14} className="mr-0.5" />
                              通过
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleReject(transfer.id)}
                            >
                              <X size={14} className="mr-0.5" />
                              驳回
                            </Button>
                          </div>
                        </Table.Cell>
                      )}
                    </Table.Row>
                    {expandedId === transfer.id && (
                      <Table.Row className="bg-gray-50">
                        <Table.Cell colSpan={canApprove && activeTab === 'pending' ? 8 : 7} className="py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-2">
                            <div>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                <MessageSquare size={14} />
                                聊天摘要
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed bg-white p-3 rounded-md border border-gray-200">
                                {transfer.chatSummarySnapshot || transfer.clue.chatSummary}
                              </p>
                            </div>
                            <div className="space-y-4">
                              <div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                  <User size={14} />
                                  顾客偏好
                                </div>
                                <div className="flex flex-wrap gap-1.5 bg-white p-3 rounded-md border border-gray-200">
                                  {(transfer.preferencesSnapshot?.length > 0 ? transfer.preferencesSnapshot : transfer.clue.preferences).map(pref => (
                                    <span key={pref} className="px-2 py-0.5 text-xs font-medium bg-teal-50 text-teal-700 rounded-full border border-teal-200">
                                      {pref}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              {(transfer.clue.designatedDoctor || transfer.clue.designatedEquipment) && (
                                <div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                    <Shield size={14} />
                                    指定需求
                                  </div>
                                  <div className="space-y-1 bg-white p-3 rounded-md border border-gray-200">
                                    {transfer.clue.designatedDoctor && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <Stethoscope size={14} className="text-amber-500" />
                                        <span className="text-gray-500">指定医生：</span>
                                        <span className="text-amber-700 font-medium">{transfer.clue.designatedDoctor}</span>
                                      </div>
                                    )}
                                    {transfer.clue.designatedEquipment && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <Wrench size={14} className="text-amber-500" />
                                        <span className="text-gray-500">指定设备：</span>
                                        <span className="text-amber-700 font-medium">{transfer.clue.designatedEquipment}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {transfer.status !== 'pending' && (
                            <div className="mt-4 pt-4 border-t border-gray-200 px-2">
                              <div className="flex items-center justify-between">
                                <div className="text-sm">
                                  <span className="text-gray-500">转派原因：</span>
                                  <span className="text-gray-700">{transfer.reason}</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {transfer.status === 'approved' ? '审批通过' : '审批驳回'} · 审批人：{transfer.approver} · {formatDateTime(transfer.approvedAt || '')}
                                </div>
                              </div>
                            </div>
                          )}

                          {transfer.status === 'pending' && (
                            <div className="mt-4 pt-4 border-t border-gray-200 px-2">
                              <div className="text-sm">
                                <span className="text-gray-500">申请原因：</span>
                                <span className="text-gray-700">{transfer.reason}</span>
                              </div>
                            </div>
                          )}
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </>
                ))}
              </Table.Body>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="驳回转派申请"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>取消</Button>
            <Button variant="danger" onClick={confirmReject}>确认驳回</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <X size={16} className="inline mr-2" />
            驳回后线索将返回原门店，状态恢复为"待承接"
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">驳回原因（必填）</label>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={4}
              placeholder="请输入驳回原因，例如：原门店有足够承接能力、目标门店饱和度过高等..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 resize-none"
            />
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
