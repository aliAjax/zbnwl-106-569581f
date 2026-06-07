export type PlotStatus = 'available' | 'claimed' | 'needsMaintenance';

export type FilterType = 'all' | 'available' | 'claimed' | 'needsMaintenance';

export interface Plot {
  id: string;
  plotNumber: string;
  owner: string | null;
  plant: string | null;
  lastWatered: string | null;
  lastWeeded: string | null;
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
