import { useState, useEffect } from 'react';
import { X, User, Phone, Sprout, Calendar, StickyNote, ChevronRight, ChevronLeft, Check, Sparkles } from 'lucide-react';
import type { Plot } from '../types/plot';
import { todayStr } from '../utils/dateUtils';

interface ClaimWizardProps {
  plot: Plot | null;
  isOpen: boolean;
  onClose: () => void;
  onClaim: (id: string, data: {
    owner: string;
    contact: string;
    plant: string;
    firstMaintenanceDate: string;
    notes?: string;
  }) => void;
}

const STEPS = [
  { id: 1, title: '认领人信息', icon: User },
  { id: 2, title: '种植计划', icon: Sprout },
  { id: 3, title: '确认提交', icon: Check },
];

const PLANT_SUGGESTIONS = [
  '番茄 🍅',
  '黄瓜 🥒',
  '辣椒 🌶️',
  '茄子 🍆',
  '白菜 🥬',
  '萝卜 🥕',
  '生菜 🥗',
  '菠菜 🌿',
  '葱 🧅',
  '土豆 🥔',
  '玉米 🌽',
  '南瓜 🎃',
  '西瓜 🍉',
  '草莓 🍓',
  '葡萄 🍇',
  '豆角 🫛',
];

const INITIAL_FORM_DATA = {
  owner: '',
  contact: '',
  plant: '',
  firstMaintenanceDate: '',
  notes: '',
};

export const ClaimWizard = ({ plot, isOpen, onClose, onClaim }: ClaimWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      const savedContact = localStorage.getItem('garden-contact') || '';
      setFormData(prev => ({
        ...INITIAL_FORM_DATA,
        contact: savedContact,
        firstMaintenanceDate: todayStr(),
      }));
      setCurrentStep(1);
      setErrors({});
    }
  }, [isOpen, plot]);

  if (!isOpen || !plot) return null;

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.owner.trim()) {
        newErrors.owner = '请输入认领人姓名';
      }
      if (!formData.contact.trim()) {
        newErrors.contact = '请输入联系方式';
      } else if (!/^1[3-9]\d{9}$/.test(formData.contact.trim())) {
        newErrors.contact = '请输入有效的手机号';
      }
    }

    if (step === 2) {
      if (!formData.plant.trim()) {
        newErrors.plant = '请输入种植物';
      }
      if (!formData.firstMaintenanceDate) {
        newErrors.firstMaintenanceDate = '请选择预计开始日期';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors({});
  };

  const handleSubmit = () => {
    if (validateStep(2)) {
      onClaim(plot.id, {
        owner: formData.owner.trim(),
        contact: formData.contact.trim(),
        plant: formData.plant.trim(),
        firstMaintenanceDate: formData.firstMaintenanceDate,
        notes: formData.notes.trim() || undefined,
      });
      onClose();
    }
  };

  const handlePlantClick = (plant: string) => {
    setFormData(prev => ({ ...prev, plant }));
    setErrors(prev => ({ ...prev, plant: '' }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-garden-700 mb-2">
                <User size={16} />
                认领人姓名
              </label>
              <input
                type="text"
                value={formData.owner}
                onChange={e => {
                  setFormData(prev => ({ ...prev, owner: e.target.value }));
                  setErrors(prev => ({ ...prev, owner: '' }));
                }}
                placeholder="请输入您的姓名"
                className={`w-full px-4 py-2.5 rounded-xl border bg-white focus:ring-2 outline-none transition-all ${
                  errors.owner
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                    : 'border-garden-200 focus:border-garden-400 focus:ring-garden-200'
                }`}
              />
              {errors.owner && <p className="mt-1 text-xs text-red-500">{errors.owner}</p>}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-garden-700 mb-2">
                <Phone size={16} />
                联系方式
              </label>
              <input
                type="tel"
                value={formData.contact}
                onChange={e => {
                  setFormData(prev => ({ ...prev, contact: e.target.value }));
                  setErrors(prev => ({ ...prev, contact: '' }));
                }}
                placeholder="请输入手机号"
                className={`w-full px-4 py-2.5 rounded-xl border bg-white focus:ring-2 outline-none transition-all ${
                  errors.contact
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                    : 'border-garden-200 focus:border-garden-400 focus:ring-garden-200'
                }`}
              />
              {errors.contact && <p className="mt-1 text-xs text-red-500">{errors.contact}</p>}
              <p className="mt-1.5 text-xs text-garden-400">💡 联系方式会自动保存，下次认领时可直接使用</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-garden-700 mb-2">
                <Sprout size={16} />
                种植物
              </label>
              <input
                type="text"
                value={formData.plant}
                onChange={e => {
                  setFormData(prev => ({ ...prev, plant: e.target.value }));
                  setErrors(prev => ({ ...prev, plant: '' }));
                }}
                placeholder="例如：番茄 🍅"
                className={`w-full px-4 py-2.5 rounded-xl border bg-white focus:ring-2 outline-none transition-all mb-3 ${
                  errors.plant
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                    : 'border-garden-200 focus:border-garden-400 focus:ring-garden-200'
                }`}
              />
              {errors.plant && <p className="mt-1 text-xs text-red-500">{errors.plant}</p>}
              <div className="flex flex-wrap gap-2">
                {PLANT_SUGGESTIONS.map(plant => (
                  <button
                    key={plant}
                    type="button"
                    onClick={() => handlePlantClick(plant)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      formData.plant === plant
                        ? 'bg-garden-500 text-white'
                        : 'bg-garden-100 text-garden-600 hover:bg-garden-200'
                    }`}
                  >
                    {plant}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-garden-700 mb-2">
                <Calendar size={16} />
                预计开始日期
              </label>
              <input
                type="date"
                value={formData.firstMaintenanceDate}
                min={todayStr()}
                onChange={e => {
                  setFormData(prev => ({ ...prev, firstMaintenanceDate: e.target.value }));
                  setErrors(prev => ({ ...prev, firstMaintenanceDate: '' }));
                }}
                className={`w-full px-4 py-2.5 rounded-xl border bg-white focus:ring-2 outline-none transition-all ${
                  errors.firstMaintenanceDate
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                    : 'border-garden-200 focus:border-garden-400 focus:ring-garden-200'
                }`}
              />
              {errors.firstMaintenanceDate && <p className="mt-1 text-xs text-red-500">{errors.firstMaintenanceDate}</p>}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-garden-700 mb-2">
                <StickyNote size={16} />
                备注 <span className="text-garden-400 font-normal">(选填)</span>
              </label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="添加备注信息..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-garden-200 bg-white focus:border-garden-400 focus:ring-2 focus:ring-garden-200 outline-none transition-all resize-none"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-garden-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-8 h-8 text-garden-500" />
              </div>
              <h3 className="text-lg font-serif font-bold text-garden-800">确认认领信息</h3>
              <p className="text-sm text-garden-500 mt-1">请确认以下信息无误</p>
            </div>

            <div className="bg-garden-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-garden-500">地块编号</span>
                <span className="text-sm font-medium text-garden-800">{plot.plotNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-garden-500">认领人</span>
                <span className="text-sm font-medium text-garden-800">{formData.owner}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-garden-500">联系方式</span>
                <span className="text-sm font-medium text-garden-800">{formData.contact}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-garden-500">种植物</span>
                <span className="text-sm font-medium text-garden-800">{formData.plant}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-garden-500">预计开始</span>
                <span className="text-sm font-medium text-garden-800">{formData.firstMaintenanceDate}</span>
              </div>
              {formData.notes && (
                <div className="pt-2 border-t border-garden-200">
                  <span className="text-sm text-garden-500 block mb-1">备注</span>
                  <span className="text-sm text-garden-700">{formData.notes}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-garden-400 text-center">
              提交后地块状态将自动更新为"已认领"
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-cream rounded-2xl shadow-2xl animate-slide-in max-h-[90vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-cream border-b border-garden-100 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif font-bold text-garden-800">
              认领地块 {plot.plotNumber}
            </h2>
            <p className="text-xs text-garden-500 mt-0.5">步骤 {currentStep} / 3</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-garden-100 transition-colors"
          >
            <X size={20} className="text-garden-600" />
          </button>
        </div>

        <div className="px-4 pt-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all
                    ${isActive
                      ? 'bg-garden-500 text-white'
                      : isCompleted
                        ? 'bg-garden-200 text-garden-700'
                        : 'bg-garden-100 text-garden-400'
                    }
                  `}>
                    {isCompleted ? <Check size={14} /> : <Icon size={14} />}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                      isCompleted ? 'bg-garden-300' : 'bg-garden-100'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2 mb-4">
            {STEPS.map(step => (
              <span
                key={step.id}
                className={`text-xs font-medium transition-colors ${
                  currentStep >= step.id ? 'text-garden-600' : 'text-garden-300'
                }`}
              >
                {step.title}
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {renderStep()}
        </div>

        <div className="sticky bottom-0 bg-cream border-t border-garden-100 p-4 flex gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="flex-1 px-4 py-3 rounded-xl border border-garden-200 text-garden-700 font-medium hover:bg-garden-50 transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft size={18} />
              上一步
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-garden-200 text-garden-700 font-medium hover:bg-garden-50 transition-colors"
            >
              取消
            </button>
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 px-4 py-3 rounded-xl bg-garden-500 text-white font-medium hover:bg-garden-600 transition-colors flex items-center justify-center gap-2"
            >
              下一步
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 px-4 py-3 rounded-xl bg-garden-500 text-white font-medium hover:bg-garden-600 transition-colors flex items-center justify-center gap-2"
            >
              <Check size={18} />
              确认认领
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
