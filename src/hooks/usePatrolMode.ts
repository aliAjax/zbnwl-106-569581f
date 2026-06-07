import { useState, useEffect, useCallback } from 'react';
import type { Plot, DailyTask } from '../types/plot';
import { todayStr } from '../utils/dateUtils';

const STORAGE_KEY = 'community-garden-patrol-progress';

interface PatrolProgress {
  date: string;
  currentIndex: number;
  completedPlotIds: string[];
  notesByPlotId: Record<string, string>;
  plotIds: string[];
  tasksByPlotId: Record<string, DailyTask[]>;
}

interface UsePatrolModeProps {
  plots: Plot[];
  getDailyTasks: (dateStr: string) => DailyTask[];
  updatePlot: (id: string, updates: Partial<Plot>) => void;
}

export const usePatrolMode = ({ plots, getDailyTasks, updatePlot }: UsePatrolModeProps) => {
  const [isPatrolModeActive, setIsPatrolModeActive] = useState(false);
  const [progress, setProgress] = useState<PatrolProgress>({
    date: todayStr(),
    currentIndex: 0,
    completedPlotIds: [],
    notesByPlotId: {},
    plotIds: [],
    tasksByPlotId: {},
  });

  const today = todayStr();

  const createProgress = useCallback((): PatrolProgress => {
    const dailyTasks = getDailyTasks(today);
    const tasksByPlotId = dailyTasks.reduce<Record<string, DailyTask[]>>((acc, task) => {
      acc[task.plotId] = [...(acc[task.plotId] || []), task];
      return acc;
    }, {});
    const taskPlotIds = new Set(Object.keys(tasksByPlotId));

    const plotIds = plots
      .filter(plot => plot.owner && taskPlotIds.has(plot.id))
      .sort((a, b) => a.plotNumber.localeCompare(b.plotNumber, undefined, { numeric: true }))
      .map(plot => plot.id);

    return {
      date: today,
      currentIndex: 0,
      completedPlotIds: [],
      notesByPlotId: {},
      plotIds,
      tasksByPlotId,
    };
  }, [plots, getDailyTasks, today]);

  const getProgressPlots = useCallback((plotIds: string[]) => {
    return plotIds
      .map(id => plots.find(plot => plot.id === id))
      .filter((plot): plot is Plot => Boolean(plot));
  }, [plots]);

  const loadProgress = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PatrolProgress = JSON.parse(saved);
        if (
          parsed.date === today &&
          Array.isArray(parsed.plotIds) &&
          parsed.tasksByPlotId
        ) {
          const availablePlotIds = new Set(plots.map(plot => plot.id));
          const plotIds = parsed.plotIds.filter(id => availablePlotIds.has(id));
          setProgress({
            ...parsed,
            plotIds,
            currentIndex: Math.min(parsed.currentIndex, plotIds.length),
          });
          return true;
        }
      }
    } catch {
      // ignore
    }
    return false;
  }, [today, plots]);

  const saveProgress = useCallback((newProgress: PatrolProgress) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (isPatrolModeActive) {
      loadProgress();
    }
  }, [isPatrolModeActive, loadProgress]);

  useEffect(() => {
    if (isPatrolModeActive) {
      saveProgress(progress);
    }
  }, [progress, isPatrolModeActive, saveProgress]);

  const startPatrol = useCallback(() => {
    const hasSavedProgress = loadProgress();
    if (!hasSavedProgress) {
      setProgress(createProgress());
    }
    setIsPatrolModeActive(true);
  }, [createProgress, loadProgress]);

  const exitPatrol = useCallback(() => {
    setIsPatrolModeActive(false);
  }, []);

  const resetProgress = useCallback(() => {
    const newProgress = createProgress();
    setProgress(newProgress);
    saveProgress(newProgress);
  }, [createProgress, saveProgress]);

  const currentPlots = getProgressPlots(progress.plotIds);

  const currentPlot = currentPlots[progress.currentIndex] || null;

  const getTasksForPlot = useCallback((plotId: string): DailyTask[] => {
    return progress.tasksByPlotId[plotId] || [];
  }, [progress.tasksByPlotId]);

  const markWatered = useCallback((plotId: string) => {
    updatePlot(plotId, { lastWatered: today });
  }, [updatePlot, today]);

  const markWeeded = useCallback((plotId: string) => {
    updatePlot(plotId, { lastWeeded: today });
  }, [updatePlot, today]);

  const updateNotes = useCallback((plotId: string, notes: string) => {
    setProgress(prev => {
      const newNotesByPlotId = { ...prev.notesByPlotId, [plotId]: notes };
      return { ...prev, notesByPlotId: newNotesByPlotId };
    });
  }, []);

  const saveNotesToPlot = useCallback((plotId: string) => {
    const notes = progress.notesByPlotId[plotId];
    if (notes !== undefined) {
      const plot = plots.find(p => p.id === plotId);
      const existingNotes = plot?.notes || '';
      const combinedNotes = existingNotes
        ? `${existingNotes}\n[${today}] ${notes}`
        : `[${today}] ${notes}`;
      updatePlot(plotId, { notes: combinedNotes });
    }
  }, [progress.notesByPlotId, plots, updatePlot, today]);

  const markCompleteAndNext = useCallback((plotId: string) => {
    saveNotesToPlot(plotId);

    setProgress(prev => {
      const newCompleted = prev.completedPlotIds.includes(plotId)
        ? prev.completedPlotIds
        : [...prev.completedPlotIds, plotId];

      const nextIndex = prev.currentIndex + 1;

      return {
        ...prev,
        currentIndex: nextIndex,
        completedPlotIds: newCompleted,
      };
    });
  }, [saveNotesToPlot]);

  const goToPrevious = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      currentIndex: Math.max(0, prev.currentIndex - 1),
    }));
  }, []);

  const skipCurrent = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      currentIndex: prev.currentIndex + 1,
    }));
  }, []);

  const hasUnfinishedProgress = useCallback((): boolean => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PatrolProgress = JSON.parse(saved);
        if (parsed.date === today && Array.isArray(parsed.plotIds)) {
          return parsed.currentIndex < parsed.plotIds.length;
        }
      }
    } catch {
      // ignore
    }
    return false;
  }, [today]);

  const getProgressStats = useCallback(() => {
    const total = progress.plotIds.length;
    return {
      total,
      completed: progress.completedPlotIds.length,
      current: progress.currentIndex + 1,
      remaining: Math.max(0, total - progress.currentIndex),
    };
  }, [progress.completedPlotIds.length, progress.currentIndex, progress.plotIds.length]);

  return {
    isPatrolModeActive,
    currentPlot,
    currentPlots,
    progress,
    startPatrol,
    exitPatrol,
    resetProgress,
    markWatered,
    markWeeded,
    updateNotes,
    markCompleteAndNext,
    goToPrevious,
    skipCurrent,
    getTasksForPlot,
    hasUnfinishedProgress,
    getProgressStats,
  };
};
