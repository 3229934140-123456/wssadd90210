import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { ClueCard } from '@/components/business/ClueCard';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Modal } from '@/components/common/Modal';
import { StatusTag } from '@/components/common/StatusTag';
import {
  Filter,
  RefreshCw,
  MapPin,
  ArrowRightLeft,
  Search,
  Star,
  Stethoscope,
  Wrench,
  MessageSquare,
  Sparkles,
  X,
} from 'lucide-react';
import { useClueStore } from '@/store/useClueStore';
import { useStoreStore } from '@/store/useStoreStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useTransferStore } from '@/store/useTransferStore';
import { useRuleStore } from '@/store/useRuleStore';
import { projects } from '@/mock';
import type { ClueStatus, IntentionLevel, Clue } from '@/types';

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

interface RecommendedStore {
  id: string;
  name: string;
  city: string;
  distance: number;
  saturation: number;
  reason: string;
  isDefault: boolean;
}

export default function CluePool() {
  const { getFilteredClues, acceptClue, setFilters, filters, getPendingCount, getClueById, updateClue } = useClueStore();
  const { stores, getStoreById, getStoreSaturation } = useStoreStore();
  const { user, hasPermission } = useAuthStore();
  const { createTransfer } = useTransferStore();
  const { getRuleByCityAndProject } = useRuleStore();

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedClueId, setSelectedClueId] = useState('');
  const [transferStoreId, setTransferStoreId] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [recommendedStores, setRecommendedStores] = useState<RecommendedStore[]>([]);

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
    setTransferStoreId('');
    setTransferReason('');
    setShowTransferModal(true);
  };

  const handleConfirmTransfer = () => {
    if (!selectedClueId || !transferStoreId || !transferReason) {
      alert('请填写完整转派信息');
      return;
    }
    const clue = getClueById(selectedClueId);
    const fromStore = getStoreById(clue?.storeId || '');
    const toStore = getStoreById(transferStoreId);
    if (!clue || !fromStore || !toStore) return;

    createTransfer({
      clueId: clue.id,
      clue,
      fromStoreId: fromStore.id,
      fromStoreName: fromStore.name,
      toStoreId: toStore.id,
      toStoreName: toStore.name,
      reason: transferReason,
    });

    setShowTransferModal(false);
    setTransferStoreId('');
    setTransferReason('');
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  const handleSmartRecommend = () => {
    const pendingClues = displayClues.filter(c => c.status === 'pending');
    if (pendingClues.length === 0) {
      alert('暂无待承接线索可推荐');
      return;
    }

    const firstClue = pendingClues[0];
    const rule = getRuleByCityAndProject(firstClue.customer.city, firstClue.project);

    const sameCityStores = stores.filter(s => s.city === firstClue.customer.city);
    if (sameCityStores.length === 0) {
      alert(`${firstClue.customer.city}暂无可用门店`);
      return;
    }
    const cityCenterLat = sameCityStores.reduce((s, x) => s + x.lat, 0) / sameCityStores.length;
    const cityCenterLng = sameCityStores.reduce((s, x) => s + x.lng, 0) / sameCityStores.length;

    const allRecommendations: RecommendedStore[] = [];

    sameCityStores.forEach(store => {
      const distance = calculateDistance(cityCenterLat, cityCenterLng, store.lat, store.lng);
      const saturation = getStoreSaturation(store.id);

      let reason = '';
      const isDefault = rule?.defaultStoreId === store.id;
      if (isDefault) {
        reason = '总部规则指定默认门店';
      } else if (distance < 2) {
        reason = '距离顾客位置最近';
      } else if (saturation < 50) {
        reason = '门店饱和度低，承接能力强';
      } else {
        reason = `${firstClue.customer.city}同城门店`;
      }

      allRecommendations.push({
        id: store.id,
        name: store.name,
        city: store.city,
        distance: Math.max(0.1, Math.round(distance * 10) / 10),
        saturation,
        reason,
        isDefault: !!isDefault,
      });
    });

    const sorted = allRecommendations
      .sort((a, b) => {
        if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
        if (a.distance !== b.distance) return a.distance - b.distance;
        if (a.saturation !== b.saturation) return a.saturation - b.saturation;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 5);

    setRecommendedStores(sorted);
    setShowRecommendModal(true);

    pendingClues.slice(0, 3).forEach(clue => {
      const bestMatch = sorted[0];
      if (bestMatch && bestMatch.isDefault) {
        updateClue(clue.id, { isRecommended: true });
      }
    });
  };

  const selectedClue = selectedClueId ? getClueById(selectedClueId) : null;

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
          <Button size="sm" onClick={handleSmartRecommend}>
            <Sparkles size={14} className="mr-1" />
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
              onTransfer={clue.status !== 'lost' && clue.status !== 'transferring' ? handleTransfer : undefined}
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
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowTransferModal(false)}>取消</Button>
            <Button onClick={handleConfirmTransfer}>确认转派</Button>
          </>
        }
      >
        <div className="space-y-5">
          {selectedClue && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-3">线索信息</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">客户：</span>
                  <span className="text-gray-900 font-medium">{selectedClue.customer.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">项目：</span>
                  <span className="text-gray-900 font-medium">{selectedClue.project}</span>
                </div>
                <div>
                  <span className="text-gray-500">城市：</span>
                  <span className="text-gray-900">{selectedClue.customer.city}</span>
                </div>
                <div>
                  <span className="text-gray-500">意向：</span>
                  <StatusTag status={selectedClue.intentionLevel} />
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <MessageSquare size={14} className="text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-500">聊天摘要：</span>
                    <span className="text-gray-700">{selectedClue.chatSummary}</span>
                  </div>
                </div>
                {selectedClue.preferences.length > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <Star size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {selectedClue.preferences.map(p => (
                        <span key={p} className="px-2 py-0.5 text-xs bg-teal-50 text-teal-700 rounded-full border border-teal-200">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedClue.designatedDoctor && (
                  <div className="flex items-center gap-2 text-sm">
                    <Stethoscope size={14} className="text-amber-500" />
                    <span className="text-gray-500">指定医生：</span>
                    <span className="text-amber-700 font-medium">{selectedClue.designatedDoctor}</span>
                  </div>
                )}
                {selectedClue.designatedEquipment && (
                  <div className="flex items-center gap-2 text-sm">
                    <Wrench size={14} className="text-amber-500" />
                    <span className="text-gray-500">指定设备：</span>
                    <span className="text-amber-700 font-medium">{selectedClue.designatedEquipment}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">转派至门店</label>
            <select
              value={transferStoreId}
              onChange={e => setTransferStoreId(e.target.value)}
              className="w-full h-10 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white"
            >
              <option value="">请选择目标门店</option>
              {stores
                .filter(s => s.id !== selectedClue?.storeId)
                .map(store => (
                  <option key={store.id} value={store.id}>
                    {store.name} - {store.city} (饱和度: {getStoreSaturation(store.id)}%)
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">转派原因</label>
            <textarea
              value={transferReason}
              onChange={e => setTransferReason(e.target.value)}
              rows={3}
              placeholder="请输入转派原因，例如：客户居住地距离目标门店更近、本店承接饱和等..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 resize-none"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-md text-sm text-amber-700 border border-amber-200">
            <div className="flex items-start gap-2">
              <ArrowRightLeft size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">转派说明</p>
                <ul className="mt-1 text-xs text-amber-600 space-y-0.5">
                  <li>• 提交后线索状态将变为"转派中"</li>
                  <li>• 聊天摘要、顾客偏好、指定医生/设备将自动同步</li>
                  <li>• 转派需经店长或总部审批后生效</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showRecommendModal}
        onClose={() => setShowRecommendModal(false)}
        title="智能推荐结果"
        size="lg"
        footer={
          <Button onClick={() => setShowRecommendModal(false)}>知道了</Button>
        }
      >
        <div className="space-y-3">
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-sm text-teal-700">
            <Sparkles size={16} className="inline mr-2" />
            根据总部规则、门店距离和饱和度推荐以下门店：
          </div>

          {recommendedStores.map((store, index) => (
            <div key={store.id} className="p-4 border border-gray-200 rounded-lg hover:border-teal-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-teal-600 text-white' :
                    index === 1 ? 'bg-teal-500 text-white' :
                    index === 2 ? 'bg-teal-400 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{store.name}</h4>
                      {store.isDefault && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-700 rounded border border-amber-200">
                          规则指定
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{store.city} · {store.reason}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{store.distance} km</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    饱和度 <span className={
                      store.saturation > 80 ? 'text-red-500' :
                      store.saturation > 60 ? 'text-amber-500' :
                      'text-emerald-500'
                    }>{store.saturation}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </PageContainer>
  );
}
