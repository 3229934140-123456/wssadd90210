import { useState, useMemo } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/common/Card';
import { Table } from '@/components/common/Table';
import { StatusTag } from '@/components/common/StatusTag';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { useAuthStore } from '@/store/useAuthStore';
import { useExportStore } from '@/store/useExportStore';
import { useStoreStore } from '@/store/useStoreStore';
import { formatDateTime } from '@/utils/format';
import type { ExportStatus, ExportRequest } from '@/types';
import {
  FileDown,
  Download,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  User,
  Building2,
  ChevronDown,
  ChevronUp,
  Lock,
  Shield,
} from 'lucide-react';

const typeLabels: Record<string, string> = {
  reports: '经营报表',
  clues: '线索明细',
  customers: '客户档案',
  records: '转派记录',
};

export default function ExportHistory() {
  const { user, hasPermission } = useAuthStore();
  const { requests, approveExport, rejectExport, pendingRequests } = useExportStore();
  const { stores } = useStoreStore();
  const isAdmin = hasPermission(['admin']);

  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const userRequests = useMemo(() => {
    let list = requests;
    if (!isAdmin && user?.storeId) {
      list = list.filter(r => r.storeId === user.storeId || r.requesterName === user.name);
    }
    if (!isAdmin) {
      list = list.filter(r => r.requesterName === user?.name || r.storeId === user?.storeId);
    }
    return list;
  }, [requests, isAdmin, user]);

  const filtered = useMemo(() => {
    let list = userRequests;
    if (activeTab !== 'all') {
      list = list.filter(r => r.status === activeTab);
    }
    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      list = list.filter(r =>
        r.requesterName.toLowerCase().includes(kw) ||
        typeLabels[r.type]?.toLowerCase().includes(kw) ||
        r.reason?.toLowerCase().includes(kw)
      );
    }
    return list;
  }, [userRequests, activeTab, searchKeyword]);

  const pendingCount = userRequests.filter(r => r.status === 'pending').length;
  const approvedCount = userRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = userRequests.filter(r => r.status === 'rejected').length;

  const handleApprove = (id: string) => {
    if (!confirm('确定通过该导出申请？通过后申请人可下载脱敏数据。')) return;
    approveExport(id, user?.name || '审批人');
    setSuccessMessage('已通过导出申请');
    setShowSuccessModal(true);
  };

  const handleReject = (id: string) => {
    setSelectedRequestId(id);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) {
      alert('请填写驳回原因');
      return;
    }
    rejectExport(selectedRequestId, user?.name || '审批人', rejectReason);
    setShowRejectModal(false);
    setSuccessMessage('已驳回导出申请');
    setShowSuccessModal(true);
  };

  const handleDownload = (req: ExportRequest) => {
    if (req.status !== 'approved') return;
    setSuccessMessage(`正在下载【${typeLabels[req.type] || req.type}】，敏感字段已按规范脱敏处理`);
    setShowSuccessModal(true);
  };

  const getStoreName = (id?: string) => stores.find(s => s.id === id)?.name || '-';

  return (
    <PageContainer
      title="导出申请中心"
      subtitle={`共 ${userRequests.length} 条申请，待审批 ${pendingCount} 条`}
    >
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center">
                <FileDown size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">全部申请</p>
                <p className="text-xl font-semibold text-gray-900">{userRequests.length}</p>
              </div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">待审批</p>
                <p className="text-xl font-semibold text-amber-600">{pendingCount}</p>
              </div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">已通过</p>
                <p className="text-xl font-semibold text-emerald-600">{approvedCount}</p>
              </div>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <XCircle size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">已驳回</p>
                <p className="text-xl font-semibold text-red-600">{rejectedCount}</p>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      <Card>
        <Card.Header className="py-3">
          <div className="space-y-3">
            <div className="flex items-center gap-6">
              {(['all', 'pending', 'approved', 'rejected'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'text-teal-600 border-teal-600'
                      : 'text-gray-500 border-transparent hover:text-gray-700'
                  }`}
                >
                  {tab === 'all' ? '全部' : tab === 'pending' ? '待审批' : tab === 'approved' ? '已通过' : '已驳回'}
                  <span className="ml-1 text-xs text-gray-400">
                    ({tab === 'all' ? userRequests.length : tab === 'pending' ? pendingCount : tab === 'approved' ? approvedCount : rejectedCount})
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Filter size={14} className="text-gray-400" />
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索申请人、类型或导出原因..."
                  value={searchKeyword}
                  onChange={e => setSearchKeyword(e.target.value)}
                  className="w-full h-9 pl-9 pr-4 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                />
              </div>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <FileDown size={40} className="mb-2 opacity-30" />
              <p className="text-sm">暂无导出申请</p>
            </div>
          ) : (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Cell header className="w-10"></Table.Cell>
                  <Table.Cell header>申请类型</Table.Cell>
                  <Table.Cell header>申请人</Table.Cell>
                  {isAdmin && <Table.Cell header>申请门店</Table.Cell>}
                  <Table.Cell header>导出原因</Table.Cell>
                  <Table.Cell header>申请时间</Table.Cell>
                  <Table.Cell header>状态</Table.Cell>
                  <Table.Cell header className="text-right">操作</Table.Cell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filtered.map(req => (
                  <>
                    <Table.Row
                      key={req.id}
                      className="cursor-pointer"
                      onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                    >
                      <Table.Cell>
                        {expandedId === req.id ? (
                          <ChevronUp size={16} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={16} className="text-gray-400" />
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm font-medium text-gray-900">{typeLabels[req.type] || req.type}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2 text-sm">
                          <User size={13} className="text-gray-400" />
                          <span className="text-gray-700">{req.requesterName}</span>
                        </div>
                      </Table.Cell>
                      {isAdmin && (
                        <Table.Cell>
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 size={13} className="text-gray-400" />
                            <span className="text-gray-700">{getStoreName(req.storeId)}</span>
                          </div>
                        </Table.Cell>
                      )}
                      <Table.Cell>
                        <span className="text-sm text-gray-600 line-clamp-1">{req.reason || '-'}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-xs text-gray-500">{formatDateTime(req.createdAt)}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <StatusTag status={req.status as ExportStatus} />
                      </Table.Cell>
                      <Table.Cell className="text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {isAdmin && req.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => handleApprove(req.id)}
                              >
                                <CheckCircle size={13} className="mr-0.5" />
                                通过
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleReject(req.id)}
                              >
                                <XCircle size={13} className="mr-0.5" />
                                驳回
                              </Button>
                            </>
                          )}
                          {req.status === 'approved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2"
                              onClick={() => handleDownload(req)}
                            >
                              <Download size={13} className="mr-0.5" />
                              下载脱敏数据
                            </Button>
                          )}
                          {req.status === 'rejected' && req.rejectReason && (
                            <span className="text-xs text-red-500 px-2">
                              原因：{req.rejectReason}
                            </span>
                          )}
                        </div>
                      </Table.Cell>
                    </Table.Row>
                    {expandedId === req.id && (
                      <Table.Row className="bg-gray-50">
                        <Table.Cell colSpan={isAdmin ? 8 : 7} className="py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
                            <div className="bg-white rounded-md border border-gray-200 p-4 space-y-2">
                              <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                <FileDown size={14} className="text-teal-600" />
                                申请信息
                              </h4>
                              <div className="space-y-1.5 text-xs">
                                <div className="flex items-start gap-2">
                                  <span className="text-gray-500 w-20 flex-shrink-0">申请类型：</span>
                                  <span className="text-gray-800 font-medium">{typeLabels[req.type] || req.type}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-gray-500 w-20 flex-shrink-0">导出原因：</span>
                                  <span className="text-gray-800">{req.reason || '-'}</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-gray-500 w-20 flex-shrink-0">申请时间：</span>
                                  <span className="text-gray-800">{formatDateTime(req.createdAt)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-white rounded-md border border-gray-200 p-4 space-y-2">
                              <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                <Shield size={14} className="text-teal-600" />
                                审批 / 安全信息
                              </h4>
                              <div className="space-y-1.5 text-xs">
                                <div className="flex items-start gap-2">
                                  <span className="text-gray-500 w-20 flex-shrink-0">申请人：</span>
                                  <span className="text-gray-800">{req.requesterName}（{req.requesterRole}）</span>
                                </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-gray-500 w-20 flex-shrink-0">审批状态：</span>
                                  <StatusTag status={req.status as ExportStatus} />
                                </div>
                                {req.status !== 'pending' && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-gray-500 w-20 flex-shrink-0">审批人：</span>
                                    <span className="text-gray-800">{req.approver}</span>
                                  </div>
                                )}
                                {req.status !== 'pending' && req.approvedAt && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-gray-500 w-20 flex-shrink-0">审批时间：</span>
                                    <span className="text-gray-800">{formatDateTime(req.approvedAt)}</span>
                                  </div>
                                )}
                                {req.status === 'rejected' && req.rejectReason && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-gray-500 w-20 flex-shrink-0">驳回原因：</span>
                                    <span className="text-red-700">{req.rejectReason}</span>
                                  </div>
                                )}
                                {req.status === 'approved' && (
                                  <div className="flex items-start gap-2 mt-2">
                                    <Lock size={12} className="text-teal-600 mt-0.5" />
                                    <span className="text-teal-700 bg-teal-50 border border-teal-100 px-2 py-1 rounded">
                                      已按数据安全规范对手机号、聊天内容等敏感字段脱敏处理
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
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
        title="驳回导出申请"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>取消</Button>
            <Button variant="danger" onClick={confirmReject}>确认驳回</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">驳回后申请人将无法下载该数据</p>
              <p className="text-xs mt-1 opacity-80">请填写清晰的驳回原因，方便门店理解并调整申请</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">驳回原因（必填）</label>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={4}
              placeholder="例如：导出原因不明确、数据范围过大需缩小、非业务必要等..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 resize-none"
            />
          </div>
        </div>
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
            <CheckCircle size={24} className="text-emerald-600" />
          </div>
          <p className="text-sm text-gray-700">{successMessage}</p>
        </div>
      </Modal>
    </PageContainer>
  );
}
