import { useState, useEffect } from 'react';
import type { Plot, PlotStatus, MaintenanceTask } from '../types/plot';
import { mockPlots } from '../data/mockData';
import { needsWatering, needsWeeding, daysSince, getUrgency } from '../utils/dateUtils';

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

  const updatePlot = (id: string, updates: Partial<Plot>) => {
    setPlots(prev => prev.map(plot => {
      if (plot.id === id) {
        let newStatus: PlotStatus = plot.status;
        const updatedPlot = { ...plot, ...updates };
        
        if (!updatedPlot.owner) {
          newStatus = 'available';
        } else if (needsWatering(updatedPlot.lastWatered) || needsWeeding(updatedPlot.lastWeeded)) {
          newStatus = 'needsMaintenance';
        } else {
          newStatus = 'claimed';
        }
        
        return { ...updatedPlot, status: newStatus };
      }
      return plot;
    }));
  };

  const getMaintenanceTasks = (): MaintenanceTask[] => {
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
  };

  const getPlotById = (id: string) => {
    return plots.find(p => p.id === id);
  };

  return {
    plots,
    isLoading,
    updatePlot,
    getMaintenanceTasks,
    getPlotById,
  };
};
