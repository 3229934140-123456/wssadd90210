import { cn } from '@/utils/format';

interface StatusTagProps {
  status: string;
  type?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const statusColorMap: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-blue-50 text-blue-700 border-blue-200',
  transferring: 'bg-purple-50 text-purple-700 border-purple-200',
  visited: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  lost: 'bg-gray-50 text-gray-500 border-gray-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-gray-50 text-gray-500 border-gray-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-gray-50 text-gray-600 border-gray-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  normal: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  meituan: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  xinyang: 'bg-pink-50 text-pink-700 border-pink-200',
};

const statusTextMap: Record<string, string> = {
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
  high: '高意向',
  medium: '中意向',
  low: '低意向',
  warning: '预警',
  danger: '危险',
  normal: '正常',
  meituan: '美团',
  xinyang: '新氧',
};

export function StatusTag({ status, type, className }: StatusTagProps) {
  const colorClass = statusColorMap[status] || statusColorMap[type || 'default'] || 'bg-gray-50 text-gray-600 border-gray-200';
  const text = statusTextMap[status] || status;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border',
        colorClass,
        className
      )}
    >
      {text}
    </span>
  );
}
