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
  return new Date().toISOString().split('T')[0];
};
