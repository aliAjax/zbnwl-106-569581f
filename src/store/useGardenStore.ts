import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Garden, GardenData, Plot, MaintenanceRules, PlotHistoryEntry } from '../types/plot';
import { mockPlots } from '../data/mockData';
import { DEFAULT_MAINTENANCE_RULES } from '../hooks/useMaintenanceRules';

const LEGACY_PLOTS_KEY = 'community-garden-plots';
const LEGACY_RULES_KEY = 'community-garden-maintenance-rules';
const LEGACY_HISTORY_KEY = 'community-garden-plot-history';

interface GardenState {
  gardens: Garden[];
  currentGardenId: string | null;
  gardenData: Record<string, GardenData>;
  isLoading: boolean;
  isMigrated: boolean;

  initialize: () => void;
  createGarden: (data: { name: string; description?: string; location?: string }) => Garden;
  deleteGarden: (gardenId: string) => void;
  updateGarden: (gardenId: string, updates: Partial<Garden>) => void;
  setCurrentGarden: (gardenId: string) => void;
  getCurrentGarden: () => Garden | null;
  getCurrentGardenData: () => GardenData | null;
  updatePlots: (gardenId: string, plots: Plot[]) => void;
  updateRules: (gardenId: string, rules: MaintenanceRules) => void;
  updateHistory: (gardenId: string, history: PlotHistoryEntry[]) => void;
}

const migrateLegacyData = (): {
  gardens: Garden[];
  currentGardenId: string | null;
  gardenData: Record<string, GardenData>;
} => {
  const now = new Date().toISOString();
  const defaultGarden: Garden = {
    id: crypto.randomUUID(),
    name: '默认菜园',
    description: '系统自动创建的默认菜园',
    createdAt: now,
    updatedAt: now,
    isDefault: true,
  };

  let plots: Plot[] = [];
  let rules: MaintenanceRules = { ...DEFAULT_MAINTENANCE_RULES };
  let history: PlotHistoryEntry[] = [];

  try {
    const savedPlots = localStorage.getItem(LEGACY_PLOTS_KEY);
    if (savedPlots) {
      const parsed = JSON.parse(savedPlots);
      if (Array.isArray(parsed) && parsed.length > 0) {
        plots = parsed;
      }
    }
  } catch {
    // ignore
  }

  try {
    const savedRules = localStorage.getItem(LEGACY_RULES_KEY);
    if (savedRules) {
      const parsed = JSON.parse(savedRules);
      rules = {
        ...DEFAULT_MAINTENANCE_RULES,
        ...parsed,
        urgencyThresholds: {
          ...DEFAULT_MAINTENANCE_RULES.urgencyThresholds,
          ...parsed?.urgencyThresholds,
        },
      };
    }
  } catch {
    // ignore
  }

  try {
    const savedHistory = localStorage.getItem(LEGACY_HISTORY_KEY);
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      if (Array.isArray(parsed)) {
        history = parsed.map((entry) => ({
          ...entry,
          before: entry.before ?? {},
          after: entry.after ?? {},
        }));
      }
    }
  } catch {
    // ignore
  }

  if (plots.length === 0) {
    plots = mockPlots;
  }

  const gardenData: Record<string, GardenData> = {
    [defaultGarden.id]: {
      gardenId: defaultGarden.id,
      plots,
      rules,
      history,
    },
  };

  try {
    localStorage.removeItem(LEGACY_PLOTS_KEY);
    localStorage.removeItem(LEGACY_RULES_KEY);
    localStorage.removeItem(LEGACY_HISTORY_KEY);
  } catch {
    // ignore
  }

  return {
    gardens: [defaultGarden],
    currentGardenId: defaultGarden.id,
    gardenData,
  };
};

export const useGardenStore = create<GardenState>()(
  persist(
    (set, get) => ({
      gardens: [],
      currentGardenId: null,
      gardenData: {},
      isLoading: true,
      isMigrated: false,

      initialize: () => {
        const { gardens, currentGardenId, gardenData } = get();
        
        if (gardens.length === 0 && !get().isMigrated) {
          const legacy = migrateLegacyData();
          set({
            gardens: legacy.gardens,
            currentGardenId: legacy.currentGardenId,
            gardenData: legacy.gardenData,
            isLoading: false,
            isMigrated: true,
          });
        } else {
          set({ isLoading: false });
        }
      },

      createGarden: (data) => {
        const now = new Date().toISOString();
        const newGarden: Garden = {
          id: crypto.randomUUID(),
          name: data.name,
          description: data.description,
          location: data.location,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          gardens: [...state.gardens, newGarden],
          gardenData: {
            ...state.gardenData,
            [newGarden.id]: {
              gardenId: newGarden.id,
              plots: [],
              rules: { ...DEFAULT_MAINTENANCE_RULES },
              history: [],
            },
          },
        }));

        return newGarden;
      },

      deleteGarden: (gardenId) => {
        set((state) => {
          const { [gardenId]: _, ...remainingData } = state.gardenData;
          const newGardens = state.gardens.filter((g) => g.id !== gardenId);
          let newCurrentId = state.currentGardenId;

          if (state.currentGardenId === gardenId) {
            newCurrentId = newGardens.length > 0 ? newGardens[0].id : null;
          }

          return {
            gardens: newGardens,
            gardenData: remainingData,
            currentGardenId: newCurrentId,
          };
        });
      },

      updateGarden: (gardenId, updates) => {
        set((state) => ({
          gardens: state.gardens.map((g) =>
            g.id === gardenId
              ? { ...g, ...updates, updatedAt: new Date().toISOString() }
              : g
          ),
        }));
      },

      setCurrentGarden: (gardenId) => {
        set({ currentGardenId: gardenId });
      },

      getCurrentGarden: () => {
        const { gardens, currentGardenId } = get();
        return gardens.find((g) => g.id === currentGardenId) ?? null;
      },

      getCurrentGardenData: () => {
        const { currentGardenId, gardenData } = get();
        return currentGardenId ? gardenData[currentGardenId] ?? null : null;
      },

      updatePlots: (gardenId, plots) => {
        set((state) => ({
          gardenData: {
            ...state.gardenData,
            [gardenId]: {
              ...state.gardenData[gardenId],
              plots,
            },
          },
        }));
      },

      updateRules: (gardenId, rules) => {
        set((state) => ({
          gardenData: {
            ...state.gardenData,
            [gardenId]: {
              ...state.gardenData[gardenId],
              rules,
            },
          },
        }));
      },

      updateHistory: (gardenId, history) => {
        set((state) => ({
          gardenData: {
            ...state.gardenData,
            [gardenId]: {
              ...state.gardenData[gardenId],
              history,
            },
          },
        }));
      },
    }),
    {
      name: 'community-garden-multi-garden',
      partialize: (state) => ({
        gardens: state.gardens,
        currentGardenId: state.currentGardenId,
        gardenData: state.gardenData,
        isMigrated: state.isMigrated,
      }),
    }
  )
);
