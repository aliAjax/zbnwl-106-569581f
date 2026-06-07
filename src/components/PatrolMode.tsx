import { useState, useEffect } from 'react';
import { X, Droplets, Leaf, User, Sprout, StickyNote, ChevronLeft, Check, SkipForward, AlertTriangle, MapPin } from 'lucide-react';
import type { Plot, DailyTask } from '../types/plot';
import { formatDate, daysSince, todayStr } from '../utils/dateUtils';

interface PatrolModeProps {
  isOpen: boolean;
  currentPlot: Plot | null;
  progress: {
    currentIndex: number;
    completedPlotIds: string[];
    notesByPlotId: Record<string, string>;
  };
  progressStats: {
    total: number;
    completed: number;
    current: number;
    remaining: number;
  };
  tasksForPlot: DailyTask[];
  onClose: () => void;
  onMarkWatered: (plotId: string) => void;
  onMarkWeeded: (plotId: string) => void;
  onUpdateNotes: (plotId: string, notes: string) => void;
  onMarkCompleteAndNext: (plotId: string) => void;
  onPrevious: () => void;
  onSkip: () => void;
  onReset: () => void;
}

export const PatrolMode = ({
  isOpen,
  currentPlot,
  progress,
  progressStats,
  tasksForPlot,
  onClose,
  onMarkWatered,
  onMarkWeeded,
  onUpdateNotes,
  onMarkCompleteAndNext,
  onPrevious,
  onSkip,
  onReset,
}: PatrolModeProps) => {
  const [watered, setWatered] = useState(false);
  const [weeded, setWeeded] = useState(false);
  const [notes, setNotes] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const today = todayStr();

  useEffect(() => {
    if (currentPlot) {
      setWatered(currentPlot.lastWatered === today);
      setWeeded(currentPlot.lastWeeded === today);
      setNotes(progress.notesByPlotId[currentPlot.id] || '');
    }
  }, [currentPlot, progress.notesByPlotId, today]);

  if (!isOpen) return null;

  const handleWaterClick = () => {
    if (currentPlot) {
      setWatered(true);
      onMarkWatered(currentPlot.id);
    }
  };

  const handleWeedClick = () => {
    if (currentPlot) {
      setWeeded(true);
      onMarkWeeded(currentPlot.id);
    }
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    if (currentPlot) {
      onUpdateNotes(currentPlot.id, value);
    }
  };

  const handleComplete = () => {
    if (currentPlot) {
      onMarkCompleteAndNext(currentPlot.id);
      if (progressStats.remaining <= 1) {
        setShowCompleteModal(true);
      }
    }
  };

  const isCompleted = currentPlot ? progress.completedPlotIds.includes(currentPlot.id) : false;

  const waterTask = tasksForPlot.find(t => t.type === 'water');
  const weedTask = tasksForPlot.find(t => t.type === 'weed');

  if (!currentPlot && progressStats.total === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-cream">
        <div className="h-full flex flex-col">
          <header className="sticky top-0 bg-garden-600 text-white p-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6" />
              <div>
                <h1 className="text-lg font-bold">巡园模式</h1>
                <p className="text-xs text-garden-100">今日无待维护地块</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-garden-500 transition-colors"
            >
              <X size={24} />
            </button>
          </header>

          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-garden-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sprout className="w-10 h-10 text-garden-500" />
              </div>
              <h2 className="text-xl font-bold text-garden-800 mb-2">太棒了！</h2>
              <p className="text-garden-600 mb-6">今天所有地块都已维护完毕</p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-garden-500 text-white rounded-xl font-medium hover:bg-garden-600 transition-colors"
              >
                返回首页
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showCompleteModal || (progressStats.remaining === 0 && !currentPlot)) {
    return (
      <div className="fixed inset-0 z-50 bg-cream">
        <div className="h-full flex flex-col">
          <header className="sticky top-0 bg-garden-600 text-white p-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6" />
              <div>
                <h1 className="text-lg font-bold">巡园完成</h1>
                <p className="text-xs text-garden-100">今日任务已全部完成</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-garden-500 transition-colors"
            >
              <X size={24} />
            </button>
          </header>

          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-garden-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-12 h-12 text-garden-600" />
              </div>
              <h2 className="text-2xl font-bold text-garden-800 mb-2">巡园完成！</h2>
              <p className="text-garden-600 mb-2">今日共完成 {progressStats.completed} 个地块的维护</p>
              <p className="text-sm text-garden-500 mb-8">辛苦了，菜园守护者 🌱</p>
              <div className="space-y-3">
                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 bg-garden-500 text-white rounded-xl font-medium hover:bg-garden-600 transition-colors"
                >
                  返回首页
                </button>
                <button
                  onClick={() => {
                    onReset();
                    setShowCompleteModal(false);
                  }}
                  className="w-full px-6 py-3 border border-garden-200 text-garden-700 rounded-xl font-medium hover:bg-garden-50 transition-colors"
                >
                  重新开始巡园
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentPlot) {
    return null;
  }

  const waterDays = daysSince(currentPlot.lastWatered);
  const weedDays = daysSince(currentPlot.lastWeeded);

  return (
    <div className="fixed inset-0 z-50 bg-cream">
      <div className="h-full flex flex-col">
        <header className="sticky top-0 bg-garden-600 text-white p-4 flex items-center justify-between shadow-lg z-10">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6" />
            <div>
              <h1 className="text-lg font-bold">巡园模式</h1>
              <p className="text-xs text-garden-100">
                {progressStats.current} / {progressStats.total} 个地块
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-garden-500 transition-colors"
            aria-label="退出巡园"
          >
            <X size={24} />
          </button>
        </header>

        <div className="bg-garden-500/10 px-4 py-2">
          <div className="h-2 bg-garden-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-garden-500 rounded-full transition-all duration-300"
              style={{ width: `${(progressStats.completed / Math.max(1, progressStats.total)) * 100}%` }}
            />
          </div>
          <p className="text-xs text-garden-600 mt-1 text-center">
            已完成 {progressStats.completed} 个，还剩 {progressStats.remaining} 个
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="bg-white rounded-2xl shadow-lg border border-garden-100 overflow-hidden">
            <div className="bg-gradient-to-r from-garden-500 to-garden-600 p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-garden-100 text-sm mb-1">地块编号</p>
                  <h2 className="text-4xl font-bold">{currentPlot.plotNumber}</h2>
                </div>
                {isCompleted && (
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Check size={16} />
                    已完成
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                {currentPlot.owner && (
                  <div className="bg-garden-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-garden-600 text-sm mb-1">
                      <User size={14} />
                      认领人
                    </div>
                    <p className="font-semibold text-garden-800">{currentPlot.owner}</p>
                  </div>
                )}
                {currentPlot.plant && (
                  <div className="bg-garden-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 text-garden-600 text-sm mb-1">
                      <Sprout size={14} />
                      种植物
                    </div>
                    <p className="font-semibold text-garden-800">{currentPlot.plant}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-garden-700 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-500" />
                  待完成任务
                </h3>
                <div className="space-y-2">
                  {waterTask && (
                    <div className={`flex items-center justify-between p-3 rounded-xl border ${
                      watered ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          watered ? 'bg-blue-200' : 'bg-blue-100'
                        }`}>
                          <Droplets size={20} className={watered ? 'text-blue-700' : 'text-blue-500'} />
                        </div>
                        <div>
                          <p className={`font-medium ${watered ? 'text-blue-700 line-through' : 'text-garden-800'}`}>
                            浇水
                          </p>
                          <p className="text-xs text-garden-500">
                            上次浇水：{formatDate(currentPlot.lastWatered)}（{waterDays}天前）
                            {waterTask.isOverdue && ` · 超期${waterTask.daysOverdue}天`}
                          </p>
                        </div>
                      </div>
                      {watered && <Check size={20} className="text-blue-600" />}
                    </div>
                  )}
                  {weedTask && (
                    <div className={`flex items-center justify-between p-3 rounded-xl border ${
                      weeded ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          weeded ? 'bg-green-200' : 'bg-green-100'
                        }`}>
                          <Leaf size={20} className={weeded ? 'text-green-700' : 'text-green-500'} />
                        </div>
                        <div>
                          <p className={`font-medium ${weeded ? 'text-green-700 line-through' : 'text-garden-800'}`}>
                            除草
                          </p>
                          <p className="text-xs text-garden-500">
                            上次除草：{formatDate(currentPlot.lastWeeded)}（{weedDays}天前）
                            {weedTask.isOverdue && ` · 超期${weedTask.daysOverdue}天`}
                          </p>
                        </div>
                      </div>
                      {weeded && <Check size={20} className="text-green-600" />}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-garden-700 flex items-center gap-2">
                  <StickyNote size={16} className="text-garden-500" />
                  巡园备注
                </h3>
                <textarea
                  value={notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="记录本次巡园的情况..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-garden-200 bg-cream focus:border-garden-400 focus:ring-2 focus:ring-garden-200 outline-none transition-all resize-none text-garden-800"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-garden-100 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <button
              onClick={handleWaterClick}
              disabled={watered}
              className={`py-4 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                watered
                  ? 'bg-blue-100 text-blue-600 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.98] shadow-lg shadow-blue-500/30'
              }`}
            >
              <Droplets size={22} />
              {watered ? '已浇水' : '今天已浇水'}
            </button>
            <button
              onClick={handleWeedClick}
              disabled={weeded}
              className={`py-4 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                weeded
                  ? 'bg-green-100 text-green-600 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600 active:scale-[0.98] shadow-lg shadow-green-500/30'
              }`}
            >
              <Leaf size={22} />
              {weeded ? '已除草' : '今天已除草'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={onPrevious}
              disabled={progress.currentIndex === 0}
              className="py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-1 border border-garden-200 text-garden-700 hover:bg-garden-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
              上一个
            </button>
            <button
              onClick={onSkip}
              className="py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-1 border border-garden-200 text-garden-700 hover:bg-garden-50 transition-all"
            >
              <SkipForward size={18} />
              跳过
            </button>
            <button
              onClick={handleComplete}
              className="py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-1 bg-garden-500 text-white hover:bg-garden-600 active:scale-[0.98] transition-all shadow-lg shadow-garden-500/30"
            >
              <Check size={20} />
              完成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
