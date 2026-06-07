import { useState, useMemo } from 'react';
import { Menu, Sprout, Upload, LayoutGrid, Calendar } from 'lucide-react';
import { PlotGrid } from './components/PlotGrid';
import { EditModal } from './components/EditModal';
import { TaskPanel } from './components/TaskPanel';
import { FilterBar } from './components/FilterBar';
import { ImportModal } from './components/ImportModal';
import { MaintenanceCalendar } from './components/MaintenanceCalendar';
import { usePlots } from './hooks/usePlots';
import type { Plot, FilterType } from './types/plot';

type ViewType = 'grid' | 'calendar';

export default function App() {
  const { plots, isLoading, updatePlot, getMaintenanceTasks, getPlotById, getDailyTasks, importPlots } = usePlots();
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [currentView, setCurrentView] = useState<ViewType>('grid');
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTaskPanelOpen, setIsTaskPanelOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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

  const handleImport = (importedPlots: Partial<Plot>[]) => {
    importPlots(importedPlots);
  };

  const existingPlotNumbers = useMemo(() => plots.map(p => p.plotNumber), [plots]);

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
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                {currentView === 'grid' && (
                  <FilterBar
                    currentFilter={currentFilter}
                    onFilterChange={setCurrentFilter}
                    counts={filterCounts}
                  />
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-white rounded-xl border border-garden-200 p-1">
                  <button
                    onClick={() => setCurrentView('grid')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                      currentView === 'grid'
                        ? 'bg-garden-500 text-white shadow-sm'
                        : 'text-garden-600 hover:bg-garden-50'
                    }`}
                  >
                    <LayoutGrid size={16} />
                    <span className="hidden sm:inline">网格</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('calendar')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                      currentView === 'calendar'
                        ? 'bg-garden-500 text-white shadow-sm'
                        : 'text-garden-600 hover:bg-garden-50'
                    }`}
                  >
                    <Calendar size={16} />
                    <span className="hidden sm:inline">日历</span>
                  </button>
                </div>
              </div>
            </div>

            {currentView === 'grid' && (
              <>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-garden-600">
                    共 <span className="font-semibold text-garden-800">{filteredPlots.length}</span> 个地块
                  </p>
                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="px-4 py-2 bg-white border border-garden-200 text-garden-700 rounded-xl hover:bg-garden-50 transition-colors font-medium text-sm flex items-center gap-2 shadow-sm"
                  >
                    <Upload size={16} />
                    批量导入
                  </button>
                </div>

                <PlotGrid
                  plots={filteredPlots}
                  onPlotClick={handlePlotClick}
                />
              </>
            )}

            {currentView === 'calendar' && (
              <MaintenanceCalendar
                getDailyTasks={getDailyTasks}
                onTaskClick={handleTaskClick}
              />
            )}
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

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        existingPlotNumbers={existingPlotNumbers}
      />
    </div>
  );
}
