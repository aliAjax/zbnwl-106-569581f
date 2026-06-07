import { useState, useMemo } from 'react';
import { X, AlertTriangle, Check, RefreshCw, User, Users, ArrowLeftRight } from 'lucide-react';
import type { ConflictInfo } from '../types/collaboration';
import type { Plot } from '../types/plot';
import { formatFieldValue } from '../hooks/usePlotHistory';

const FIELD_LABELS: Record<string, string> = {
  owner: '认领人',
  contact: '联系方式',
  plant: '种植物',
  lastWatered: '最近浇水日期',
  lastWeeded: '最近除草日期',
  firstMaintenanceDate: '首次维护日期',
  status: '地块状态',
  notes: '备注',
};

interface ConflictResolverModalProps {
  conflict: ConflictInfo | null;
  isOpen: boolean;
  onResolve: (conflict: ConflictInfo, choice: 'local' | 'remote' | 'merge') => void;
  onClose: () => void;
}

type ChangeView = 'split' | 'combined';

export const ConflictResolverModal = ({
  conflict,
  isOpen,
  onResolve,
  onClose,
}: ConflictResolverModalProps) => {
  const [view, setView] = useState<ChangeView>('split');

  const formatValue = (field: string, value: unknown) => {
    if (value === null || value === undefined || value === '') {
      return '（空）';
    }
    return formatFieldValue(field, value);
  };

  const comparisonData = useMemo(() => {
    if (!conflict) return [];
    const { basePlot, localChanges, remoteChanges, conflictFields } = conflict;
    const allFields = new Set([
      ...Object.keys(localChanges),
      ...Object.keys(remoteChanges),
    ]);

    return Array.from(allFields).map((field) => {
      const baseVal = (basePlot as unknown as Record<string, unknown>)[field];
      const localVal = (localChanges as unknown as Record<string, unknown>)[field];
      const remoteVal = (remoteChanges as unknown as Record<string, unknown>)[field];
      const isConflict = conflictFields.includes(field);
      const localChanged = JSON.stringify(baseVal) !== JSON.stringify(localVal);
      const remoteChanged = JSON.stringify(baseVal) !== JSON.stringify(remoteVal);

      return {
        field,
        label: FIELD_LABELS[field] || field,
        baseValue: formatValue(field, baseVal),
        localValue: formatValue(field, localVal),
        remoteValue: formatValue(field, remoteVal),
        isConflict,
        localChanged,
        remoteChanged,
      };
    });
  }, [conflict]);

  if (!isOpen || !conflict) return null;

  const { basePlot, localTimestamp, remoteTimestamp, remoteClientId } = conflict;
  const remoteTime = new Date(remoteTimestamp).toLocaleString('zh-CN');
  const localTime = new Date(localTimestamp).toLocaleString('zh-CN');
  const plotNumber = basePlot.plotNumber;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-cream rounded-2xl shadow-2xl animate-slide-in max-h-[90vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-warning/10 border-b border-warning/20 p-4 flex items-start gap-3 rounded-t-2xl z-10">
          <div className="p-2 bg-warning/20 rounded-xl flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-warning" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-serif font-bold text-garden-800">
              编辑冲突
            </h2>
            <p className="text-sm text-garden-600 mt-1">
              地块 <span className="font-semibold">{plotNumber}</span> 在其他标签页也被修改了
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-garden-100 transition-colors flex-shrink-0"
          >
            <X size={20} className="text-garden-600" />
          </button>
        </div>

        <div className="flex border-b border-garden-100 bg-white/50">
          <button
            type="button"
            onClick={() => setView('split')}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              view === 'split'
                ? 'text-garden-700 border-b-2 border-garden-500 bg-garden-50/50'
                : 'text-gray-500 hover:text-garden-600 hover:bg-garden-50/30'
            }`}
          >
            <ArrowLeftRight size={16} />
            对比视图
          </button>
          <button
            type="button"
            onClick={() => setView('combined')}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              view === 'combined'
                ? 'text-garden-700 border-b-2 border-garden-500 bg-garden-50/50'
                : 'text-gray-500 hover:text-garden-600 hover:bg-garden-50/30'
            }`}
          >
            <Users size={16} />
            合并预览
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {view === 'split' ? (
            <>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="text-center text-gray-500 text-xs font-medium uppercase tracking-wide py-2">
                  原值
                </div>
                <div className="text-center text-garden-600 text-xs font-medium uppercase tracking-wide py-2 bg-garden-50 rounded-lg">
                  <User className="w-4 h-4 mx-auto mb-1" />
                  本标签页
                  <div className="text-[10px] font-normal opacity-70 mt-0.5">{localTime}</div>
                </div>
                <div className="text-center text-amber-600 text-xs font-medium uppercase tracking-wide py-2 bg-amber-50 rounded-lg">
                  <Users className="w-4 h-4 mx-auto mb-1" />
                  其他标签页
                  <div className="text-[10px] font-normal opacity-70 mt-0.5">{remoteTime}</div>
                </div>
              </div>

              <div className="space-y-2">
                {comparisonData.map((row) => (
                  <div
                    key={row.field}
                    className={`grid grid-cols-3 gap-3 text-sm p-3 rounded-xl ${
                      row.isConflict
                        ? 'bg-warning/10 border border-warning/20'
                        : 'bg-white/50 border border-garden-100'
                    }`}
                  >
                    <div className="text-gray-500 break-words">
                      <div className="text-xs text-gray-400 mb-1">{row.label}</div>
                      <div>{row.baseValue}</div>
                    </div>
                    <div
                      className={`break-words ${
                        row.localChanged
                          ? row.isConflict
                            ? 'text-garden-700 font-medium'
                            : 'text-garden-600'
                          : 'text-gray-400'
                      }`}
                    >
                      <div className="text-xs text-gray-400 mb-1">
                        {row.localChanged ? '已修改' : '未修改'}
                      </div>
                      <div>{row.localValue}</div>
                    </div>
                    <div
                      className={`break-words ${
                        row.remoteChanged
                          ? row.isConflict
                            ? 'text-amber-700 font-medium'
                            : 'text-amber-600'
                          : 'text-gray-400'
                      }`}
                    >
                      <div className="text-xs text-gray-400 mb-1">
                        {row.remoteChanged ? '已修改' : '未修改'}
                      </div>
                      <div>{row.remoteValue}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-garden-50 rounded-xl border border-garden-200">
                <h3 className="text-sm font-semibold text-garden-700 mb-2 flex items-center gap-2">
                  <RefreshCw size={16} />
                  自动合并结果（无冲突字段）
                </h3>
                <p className="text-xs text-garden-600">
                  以下是不冲突字段自动合并后的预览，冲突字段需要您选择保留哪一版
                </p>
              </div>

              <div className="space-y-2">
                {comparisonData.map((row) => (
                  <div
                    key={row.field}
                    className={`p-3 rounded-xl text-sm ${
                      row.isConflict
                        ? 'bg-warning/10 border border-warning/20'
                        : 'bg-white/50 border border-garden-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">{row.label}</span>
                      {row.isConflict ? (
                        <span className="text-xs text-warning font-medium flex items-center gap-1">
                          <AlertTriangle size={12} />
                          冲突
                        </span>
                      ) : (
                        <span className="text-xs text-garden-600 font-medium">
                          自动合并
                        </span>
                      )}
                    </div>
                    {row.isConflict ? (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="p-2 bg-garden-50 rounded-lg">
                          <div className="text-[10px] text-garden-600 mb-0.5">本标签页</div>
                          <div className="text-garden-700 font-medium break-words">{row.localValue}</div>
                        </div>
                        <div className="p-2 bg-amber-50 rounded-lg">
                          <div className="text-[10px] text-amber-600 mb-0.5">其他标签页</div>
                          <div className="text-amber-700 font-medium break-words">{row.remoteValue}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-garden-800 font-medium break-words">
                        {row.localChanged ? row.localValue : row.remoteValue}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-cream border-t border-garden-100 p-4">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => onResolve(conflict, 'local')}
              className="px-4 py-3 rounded-xl bg-garden-500 text-white font-medium hover:bg-garden-600 transition-colors flex flex-col items-center gap-1"
            >
              <User size={18} />
              <span className="text-sm">保留我的</span>
            </button>
            <button
              onClick={() => onResolve(conflict, 'merge')}
              className="px-4 py-3 rounded-xl bg-white border-2 border-garden-300 text-garden-700 font-medium hover:bg-garden-50 transition-colors flex flex-col items-center gap-1"
            >
              <RefreshCw size={18} />
              <span className="text-sm">自动合并</span>
            </button>
            <button
              onClick={() => onResolve(conflict, 'remote')}
              className="px-4 py-3 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors flex flex-col items-center gap-1"
            >
              <Users size={18} />
              <span className="text-sm">使用对方</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
