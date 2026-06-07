import { useState, useEffect, useCallback } from 'react';
import type { Plot, PlotStatus, MaintenanceTask, DailyTask } from '../types/plot';
import { mockPlots } from '../data/mockData';
import { needsWatering, needsWeeding, daysSince, getUrgency, getNextWaterDate, getNextWeedDate, todayStr, daysSince as getDaysSince } from '../utils/dateUtils';

const STORAGE_KEY = 'community-garden-plots';

export const usePlots = () => {
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

  const computeStatus = (plot: Partial<Plot>): PlotStatus => {
    if (!plot.owner) {
      return 'available';
    }
    if (needsWatering(plot.lastWatered ?? null) || needsWeeding(plot.lastWeeded ?? null)) {
      return 'needsMaintenance';
    }
    return 'claimed';
  };

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
      if (waterDays > 3) {
        tasks.push({
          plotId: plot.id,
          plotNumber: plot.plotNumber,
          type: 'water',
          daysOverdue: waterDays - 3,
          urgency: getUrgency(waterDays - 3),
        });
      }

      const weedDays = daysSince(plot.lastWeeded);
      if (weedDays > 7) {
        tasks.push({
          plotId: plot.id,
          plotNumber: plot.plotNumber,
          type: 'weed',
          daysOverdue: weedDays - 7,
          urgency: getUrgency(weedDays - 7),
        });
      }
    });

    return tasks.sort((a, b) => {
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });
  }, [plots]);

  const getPlotById = (id: string) => {
    return plots.find(p => p.id === id);
  };

  const getDailyTasks = useCallback((dateStr: string): DailyTask[] => {
    const tasks: DailyTask[] = [];
    const today = todayStr();

    plots.forEach(plot => {
      if (!plot.owner) return;

      const nextWaterDate = getNextWaterDate(plot.lastWatered);
      if (nextWaterDate && nextWaterDate <= dateStr) {
        const daysOverdue = Math.max(0, getDaysSince(plot.lastWatered) - 3);
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

      const nextWeedDate = getNextWeedDate(plot.lastWeeded);
      if (nextWeedDate && nextWeedDate <= dateStr) {
        const daysOverdue = Math.max(0, getDaysSince(plot.lastWeeded) - 7);
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
  }, [plots]);

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
            plant: imported.plant ?? null,
            lastWatered: imported.lastWatered ?? null,
            lastWeeded: imported.lastWeeded ?? null,
            status: computeStatus(imported),
            notes: imported.notes,
          };
          updated.push(newPlot);
        }
      });

      return updated;
    });
  };

  return {
    plots,
    isLoading,
    updatePlot,
    getMaintenanceTasks,
    getPlotById,
    getDailyTasks,
    importPlots,
  };
};
