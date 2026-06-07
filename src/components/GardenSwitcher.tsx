import { useState, useRef, useEffect } from 'react';
import { Sprout, ChevronDown, List, Check } from 'lucide-react';
import { useGardenStore } from '../store/useGardenStore';

interface GardenSwitcherProps {
  onOpenGardenList: () => void;
}

export function GardenSwitcher({ onOpenGardenList }: GardenSwitcherProps) {
  const gardens = useGardenStore((state) => state.gardens);
  const currentGardenId = useGardenStore((state) => state.currentGardenId);
  const setCurrentGarden = useGardenStore((state) => state.setCurrentGarden);
  const currentGarden = gardens.find((g) => g.id === currentGardenId);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectGarden = (gardenId: string) => {
    setCurrentGarden(gardenId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-garden-100 transition-colors group"
      >
        <div className="w-8 h-8 bg-garden-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Sprout className="w-4 h-4 text-white" />
        </div>
        <div className="text-left min-w-0">
          <p className="text-sm font-semibold text-garden-800 truncate max-w-[120px] sm:max-w-[160px]">
            {currentGarden?.name || '未选择菜园'}
          </p>
          {currentGarden?.description && (
            <p className="text-xs text-garden-500 truncate max-w-[120px] sm:max-w-[160px] hidden sm:block">
              {currentGarden.description}
            </p>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-garden-500 transition-transform flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl border border-garden-200 shadow-lg shadow-garden-900/5 z-50 overflow-hidden">
          <div className="p-2">
            {gardens.map((garden) => (
              <button
                key={garden.id}
                onClick={() => handleSelectGarden(garden.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  garden.id === currentGardenId
                    ? 'bg-garden-50 text-garden-800'
                    : 'text-garden-700 hover:bg-garden-50'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    garden.id === currentGardenId
                      ? 'bg-garden-500 text-white'
                      : 'bg-garden-100 text-garden-500'
                  }`}
                >
                  <Sprout className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{garden.name}</p>
                  {garden.location && (
                    <p className="text-xs text-garden-500 truncate">{garden.location}</p>
                  )}
                </div>
                {garden.id === currentGardenId && (
                  <Check className="w-4 h-4 text-garden-600 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
          <div className="border-t border-garden-100 p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onOpenGardenList();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-garden-600 hover:bg-garden-50 transition-colors"
            >
              <List className="w-4 h-4" />
              <span className="text-sm font-medium">管理菜园</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
