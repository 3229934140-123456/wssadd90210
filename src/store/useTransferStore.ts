import { create } from 'zustand';
import type { TransferRecord, TransferStatus, Clue, TransferTimeline, TransferActionType } from '@/types';
import { mockTransfers } from '@/mock';
import { useClueStore } from './useClueStore';
import { useStoreStore } from './useStoreStore';

interface FilterParams {
  storeId?: string;
  operator?: string;
  startDate?: string;
  endDate?: string;
  action?: TransferActionType;
}

interface TransferState {
  transfers: TransferRecord[];
  createTransfer: (params: {
    clueId: string;
    clue: Clue;
    toStoreId: string;
    toStoreName: string;
    reason: string;
    fromStoreId: string;
    fromStoreName: string;
    operator?: string;
    operatorRole?: string;
  }) => void;
  approveTransfer: (transferId: string, approver: string, approverRole?: string, note?: string) => void;
  rejectTransfer: (transferId: string, approver: string, rejectReason: string, approverRole?: string) => void;
  reapplyTransfer: (transferId: string, newReason: string, operator: string, operatorRole?: string) => void;
  addTimelineEvent: (transferId: string, event: Omit<TransferTimeline, 'id' | 'timestamp'>) => void;
  getPendingTransfers: (storeId?: string) => TransferRecord[];
  getHistoryTransfers: (storeId?: string) => TransferRecord[];
  getPendingCount: (storeId?: string) => number;
  getTransferById: (id: string) => TransferRecord | undefined;
  filterTransfers: (filters: FilterParams) => TransferRecord[];
}

const makeTimeline = (
  action: TransferActionType,
  actionLabel: string,
  operator: string,
  operatorRole: string,
  storeId?: string,
  storeName?: string,
  note?: string
): TransferTimeline => ({
  id: `tl${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  action,
  actionLabel,
  operator,
  operatorRole,
  storeId,
  storeName,
  timestamp: new Date().toISOString(),
  note,
});

export const useTransferStore = create<TransferState>((set, get) => ({
  transfers: mockTransfers,

  createTransfer: (params) => {
    const { useStoreStore } = require('@/store/useStoreStore');
    const fromStore = params.fromStoreId ? useStoreStore.getState().getStoreById(params.fromStoreId) : undefined;

    const applyTimeline = makeTimeline(
      'apply',
      '提交转派申请',
      params.operator || '申请人',
      params.operatorRole || 'storeManager',
      params.fromStoreId,
      params.fromStoreName || fromStore?.name,
      params.reason
    );

    const newTransfer: TransferRecord = {
      id: `t${Date.now()}`,
      clueId: params.clueId,
      clue: params.clue,
      fromStoreId: params.fromStoreId,
      fromStoreName: params.fromStoreName,
      toStoreId: params.toStoreId,
      toStoreName: params.toStoreName,
      reason: params.reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
      chatSummarySnapshot: params.clue.chatSummary,
      preferencesSnapshot: params.clue.preferences,
      timeline: [applyTimeline],
    };

    set(state => ({
      transfers: [newTransfer, ...state.transfers],
    }));

    useClueStore.getState().updateClue(params.clueId, { status: 'transferring' });
  },

  approveTransfer: (transferId, approver, approverRole = 'admin', note = '同意转派') => {
    const transfer = get().transfers.find(t => t.id === transferId);
    if (!transfer) return;

    const timelineEvent = makeTimeline(
      'approve',
      '审批通过',
      approver,
      approverRole,
      undefined,
      '总部',
      note
    );

    set(state => ({
      transfers: state.transfers.map(t =>
        t.id === transferId
          ? {
              ...t,
              status: 'approved' as TransferStatus,
              approver,
              approvedAt: new Date().toISOString(),
              timeline: [...t.timeline, timelineEvent],
            }
          : t
      ),
    }));

    useClueStore.getState().updateClue(transfer.clueId, {
      storeId: transfer.toStoreId,
      status: 'pending',
    });
  },

  rejectTransfer: (transferId, approver, rejectReason, approverRole = 'admin') => {
    const transfer = get().transfers.find(t => t.id === transferId);
    if (!transfer) return;

    const timelineEvent = makeTimeline(
      'reject',
      '审批驳回',
      approver,
      approverRole,
      undefined,
      '总部',
      rejectReason
    );

    set(state => ({
      transfers: state.transfers.map(t =>
        t.id === transferId
          ? {
              ...t,
              status: 'rejected' as TransferStatus,
              approver,
              approvedAt: new Date().toISOString(),
              rejectReason,
              timeline: [...t.timeline, timelineEvent],
            }
          : t
      ),
    }));

    useClueStore.getState().updateClue(transfer.clueId, { status: 'pending' });
  },

  reapplyTransfer: (transferId, newReason, operator, operatorRole = 'storeManager') => {
    const transfer = get().transfers.find(t => t.id === transferId);
    if (!transfer || transfer.status !== 'rejected') return;

    const fromStore = transfer.fromStoreId ? useStoreStore.getState().getStoreById(transfer.fromStoreId) : undefined;

    const timelineEvent = makeTimeline(
      'reapply',
      '重新发起转派',
      operator,
      operatorRole,
      transfer.fromStoreId,
      fromStore?.name || transfer.fromStoreName,
      newReason
    );

    set(state => ({
      transfers: state.transfers.map(t =>
        t.id === transferId
          ? {
              ...t,
              status: 'pending' as TransferStatus,
              reason: newReason,
              approver: undefined,
              rejectReason: undefined,
              approvedAt: undefined,
              timeline: [...t.timeline, timelineEvent],
            }
          : t
      ),
    }));

    useClueStore.getState().updateClue(transfer.clueId, { status: 'transferring' });
  },

  addTimelineEvent: (transferId, event) => {
    set(state => ({
      transfers: state.transfers.map(t =>
        t.id === transferId
          ? {
              ...t,
              timeline: [...t.timeline, { ...event, id: `tl${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, timestamp: new Date().toISOString() }],
            }
          : t
      ),
    }));
  },

  filterTransfers: (filters) => {
    let result = [...get().transfers];
    if (filters.storeId) {
      result = result.filter(t => t.fromStoreId === filters.storeId || t.toStoreId === filters.storeId);
    }
    if (filters.operator) {
      const kw = filters.operator.toLowerCase();
      result = result.filter(t => t.timeline.some(e => e.operator.toLowerCase().includes(kw)));
    }
    if (filters.startDate) {
      const start = new Date(filters.startDate).getTime();
      result = result.filter(t => t.timeline.some(e => new Date(e.timestamp).getTime() >= start));
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate).getTime() + 86400000;
      result = result.filter(t => t.timeline.some(e => new Date(e.timestamp).getTime() <= end));
    }
    if (filters.action) {
      result = result.filter(t => t.timeline.some(e => e.action === filters.action));
    }
    return result;
  },

  getPendingTransfers: (storeId) => {
    const { transfers } = get();
    return transfers.filter(t => {
      if (t.status !== 'pending') return false;
      if (storeId && t.fromStoreId !== storeId && t.toStoreId !== storeId) return false;
      return true;
    });
  },

  getHistoryTransfers: (storeId) => {
    const { transfers } = get();
    return transfers.filter(t => {
      if (t.status === 'pending') return false;
      if (storeId && t.fromStoreId !== storeId && t.toStoreId !== storeId) return false;
      return true;
    });
  },

  getPendingCount: (storeId) => {
    return get().getPendingTransfers(storeId).length;
  },

  getTransferById: (id) => {
    return get().transfers.find(t => t.id === id);
  },
}));
