import { Card } from '@/components/common/Card';
import { StatusTag } from '@/components/common/StatusTag';
import { Button } from '@/components/common/Button';
import { Clue } from '@/types';
import { formatPhone, timeAgo } from '@/utils/format';
import { MapPin, Clock, Star, MessageCircle, ArrowRightLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ClueCardProps {
  clue: Clue;
  onAccept?: (clueId: string) => void;
  onTransfer?: (clueId: string) => void;
  storeName?: string;
}

export function ClueCard({ clue, onAccept, onTransfer, storeName }: ClueCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/clues/${clue.id}`);
  };

  return (
    <Card hover className="overflow-hidden" onClick={handleClick}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-sm font-medium">
              {clue.customer.name.charAt(0)}
            </div>
            <div>
              <div className="font-medium text-gray-900 text-sm">{clue.customer.name}</div>
              <div className="text-xs text-gray-400">{formatPhone(clue.customer.phone)}</div>
            </div>
          </div>
          <StatusTag status={clue.status} />
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">项目:</span>
            <span className="text-gray-700 font-medium">{clue.project}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin size={14} className="text-gray-400" />
            <span className="text-gray-500">{clue.customer.city}</span>
            {storeName && <span className="text-gray-400">· {storeName}</span>}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock size={14} className="text-gray-400" />
            <span className="text-gray-500">{timeAgo(clue.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 mb-3 flex-wrap">
          <StatusTag status={clue.intentionLevel} />
          <StatusTag status={clue.customer.sourcePlatform} />
          {clue.isRecommended && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md bg-teal-50 text-teal-700 border border-teal-200">
              <Star size={10} />
              智能推荐
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
          {clue.chatSummary}
        </p>

        {(clue.status === 'pending' || clue.status === 'accepted') && (
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            {clue.status === 'pending' && onAccept && (
              <Button size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); onAccept(clue.id); }}>
                立即承接
              </Button>
            )}
            {onTransfer && (
              <Button
                size="sm"
                variant="outline"
                className={clue.status === 'pending' ? '' : 'flex-1'}
                onClick={(e) => { e.stopPropagation(); onTransfer(clue.id); }}
              >
                <ArrowRightLeft size={14} className="mr-1" />
                申请转派
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto"
              onClick={(e) => { e.stopPropagation(); navigate(`/clues/${clue.id}`); }}
            >
              <MessageCircle size={14} className="mr-1" />
              详情
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
