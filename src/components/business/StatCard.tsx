import { Card } from '@/components/common/Card';
import { cn } from '@/utils/format';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  color?: 'teal' | 'amber' | 'blue' | 'rose' | 'purple';
  className?: string;
}

const colorClasses = {
  teal: 'bg-teal-50 text-teal-600',
  amber: 'bg-amber-50 text-amber-600',
  blue: 'bg-blue-50 text-blue-600',
  rose: 'bg-rose-50 text-rose-600',
  purple: 'bg-purple-50 text-purple-600',
};

export function StatCard({ title, value, icon: Icon, trend, trendLabel, color = 'teal', className }: StatCardProps) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {trend >= 0 ? (
                <TrendingUp size={14} className="text-emerald-500" />
              ) : (
                <TrendingDown size={14} className="text-red-500" />
              )}
              <span className={cn(
                'text-xs font-medium',
                trend >= 0 ? 'text-emerald-600' : 'text-red-500'
              )}>
                {trend >= 0 ? '+' : ''}{trend}%
              </span>
              {trendLabel && <span className="text-xs text-gray-400">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className={cn('w-11 h-11 rounded-lg flex items-center justify-center', colorClasses[color])}>
          <Icon size={22} />
        </div>
      </div>
    </Card>
  );
}
