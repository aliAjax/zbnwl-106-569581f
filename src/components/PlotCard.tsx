import { Droplets, Leaf, User, Info, HandCoins } from 'lucide-react';
import type { Plot, PlotStatus } from '../types/plot';
import { formatDate, needsWatering, needsWeeding } from '../utils/dateUtils';

interface PlotCardProps {
  plot: Plot;
  onClick: () => void;
  onClaim?: () => void;
  index: number;
}

const STATUS_CONFIG: Record<PlotStatus, {
  label: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  badgeBg: string;
}> = {
  available: {
    label: '待认领',
    bgColor: 'bg-soil-100',
    borderColor: 'border-soil-300',
    textColor: 'text-soil-600',
    badgeBg: 'bg-soil-200',
  },
  claimed: {
    label: '已认领',
    bgColor: 'bg-garden-50',
    borderColor: 'border-garden-300',
    textColor: 'text-garden-700',
    badgeBg: 'bg-garden-200',
  },
  needsMaintenance: {
    label: '需维护',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-700',
    badgeBg: 'bg-amber-200',
  },
};

export const PlotCard = ({ plot, onClick, onClaim, index }: PlotCardProps) => {
  const config = STATUS_CONFIG[plot.status];
  const waterWarning = needsWatering(plot.lastWatered);
  const weedWarning = needsWeeding(plot.lastWeeded);
  const isAvailable = plot.status === 'available';

  const handleCardClick = () => {
    if (isAvailable && onClaim) {
      onClaim();
    } else {
      onClick();
    }
  };

  const handleClaimClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClaim?.();
  };

  return (
    <div
      onClick={handleCardClick}
      className={`
        relative p-4 rounded-xl border-2
        transition-all duration-300 ease-out
        hover:scale-105 hover:shadow-lg hover:z-10
        ${config.bgColor} ${config.borderColor}
        animate-fade-in
        ${isAvailable ? 'cursor-pointer' : 'cursor-pointer'}
      `}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="absolute top-2 right-2">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.badgeBg} ${config.textColor}`}>
          {config.label}
        </span>
      </div>

      <div className="mb-3">
        <h3 className="text-lg font-serif font-bold text-garden-800">
          {plot.plotNumber}
        </h3>
      </div>

      {isAvailable ? (
        <div className="space-y-3">
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-soil-200 rounded-full flex items-center justify-center mx-auto mb-2">
              <HandCoins className="w-6 h-6 text-soil-600" />
            </div>
            <p className="text-sm text-soil-500">点击立即认领</p>
          </div>
          <button
            onClick={handleClaimClick}
            className="w-full py-2 bg-soil-500 text-white rounded-lg text-sm font-medium hover:bg-soil-600 transition-colors flex items-center justify-center gap-1.5"
          >
            <HandCoins size={16} />
            认领此地
          </button>
        </div>
      ) : (
        <div className="space-y-2 text-sm">
          {plot.owner && (
            <div className="flex items-center gap-2 text-garden-700">
              <User size={14} className="flex-shrink-0" />
              <span className="truncate font-medium">{plot.owner}</span>
            </div>
          )}

          {plot.plant && (
            <div className="flex items-center gap-2 text-garden-600">
              <Leaf size={14} className="flex-shrink-0" />
              <span className="truncate">{plot.plant}</span>
            </div>
          )}

          <div className={`flex items-center gap-2 ${waterWarning ? 'text-warning' : 'text-garden-600'}`}>
            <Droplets size={14} className={`flex-shrink-0 ${waterWarning ? 'animate-bounce-soft' : ''}`} />
            <span className="text-xs">
              浇水: {formatDate(plot.lastWatered)}
              {waterWarning && <span className="ml-1 font-medium">⚠️</span>}
            </span>
          </div>

          <div className={`flex items-center gap-2 ${weedWarning ? 'text-warning' : 'text-garden-600'}`}>
            <Leaf size={14} className={`flex-shrink-0 ${weedWarning ? 'animate-bounce-soft' : ''}`} />
            <span className="text-xs">
              除草: {formatDate(plot.lastWeeded)}
              {weedWarning && <span className="ml-1 font-medium">⚠️</span>}
            </span>
          </div>
        </div>
      )}

      {!isAvailable && (
        <div className="absolute bottom-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
          <Info size={16} className="text-garden-500" />
        </div>
      )}
    </div>
  );
};
