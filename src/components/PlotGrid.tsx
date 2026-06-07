import type { Plot } from '../types/plot';
import { PlotCard } from './PlotCard';

interface PlotGridProps {
  plots: Plot[];
  onPlotClick: (plot: Plot) => void;
}

export const PlotGrid = ({ plots, onPlotClick }: PlotGridProps) => {
  if (plots.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-4xl mb-4">🌱</p>
          <p className="text-garden-600 text-lg">没有找到符合条件的地块</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {plots.map((plot, index) => (
        <PlotCard
          key={plot.id}
          plot={plot}
          index={index}
          onClick={() => onPlotClick(plot)}
        />
      ))}
    </div>
  );
};
