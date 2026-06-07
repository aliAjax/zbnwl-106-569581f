export const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '未记录';
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

export const daysSince = (dateStr: string | null): number => {
  if (!dateStr) return Infinity;
  const date = new Date(dateStr);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const needsWatering = (lastWatered: string | null): boolean => {
  return daysSince(lastWatered) > 3;
};

export const needsWeeding = (lastWeeded: string | null): boolean => {
  return daysSince(lastWeeded) > 7;
};

export const getUrgency = (daysOverdue: number): 'low' | 'medium' | 'high' => {
  if (daysOverdue <= 1) return 'low';
  if (daysOverdue <= 3) return 'medium';
  return 'high';
};

export const todayStr = (): string => {
  return formatDateISO(new Date());
};

export const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

export const getNextWaterDate = (lastWatered: string | null): string | null => {
  if (!lastWatered) return null;
  return addDays(lastWatered, 3);
};

export const getNextWeedDate = (lastWeeded: string | null): string | null => {
  if (!lastWeeded) return null;
  return addDays(lastWeeded, 7);
};

export const isSameDay = (date1: string, date2: string): boolean => {
  return date1 === date2;
};

export const isBeforeOrEqual = (date1: string, date2: string): boolean => {
  return date1 <= date2;
};

export const getMonthDays = (year: number, month: number): Date[] => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  let firstDayOfWeek = firstDay.getDay();
  firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push(new Date(year, month - 1, prevMonthLastDay - i));
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
};

export const formatDateISO = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
