import { useState, useEffect, useCallback } from 'react';
import type { MaintenanceRules } from '../types/plot';

const STORAGE_KEY = 'community-garden-maintenance-rules';

export const DEFAULT_MAINTENANCE_RULES: MaintenanceRules = {
  waterOverdueDays: 3,
  weedOverdueDays: 7,
  urgencyThresholds: {
    medium: 1,
    high: 3,
  },
};

export const useMaintenanceRules = () => {
  const [rules, setRules] = useState<MaintenanceRules>(DEFAULT_MAINTENANCE_RULES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRules({
          ...DEFAULT_MAINTENANCE_RULES,
          ...parsed,
          urgencyThresholds: {
            ...DEFAULT_MAINTENANCE_RULES.urgencyThresholds,
            ...parsed.urgencyThresholds,
          },
        });
      } catch {
        setRules(DEFAULT_MAINTENANCE_RULES);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
    }
  }, [rules, isLoading]);

  const updateRules = useCallback((newRules: Partial<MaintenanceRules>) => {
    setRules(prev => ({
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
    updateRules,
    resetToDefault,
  };
};
