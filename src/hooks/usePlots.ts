import { useState, useEffect, useCallback } from 'react';
import type { Plot, PlotStatus, MaintenanceTask, DailyTask, DashboardStats, MaintenanceRules } from '../types/plot';
import { mockPlots } from '../data/mockData';
import { needsWatering, needsWeeding, daysSince, getUrgency, getNextWaterDate, getNextWeedDate, todayStr, daysSince as getDaysSince, isSameDay } from '../utils/dateUtils';
import { DEFAULT_MAINTENANCE_RULES } from './useMaintenanceRules';

const STORAGE_KEY = 'community-garden-plots';

export const usePlots = (rules: MaintenanceRules = DEFAULT_MAINTENANCE_RULES) => {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPlots(JSON.parse(saved));
      } catch {
        setPlots(mockPlots);
      }
    } else {
      setPlots(mockPlots);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plots));
    }
  }, [plots, isLoading]);

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
    setPlots(prev => prev.map(plot => ({
      ...plot,
      status: computeStatus(plot),
    })));
  }, [computeStatus]);

  useEffect(() => {
    if (!isLoading) {
      recalculateAllStatuses();
    }
  }, [rules, isLoading, recalculateAllStatuses]);

  const updatePlot = (id: string, updates: Partial<Plot>) => {
    setPlots(prev => prev.map(plot => {
      if (plot.id !== id) return plot;

      const updatedPlot = { ...plot, ...updates };

      if (updates.status !== undefined) {
        return updatedPlot;
      }

      return { ...updatedPlot, status: computeStatus(updatedPlot) };
    }));
  };

  const getMaintenanceTasks = useCallback((): MaintenanceTask[] => {
    const tasks: MaintenanceTask[] = [];

    plots.forEach(plot => {
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
    return plots.find(p => p.id === id);
  };

  const getDailyTasks = useCallback((dateStr: string): DailyTask[] => {
    const tasks: DailyTask[] = [];
    const today = todayStr();

    plots.forEach(plot => {
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
  }, [plots, rules]);

  const claimPlot = (id: string, data: {
    owner: string;
    contact: string;
    plant: string;
    firstMaintenanceDate: string;
    notes?: string;
  }) => {
    const today = todayStr();
    setPlots(prev => prev.map(plot => {
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
    }));

    try {
      localStorage.setItem('garden-contact', data.contact);
    } catch (e) {
      console.warn('Failed to save contact to localStorage:', e);
    }
  };

  const importPlots = (importedPlots: Partial<Plot>[]) => {
    setPlots(prev => {
      const updated = [...prev];

      importedPlots.forEach(imported => {
        if (!imported.plotNumber) return;

        const existingIndex = updated.findIndex(p => p.plotNumber === imported.plotNumber);

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

  const getDashboardStats = useCallback((targetPlots?: Plot[]): DashboardStats => {
    const dataPlots = targetPlots ?? plots;
    const totalPlots = dataPlots.length;
    const availablePlots = dataPlots.filter(p => p.status === 'available').length;
    const needsMaintenancePlots = dataPlots.filter(p => p.status === 'needsMaintenance').length;

    const today = todayStr();
    const todayTasks = getDailyTasks(today);
    const targetPlotIds = new Set(dataPlots.map(p => p.id));
    const todayNewTasks = todayTasks.filter(t => targetPlotIds.has(t.plotId) && isSameDay(t.dueDate, today)).length;

    const claimedPlots = dataPlots.filter(p => p.owner);

    let longestUnwateredPlot: DashboardStats['longestUnwateredPlot'] = null;
    let maxWaterDays = -1;
    claimedPlots.forEach(plot => {
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
    claimedPlots.forEach(plot => {
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
  }, [plots, getDailyTasks]);

  return {
    plots,
    isLoading,
    updatePlot,
    claimPlot,
    getMaintenanceTasks,
    getPlotById,
    getDailyTasks,
    importPlots,
    getDashboardStats,
  };
};
