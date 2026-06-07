import { useState, useEffect } from 'react';
import { X, Droplets, Leaf, User, Sprout, Calendar, StickyNote, Save } from 'lucide-react';
import type { Plot, PlotStatus } from '../types/plot';
import { todayStr } from '../utils/dateUtils';

interface EditModalProps {
  plot: Plot | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Plot>) => void;
}

export const EditModal = ({ plot, isOpen, onClose, onSave }: EditModalProps) => {
  const [formData, setFormData] = useState({
    owner: '',
    plant: '',
    lastWatered: '',
    lastWeeded: '',
    status: 'available' as PlotStatus,
    notes: '',
  });

  useEffect(() => {
    if (plot) {
      setFormData({
        owner: plot.owner || '',
        plant: plot.plant || '',
        lastWatered: plot.lastWatered || '',
        lastWeeded: plot.lastWeeded || '',
        status: plot.status,
        notes: plot.notes || '',
      });
    }
  }, [plot]);

  if (!isOpen || !plot) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(plot.id, {
      owner: formData.owner || null,
      plant: formData.plant || null,
      lastWatered: formData.lastWatered || null,
      lastWeeded: formData.lastWeeded || null,
      notes: formData.notes || undefined,
    });
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
      
      <div className="relative w-full max-w-md bg-cream rounded-2xl shadow-2xl animate-slide-in max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-cream border-b border-garden-100 p-4 flex items-center justify-between rounded-t-2xl">
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
      </div>
    </div>
  );
};
