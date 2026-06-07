import { Filter } from 'lucide-react';
import type { FilterType } from '../types/plot';

interface FilterBarProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: Record<FilterType, number>;
}

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'available', label: '待认领' },
  { value: 'claimed', label: '已认领' },
  { value: 'needsMaintenance', label: '需维护' },
];

export const FilterBar = ({ currentFilter, onFilterChange, counts }: FilterBarProps) => {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      <div className="flex items-center gap-2 text-garden-700">
        <Filter size={18} />
        <span className="font-medium text-sm hidden sm:inline">筛选:</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map(option => (
          <button
            key={option.value}
            onClick={() => onFilterChange(option.value)}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium transition-all
              ${currentFilter === option.value
                ? 'bg-garden-500 text-white shadow-md'
                : 'bg-white text-garden-700 border border-garden-200 hover:bg-garden-50'
              }
            `}
          >
            {option.label}
            <span className={`ml-1.5 ${currentFilter === option.value ? 'text-white/80' : 'text-garden-400'}`}>
              {counts[option.value]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
