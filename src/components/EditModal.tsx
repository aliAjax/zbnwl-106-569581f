import { useState, useEffect } from 'react';
import { X, Droplets, Leaf, User, Sprout, StickyNote, Save, Flag, Info, Phone, CalendarDays, Clock, Edit3 } from 'lucide-react';
import type { Plot, PlotStatus, PlotHistoryEntry } from '../types/plot';
import { todayStr } from '../utils/dateUtils';
import { PlotHistoryTimeline } from './PlotHistoryTimeline';

interface EditModalProps {
  plot: Plot | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Plot>) => void;
  history?: PlotHistoryEntry[];
  onRollback?: (entryId: string) => void;
  isHistoryLoaded?: boolean;
}

const STATUS_OPTIONS: { value: PlotStatus; label: string; color: string }[] = [
  { value: 'available', label: '待认领', color: 'bg-soil-100 text-soil-700 border-soil-300' },
  { value: 'claimed', label: '已认领', color: 'bg-garden-100 text-garden-700 border-garden-300' },
  { value: 'needsMaintenance', label: '需维护', color: 'bg-amber-100 text-amber-700 border-amber-300' },
];

const INITIAL_FORM_DATA = {
  owner: '',
  contact: '',
  plant: '',
  lastWatered: '',
  lastWeeded: '',
  firstMaintenanceDate: '',
  status: 'available' as PlotStatus,
  notes: '',
};

type TabType = 'edit' | 'history';

export const EditModal = ({ plot, isOpen, onClose, onSave, history = [], onRollback, isHistoryLoaded = true }: EditModalProps) => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isStatusManuallyChanged, setIsStatusManuallyChanged] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('edit');

  useEffect(() => {
    if (plot) {
      setFormData({
        owner: plot.owner || '',
        contact: plot.contact || '',
        plant: plot.plant || '',
        lastWatered: plot.lastWatered || '',
        lastWeeded: plot.lastWeeded || '',
        firstMaintenanceDate: plot.firstMaintenanceDate || '',
        status: plot.status,
        notes: plot.notes || '',
      });
      setIsStatusManuallyChanged(false);
    }
  }, [plot]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('edit');
    }
  }, [isOpen]);

  if (!isOpen || !plot) return null;

  const handleStatusClick = (status: PlotStatus) => {
    setFormData(prev => ({ ...prev, status }));
    setIsStatusManuallyChanged(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: Partial<Plot> = {
      owner: formData.owner || null,
      contact: formData.contact || null,
      plant: formData.plant || null,
      lastWatered: formData.lastWatered || null,
      lastWeeded: formData.lastWeeded || null,
      firstMaintenanceDate: formData.firstMaintenanceDate || null,
      notes: formData.notes || undefined,
    };
    if (isStatusManuallyChanged) {
      updates.status = formData.status;
    }
    onSave(plot.id, updates);
    onClose();
  };

  const handleWaterToday = () => {
    setFormData(prev => ({ ...prev, lastWatered: todayStr() }));
  };

  const handleWeedToday = () => {
    setFormData(prev => ({ ...prev, lastWeeded: todayStr() }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-cream rounded-2xl shadow-2xl animate-slide-in max-h-[90vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-cream border-b border-garden-100 p-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-xl font-serif font-bold text-garden-800">
            编辑地块 {plot.plotNumber}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-garden-100 transition-colors"
          >
            <X size={20} className="text-garden-600" />
          </button>
        </div>

        <div className="flex border-b border-garden-100 bg-white/50">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'edit'
                ? 'text-garden-700 border-b-2 border-garden-500 bg-garden-50/50'
                : 'text-gray-500 hover:text-garden-600 hover:bg-garden-50/30'
            }`}
          >
            <Edit3 size={16} />
            编辑信息
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative ${
              activeTab === 'history'
                ? 'text-garden-700 border-b-2 border-garden-500 bg-garden-50/50'
                : 'text-gray-500 hover:text-garden-600 hover:bg-garden-50/30'
            }`}
          >
            <Clock size={16} />
            历史记录
            {history.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-garden-100 text-garden-700 rounded-full">
                {history.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'edit' ? (
            <form onSubmit={handleSubmit} className="p-4 space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-garden-700 mb-2">
                  <User size={16} />
                  认领人
                </label>
                <input
                  type="text"
                  value={formData.owner}
                  onChange={e => setFormData(prev => ({ ...prev, owner: e.target.value }))}
                  placeholder="输入认领人姓名"
                  className="w-full px-4 py-2.5 rounded-xl border border-garden-200 bg-white focus:border-garden-400 focus:ring-2 focus:ring-garden-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-garden-700 mb-2">
                  <Phone size={16} />
                  联系方式
                </label>
                <input
                  type="tel"
                  value={formData.contact}
                  onChange={e => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                  placeholder="输入手机号"
                  className="w-full px-4 py-2.5 rounded-xl border border-garden-200 bg-white focus:border-garden-400 focus:ring-2 focus:ring-garden-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-garden-700 mb-2">
                  <Sprout size={16} />
                  种植物
                </label>
                <input
                  type="text"
                  value={formData.plant}
                  onChange={e => setFormData(prev => ({ ...prev, plant: e.target.value }))}
                  placeholder="例如：番茄 🍅"
                  className="w-full px-4 py-2.5 rounded-xl border border-garden-200 bg-white focus:border-garden-400 focus:ring-2 focus:ring-garden-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-garden-700 mb-2">
                  <CalendarDays size={16} />
                  首次维护日期
                </label>
                <input
                  type="date"
                  value={formData.firstMaintenanceDate}
                  onChange={e => setFormData(prev => ({ ...prev, firstMaintenanceDate: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-garden-200 bg-white focus:border-garden-400 focus:ring-2 focus:ring-garden-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-garden-700 mb-2">
                  <Droplets size={16} />
                  最近浇水日期
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={formData.lastWatered}
                    onChange={e => setFormData(prev => ({ ...prev, lastWatered: e.target.value }))}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-garden-200 bg-white focus:border-garden-400 focus:ring-2 focus:ring-garden-200 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleWaterToday}
                    className="px-4 py-2.5 bg-garden-100 text-garden-700 rounded-xl hover:bg-garden-200 transition-colors font-medium text-sm whitespace-nowrap"
                  >
                    今天
                  </button>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-garden-700 mb-2">
                  <Leaf size={16} />
                  最近除草日期
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={formData.lastWeeded}
                    onChange={e => setFormData(prev => ({ ...prev, lastWeeded: e.target.value }))}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-garden-200 bg-white focus:border-garden-400 focus:ring-2 focus:ring-garden-200 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleWeedToday}
                    className="px-4 py-2.5 bg-garden-100 text-garden-700 rounded-xl hover:bg-garden-200 transition-colors font-medium text-sm whitespace-nowrap"
                  >
                    今天
                  </button>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-garden-700 mb-2">
                  <Flag size={16} />
                  地块状态
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {STATUS_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleStatusClick(option.value)}
                      className={`
                        px-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all
                        ${formData.status === option.value
                          ? `${option.color} border-current shadow-sm`
                          : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                        }
                      `}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <p className="flex items-start gap-1.5 text-xs text-garden-500">
                  <Info size={12} className="mt-0.5 flex-shrink-0" />
                  <span>手动选择状态后将覆盖自动计算，更新浇水/除草日期将自动刷新状态</span>
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-garden-700 mb-2">
                  <StickyNote size={16} />
                  备注
                </label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="添加备注信息..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-garden-200 bg-white focus:border-garden-400 focus:ring-2 focus:ring-garden-200 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-xl border border-garden-200 text-garden-700 font-medium hover:bg-garden-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-garden-500 text-white font-medium hover:bg-garden-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  保存
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4">
              <PlotHistoryTimeline
                history={history}
                onRollback={(entryId) => {
                  if (onRollback) {
                    onRollback(entryId);
                  }
                }}
                isLoading={!isHistoryLoaded}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
