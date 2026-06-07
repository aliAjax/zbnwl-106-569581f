import { LayoutGrid, HandCoins, Wrench, CalendarDays, Droplets, Leaf } from 'lucide-react';
import type { DashboardStats } from '../types/plot';

interface DashboardProps {
  stats: DashboardStats;
}

export const Dashboard = ({ stats }: DashboardProps) => {
  const statCards = [
    {
      label: '总地块数',
      value: stats.totalPlots,
      icon: LayoutGrid,
      bgColor: 'bg-garden-50',
      borderColor: 'border-garden-200',
      iconBg: 'bg-garden-100',
      iconColor: 'text-garden-600',
      valueColor: 'text-garden-800',
    },
    {
      label: '待认领',
      value: stats.availablePlots,
      icon: HandCoins,
      bgColor: 'bg-soil-50',
      borderColor: 'border-soil-200',
      iconBg: 'bg-soil-100',
      iconColor: 'text-soil-600',
      valueColor: 'text-soil-700',
    },
    {
      label: '需维护',
      value: stats.needsMaintenancePlots,
      icon: Wrench,
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-700',
    },
    {
      label: '今日新增任务',
      value: stats.todayNewTasks,
      icon: CalendarDays,
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200',
      iconBg: 'bg-sky-100',
      iconColor: 'text-sky-600',
      valueColor: 'text-sky-700',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`
                p-4 rounded-xl border-2 ${card.bgColor} ${card.borderColor}
                transition-all duration-300 hover:shadow-md
              `}
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`w-10 h-10 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
              <p className={`text-2xl font-bold ${card.valueColor}`}>{card.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{card.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-4 rounded-xl border-2 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Droplets className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-semibold text-blue-800">最久未浇水</h3>
          </div>
          {stats.longestUnwateredPlot ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-blue-900">
                  {stats.longestUnwateredPlot.plotNumber}
                  {stats.longestUnwateredPlot.plant && (
                    <span className="text-sm font-normal text-blue-600 ml-2">
                      {stats.longestUnwateredPlot.plant}
                    </span>
                  )}
                </p>
                <p className="text-sm text-blue-600">
                  已 {stats.longestUnwateredPlot.days} 天未浇水
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  需关注
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-blue-500">暂无数据</p>
          )}
        </div>

        <div className="p-4 rounded-xl border-2 bg-emerald-50 border-emerald-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-emerald-800">最久未除草</h3>
          </div>
          {stats.longestUnweededPlot ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-emerald-900">
                  {stats.longestUnweededPlot.plotNumber}
                  {stats.longestUnweededPlot.plant && (
                    <span className="text-sm font-normal text-emerald-600 ml-2">
                      {stats.longestUnweededPlot.plant}
                    </span>
                  )}
                </p>
                <p className="text-sm text-emerald-600">
                  已 {stats.longestUnweededPlot.days} 天未除草
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                  需关注
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-emerald-500">暂无数据</p>
          )}
        </div>
      </div>
    </div>
  );
};
