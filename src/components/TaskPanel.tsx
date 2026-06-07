import { X, Droplets, Leaf, AlertCircle, ChevronRight } from 'lucide-react';
import type { MaintenanceTask } from '../types/plot';

interface TaskPanelProps {
  tasks: MaintenanceTask[];
  isOpen: boolean;
  onClose: () => void;
  onTaskClick: (plotId: string) => void;
}

const urgencyConfig = {
  low: {
    label: '普通',
    color: 'text-garden-600',
    bg: 'bg-garden-100',
  },
  medium: {
    label: '紧急',
    color: 'text-amber-600',
    bg: 'bg-amber-100',
  },
  high: {
    label: '非常紧急',
    color: 'text-warning',
    bg: 'bg-red-100',
  },
};

export const TaskPanel = ({ tasks, isOpen, onClose, onTaskClick }: TaskPanelProps) => {
  const waterTasks = tasks.filter(t => t.type === 'water');
  const weedTasks = tasks.filter(t => t.type === 'weed');

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={`
        fixed top-0 right-0 h-full w-full sm:w-80 bg-white shadow-2xl z-50
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        lg:relative lg:translate-x-0 lg:shadow-none lg:bg-transparent
        flex flex-col
      `}>
        <div className="p-4 border-b border-garden-100 bg-cream flex items-center justify-between lg:bg-transparent lg:border-0 lg:px-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="text-amber-500" size={20} />
            <h2 className="text-lg font-serif font-bold text-garden-800">本周维护任务</h2>
            {tasks.length > 0 && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                {tasks.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-garden-100 transition-colors lg:hidden"
          >
            <X size={20} className="text-garden-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 lg:px-0">
          {tasks.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">🌿</p>
              <p className="text-garden-600">太棒了！没有待处理的任务</p>
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
                      <TaskItem
                        key={`water-${task.plotId}`}
                        task={task}
                        onClick={() => onTaskClick(task.plotId)}
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
                      <TaskItem
                        key={`weed-${task.plotId}`}
                        task={task}
                        onClick={() => onTaskClick(task.plotId)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

const TaskItem = ({ task, onClick }: { task: MaintenanceTask; onClick: () => void }) => {
  const config = urgencyConfig[task.urgency];
  
  return (
    <button
      onClick={onClick}
      className="w-full p-3 bg-cream rounded-xl border border-garden-100 flex items-center gap-3 hover:border-garden-300 hover:shadow-sm transition-all group"
    >
      <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
        {task.type === 'water' ? (
          <Droplets size={18} className="text-blue-500" />
        ) : (
          <Leaf size={18} className="text-garden-500" />
        )}
      </div>
      
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-garden-800">地块 {task.plotNumber}</span>
          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${config.bg} ${config.color}`}>
            {config.label}
          </span>
        </div>
        <p className="text-xs text-garden-500">
          超期 {task.daysOverdue} 天
        </p>
      </div>
      
      <ChevronRight size={18} className="text-garden-300 group-hover:text-garden-500 transition-colors flex-shrink-0" />
    </button>
  );
};
