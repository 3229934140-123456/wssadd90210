import { create } from 'zustand';
import type { TransferRecord, TransferStatus, Clue } from '@/types';
import { mockTransfers } from '@/mock';
import { useClueStore } from './useClueStore';
import { useStoreStore } from './useStoreStore';

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
  }) => void;
  approveTransfer: (transferId: string, approver: string) => void;
  rejectTransfer: (transferId: string, approver: string, rejectReason: string) => void;
  getPendingTransfers: (storeId?: string) => TransferRecord[];
  getHistoryTransfers: (storeId?: string) => TransferRecord[];
  getPendingCount: (storeId?: string) => number;
  getTransferById: (id: string) => TransferRecord | undefined;
}

export const useTransferStore = create<TransferState>((set, get) => ({
  transfers: mockTransfers,

  createTransfer: (params) => {
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
    };

    set(state => ({
      transfers: [newTransfer, ...state.transfers],
    }));

    useClueStore.getState().updateClue(params.clueId, { status: 'transferring' });
  },

  approveTransfer: (transferId, approver) => {
    const transfer = get().transfers.find(t => t.id === transferId);
    if (!transfer) return;

    set(state => ({
      transfers: state.transfers.map(t =>
        t.id === transferId
          ? { ...t, status: 'approved' as TransferStatus, approver, approvedAt: new Date().toISOString() }
          : t
      ),
    }));

    useClueStore.getState().updateClue(transfer.clueId, {
      storeId: transfer.toStoreId,
      status: 'pending',
    });
  },

  rejectTransfer: (transferId, approver, rejectReason) => {
    const transfer = get().transfers.find(t => t.id === transferId);
    if (!transfer) return;

    set(state => ({
      transfers: state.transfers.map(t =>
        t.id === transferId
          ? {
              ...t,
              status: 'rejected' as TransferStatus,
              approver,
              approvedAt: new Date().toISOString(),
              rejectReason: rejectReason,
            }
          : t
      ),
    }));

    useClueStore.getState().updateClue(transfer.clueId, { status: 'pending' });
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
