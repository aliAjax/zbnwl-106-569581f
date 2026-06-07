import { useState } from 'react';
import {
  Clock,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Edit3,
  UserPlus,
  Undo2,
} from 'lucide-react';
import type { PlotHistoryEntry, Plot } from '../types/plot';
import { formatFieldValue } from '../hooks/usePlotHistory';

const FIELD_LABELS: Record<string, string> = {
  owner: '认领人',
  plant: '种植物',
  lastWatered: '浇水日期',
  lastWeeded: '除草日期',
  status: '状态',
  notes: '备注',
};

interface PlotHistoryTimelineProps {
  history: PlotHistoryEntry[];
  onRollback: (entryId: string) => void;
  isLoading?: boolean;
}

const ActionIcon = ({ action }: { action: PlotHistoryEntry['action'] }) => {
  switch (action) {
    case 'claim':
      return <UserPlus size={14} className="text-garden-600" />;
    case 'update':
      return <Edit3 size={14} className="text-blue-600" />;
    case 'rollback':
      return <Undo2 size={14} className="text-amber-600" />;
    default:
      return <Clock size={14} className="text-gray-500" />;
  }
};

const ActionLabel = ({ action }: { action: PlotHistoryEntry['action'] }) => {
  switch (action) {
    case 'claim':
      return <span className="text-garden-700">认领</span>;
    case 'update':
      return <span className="text-blue-700">编辑</span>;
    case 'rollback':
      return <span className="text-amber-700">回滚</span>;
    default:
      return <span className="text-gray-600">操作</span>;
  }
};

const DiffView = ({ before, after }: { before: Partial<Plot>; after: Partial<Plot> }) => {
  const changes: { field: string; before: unknown; after: unknown }[] = [];

  Object.keys(FIELD_LABELS).forEach((field) => {
    const key = field as keyof Plot;
    const beforeVal = before[key];
    const afterVal = after[key];
    if (beforeVal !== afterVal) {
      changes.push({ field, before: beforeVal, after: afterVal });
    }
  });

  if (changes.length === 0) {
    return <p className="text-sm text-gray-500">无字段变更</p>;
  }

  return (
    <div className="space-y-2">
      {changes.map(({ field, before, after }) => (
        <div key={field} className="text-sm">
          <span className="font-medium text-garden-700">
            {FIELD_LABELS[field] || field}:
          </span>
          <div className="mt-1 flex items-start gap-2 pl-2">
            <span className="line-through text-red-500 bg-red-50 px-2 py-0.5 rounded text-xs">
              {formatFieldValue(field, before)}
            </span>
            <span className="text-gray-400">→</span>
            <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs">
              {formatFieldValue(field, after)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export const PlotHistoryTimeline = ({
  history,
  onRollback,
  isLoading = false,
}: PlotHistoryTimelineProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmRollbackId, setConfirmRollbackId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    setConfirmRollbackId(null);
  };

  const handleRollbackClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirmRollbackId === id) {
      onRollback(id);
      setConfirmRollbackId(null);
      setExpandedId(null);
    } else {
      setConfirmRollbackId(id);
    }
  };

  const handleCancelRollback = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmRollbackId(null);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-garden-500">
        <Clock className="animate-spin mx-auto mb-2" size={24} />
        <p>加载历史记录中...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-garden-500">
        <Clock className="mx-auto mb-2 opacity-50" size={32} />
        <p>暂无历史记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((entry, index) => (
        <div
          key={entry.id}
          className={`relative border rounded-xl overflow-hidden transition-all ${
            expandedId === entry.id
              ? 'border-garden-300 bg-garden-50/30'
              : 'border-garden-100 bg-white hover:border-garden-200'
          }`}
        >
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-garden-100" />
          <div
            className="relative z-10 p-3 cursor-pointer"
            onClick={() => toggleExpand(entry.id)}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  entry.action === 'claim'
                    ? 'bg-garden-100'
                    : entry.action === 'rollback'
                    ? 'bg-amber-100'
                    : 'bg-blue-100'
                }`}
              >
                <ActionIcon action={entry.action} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ActionLabel action={entry.action} />
                    <span className="text-xs text-gray-400">
                      {new Date(entry.timestamp).toLocaleString('zh-CN', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {index === 0 && (
                      <span className="text-xs bg-garden-500 text-white px-2 py-0.5 rounded-full">
                        最新
                      </span>
                    )}
                    {expandedId === entry.id ? (
                      <ChevronUp size={16} className="text-garden-500" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-400" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {entry.description}
                </p>

                {expandedId === entry.id && (
                  <div className="mt-3 pt-3 border-t border-garden-100">
                    <h4 className="text-xs font-medium text-garden-600 mb-2">
                      变更详情
                    </h4>
                    <DiffView before={entry.before} after={entry.after} />

                    <div className="mt-3 pt-3 border-t border-garden-100">
                      {confirmRollbackId === entry.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-amber-700 flex-1">
                            确定回滚到此版本？
                          </span>
                          <button
                            type="button"
                            onClick={handleCancelRollback}
                            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            取消
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleRollbackClick(e, entry.id)}
                            className="px-3 py-1.5 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-1"
                          >
                            <RotateCcw size={14} />
                            确认回滚
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => handleRollbackClick(e, entry.id)}
                          disabled={entry.action === 'rollback' && index === 0}
                          className="w-full px-3 py-2 text-sm border border-amber-200 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <RotateCcw size={14} />
                          回滚到此版本
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
