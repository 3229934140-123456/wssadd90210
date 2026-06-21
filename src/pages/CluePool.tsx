import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { ClueCard } from '@/components/business/ClueCard';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Modal } from '@/components/common/Modal';
import {
  Filter,
  RefreshCw,
  MapPin,
  ArrowRightLeft,
  Search,
  Star,
} from 'lucide-react';
import { useClueStore } from '@/store/useClueStore';
import { useStoreStore } from '@/store/useStoreStore';
import { useAuthStore } from '@/store/useAuthStore';
import { projects } from '@/mock';
import type { ClueStatus, IntentionLevel } from '@/types';

const statusOptions: { value: ClueStatus | ''; label: string }[] = [
  { value: '', label: '全部状态' },
  { value: 'pending', label: '待承接' },
  { value: 'accepted', label: '已承接' },
  { value: 'transferring', label: '转派中' },
  { value: 'visited', label: '已到院' },
  { value: 'lost', label: '已流失' },
];

const intentionOptions: { value: IntentionLevel | ''; label: string }[] = [
  { value: '', label: '全部意向' },
  { value: 'high', label: '高意向' },
  { value: 'medium', label: '中意向' },
  { value: 'low', label: '低意向' },
];

export default function CluePool() {
  const { getFilteredClues, acceptClue, setFilters, filters, getPendingCount } = useClueStore();
  const { stores, getStoreById } = useStoreStore();
  const { user, hasPermission } = useAuthStore();
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedClueId, setSelectedClueId] = useState('');
  const [transferStoreId, setTransferStoreId] = useState('');
  const [transferReason, setTransferReason] = useState('');

  const storeId = user?.storeId;
  const isAdmin = hasPermission(['admin']);

  const clues = getFilteredClues();
  const displayClues = storeId && !isAdmin ? clues.filter(c => c.storeId === storeId) : clues;

  const pendingCount = getPendingCount(storeId || undefined);

  const handleAccept = (clueId: string) => {
    acceptClue(clueId, user?.name || '咨询师');
  };

  const handleTransfer = (clueId: string) => {
    setSelectedClueId(clueId);
    setShowTransferModal(true);
  };

  const handleConfirmTransfer = () => {
    if (!selectedClueId || !transferStoreId || !transferReason) return;
    setShowTransferModal(false);
    setTransferStoreId('');
    setTransferReason('');
  };

  return (
    <PageContainer
      title="门店线索池"
      subtitle={`共 ${displayClues.length} 条线索，待承接 ${pendingCount} 条`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw size={14} className="mr-1" />
            刷新
          </Button>
          <Button size="sm">
            <Star size={14} className="mr-1" />
            智能推荐
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Card>
          <Card.Body className="py-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索客户姓名、项目..."
                  value={filters.keyword || ''}
                  onChange={e => setFilters({ keyword: e.target.value })}
                  className="w-full h-9 pl-9 pr-4 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                />
              </div>

              <select
                value={filters.status || ''}
                onChange={e => setFilters({ status: e.target.value as ClueStatus | undefined })}
                className="h-9 px-3 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white"
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              <select
                value={filters.intentionLevel || ''}
                onChange={e => setFilters({ intentionLevel: e.target.value as IntentionLevel | undefined })}
                className="h-9 px-3 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white"
              >
                {intentionOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              <select
                value={filters.project || ''}
                onChange={e => setFilters({ project: e.target.value || undefined })}
                className="h-9 px-3 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white"
              >
                <option value="">全部项目</option>
                {projects.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              {isAdmin && (
                <select
                  value={filters.storeId || ''}
                  onChange={e => setFilters({ storeId: e.target.value || undefined })}
                  className="h-9 px-3 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white"
                >
                  <option value="">全部门店</option>
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              )}

              <Button variant="ghost" size="sm">
                <Filter size={14} className="mr-1" />
                更多筛选
              </Button>
            </div>
          </Card.Body>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayClues.map(clue => (
            <ClueCard
              key={clue.id}
              clue={clue}
              storeName={isAdmin ? getStoreById(clue.storeId)?.name : undefined}
              onAccept={clue.status === 'pending' ? handleAccept : undefined}
              onTransfer={clue.status !== 'lost' ? handleTransfer : undefined}
            />
          ))}
        </div>

        {displayClues.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <MapPin size={48} className="mb-3 opacity-30" />
            <p className="text-sm">暂无符合条件的线索</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        title="申请转派"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowTransferModal(false)}>取消</Button>
            <Button onClick={handleConfirmTransfer}>确认转派</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">转派至门店</label>
            <select
              value={transferStoreId}
              onChange={e => setTransferStoreId(e.target.value)}
              className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
            >
              <option value="">请选择目标门店</option>
              {stores.filter(s => s.id !== storeId).map(store => (
                <option key={store.id} value={store.id}>
                  {store.name} - {store.city}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">转派原因</label>
            <textarea
              value={transferReason}
              onChange={e => setTransferReason(e.target.value)}
              rows={4}
              placeholder="请输入转派原因..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 resize-none"
            />
          </div>
          <div className="p-3 bg-amber-50 rounded-md text-sm text-amber-700">
            <ArrowRightLeft size={16} className="inline mr-2" />
            转派时会自动同步聊天摘要和顾客偏好信息
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}
