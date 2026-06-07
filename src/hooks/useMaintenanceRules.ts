import { useState, useEffect, useCallback, useRef } from 'react';
import type { MaintenanceRules } from '../types/plot';
import { useGardenStore } from '../store/useGardenStore';

export const DEFAULT_MAINTENANCE_RULES: MaintenanceRules = {
  waterOverdueDays: 3,
  weedOverdueDays: 7,
  urgencyThresholds: {
    medium: 1,
    high: 3,
  },
};

export const useMaintenanceRules = () => {
  const currentGardenId = useGardenStore((state) => state.currentGardenId);
  const gardenData = useGardenStore((state) =>
    state.currentGardenId ? state.gardenData[state.currentGardenId] : null
  );
  const updateRules = useGardenStore((state) => state.updateRules);

  const [rules, setRules] = useState<MaintenanceRules>(DEFAULT_MAINTENANCE_RULES);
  const [isLoading, setIsLoading] = useState(true);
  const lastSyncedGardenIdRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    if (gardenData && currentGardenId) {
      isInitialLoadRef.current = true;
      setRules({
        ...DEFAULT_MAINTENANCE_RULES,
        ...gardenData.rules,
        urgencyThresholds: {
          ...DEFAULT_MAINTENANCE_RULES.urgencyThresholds,
          ...gardenData.rules?.urgencyThresholds,
        },
      });
      lastSyncedGardenIdRef.current = currentGardenId;
      setIsLoading(false);
    } else {
      setRules(DEFAULT_MAINTENANCE_RULES);
      setIsLoading(false);
    }
  }, [gardenData, currentGardenId]);

  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }
    if (currentGardenId && !isLoading && lastSyncedGardenIdRef.current === currentGardenId) {
      updateRules(currentGardenId, rules);
    }
  }, [rules, currentGardenId, isLoading, updateRules]);

  const updateRulesLocal = useCallback((newRules: Partial<MaintenanceRules>) => {
    setRules((prev) => ({
      ...prev,
      ...newRules,
      urgencyThresholds: {
        ...prev.urgencyThresholds,
        ...newRules.urgencyThresholds,
      },
    }));
  }, []);

  const resetToDefault = useCallback(() => {
    setRules(DEFAULT_MAINTENANCE_RULES);
  }, []);

  return {
    rules,
    isLoading,
    updateRules: updateRulesLocal,
    resetToDefault,
  };
};
