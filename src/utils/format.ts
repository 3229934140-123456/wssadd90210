export const formatPhone = (phone: string): string => {
  if (!phone || phone.length < 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

export const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const formatDateTime = (dateStr: string): string => {
  return `${formatDate(dateStr)} ${formatTime(dateStr)}`;
};

export const timeAgo = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return formatDate(dateStr);
};

export const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: '待承接',
    accepted: '已承接',
    transferring: '转派中',
    visited: '已到院',
    lost: '已流失',
    approved: '已通过',
    rejected: '已驳回',
    confirmed: '已确认',
    cancelled: '已取消',
    completed: '已完成',
  };
  return statusMap[status] || status;
};

export const getIntentionText = (level: string): string => {
  const map: Record<string, string> = {
    high: '高意向',
    medium: '中意向',
    low: '低意向',
  };
  return map[level] || level;
};

export const getPlatformText = (platform: string): string => {
  const map: Record<string, string> = {
    meituan: '美团',
    xinyang: '新氧',
  };
  return map[platform] || platform;
};

export const getRoleText = (role: string): string => {
  const map: Record<string, string> = {
    admin: '总部管理员',
    storeManager: '门店店长',
    consultant: '接待咨询师',
    scheduler: '排班管理员',
  };
  return map[role] || role;
};

export const cn = (...args: (string | undefined | false | null)[]): string => {
  return args.filter(Boolean).join(' ');
};
