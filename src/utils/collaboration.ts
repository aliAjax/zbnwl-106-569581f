import type { Plot } from '../types/plot';
import type { ConflictInfo, PlotVersionMap } from '../types/collaboration';

export const generateClientId = (): string => {
  return `client-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
};

export const generateRequestId = (): string => {
  return `req-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
};

export const detectConflicts = (
  basePlot: Plot,
  localChanges: Partial<Plot>,
  remoteChanges: Partial<Plot>
): string[] => {
  const conflictFields: string[] = [];
  const allFields = new Set([...Object.keys(localChanges), ...Object.keys(remoteChanges)]);

  allFields.forEach((field) => {
    const localVal = localChanges[field as keyof Plot];
    const remoteVal = remoteChanges[field as keyof Plot];

    if (field in localChanges && field in remoteChanges) {
      if (JSON.stringify(localVal) !== JSON.stringify(remoteVal)) {
        conflictFields.push(field);
      }
    }
  });

  return conflictFields;
};

export const autoMergeChanges = (
  basePlot: Plot,
  localChanges: Partial<Plot>,
  remoteChanges: Partial<Plot>,
  conflictFields: string[]
): Partial<Plot> => {
  const merged: Partial<Plot> = { ...basePlot };

  Object.keys(remoteChanges).forEach((field) => {
    if (!conflictFields.includes(field)) {
      (merged as Record<string, unknown>)[field] = remoteChanges[field as keyof Plot];
    }
  });

  Object.keys(localChanges).forEach((field) => {
    if (!conflictFields.includes(field)) {
      (merged as Record<string, unknown>)[field] = localChanges[field as keyof Plot];
    }
  });

  return merged;
};

export const resolveConflictWithLocal = (
  basePlot: Plot,
  localChanges: Partial<Plot>,
  remoteChanges: Partial<Plot>
): Partial<Plot> => {
  return { ...basePlot, ...remoteChanges, ...localChanges };
};

export const resolveConflictWithRemote = (
  basePlot: Plot,
  localChanges: Partial<Plot>,
  remoteChanges: Partial<Plot>
): Partial<Plot> => {
  return { ...basePlot, ...localChanges, ...remoteChanges };
};

export const applyChangesToPlot = (plot: Plot, changes: Partial<Plot>): Plot => {
  return { ...plot, ...changes };
};

export const calculatePlotVersions = (plots: Plot[]): PlotVersionMap => {
  const versions: PlotVersionMap = {};
  plots.forEach((plot) => {
    versions[plot.id] = 0;
  });
  return versions;
};

export const incrementVersion = (versions: PlotVersionMap, plotId: string): PlotVersionMap => {
  return {
    ...versions,
    [plotId]: (versions[plotId] || 0) + 1,
  };
};

export const createConflictInfo = (
  type: ConflictInfo['type'],
  plotId: string,
  basePlot: Plot,
  localChanges: Partial<Plot>,
  remoteChanges: Partial<Plot>,
  remoteClientId: string,
  remoteTimestamp: number
): ConflictInfo => {
  const conflictFields = detectConflicts(basePlot, localChanges, remoteChanges);
  return {
    type,
    plotId,
    localChanges,
    remoteChanges,
    localTimestamp: Date.now(),
    remoteTimestamp,
    remoteClientId,
    conflictFields,
    basePlot,
  };
};
