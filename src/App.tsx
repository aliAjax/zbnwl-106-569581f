import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Menu, Sprout, Upload, LayoutGrid, Calendar, LayoutDashboard, Settings, MapPin, Wifi, WifiOff } from 'lucide-react';
import { PlotGrid } from './components/PlotGrid';
import { EditModal } from './components/EditModal';
import { ClaimWizard } from './components/ClaimWizard';
import { TaskPanel } from './components/TaskPanel';
import { FilterBar } from './components/FilterBar';
import { ImportModal } from './components/ImportModal';
import { MaintenanceCalendar } from './components/MaintenanceCalendar';
import { Dashboard } from './components/Dashboard';
import { RulesConfigModal } from './components/RulesConfigModal';
import { PatrolMode } from './components/PatrolMode';
import { GardenList } from './components/GardenList';
import { GardenSwitcher } from './components/GardenSwitcher';
import { ConflictResolverModal } from './components/ConflictResolverModal';
import { usePlots } from './hooks/usePlots';
import { useMaintenanceRules } from './hooks/useMaintenanceRules';
import { usePatrolMode } from './hooks/usePatrolMode';
import { useGardenStore } from './store/useGardenStore';
import { useCollaborationSync } from './hooks/useCollaborationSync';
import { usePlotHistory } from './hooks/usePlotHistory';
import type { Plot, FilterType, PlotHistoryEntry, MaintenanceRules } from './types/plot';
import type { ConflictInfo } from './types/collaboration';

type ViewType = 'dashboard' | 'grid' | 'calendar';
type PageType = 'garden-detail' | 'garden-list';

export default function App() {
  const initialize = useGardenStore((state) => state.initialize);
  const setCurrentGarden = useGardenStore((state) => state.setCurrentGarden);
  const isStoreLoading = useGardenStore((state) => state.isLoading);
  const gardens = useGardenStore((state) => state.gardens);
  const currentGardenId = useGardenStore((state) => state.currentGardenId);

  const [currentPage, setCurrentPage] = useState<PageType>('garden-detail');

  useEffect(() => {
    initialize();
  }, [initialize]);

  const { rules, updateRules, resetToDefault, isLoading: rulesLoading } = useMaintenanceRules();
  const { addHistoryEntries } = usePlotHistory();
  const {
    plots,
    isLoading,
    isHistoryLoaded,
    updatePlot,
    claimPlot,
    rollbackPlot,
    getMaintenanceTasks,
    getPlotById,
    getDailyTasks,
    importPlots,
    getDashboardStats,
    getHistoryByPlotId,
    setSyncHandlers,
    applyRemotePlotUpdate,
    applyRemotePlotClaim,
    applyRemotePlotRollback,
    applyRemotePlotsBatchUpdate,
  } = usePlots({ rules, enableSync: true });

  const [currentConflict, setCurrentConflict] = useState<ConflictInfo | null>(null);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const conflictQueueRef = useRef<ConflictInfo[]>([]);

  const handleConflictDetected = useCallback((conflict: ConflictInfo) => {
    if (currentConflict) {
      conflictQueueRef.current.push(conflict);
    } else {
      setCurrentConflict(conflict);
      setIsConflictModalOpen(true);
    }
  }, [currentConflict]);

  const processNextConflict = useCallback(() => {
    if (conflictQueueRef.current.length > 0) {
      const next = conflictQueueRef.current.shift()!;
      setCurrentConflict(next);
      setIsConflictModalOpen(true);
    } else {
      setCurrentConflict(null);
      setIsConflictModalOpen(false);
    }
  }, []);

  const {
    syncState,
    sendPlotUpdate,
    sendPlotClaim,
    sendPlotRollback,
    resolveConflict,
  } = useCollaborationSync({
    gardenId: currentGardenId,
    getCurrentPlot: getPlotById,
    onRemotePlotUpdate: applyRemotePlotUpdate,
    onRemotePlotClaim: applyRemotePlotClaim,
    onRemotePlotRollback: applyRemotePlotRollback,
    onRemotePlotsBatchUpdate: applyRemotePlotsBatchUpdate,
    onRemoteHistoryAdd: (entries: PlotHistoryEntry[]) => {
      addHistoryEntries(entries);
    },
    onRemoteRulesUpdate: (newRules: MaintenanceRules) => {
      updateRules(newRules);
    },
    onConflictDetected: handleConflictDetected,
  });

  const handleResolveConflict = useCallback(
    (conflict: ConflictInfo, choice: 'local' | 'remote' | 'merge') => {
      resolveConflict(conflict, choice);
      processNextConflict();
    },
    [resolveConflict, processNextConflict]
  );

  const handleCloseConflict = useCallback(() => {
    processNextConflict();
  }, [processNextConflict]);

  useEffect(() => {
    setSyncHandlers({
      onLocalPlotUpdate: sendPlotUpdate,
      onLocalPlotClaim: sendPlotClaim,
      onLocalPlotRollback: sendPlotRollback,
    });
  }, [setSyncHandlers, sendPlotUpdate, sendPlotClaim, sendPlotRollback]);

  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClaimWizardOpen, setIsClaimWizardOpen] = useState(false);
  const [claimingPlot, setClaimingPlot] = useState<Plot | null>(null);
  const [isTaskPanelOpen, setIsTaskPanelOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRulesConfigOpen, setIsRulesConfigOpen] = useState(false);

  const patrol = usePatrolMode({
    plots,
    getDailyTasks,
    updatePlot,
  });

  const tasksForCurrentPlot = patrol.currentPlot
    ? patrol.getTasksForPlot(patrol.currentPlot.id)
    : [];
  const progressStats = patrol.getProgressStats();

  const tasks = useMemo(() => getMaintenanceTasks(), [getMaintenanceTasks]);

  const filteredPlots = useMemo(() => {
    switch (currentFilter) {
      case 'available':
        return plots.filter((p) => p.status === 'available');
      case 'claimed':
        return plots.filter((p) => p.status === 'claimed');
      case 'needsMaintenance':
        return plots.filter((p) => p.status === 'needsMaintenance');
      default:
        return plots;
    }
  }, [plots, currentFilter]);

  const filterCounts = useMemo(
    () => ({
      all: plots.length,
      available: plots.filter((p) => p.status === 'available').length,
      claimed: plots.filter((p) => p.status === 'claimed').length,
      needsMaintenance: plots.filter((p) => p.status === 'needsMaintenance').length,
    }),
    [plots]
  );

  const dashboardStats = useMemo(
    () => getDashboardStats(filteredPlots),
    [getDashboardStats, filteredPlots]
  );

  const handlePlotClick = (plot: Plot) => {
    setSelectedPlot(plot);
    setIsModalOpen(true);
  };

  const handlePlotClaim = (plot: Plot) => {
    setClaimingPlot(plot);
    setIsClaimWizardOpen(true);
  };

  const handleClaimSubmit = (
    id: string,
    data: {
      owner: string;
      contact: string;
      plant: string;
      firstMaintenanceDate: string;
      notes?: string;
    }
  ) => {
    claimPlot(id, data);
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

  const existingPlotNumbers = useMemo(() => plots.map((p) => p.plotNumber), [plots]);

  const handleSelectGarden = (gardenId: string) => {
    setCurrentGarden(gardenId);
    setCurrentPage('garden-detail');
    setSelectedPlot(null);
    setIsModalOpen(false);
    patrol.exitPatrol();
  };

  const handleOpenGardenList = () => {
    setCurrentPage('garden-list');
  };

  const handleBackToDetail = () => {
    setCurrentPage('garden-detail');
  };

  const overallLoading = isLoading || rulesLoading || isStoreLoading;

  if (currentPage === 'garden-list') {
    return (
      <GardenList
        onSelectGarden={handleSelectGarden}
        onBack={handleBackToDetail}
      />
    );
  }

  if (overallLoading || !currentGardenId || gardens.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
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
              <GardenSwitcher onOpenGardenList={handleOpenGardenList} />
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
                {(currentView === 'dashboard' || currentView === 'grid') && (
                  <FilterBar
                    currentFilter={currentFilter}
                    onFilterChange={setCurrentFilter}
                    counts={filterCounts}
                  />
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={patrol.startPatrol}
                  className="px-4 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors font-medium text-sm flex items-center gap-2 shadow-sm shadow-amber-500/20"
                >
                  <MapPin size={16} />
                  <span className="hidden sm:inline">巡园模式</span>
                  <span className="sm:hidden">巡园</span>
                  {patrol.hasUnfinishedProgress() && (
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </button>
                <div className="flex bg-white rounded-xl border border-garden-200 p-1">
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    aria-label="切换到概览仪表盘"
                    aria-pressed={currentView === 'dashboard'}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                      currentView === 'dashboard'
                        ? 'bg-garden-500 text-white shadow-sm'
                        : 'text-garden-600 hover:bg-garden-50'
                    }`}
                  >
                    <LayoutDashboard size={16} aria-hidden="true" />
                    <span className="hidden sm:inline">概览</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('grid')}
                    aria-label="切换到网格视图"
                    aria-pressed={currentView === 'grid'}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                      currentView === 'grid'
                        ? 'bg-garden-500 text-white shadow-sm'
                        : 'text-garden-600 hover:bg-garden-50'
                    }`}
                  >
                    <LayoutGrid size={16} aria-hidden="true" />
                    <span className="hidden sm:inline">网格</span>
                  </button>
                  <button
                    onClick={() => setCurrentView('calendar')}
                    aria-label="切换到日历视图"
                    aria-pressed={currentView === 'calendar'}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                      currentView === 'calendar'
                        ? 'bg-garden-500 text-white shadow-sm'
                        : 'text-garden-600 hover:bg-garden-50'
                    }`}
                  >
                    <Calendar size={16} aria-hidden="true" />
                    <span className="hidden sm:inline">日历</span>
                  </button>
                </div>
                <button
                  onClick={() => setIsRulesConfigOpen(true)}
                  aria-label="维护规则配置"
                  className="p-2.5 rounded-xl bg-white border border-garden-200 text-garden-600 hover:bg-garden-50 hover:text-garden-700 transition-colors"
                >
                  <Settings size={18} />
                </button>
              </div>
            </div>

            {currentView === 'dashboard' && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-garden-800 mb-4">概览仪表盘</h2>
                <Dashboard
                  stats={dashboardStats}
                  onStartPatrol={patrol.startPatrol}
                  hasUnfinishedPatrol={patrol.hasUnfinishedProgress()}
                />
              </div>
            )}

            {currentView === 'grid' && (
              <>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-garden-600">
                    共{' '}
                    <span className="font-semibold text-garden-800">{filteredPlots.length}</span>{' '}
                    个地块
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
                  onPlotClaim={handlePlotClaim}
                  rules={rules}
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
        history={selectedPlot ? getHistoryByPlotId(selectedPlot.id) : []}
        onRollback={(entryId) => {
          if (selectedPlot) {
            rollbackPlot(selectedPlot.id, entryId);
          }
        }}
        isHistoryLoaded={isHistoryLoaded}
      />

      <ClaimWizard
        plot={claimingPlot}
        isOpen={isClaimWizardOpen}
        onClose={() => {
          setIsClaimWizardOpen(false);
          setClaimingPlot(null);
        }}
        onClaim={handleClaimSubmit}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
        existingPlotNumbers={existingPlotNumbers}
      />

      <RulesConfigModal
        isOpen={isRulesConfigOpen}
        onClose={() => setIsRulesConfigOpen(false)}
        rules={rules}
        onSave={updateRules}
        onReset={resetToDefault}
      />

      <PatrolMode
        isOpen={patrol.isPatrolModeActive}
        currentPlot={patrol.currentPlot}
        progress={patrol.progress}
        progressStats={progressStats}
        tasksForPlot={tasksForCurrentPlot}
        onClose={patrol.exitPatrol}
        onMarkWatered={patrol.markWatered}
        onMarkWeeded={patrol.markWeeded}
        onUpdateNotes={patrol.updateNotes}
        onMarkCompleteAndNext={patrol.markCompleteAndNext}
        onPrevious={patrol.goToPrevious}
        onSkip={patrol.skipCurrent}
        onReset={patrol.resetProgress}
      />

      <ConflictResolverModal
        conflict={currentConflict}
        isOpen={isConflictModalOpen}
        onResolve={handleResolveConflict}
        onClose={handleCloseConflict}
      />

      {currentGardenId && (
        <div className="fixed bottom-4 right-4 z-40">
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium shadow-md ${
              syncState.isConnected
                ? 'bg-garden-100 text-garden-700 border border-garden-200'
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}
          >
            {syncState.isConnected ? (
              <Wifi size={14} className="text-garden-600" />
            ) : (
              <WifiOff size={14} className="text-gray-500" />
            )}
            <span>
              {syncState.isConnected
                ? `同步中 (${syncState.otherClients.length + 1} 个标签页)`
                : '同步离线'}
            </span>
            {syncState.pendingConflicts.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-warning text-white rounded-full text-[10px]">
                {syncState.pendingConflicts.length} 冲突
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
