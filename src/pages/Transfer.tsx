import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/common/Card';
import { Table } from '@/components/common/Table';
import { StatusTag } from '@/components/common/StatusTag';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { useAuthStore } from '@/store/useAuthStore';
import { useTransferStore } from '@/store/useTransferStore';
import { useExportStore } from '@/store/useExportStore';
import { formatDateTime, formatPhone } from '@/utils/format';
import type { ExportType } from '@/types';
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
  Lock,
  BarChart3,
  History,
} from 'lucide-react';

export default function Transfer() {
  const { hasPermission, user } = useAuthStore();
  const { transfers, approveTransfer, rejectTransfer } = useTransferStore();
  const { canExport, requestExport } = useExportStore();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedTransferId, setSelectedTransferId] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const [showExportModal, setShowExportModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [exportReason, setExportReason] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
          <Button variant="outline" size="sm" onClick={() => setShowExportModal(true)}>
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
                            <div className="mt-4 pt-4 border-t border-gray-200 px-2 space-y-3">
                              <div className="flex items-start gap-2">
                                <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <FileText size={11} className="text-teal-600" />
                                </div>
                                <div className="text-sm">
                                  <span className="text-gray-500 font-medium">申请原因：</span>
                                  <span className="text-gray-700">{transfer.reason}</span>
                                </div>
                              </div>

                              {transfer.status === 'rejected' && transfer.rejectReason && (
                                <div className="flex items-start gap-2">
                                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <X size={11} className="text-red-600" />
                                  </div>
                                  <div className="text-sm">
                                    <span className="text-gray-500 font-medium">驳回原因：</span>
                                    <span className="text-red-700">{transfer.rejectReason}</span>
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <div className="text-xs text-gray-500 flex items-center gap-3">
                                  <span>
                                    <User size={11} className="inline mr-1" />
                                    审批人：<span className="font-medium text-gray-700">{transfer.approver}</span>
                                  </span>
                                  <span>
                                    <MessageSquare size={11} className="inline mr-1" />
                                    审批时间：<span className="font-medium text-gray-700">{formatDateTime(transfer.approvedAt || '')}</span>
                                  </span>
                                </div>
                                <StatusTag status={transfer.status} />
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

      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="导出转派记录"
        size="md"
      >
        {(() => {
          const recordsPermission = canExport('records', user?.role);
          const reportsPermission = canExport('reports', user?.role);

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
              reason: exportReason || '导出转派记录用于存档',
              requesterName: user?.name || '用户',
              requesterRole: user?.role || 'consultant',
              storeId: user?.storeId,
            });
            if (result.approved) {
              setSuccessMessage('导出成功！已按数据安全规范对客户手机号、聊天内容等敏感字段进行脱敏处理');
            } else {
              setSuccessMessage('已提交导出申请，请等待总部审批后下载');
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
                  <p className="mt-0.5">转派记录涉及客户手机号、聊天内容等敏感信息，门店角色需总部审批</p>
                </div>
              </div>

              {!recordsPermission.canExport && !reportsPermission.canExport && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-2">
                  <Lock size={14} />
                  {recordsPermission.reason}
                </div>
              )}

              {(recordsPermission.canExport || reportsPermission.canExport) && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">导出类型</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleExport('records', recordsPermission)}
                        disabled={!recordsPermission.canExport}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          recordsPermission.canExport
                            ? 'border-gray-200 hover:border-teal-400 hover:bg-teal-50/50'
                            : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <History size={20} className="text-teal-600 mb-2" />
                        <div className="text-sm font-medium text-gray-900">转派记录明细</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">含客户信息、申请原因等</div>
                        {recordsPermission.requireApproval && recordsPermission.canExport && (
                          <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-600">
                            <Lock size={10} />需审批
                          </div>
                        )}
                        {!recordsPermission.canExport && (
                          <div className="mt-2 flex items-center gap-1 text-[10px] text-red-500">
                            <Lock size={10} />无权限
                          </div>
                        )}
                      </button>

                      <button
                        onClick={() => handleExport('reports', reportsPermission)}
                        disabled={!reportsPermission.canExport}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          reportsPermission.canExport
                            ? 'border-gray-200 hover:border-teal-400 hover:bg-teal-50/50'
                            : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <BarChart3 size={20} className="text-teal-600 mb-2" />
                        <div className="text-sm font-medium text-gray-900">转派统计报表</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">按门店/月份统计汇总</div>
                        {reportsPermission.requireApproval && reportsPermission.canExport && (
                          <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-600">
                            <Lock size={10} />需审批
                          </div>
                        )}
                        {!reportsPermission.canExport && (
                          <div className="mt-2 flex items-center gap-1 text-[10px] text-red-500">
                            <Lock size={10} />无权限
                          </div>
                        )}
                      </button>
                    </div>
                  </div>

                  {(recordsPermission.requireApproval || reportsPermission.requireApproval) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">导出原因（申请必填）</label>
                      <textarea
                        value={exportReason}
                        onChange={e => setExportReason(e.target.value)}
                        rows={3}
                        placeholder="请详细说明导出用途和使用范围，如：2026年6月转派记录存档..."
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
