import { useState, useEffect, useCallback, useRef } from 'react';
import type { Plot, PlotStatus, MaintenanceTask, DailyTask, DashboardStats, MaintenanceRules } from '../types/plot';
import { needsWatering, needsWeeding, daysSince, getUrgency, getNextWaterDate, getNextWeedDate, todayStr, daysSince as getDaysSince, isSameDay } from '../utils/dateUtils';
import { DEFAULT_MAINTENANCE_RULES } from './useMaintenanceRules';
import { useGardenStore } from '../store/useGardenStore';
import { usePlotHistory } from './usePlotHistory';

const HISTORY_FIELDS: (keyof Plot)[] = [
  'owner',
  'plant',
  'lastWatered',
  'lastWeeded',
  'status',
  'notes',
];

export const usePlots = (rules: MaintenanceRules = DEFAULT_MAINTENANCE_RULES) => {
  const currentGardenId = useGardenStore((state) => state.currentGardenId);
  const gardenData = useGardenStore((state) =>
    state.currentGardenId ? state.gardenData[state.currentGardenId] : null
  );
  const updatePlots = useGardenStore((state) => state.updatePlots);

  const [plots, setPlots] = useState<Plot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const lastSyncedGardenIdRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef(true);

  const {
    addHistoryEntry,
    getHistoryByPlotId,
    getHistoryEntryById,
    isHistoryLoaded,
  } = usePlotHistory();

  useEffect(() => {
    if (gardenData && currentGardenId) {
      isInitialLoadRef.current = true;
      setPlots(gardenData.plots);
      lastSyncedGardenIdRef.current = currentGardenId;
      setIsLoading(false);
    } else {
        setPlots([]);
        setIsLoading(false);
      }
  }, [gardenData, currentGardenId]);

  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }
    if (currentGardenId && !isLoading && lastSyncedGardenIdRef.current === currentGardenId) {
      updatePlots(currentGardenId, plots);
    }
  }, [plots, currentGardenId, isLoading, updatePlots]);

  const computeStatus = useCallback((plot: Partial<Plot>): PlotStatus => {
    if (!plot.owner) {
      return 'available';
    }
    if (needsWatering(plot.lastWatered ?? null, rules) || needsWeeding(plot.lastWeeded ?? null, rules)) {
      return 'needsMaintenance';
    }
    return 'claimed';
  }, [rules]);

  const recalculateAllStatuses = useCallback(() => {
    setPlots((prev) =>
      prev.map((plot) => ({
        ...plot,
        status: computeStatus(plot),
      }))
    );
  }, [computeStatus]);

  useEffect(() => {
    if (!isLoading) {
      recalculateAllStatuses();
    }
  }, [rules, isLoading, recalculateAllStatuses]);

  const updatePlot = (id: string, updates: Partial<Plot>) => {
    const currentPlot = plots.find((p) => p.id === id);
    if (!currentPlot) return;

    const before: Partial<Plot> = {};
    HISTORY_FIELDS.forEach((field) => {
      (before as Record<string, unknown>)[field] = currentPlot[field];
    });

    setPlots((prev) =>
      prev.map((plot) => {
        if (plot.id !== id) return plot;

        const updatedPlot = { ...plot, ...updates };

        if (updates.status !== undefined) {
          return updatedPlot;
        }

        return { ...updatedPlot, status: computeStatus(updatedPlot) };
      })
    );

    setTimeout(() => {
      setPlots((prev) => {
        const updatedPlot = prev.find((p) => p.id === id);
        if (updatedPlot) {
          const after: Partial<Plot> = {};
          HISTORY_FIELDS.forEach((field) => {
            (after as Record<string, unknown>)[field] = updatedPlot[field];
          });
          addHistoryEntry(id, 'update', before, after);
        }
        return prev;
      });
    }, 0);
  };

  const rollbackPlot = (plotId: string, historyEntryId: string): boolean => {
    const entry = getHistoryEntryById(historyEntryId);
    if (!entry) return false;

    const currentPlot = plots.find((p) => p.id === plotId);
    if (!currentPlot) return false;

    const beforeRollback: Partial<Plot> = {};
    HISTORY_FIELDS.forEach((field) => {
      (beforeRollback as Record<string, unknown>)[field] = currentPlot[field];
    });

    const rollbackData: Partial<Plot> = { ...entry.before };

    if (rollbackData.status === undefined) {
      rollbackData.status = computeStatus(rollbackData);
    }

    setPlots((prev) =>
      prev.map((plot) => {
        if (plot.id !== plotId) return plot;
        return { ...plot, ...rollbackData };
      })
    );

    setTimeout(() => {
      setPlots((prev) => {
        const afterRollbackPlot = prev.find((p) => p.id === plotId);
        if (afterRollbackPlot) {
          const afterRollback: Partial<Plot> = {};
          HISTORY_FIELDS.forEach((field) => {
            (afterRollback as Record<string, unknown>)[field] = afterRollbackPlot[field];
          });
          addHistoryEntry(
            plotId,
            'rollback',
            beforeRollback,
            afterRollback,
            `回滚到 ${new Date(entry.timestamp).toLocaleString('zh-CN')} 的版本`
          );
        }
        return prev;
      });
    }, 0);

    return true;
  };

  const getMaintenanceTasks = useCallback((): MaintenanceTask[] => {
    const tasks: MaintenanceTask[] = [];

    plots.forEach((plot) => {
      if (!plot.owner) return;

      const waterDays = daysSince(plot.lastWatered);
      if (waterDays > rules.waterOverdueDays) {
        const daysOverdue = waterDays - rules.waterOverdueDays;
        tasks.push({
          plotId: plot.id,
          plotNumber: plot.plotNumber,
          type: 'water',
          daysOverdue,
          urgency: getUrgency(daysOverdue, rules),
        });
      }

      const weedDays = daysSince(plot.lastWeeded);
      if (weedDays > rules.weedOverdueDays) {
        const daysOverdue = weedDays - rules.weedOverdueDays;
        tasks.push({
          plotId: plot.id,
          plotNumber: plot.plotNumber,
          type: 'weed',
          daysOverdue,
          urgency: getUrgency(daysOverdue, rules),
        });
      }
    });

    return tasks.sort((a, b) => {
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });
  }, [plots, rules]);

  const getPlotById = (id: string) => {
    return plots.find((p) => p.id === id);
  };

  const getDailyTasks = useCallback(
    (dateStr: string): DailyTask[] => {
      const tasks: DailyTask[] = [];
      const today = todayStr();

      plots.forEach((plot) => {
        if (!plot.owner) return;

        const nextWaterDate = getNextWaterDate(plot.lastWatered, rules);
        if (nextWaterDate && nextWaterDate <= dateStr) {
          const daysOverdue = Math.max(0, getDaysSince(plot.lastWatered) - rules.waterOverdueDays);
          tasks.push({
            plotId: plot.id,
            plotNumber: plot.plotNumber,
            plant: plot.plant,
            owner: plot.owner,
            type: 'water',
            dueDate: nextWaterDate,
            isOverdue: nextWaterDate < today,
            daysOverdue,
          });
        }

        const nextWeedDate = getNextWeedDate(plot.lastWeeded, rules);
        if (nextWeedDate && nextWeedDate <= dateStr) {
          const daysOverdue = Math.max(0, getDaysSince(plot.lastWeeded) - rules.weedOverdueDays);
          tasks.push({
            plotId: plot.id,
            plotNumber: plot.plotNumber,
            plant: plot.plant,
            owner: plot.owner,
            type: 'weed',
            dueDate: nextWeedDate,
            isOverdue: nextWeedDate < today,
            daysOverdue,
          });
        }
      });

      return tasks;
    },
    [plots, rules]
  );

  const claimPlot = (
    id: string,
    data: {
      owner: string;
      contact: string;
      plant: string;
      firstMaintenanceDate: string;
      notes?: string;
    }
  ) => {
    const currentPlot = plots.find((p) => p.id === id);
    const before: Partial<Plot> = {};
    if (currentPlot) {
      HISTORY_FIELDS.forEach((field) => {
        (before as Record<string, unknown>)[field] = currentPlot[field];
      });
    }

    const today = todayStr();
    setPlots((prev) =>
      prev.map((plot) => {
        if (plot.id !== id) return plot;
        return {
          ...plot,
          owner: data.owner,
          contact: data.contact,
          plant: data.plant,
          firstMaintenanceDate: data.firstMaintenanceDate,
          lastWatered: today,
          lastWeeded: today,
          status: 'claimed' as PlotStatus,
          notes: data.notes || plot.notes,
        };
      })
    );

    setTimeout(() => {
      setPlots((prev) => {
        const updatedPlot = prev.find((p) => p.id === id);
        if (updatedPlot) {
          const after: Partial<Plot> = {};
          HISTORY_FIELDS.forEach((field) => {
            (after as Record<string, unknown>)[field] = updatedPlot[field];
          });
          addHistoryEntry(id, 'claim', before, after, `认领地块：${data.owner}`);
        }
        return prev;
      });
    }, 0);

    try {
      localStorage.setItem('garden-contact', data.contact);
    } catch (e) {
      console.warn('Failed to save contact to localStorage:', e);
    }
  };

  const importPlots = (importedPlots: Partial<Plot>[]) => {
    setPlots((prev) => {
      const updated = [...prev];

      importedPlots.forEach((imported) => {
        if (!imported.plotNumber) return;

        const existingIndex = updated.findIndex((p) => p.plotNumber === imported.plotNumber);

        if (existingIndex >= 0) {
          const existing = updated[existingIndex];
          const merged = { ...existing, ...imported };
          updated[existingIndex] = {
            ...merged,
            status: computeStatus(merged),
          };
        } else {
          const newPlot: Plot = {
            id: crypto.randomUUID(),
            plotNumber: imported.plotNumber!,
            owner: imported.owner ?? null,
            contact: imported.contact ?? null,
            plant: imported.plant ?? null,
            lastWatered: imported.lastWatered ?? null,
            lastWeeded: imported.lastWeeded ?? null,
            firstMaintenanceDate: imported.firstMaintenanceDate ?? null,
            status: computeStatus(imported),
            notes: imported.notes,
          };
          updated.push(newPlot);
        }
      });

      return updated;
    });
  };

  const getDashboardStats = useCallback(
    (targetPlots?: Plot[]): DashboardStats => {
      const dataPlots = targetPlots ?? plots;
      const totalPlots = dataPlots.length;
      const availablePlots = dataPlots.filter((p) => p.status === 'available').length;
      const needsMaintenancePlots = dataPlots.filter((p) => p.status === 'needsMaintenance').length;

      const today = todayStr();
      const todayTasks = getDailyTasks(today);
      const targetPlotIds = new Set(dataPlots.map((p) => p.id));
      const todayNewTasks = todayTasks.filter((t) => targetPlotIds.has(t.plotId) && isSameDay(t.dueDate, today)).length;

      const claimedPlots = dataPlots.filter((p) => p.owner);

      let longestUnwateredPlot: DashboardStats['longestUnwateredPlot'] = null;
      let maxWaterDays = -1;
      claimedPlots.forEach((plot) => {
        const days = daysSince(plot.lastWatered);
        if (days !== Infinity && days > maxWaterDays) {
          maxWaterDays = days;
          longestUnwateredPlot = {
            plotNumber: plot.plotNumber,
            days,
            plant: plot.plant,
          };
        }
      });

      let longestUnweededPlot: DashboardStats['longestUnweededPlot'] = null;
      let maxWeedDays = -1;
      claimedPlots.forEach((plot) => {
        const days = daysSince(plot.lastWeeded);
        if (days !== Infinity && days > maxWeedDays) {
          maxWeedDays = days;
          longestUnweededPlot = {
            plotNumber: plot.plotNumber,
            days,
            plant: plot.plant,
          };
        }
      });

      return {
        totalPlots,
        availablePlots,
        needsMaintenancePlots,
        todayNewTasks,
        longestUnwateredPlot,
        longestUnweededPlot,
      };
    },
    [plots, getDailyTasks]
  );

  return {
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
  };
};
