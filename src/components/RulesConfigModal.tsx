import { useState, useEffect } from 'react';
import { X, Settings, Save, RotateCcw, Droplets, Leaf, AlertTriangle, Info } from 'lucide-react';
import type { MaintenanceRules } from '../types/plot';
import { DEFAULT_MAINTENANCE_RULES } from '../hooks/useMaintenanceRules';

interface RulesConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: MaintenanceRules;
  onSave: (rules: Partial<MaintenanceRules>) => void;
  onReset: () => void;
}

export const RulesConfigModal = ({ isOpen, onClose, rules, onSave, onReset }: RulesConfigModalProps) => {
  const [formData, setFormData] = useState<MaintenanceRules>(rules);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(rules);
      setErrors({});
    }
  }, [isOpen, rules]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.waterOverdueDays < 1) {
      newErrors.waterOverdueDays = '浇水超期天数至少为 1 天';
    }
    if (formData.weedOverdueDays < 1) {
      newErrors.weedOverdueDays = '除草超期天数至少为 1 天';
    }
    if (formData.urgencyThresholds.medium < 0) {
      newErrors.mediumThreshold = '普通阈值不能为负数';
    }
    if (formData.urgencyThresholds.high <= formData.urgencyThresholds.medium) {
      newErrors.highThreshold = '紧急阈值必须大于普通阈值';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
      onClose();
    }
  };

  const handleReset = () => {
    setFormData(DEFAULT_MAINTENANCE_RULES);
    setErrors({});
  };

  const handleRestoreDefault = () => {
    onReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-cream rounded-2xl shadow-2xl animate-slide-in max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-cream border-b border-garden-100 p-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Settings className="text-garden-600" size={20} />
            <h2 className="text-xl font-serif font-bold text-garden-800">
              维护规则配置
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-garden-100 transition-colors"
          >
            <X size={20} className="text-garden-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          <div className="bg-white rounded-xl p-4 border border-garden-100">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Droplets size={20} className="text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-garden-800">浇水规则</h3>
                <p className="text-xs text-garden-500 mt-0.5">超过此天数未浇水将标记为需维护</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-garden-700 mb-2 block">
                浇水超期天数
              </label>
              <input
                type="number"
                min={1}
                value={formData.waterOverdueDays}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  waterOverdueDays: Math.max(1, parseInt(e.target.value) || 1),
                }))}
                className={`w-full px-4 py-2.5 rounded-xl border bg-white focus:outline-none transition-all ${
                  errors.waterOverdueDays
                    ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-200'
                    : 'border-garden-200 focus:border-garden-400 focus:ring-2 focus:ring-garden-200'
                }`}
              />
              {errors.waterOverdueDays && (
                <p className="text-xs text-red-500 mt-1">{errors.waterOverdueDays}</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-garden-100">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-garden-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Leaf size={20} className="text-garden-500" />
              </div>
              <div>
                <h3 className="font-semibold text-garden-800">除草规则</h3>
                <p className="text-xs text-garden-500 mt-0.5">超过此天数未除草将标记为需维护</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-garden-700 mb-2 block">
                除草超期天数
              </label>
              <input
                type="number"
                min={1}
                value={formData.weedOverdueDays}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  weedOverdueDays: Math.max(1, parseInt(e.target.value) || 1),
                }))}
                className={`w-full px-4 py-2.5 rounded-xl border bg-white focus:outline-none transition-all ${
                  errors.weedOverdueDays
                    ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-200'
                    : 'border-garden-200 focus:border-garden-400 focus:ring-2 focus:ring-garden-200'
                }`}
              />
              {errors.weedOverdueDays && (
                <p className="text-xs text-red-500 mt-1">{errors.weedOverdueDays}</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-garden-100">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-amber-500" />
              </div>
              <div>
                <h3 className="font-semibold text-garden-800">紧急程度阈值</h3>
                <p className="text-xs text-garden-500 mt-0.5">根据超期天数划分任务紧急程度</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-garden-700 mb-2 block">
                  普通 → 紧急 阈值（天）
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.urgencyThresholds.medium}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    urgencyThresholds: {
                      ...prev.urgencyThresholds,
                      medium: Math.max(0, parseInt(e.target.value) || 0),
                    },
                  }))}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white focus:outline-none transition-all ${
                    errors.mediumThreshold
                      ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-200'
                      : 'border-garden-200 focus:border-garden-400 focus:ring-2 focus:ring-garden-200'
                  }`}
                />
                {errors.mediumThreshold && (
                  <p className="text-xs text-red-500 mt-1">{errors.mediumThreshold}</p>
                )}
                <p className="text-xs text-garden-500 mt-1">
                  ≤ 此天数为「普通」紧急程度
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-garden-700 mb-2 block">
                  紧急 → 非常紧急 阈值（天）
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.urgencyThresholds.high}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    urgencyThresholds: {
                      ...prev.urgencyThresholds,
                      high: Math.max(0, parseInt(e.target.value) || 0),
                    },
                  }))}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-white focus:outline-none transition-all ${
                    errors.highThreshold
                      ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-200'
                      : 'border-garden-200 focus:border-garden-400 focus:ring-2 focus:ring-garden-200'
                  }`}
                />
                {errors.highThreshold && (
                  <p className="text-xs text-red-500 mt-1">{errors.highThreshold}</p>
                )}
                <p className="text-xs text-garden-500 mt-1">
                  ≤ 此天数为「紧急」，&gt; 此天数为「非常紧急」
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-garden-50 rounded-xl border border-garden-100">
            <Info size={16} className="text-garden-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-garden-600">
              修改规则后将自动重新计算所有地块的维护状态，保存后立即生效。
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 px-4 py-3 rounded-xl border border-garden-200 text-garden-700 font-medium hover:bg-garden-50 transition-colors text-sm"
              >
                重置表单
              </button>
              <button
                type="button"
                onClick={handleRestoreDefault}
                className="flex-1 px-4 py-3 rounded-xl border border-garden-200 text-garden-700 font-medium hover:bg-garden-50 transition-colors text-sm flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={16} />
                恢复默认
              </button>
            </div>
            <button
              type="submit"
              className="w-full px-4 py-3 rounded-xl bg-garden-500 text-white font-medium hover:bg-garden-600 transition-colors flex items-center justify-center gap-2"
            >
              <Save size={18} />
              保存规则
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
