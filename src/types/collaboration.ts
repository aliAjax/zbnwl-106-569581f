import type { Plot, PlotHistoryEntry, MaintenanceRules } from './plot';

export const CHANNEL_NAME = 'garden-plot-sync';
export const STORAGE_SYNC_KEY = 'garden-sync-event';

export type SyncActionType =
  | 'plot-update'
  | 'plot-claim'
  | 'plot-rollback'
  | 'plots-batch-update'
  | 'history-add'
  | 'rules-update'
  | 'garden-switch'
  | 'ping'
  | 'pong';

export interface SyncMessageBase {
  type: SyncActionType;
  clientId: string;
  timestamp: number;
  requestId: string;
  gardenId: string;
}

export interface PlotUpdateSyncMessage extends SyncMessageBase {
  type: 'plot-update';
  plotId: string;
  updates: Partial<Plot>;
  baseVersion: number;
}

export interface PlotClaimSyncMessage extends SyncMessageBase {
  type: 'plot-claim';
  plotId: string;
  claimData: {
    owner: string;
    contact: string;
    plant: string;
    firstMaintenanceDate: string;
    notes?: string;
  };
  baseVersion: number;
}

export interface PlotRollbackSyncMessage extends SyncMessageBase {
  type: 'plot-rollback';
  plotId: string;
  historyEntryId: string;
  rollbackData: Partial<Plot>;
  baseVersion: number;
}

export interface PlotsBatchUpdateSyncMessage extends SyncMessageBase {
  type: 'plots-batch-update';
  plots: Plot[];
  baseVersion: number;
}

export interface HistoryAddSyncMessage extends SyncMessageBase {
  type: 'history-add';
  entries: PlotHistoryEntry[];
}

export interface RulesUpdateSyncMessage extends SyncMessageBase {
  type: 'rules-update';
  rules: MaintenanceRules;
}

export interface GardenSwitchSyncMessage extends SyncMessageBase {
  type: 'garden-switch';
  newGardenId: string;
}

export interface PingSyncMessage extends SyncMessageBase {
  type: 'ping';
}

export interface PongSyncMessage extends SyncMessageBase {
  type: 'pong';
}

export type SyncMessage =
  | PlotUpdateSyncMessage
  | PlotClaimSyncMessage
  | PlotRollbackSyncMessage
  | PlotsBatchUpdateSyncMessage
  | HistoryAddSyncMessage
  | RulesUpdateSyncMessage
  | GardenSwitchSyncMessage
  | PingSyncMessage
  | PongSyncMessage;

export interface ConflictInfo {
  type: 'plot-update' | 'plot-claim' | 'plot-rollback';
  plotId: string;
  localChanges: Partial<Plot>;
  remoteChanges: Partial<Plot>;
  localTimestamp: number;
  remoteTimestamp: number;
  remoteClientId: string;
  conflictFields: string[];
  basePlot: Plot;
}

export interface PlotVersionMap {
  [plotId: string]: number;
}

export interface SyncState {
  isConnected: boolean;
  otherClients: string[];
  lastSyncTime: number | null;
  pendingConflicts: ConflictInfo[];
  plotVersions: PlotVersionMap;
}
