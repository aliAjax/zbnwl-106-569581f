import { useState, useEffect, useCallback, useRef } from 'react';
import type { Plot, PlotHistoryEntry } from '../types/plot';
import { useGardenStore } from '../store/useGardenStore';

const HISTORY_FIELDS: (keyof Plot)[] = [
  'owner',
  'plant',
  'lastWatered',
  'lastWeeded',
  'status',
  'notes',
];

const FIELD_LABELS: Record<string, string> = {
  owner: '认领人',
  plant: '种植物',
  lastWatered: '浇水日期',
  lastWeeded: '除草日期',
  status: '状态',
  notes: '备注',
};

const STATUS_LABELS: Record<string, string> = {
  available: '待认领',
  claimed: '已认领',
  needsMaintenance: '需维护',
};

export const formatFieldValue = (field: string, value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return '（空）';
  }
  if (field === 'status' && typeof value === 'string') {
    return STATUS_LABELS[value] || value;
  }
  return String(value);
};

export const generateHistoryDescription = (
  before: Partial<Plot>,
  after: Partial<Plot>
): string => {
  const changes: string[] = [];

  HISTORY_FIELDS.forEach((field) => {
    const beforeVal = before[field];
    const afterVal = after[field];

    if (beforeVal !== afterVal) {
      const label = FIELD_LABELS[field] || field;
      const beforeStr = formatFieldValue(field, beforeVal);
      const afterStr = formatFieldValue(field, afterVal);
      changes.push(`${label}: ${beforeStr} → ${afterStr}`);
    }
  });

  if (changes.length === 0) {
    return '无实际变更';
  }

  return changes.join('；');
};

const filterPlotHistoryFields = (plot: Partial<Plot>): Partial<Plot> => {
  const filtered: Partial<Plot> = {};
  HISTORY_FIELDS.forEach((field) => {
    if (field in plot) {
      (filtered as Record<string, unknown>)[field] = plot[field];
    }
  });
  return filtered;
};

export const usePlotHistory = () => {
  const currentGardenId = useGardenStore((state) => state.currentGardenId);
  const gardenData = useGardenStore((state) =>
    state.currentGardenId ? state.gardenData[state.currentGardenId] : null
  );
  const updateHistory = useGardenStore((state) => state.updateHistory);

  const [history, setHistory] = useState<PlotHistoryEntry[]>([]);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
  const lastSyncedGardenIdRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    if (gardenData && currentGardenId) {
      isInitialLoadRef.current = true;
      const migrated = (gardenData.history || []).map((entry) => ({
        ...entry,
        before: entry.before ?? {},
        after: entry.after ?? {},
      }));
      setHistory(migrated);
      lastSyncedGardenIdRef.current = currentGardenId;
      setIsHistoryLoaded(true);
    } else {
      setHistory([]);
      setIsHistoryLoaded(true);
    }
  }, [gardenData, currentGardenId]);

  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }
    if (currentGardenId && isHistoryLoaded && lastSyncedGardenIdRef.current === currentGardenId) {
      updateHistory(currentGardenId, history);
    }
  }, [history, currentGardenId, isHistoryLoaded, updateHistory]);

  const addHistoryEntry = useCallback(
    (
      plotId: string,
      action: PlotHistoryEntry['action'],
      before: Partial<Plot>,
      after: Partial<Plot>,
      customDescription?: string
    ): PlotHistoryEntry | null => {
      const beforeFiltered = filterPlotHistoryFields(before);
      const afterFiltered = filterPlotHistoryFields(after);

      const hasChanges = HISTORY_FIELDS.some(
        (field) => beforeFiltered[field] !== afterFiltered[field]
      );

      if (!hasChanges && action === 'update') {
        return null;
      }

      const description =
        customDescription ||
        generateHistoryDescription(beforeFiltered, afterFiltered);

      const entry: PlotHistoryEntry = {
        id: crypto.randomUUID(),
        plotId,
        timestamp: new Date().toISOString(),
        action,
        description,
        before: beforeFiltered,
        after: afterFiltered,
      };

      setHistory((prev) => [...prev, entry]);
      return entry;
    },
    []
  );

  const addHistoryEntries = useCallback(
    (entries: PlotHistoryEntry[]) => {
      setHistory((prev) => {
        const existingIds = new Set(prev.map((e) => e.id));
        const newEntries = entries.filter((e) => !existingIds.has(e.id));
        return newEntries.length > 0 ? [...prev, ...newEntries] : prev;
      });
    },
    []
  );

  const getHistoryByPlotId = useCallback(
    (plotId: string): PlotHistoryEntry[] => {
      return history
        .filter((entry) => entry.plotId === plotId)
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    },
    [history]
  );

  const getHistoryEntryById = useCallback(
    (entryId: string): PlotHistoryEntry | undefined => {
      return history.find((entry) => entry.id === entryId);
    },
    [history]
  );

  const deleteHistoryByPlotId = useCallback((plotId: string) => {
    setHistory((prev) => prev.filter((entry) => entry.plotId !== plotId));
  }, []);

  const clearAllHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    history,
    isHistoryLoaded,
    addHistoryEntry,
    addHistoryEntries,
    getHistoryByPlotId,
    getHistoryEntryById,
    deleteHistoryByPlotId,
    clearAllHistory,
  };
};
