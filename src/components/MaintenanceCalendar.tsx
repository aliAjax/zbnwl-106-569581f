import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Droplets, Leaf, X, User, Sprout, AlertTriangle } from 'lucide-react';
import type { DailyTask } from '../types/plot';
import { getMonthDays, formatDateISO, todayStr, formatDate } from '../utils/dateUtils';
import { cn } from '../lib/utils';

interface MaintenanceCalendarProps {
  getDailyTasks: (dateStr: string) => DailyTask[];
  onTaskClick: (plotId: string) => void;
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

export const MaintenanceCalendar = ({ getDailyTasks, onTaskClick }: MaintenanceCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthDays = useMemo(() => getMonthDays(year, month), [year, month]);
  const today = todayStr();

  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];
    return getDailyTasks(selectedDate);
  }, [selectedDate, getDailyTasks]);

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(today);
  };

  const getDateTasks = (dateStr: string) => {
    return getDailyTasks(dateStr);
  };

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
  };

  const closeDayModal = () => {
    setSelectedDate(null);
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-sm border border-garden-100 overflow-hidden">
        <div className="p-4 border-b border-garden-100 flex items-center justify-between bg-cream/50">
          <button
            onClick={goToPrevMonth}
            className="p-2 rounded-xl hover:bg-garden-100 transition-colors"
          >
            <ChevronLeft size={20} className="text-garden-700" />
          </button>

          <div className="flex items-center gap-3">
            <h2 className="text-lg font-serif font-bold text-garden-800">
              {year}年{month + 1}月
            </h2>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-garden-100 text-garden-700 rounded-lg hover:bg-garden-200 transition-colors font-medium"
            >
              今天
            </button>
          </div>

          <button
            onClick={goToNextMonth}
            className="p-2 rounded-xl hover:bg-garden-100 transition-colors"
          >
            <ChevronRight size={20} className="text-garden-700" />
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-garden-100">
          {WEEKDAYS.map((day, idx) => (
            <div
              key={day}
              className={cn(
                "py-2 text-center text-sm font-medium",
                idx >= 5 ? "text-amber-600" : "text-garden-600"
              )}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {monthDays.map((date, idx) => {
            const dateStr = formatDateISO(date);
            const isCurrentMonth = date.getMonth() === month;
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;
            const dayTasks = getDateTasks(dateStr);
            const waterTasks = dayTasks.filter(t => t.type === 'water');
            const weedTasks = dayTasks.filter(t => t.type === 'weed');
            const hasOverdue = dayTasks.some(t => t.isOverdue);

            return (
              <button
                key={idx}
                onClick={() => handleDateClick(dateStr)}
                className={cn(
                  "aspect-square p-1 flex flex-col items-center justify-start border-b border-r border-garden-50 transition-all hover:bg-garden-50",
                  !isCurrentMonth && "opacity-40",
                  isSelected && "bg-garden-100 ring-2 ring-garden-400 ring-inset",
                  isToday && !isSelected && "bg-amber-50"
                )}
              >
                <span className={cn(
                  "text-sm font-medium mb-1",
                  isToday && "text-amber-600",
                  !isCurrentMonth && "text-gray-400",
                  idx % 7 >= 5 && isCurrentMonth && !isToday && "text-amber-600"
                )}>
                  {date.getDate()}
                </span>

                <div className="flex flex-col gap-0.5 w-full">
                  {waterTasks.length > 0 && (
                    <div className={cn(
                      "flex items-center gap-0.5 text-xs px-1 py-0.5 rounded truncate",
                      hasOverdue && waterTasks.some(t => t.isOverdue)
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    )}>
                      <Droplets size={10} />
                      <span className="truncate">{waterTasks.length}</span>
                    </div>
                  )}
                  {weedTasks.length > 0 && (
                    <div className={cn(
                      "flex items-center gap-0.5 text-xs px-1 py-0.5 rounded truncate",
                      hasOverdue && weedTasks.some(t => t.isOverdue)
                        ? "bg-red-100 text-red-700"
                        : "bg-garden-100 text-garden-700"
                    )}>
                      <Leaf size={10} />
                      <span className="truncate">{weedTasks.length}</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-3 border-t border-garden-100 bg-cream/30 flex flex-wrap items-center gap-4 text-xs text-garden-600">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200" />
            <span>浇水</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-garden-100 border border-garden-200" />
            <span>除草</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-100 border border-red-200" />
            <span>已超期</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-amber-50 border border-amber-200" />
            <span>今天</span>
          </div>
        </div>
      </div>

      {selectedDate && (
        <DayTaskModal
          dateStr={selectedDate}
          tasks={selectedDateTasks}
          onClose={closeDayModal}
          onTaskClick={onTaskClick}
        />
      )}
    </div>
  );
};

interface DayTaskModalProps {
  dateStr: string;
  tasks: DailyTask[];
  onClose: () => void;
  onTaskClick: (plotId: string) => void;
}

const DayTaskModal = ({ dateStr, tasks, onClose, onTaskClick }: DayTaskModalProps) => {
  const waterTasks = tasks.filter(t => t.type === 'water');
  const weedTasks = tasks.filter(t => t.type === 'weed');

  const handleTaskClick = (plotId: string) => {
    onTaskClick(plotId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-cream rounded-t-2xl sm:rounded-2xl shadow-2xl animate-slide-in max-h-[80vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-cream border-b border-garden-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="text-garden-600" size={20} />
            <h2 className="text-lg font-serif font-bold text-garden-800">
              {formatDate(dateStr)}
            </h2>
            {tasks.length > 0 && (
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium",
                tasks.some(t => t.isOverdue)
                  ? "bg-red-100 text-red-700"
                  : "bg-garden-100 text-garden-700"
              )}>
                {tasks.length} 项任务
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-garden-100 transition-colors"
          >
            <X size={20} className="text-garden-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {tasks.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">🌱</p>
              <p className="text-garden-600">这一天没有维护任务</p>
            </div>
          ) : (
            <>
              {waterTasks.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-garden-700 mb-3">
                    <Droplets size={16} className="text-blue-500" />
                    需要浇水 ({waterTasks.length})
                  </h3>
                  <div className="space-y-2">
                    {waterTasks.map(task => (
                      <DailyTaskItem
                        key={`water-${task.plotId}`}
                        task={task}
                        onClick={() => handleTaskClick(task.plotId)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {weedTasks.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-garden-700 mb-3">
                    <Leaf size={16} className="text-garden-500" />
                    需要除草 ({weedTasks.length})
                  </h3>
                  <div className="space-y-2">
                    {weedTasks.map(task => (
                      <DailyTaskItem
                        key={`weed-${task.plotId}`}
                        task={task}
                        onClick={() => handleTaskClick(task.plotId)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const DailyTaskItem = ({ task, onClick }: { task: DailyTask; onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="w-full p-3 bg-white rounded-xl border border-garden-100 flex items-center gap-3 hover:border-garden-300 hover:shadow-sm transition-all group"
    >
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
        task.isOverdue ? "bg-red-100" : task.type === 'water' ? "bg-blue-100" : "bg-garden-100"
      )}>
        {task.type === 'water' ? (
          <Droplets size={18} className={task.isOverdue ? "text-red-500" : "text-blue-500"} />
        ) : (
          <Leaf size={18} className={task.isOverdue ? "text-red-500" : "text-garden-500"} />
        )}
      </div>

      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-garden-800">地块 {task.plotNumber}</span>
          {task.isOverdue && (
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
              <AlertTriangle size={10} />
              超期 {task.daysOverdue} 天
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-garden-500 mt-0.5">
          {task.plant && (
            <span className="flex items-center gap-1">
              <Sprout size={10} />
              {task.plant}
            </span>
          )}
          {task.owner && (
            <span className="flex items-center gap-1">
              <User size={10} />
              {task.owner}
            </span>
          )}
        </div>
      </div>

      <ChevronRight size={18} className="text-garden-300 group-hover:text-garden-500 transition-colors flex-shrink-0" />
    </button>
  );
};
