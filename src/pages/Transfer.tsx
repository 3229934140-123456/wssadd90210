import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/common/Card';
import { Table } from '@/components/common/Table';
import { StatusTag } from '@/components/common/StatusTag';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { mockTransfers } from '@/mock';
import { useAuthStore } from '@/store/useAuthStore';
import { formatDateTime } from '@/utils/format';
import {
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Eye,
  FileText,
  MessageSquare,
  User,
} from 'lucide-react';

export default function Transfer() {
  const { hasPermission, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedTransferId, setSelectedTransferId] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const canApprove = hasPermission(['admin', 'storeManager']);
  const isAdmin = hasPermission(['admin']);

  const pendingTransfers = mockTransfers.filter(t => t.status === 'pending');
  const historyTransfers = mockTransfers.filter(t => t.status !== 'pending');

  const displayTransfers = activeTab === 'pending' ? pendingTransfers : historyTransfers;

  const handleApprove = (id: string) => {
    console.log('Approve transfer:', id);
  };

  const handleReject = (id: string) => {
    setSelectedTransferId(id);
    setShowRejectModal(true);
  };

  const confirmReject = () => {
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
                  <Table.Row key={transfer.id} className="cursor-pointer" onClick={() => setExpandedId(expandedId === transfer.id ? null : transfer.id)}>
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
                            {transfer.clue.customer.city} · {transfer.clue.customer.sourcePlatform === 'meituan' ? '美团' : '新氧'}
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
                          <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => {}}>
                            <Eye size={14} />
                          </Button>
                          <Button size="sm" className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleApprove(transfer.id)}>
                            <Check size={14} />
                          </Button>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleReject(transfer.id)}>
                            <X size={14} />
                          </Button>
                        </div>
                      </Table.Cell>
                    )}
                  </Table.Row>
                  {expandedId === transfer.id && (
                    <Table.Row className="bg-gray-50">
                      <Table.Cell colSpan={8} className="py-4">
                        <div className="grid grid-cols-2 gap-6 px-2">
                          <div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                              <MessageSquare size={14} />
                              聊天摘要
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed bg-white p-3 rounded-md border border-gray-200">
                              {transfer.chatSummarySnapshot}
                            </p>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                              <User size={14} />
                              顾客偏好
                            </div>
                            <div className="flex flex-wrap gap-1.5 bg-white p-3 rounded-md border border-gray-200">
                              {transfer.preferencesSnapshot.map(pref => (
                                <span key={pref} className="px-2 py-0.5 text-xs font-medium bg-teal-50 text-teal-700 rounded-full">
                                  {pref}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        {transfer.status !== 'pending' && (
                          <div className="mt-4 pt-4 border-t border-gray-200 px-2">
                            <div className="text-xs text-gray-500">
                              {transfer.status === 'approved' ? '审批通过' : '审批驳回'} · {transfer.approver} · {formatDateTime(transfer.approvedAt || '')}
                            </div>
                            {transfer.reason && (
                              <p className="text-sm text-gray-600 mt-1">原因：{transfer.reason}</p>
                            )}
                          </div>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  )}
                </>
              ))}
            </Table.Body>
          </Table>

          {displayTransfers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <ArrowRightLeft size={40} className="mb-2 opacity-30" />
              <p className="text-sm">暂无转派记录</p>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="驳回转派"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>取消</Button>
            <Button variant="danger" onClick={confirmReject}>确认驳回</Button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">驳回原因</label>
          <textarea
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            rows={3}
            placeholder="请输入驳回原因..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 resize-none"
          />
        </div>
      </Modal>
    </PageContainer>
  );
}
