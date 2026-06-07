import { useState, useEffect, useCallback } from 'react';
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

  useEffect(() => {
    if (gardenData) {
      setRules({
        ...DEFAULT_MAINTENANCE_RULES,
        ...gardenData.rules,
        urgencyThresholds: {
          ...DEFAULT_MAINTENANCE_RULES.urgencyThresholds,
          ...gardenData.rules?.urgencyThresholds,
        },
      });
      setIsLoading(false);
    } else {
      setRules(DEFAULT_MAINTENANCE_RULES);
      setIsLoading(false);
    }
  }, [gardenData]);

  useEffect(() => {
    if (currentGardenId && !isLoading) {
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
