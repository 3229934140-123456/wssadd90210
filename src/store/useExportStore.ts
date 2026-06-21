import { create } from 'zustand';
import type { UserRole, ExportType, ExportStatus, ExportRequest, ExportDownloadRecord } from '@/types';

interface ExportState {
  requests: ExportRequest[];
  pendingRequests: ExportRequest[];
  canExport: (type: ExportType, userRole?: UserRole) => { canExport: boolean; requireApproval: boolean; reason: string };
  requestExport: (params: {
    type: ExportType;
    reason: string;
    requesterName: string;
    requesterRole: string;
    storeId?: string;
  }) => ExportRequest;
  approveExport: (requestId: string, approver: string) => void;
  rejectExport: (requestId: string, approver: string, rejectReason: string) => void;
  recordDownload: (requestId: string, downloadedBy: string) => void;
  getPendingRequests: (role?: string, storeId?: string) => ExportRequest[];
}

const EXPORT_RULES: Record<ExportType, { roles: string[]; requireApproval: string[] }> = {
  reports: {
    roles: ['admin', 'storeManager', 'consultant', 'scheduler'],
    requireApproval: ['storeManager', 'consultant', 'scheduler'],
  },
  clues: {
    roles: ['admin', 'storeManager'],
    requireApproval: ['storeManager'],
  },
  customers: {
    roles: ['admin'],
    requireApproval: [],
  },
  records: {
    roles: ['admin', 'storeManager'],
    requireApproval: ['storeManager'],
  },
};

export const useExportStore = create<ExportState>((set, get) => ({
  requests: [],
  pendingRequests: [],

  canExport: (type, userRole) => {
    if (!userRole) {
      return { canExport: false, requireApproval: false, reason: '用户未登录' };
    }
    const rule = EXPORT_RULES[type];
    if (!rule) {
      return { canExport: false, requireApproval: false, reason: '未知的导出类型' };
    }
    if (!rule.roles.includes(userRole)) {
      return { canExport: false, requireApproval: false, reason: '您没有该数据的导出权限，仅总部可导出高敏感客资' };
    }
    const requireApproval = rule.requireApproval.includes(userRole);
    return {
      canExport: true,
      requireApproval,
      reason: requireApproval ? '门店角色导出需总部审批' : '总部角色可直接导出（脱敏）',
    };
  },

  requestExport: (params) => {
    const { canExport, requireApproval, reason } = get().canExport(params.type, params.requesterRole as UserRole);
    if (!canExport) {
      throw new Error(reason);
    }

    const request: ExportRequest = {
      id: `exp${Date.now()}`,
      type: params.type,
      reason: params.reason,
      requesterName: params.requesterName,
      requesterRole: params.requesterRole,
      storeId: params.storeId,
      status: (requireApproval ? 'pending' : 'approved') as ExportStatus,
      createdAt: new Date().toISOString(),
      approved: !requireApproval,
      approver: requireApproval ? undefined : params.requesterName,
      approvedAt: requireApproval ? undefined : new Date().toISOString(),
    };

    set(state => {
      const newRequests = [request, ...state.requests];
      return {
        requests: newRequests,
        pendingRequests: newRequests.filter(r => r.status === 'pending'),
      };
    });

    return request;
  },

  approveExport: (requestId, approver) => {
    set(state => {
      const newRequests = state.requests.map((r): ExportRequest =>
        r.id === requestId
          ? { ...r, status: 'approved' as ExportStatus, approved: true, approver, approvedAt: new Date().toISOString() }
          : r
      );
      return {
        requests: newRequests,
        pendingRequests: newRequests.filter(r => r.status === 'pending'),
      };
    });
  },

  rejectExport: (requestId, approver, rejectReason) => {
    set(state => {
      const newRequests = state.requests.map((r): ExportRequest =>
        r.id === requestId
          ? { ...r, status: 'rejected' as ExportStatus, approved: false, approver, rejectReason }
          : r
      );
      return {
        requests: newRequests,
        pendingRequests: newRequests.filter(r => r.status === 'pending'),
      };
    });
  },

  recordDownload: (requestId, downloadedBy) => {
    const downloadRecord: ExportDownloadRecord = {
      id: `dl${Date.now()}`,
      downloadedAt: new Date().toISOString(),
      downloadedBy,
      desensitizationNote: '已按数据安全规范对手机号、聊天内容等敏感字段脱敏处理',
    };
    set(state => ({
      requests: state.requests.map(r =>
        r.id === requestId
          ? { ...r, downloadRecords: [...(r.downloadRecords || []), downloadRecord] }
          : r
      ),
    }));
  },

  getPendingRequests: (role, storeId) => {
    return get().requests.filter(r => {
      if (r.status !== 'pending') return false;
      if (role !== 'admin' && storeId && r.storeId !== storeId) return false;
      return true;
    });
  },
}));
