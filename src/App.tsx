import { useState, useMemo } from 'react';
import { Menu, Sprout } from 'lucide-react';
import { PlotGrid } from './components/PlotGrid';
import { EditModal } from './components/EditModal';
import { TaskPanel } from './components/TaskPanel';
import { FilterBar } from './components/FilterBar';
import { usePlots } from './hooks/usePlots';
import type { Plot, FilterType } from './types/plot';

export default function App() {
  const { plots, isLoading, updatePlot, getMaintenanceTasks, getPlotById } = usePlots();
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTaskPanelOpen, setIsTaskPanelOpen] = useState(false);

  const tasks = useMemo(() => getMaintenanceTasks(), [getMaintenanceTasks]);

  const filteredPlots = useMemo(() => {
    switch (currentFilter) {
      case 'available':
        return plots.filter(p => p.status === 'available');
      case 'claimed':
        return plots.filter(p => p.status === 'claimed');
      case 'needsMaintenance':
        return plots.filter(p => p.status === 'needsMaintenance');
      default:
        return plots;
    }
  }, [plots, currentFilter]);

  const filterCounts = useMemo(() => ({
    all: plots.length,
    available: plots.filter(p => p.status === 'available').length,
    claimed: plots.filter(p => p.status === 'claimed').length,
    needsMaintenance: plots.filter(p => p.status === 'needsMaintenance').length,
  }), [plots]);

  const handlePlotClick = (plot: Plot) => {
    setSelectedPlot(plot);
    setIsModalOpen(true);
  };

  const handleTaskClick = (plotId: string) => {
    const plot = getPlotById(plotId);
    if (plot) {
      setSelectedPlot(plot);
      setIsModalOpen(true);
      setIsTaskPanelOpen(false);
    }
  };

  const handleSave = (id: string, updates: Partial<Plot>) => {
    updatePlot(id, updates);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sprout className="w-12 h-12 text-garden-500 animate-bounce mx-auto mb-4" />
          <p className="text-garden-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur-sm border-b border-garden-100">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-garden-500 rounded-xl flex items-center justify-center">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold text-garden-800">社区菜园</h1>
                <p className="text-xs text-garden-500 hidden sm:block">地块认领与维护管理</p>
              </div>
            </div>
            
            <button
              onClick={() => setIsTaskPanelOpen(!isTaskPanelOpen)}
              className="lg:hidden relative p-2.5 rounded-xl bg-white border border-garden-200 hover:bg-garden-50 transition-colors"
            >
              <Menu className="w-5 h-5 text-garden-700" />
              {tasks.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-warning text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {tasks.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <main className="flex-1 min-w-0">
            <div className="mb-6">
              <FilterBar
                currentFilter={currentFilter}
                onFilterChange={setCurrentFilter}
                counts={filterCounts}
              />
            </div>

            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-garden-600">
                共 <span className="font-semibold text-garden-800">{filteredPlots.length}</span> 个地块
              </p>
            </div>

            <PlotGrid
              plots={filteredPlots}
              onPlotClick={handlePlotClick}
            />
          </main>

          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <TaskPanel
                tasks={tasks}
                isOpen={true}
                onClose={() => {}}
                onTaskClick={handleTaskClick}
              />
            </div>
          </aside>
        </div>
      </div>

      <div className="lg:hidden">
        <TaskPanel
          tasks={tasks}
          isOpen={isTaskPanelOpen}
          onClose={() => setIsTaskPanelOpen(false)}
          onTaskClick={handleTaskClick}
        />
      </div>

      <EditModal
        plot={selectedPlot}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
