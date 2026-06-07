export type PlotStatus = 'available' | 'claimed' | 'needsMaintenance';

export type FilterType = 'all' | 'available' | 'claimed' | 'needsMaintenance';

export interface Plot {
  id: string;
  plotNumber: string;
  owner: string | null;
  contact: string | null;
  plant: string | null;
  lastWatered: string | null;
  lastWeeded: string | null;
  firstMaintenanceDate: string | null;
  status: PlotStatus;
  notes?: string;
}

export interface MaintenanceTask {
  plotId: string;
  plotNumber: string;
  type: 'water' | 'weed';
  daysOverdue: number;
  urgency: 'low' | 'medium' | 'high';
}

export interface DailyTask {
  plotId: string;
  plotNumber: string;
  plant: string | null;
  owner: string | null;
  type: 'water' | 'weed';
  dueDate: string;
  isOverdue: boolean;
  daysOverdue: number;
}
