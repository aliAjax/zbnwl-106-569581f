import { useState, useEffect, useRef, useCallback } from 'react';
import type {
  SyncMessage,
  SyncState,
  ConflictInfo,
  PlotUpdateSyncMessage,
  PlotClaimSyncMessage,
  PlotRollbackSyncMessage,
  PlotsBatchUpdateSyncMessage,
  HistoryAddSyncMessage,
  RulesUpdateSyncMessage,
} from '../types/collaboration';
import {
  CHANNEL_NAME,
  STORAGE_SYNC_KEY,
} from '../types/collaboration';
import {
  generateClientId,
  generateRequestId,
  createConflictInfo,
  detectConflicts,
  autoMergeChanges,
  incrementVersion,
} from '../utils/collaboration';
import type { Plot, PlotHistoryEntry, MaintenanceRules } from '../types/plot';

interface UseCollaborationSyncOptions {
  gardenId: string | null;
  getCurrentPlot: (plotId: string) => Plot | undefined;
  onRemotePlotUpdate: (plotId: string, updates: Partial<Plot>) => void;
  onRemotePlotClaim: (
    plotId: string,
    claimData: PlotClaimSyncMessage['claimData']
  ) => void;
  onRemotePlotRollback: (
    plotId: string,
    historyEntryId: string,
    rollbackData: Partial<Plot>
  ) => void;
  onRemotePlotsBatchUpdate: (plots: Plot[]) => void;
  onRemoteHistoryAdd: (entries: PlotHistoryEntry[]) => void;
  onRemoteRulesUpdate: (rules: MaintenanceRules) => void;
  onConflictDetected: (conflict: ConflictInfo) => void;
}

export const useCollaborationSync = (options: UseCollaborationSyncOptions) => {
  const {
    gardenId,
    getCurrentPlot,
    onRemotePlotUpdate,
    onRemotePlotClaim,
    onRemotePlotRollback,
    onRemotePlotsBatchUpdate,
    onRemoteHistoryAdd,
    onRemoteRulesUpdate,
    onConflictDetected,
  } = options;

  const [syncState, setSyncState] = useState<SyncState>({
    isConnected: false,
    otherClients: [],
    lastSyncTime: null,
    pendingConflicts: [],
    plotVersions: {},
  });

  const clientIdRef = useRef<string>(generateClientId());
  const channelRef = useRef<BroadcastChannel | null>(null);
  const pendingLocalChangesRef = useRef<
    Map<
      string,
      {
        plotId: string;
        changes: Partial<Plot>;
        type: 'update' | 'claim' | 'rollback';
        timestamp: number;
      }
    >
  >(new Map());

  const processedMessagesRef = useRef<Set<string>>(new Set());

  const broadcastMessage = useCallback((message: SyncMessage) => {
    if (channelRef.current) {
      try {
        channelRef.current.postMessage(message);
      } catch (e) {
        console.warn('BroadcastChannel send failed:', e);
      }
    }

    try {
      localStorage.setItem(
        `${STORAGE_SYNC_KEY}-${message.requestId}`,
        JSON.stringify({
          message,
          sentAt: Date.now(),
        })
      );
      setTimeout(() => {
        try {
          localStorage.removeItem(`${STORAGE_SYNC_KEY}-${message.requestId}`);
        } catch {}
      }, 5000);
    } catch (e) {
      console.warn('localStorage sync fallback failed:', e);
    }
  }, []);

  const handleIncomingMessage = useCallback(
    (message: SyncMessage) => {
      if (message.clientId === clientIdRef.current) {
        return;
      }

      if (processedMessagesRef.current.has(message.requestId)) {
        return;
      }
      processedMessagesRef.current.add(message.requestId);

      if (message.gardenId !== gardenId) {
        return;
      }

      setSyncState((prev) => ({
        ...prev,
        lastSyncTime: Date.now(),
      }));

      switch (message.type) {
        case 'plot-update': {
          const { plotId, updates, baseVersion } = message;
          const currentPlot = getCurrentPlot(plotId);
          const currentVersion = syncState.plotVersions[plotId] || 0;

          if (!currentPlot) {
            onRemotePlotUpdate(plotId, updates);
            setSyncState((prev) => ({
              ...prev,
              plotVersions: incrementVersion(prev.plotVersions, plotId),
            }));
            return;
          }

          const pendingKey = `update-${plotId}`;
          const pendingLocal = pendingLocalChangesRef.current.get(pendingKey);

          if (pendingLocal) {
            const conflictFields = detectConflicts(
              currentPlot,
              pendingLocal.changes,
              updates
            );

            if (conflictFields.length > 0) {
              const conflict = createConflictInfo(
                'plot-update',
                plotId,
                currentPlot,
                pendingLocal.changes,
                updates,
                message.clientId,
                message.timestamp
              );
              onConflictDetected(conflict);
              pendingLocalChangesRef.current.delete(pendingKey);
            } else {
              const merged = autoMergeChanges(
                currentPlot,
                pendingLocal.changes,
                updates,
                []
              );
              onRemotePlotUpdate(plotId, merged);
              setSyncState((prev) => ({
                ...prev,
                plotVersions: incrementVersion(prev.plotVersions, plotId),
              }));
              pendingLocalChangesRef.current.delete(pendingKey);
            }
          } else {
            onRemotePlotUpdate(plotId, updates);
            setSyncState((prev) => ({
              ...prev,
              plotVersions: incrementVersion(prev.plotVersions, plotId),
            }));
          }
          break;
        }

        case 'plot-claim': {
          const { plotId, claimData } = message;
          const currentPlot = getCurrentPlot(plotId);
          const pendingKey = `claim-${plotId}`;
          const pendingLocal = pendingLocalChangesRef.current.get(pendingKey);

          if (pendingLocal && currentPlot) {
            const conflict = createConflictInfo(
              'plot-claim',
              plotId,
              currentPlot,
              pendingLocal.changes,
              claimData,
              message.clientId,
              message.timestamp
            );
            onConflictDetected(conflict);
            pendingLocalChangesRef.current.delete(pendingKey);
          } else {
            onRemotePlotClaim(plotId, claimData);
            setSyncState((prev) => ({
              ...prev,
              plotVersions: incrementVersion(prev.plotVersions, plotId),
            }));
          }
          break;
        }

        case 'plot-rollback': {
          const { plotId, historyEntryId, rollbackData } = message;
          const currentPlot = getCurrentPlot(plotId);
          const pendingKey = `rollback-${plotId}`;
          const pendingLocal = pendingLocalChangesRef.current.get(pendingKey);

          if (pendingLocal && currentPlot) {
            const conflict = createConflictInfo(
              'plot-rollback',
              plotId,
              currentPlot,
              pendingLocal.changes,
              rollbackData,
              message.clientId,
              message.timestamp
            );
            onConflictDetected(conflict);
            pendingLocalChangesRef.current.delete(pendingKey);
          } else {
            onRemotePlotRollback(plotId, historyEntryId, rollbackData);
            setSyncState((prev) => ({
              ...prev,
              plotVersions: incrementVersion(prev.plotVersions, plotId),
            }));
          }
          break;
        }

        case 'plots-batch-update': {
          onRemotePlotsBatchUpdate(message.plots);
          break;
        }

        case 'history-add': {
          onRemoteHistoryAdd(message.entries);
          break;
        }

        case 'rules-update': {
          onRemoteRulesUpdate(message.rules);
          break;
        }

        case 'ping': {
          const pongMessage: SyncMessage = {
            type: 'pong',
            clientId: clientIdRef.current,
            timestamp: Date.now(),
            requestId: generateRequestId(),
            gardenId: gardenId || '',
          };
          broadcastMessage(pongMessage);
          break;
        }

        case 'pong': {
          setSyncState((prev) => {
            if (!prev.otherClients.includes(message.clientId)) {
              return {
                ...prev,
                otherClients: [...prev.otherClients, message.clientId],
              };
            }
            return prev;
          });
          break;
        }
      }
    },
    [
      gardenId,
      getCurrentPlot,
      syncState.plotVersions,
      onRemotePlotUpdate,
      onRemotePlotClaim,
      onRemotePlotRollback,
      onRemotePlotsBatchUpdate,
      onRemoteHistoryAdd,
      onRemoteRulesUpdate,
      onConflictDetected,
      broadcastMessage,
    ]
  );

  const sendPlotUpdate = useCallback(
    (plotId: string, updates: Partial<Plot>) => {
      if (!gardenId) return;

      const baseVersion = syncState.plotVersions[plotId] || 0;
      pendingLocalChangesRef.current.set(`update-${plotId}`, {
        plotId,
        changes: updates,
        type: 'update',
        timestamp: Date.now(),
      });

      const message: PlotUpdateSyncMessage = {
        type: 'plot-update',
        clientId: clientIdRef.current,
        timestamp: Date.now(),
        requestId: generateRequestId(),
        gardenId,
        plotId,
        updates,
        baseVersion,
      };

      broadcastMessage(message);
      setSyncState((prev) => ({
        ...prev,
        plotVersions: incrementVersion(prev.plotVersions, plotId),
      }));
    },
    [gardenId, syncState.plotVersions, broadcastMessage]
  );

  const sendPlotClaim = useCallback(
    (plotId: string, claimData: PlotClaimSyncMessage['claimData']) => {
      if (!gardenId) return;

      const baseVersion = syncState.plotVersions[plotId] || 0;
      pendingLocalChangesRef.current.set(`claim-${plotId}`, {
        plotId,
        changes: claimData,
        type: 'claim',
        timestamp: Date.now(),
      });

      const message: PlotClaimSyncMessage = {
        type: 'plot-claim',
        clientId: clientIdRef.current,
        timestamp: Date.now(),
        requestId: generateRequestId(),
        gardenId,
        plotId,
        claimData,
        baseVersion,
      };

      broadcastMessage(message);
      setSyncState((prev) => ({
        ...prev,
        plotVersions: incrementVersion(prev.plotVersions, plotId),
      }));
    },
    [gardenId, syncState.plotVersions, broadcastMessage]
  );

  const sendPlotRollback = useCallback(
    (plotId: string, historyEntryId: string, rollbackData: Partial<Plot>) => {
      if (!gardenId) return;

      const baseVersion = syncState.plotVersions[plotId] || 0;
      pendingLocalChangesRef.current.set(`rollback-${plotId}`, {
        plotId,
        changes: rollbackData,
        type: 'rollback',
        timestamp: Date.now(),
      });

      const message: PlotRollbackSyncMessage = {
        type: 'plot-rollback',
        clientId: clientIdRef.current,
        timestamp: Date.now(),
        requestId: generateRequestId(),
        gardenId,
        plotId,
        historyEntryId,
        rollbackData,
        baseVersion,
      };

      broadcastMessage(message);
      setSyncState((prev) => ({
        ...prev,
        plotVersions: incrementVersion(prev.plotVersions, plotId),
      }));
    },
    [gardenId, syncState.plotVersions, broadcastMessage]
  );

  const sendPlotsBatchUpdate = useCallback(
    (plots: Plot[]) => {
      if (!gardenId) return;

      const message: PlotsBatchUpdateSyncMessage = {
        type: 'plots-batch-update',
        clientId: clientIdRef.current,
        timestamp: Date.now(),
        requestId: generateRequestId(),
        gardenId,
        plots,
        baseVersion: 0,
      };

      broadcastMessage(message);
    },
    [gardenId, broadcastMessage]
  );

  const sendHistoryAdd = useCallback(
    (entries: PlotHistoryEntry[]) => {
      if (!gardenId) return;

      const message: HistoryAddSyncMessage = {
        type: 'history-add',
        clientId: clientIdRef.current,
        timestamp: Date.now(),
        requestId: generateRequestId(),
        gardenId,
        entries,
      };

      broadcastMessage(message);
    },
    [gardenId, broadcastMessage]
  );

  const sendRulesUpdate = useCallback(
    (rules: MaintenanceRules) => {
      if (!gardenId) return;

      const message: RulesUpdateSyncMessage = {
        type: 'rules-update',
        clientId: clientIdRef.current,
        timestamp: Date.now(),
        requestId: generateRequestId(),
        gardenId,
        rules,
      };

      broadcastMessage(message);
    },
    [gardenId, broadcastMessage]
  );

  const addConflict = useCallback((conflict: ConflictInfo) => {
    setSyncState((prev) => ({
      ...prev,
      pendingConflicts: [...prev.pendingConflicts, conflict],
    }));
  }, []);

  const resolveConflict = useCallback(
    (conflict: ConflictInfo, choice: 'local' | 'remote' | 'merge') => {
      const { plotId, basePlot, localChanges, remoteChanges } = conflict;

      let finalChanges: Partial<Plot>;
      if (choice === 'local') {
        finalChanges = { ...basePlot, ...remoteChanges, ...localChanges };
      } else if (choice === 'remote') {
        finalChanges = { ...basePlot, ...localChanges, ...remoteChanges };
      } else {
        const conflictFields = detectConflicts(basePlot, localChanges, remoteChanges);
        finalChanges = autoMergeChanges(basePlot, localChanges, remoteChanges, conflictFields);
      }

      onRemotePlotUpdate(plotId, finalChanges);

      setSyncState((prev) => ({
        ...prev,
        pendingConflicts: prev.pendingConflicts.filter(
          (c) => !(c.plotId === plotId && c.remoteTimestamp === conflict.remoteTimestamp)
        ),
        plotVersions: incrementVersion(prev.plotVersions, plotId),
      }));
    },
    [onRemotePlotUpdate]
  );

  const clearPendingChange = useCallback((plotId: string, type: 'update' | 'claim' | 'rollback') => {
    pendingLocalChangesRef.current.delete(`${type}-${plotId}`);
  }, []);

  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      channelRef.current = new BroadcastChannel(CHANNEL_NAME);

      const handleMessage = (event: MessageEvent<SyncMessage>) => {
        handleIncomingMessage(event.data);
      };

      channelRef.current.addEventListener('message', handleMessage);

      setSyncState((prev) => ({ ...prev, isConnected: true }));

      return () => {
        if (channelRef.current) {
          channelRef.current.removeEventListener('message', handleMessage);
          channelRef.current.close();
          channelRef.current = null;
        }
        setSyncState((prev) => ({ ...prev, isConnected: false }));
      };
    } else {
      setSyncState((prev) => ({ ...prev, isConnected: false }));
    }
  }, [handleIncomingMessage]);

  useEffect(() => {
    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key && event.key.startsWith(STORAGE_SYNC_KEY) && event.newValue) {
        try {
          const { message } = JSON.parse(event.newValue);
          handleIncomingMessage(message);
        } catch (e) {
          console.warn('Failed to parse storage sync message:', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    return () => {
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [handleIncomingMessage]);

  useEffect(() => {
    if (gardenId && syncState.isConnected) {
      const pingMessage: SyncMessage = {
        type: 'ping',
        clientId: clientIdRef.current,
        timestamp: Date.now(),
        requestId: generateRequestId(),
        gardenId,
      };
      broadcastMessage(pingMessage);
    }
  }, [gardenId, syncState.isConnected, broadcastMessage]);

  return {
    syncState,
    clientId: clientIdRef.current,
    sendPlotUpdate,
    sendPlotClaim,
    sendPlotRollback,
    sendPlotsBatchUpdate,
    sendHistoryAdd,
    sendRulesUpdate,
    addConflict,
    resolveConflict,
    clearPendingChange,
  };
};
