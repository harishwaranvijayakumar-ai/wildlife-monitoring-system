import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export function StatCard({ title, value, icon: Icon, trend, color = 'emerald' }: StatCardProps) {
  const colorClasses = {
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400',
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400',
    red: 'from-red-500/20 to-red-600/5 border-red-500/30 text-red-400',
  };

  const bgClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.emerald;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-gradient-to-br p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-${color}-500/10 hover:-translate-y-1 ${bgClass}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white mb-2">{value}</p>
          {trend && (
            <div className="flex items-center gap-1">
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-slate-500">vs last period</span>
            </div>
          )}
        </div>
        <div className={`rounded-lg bg-${color}-500/10 p-3`}>
          <Icon className={`h-6 w-6 text-${color}-400`} />
        </div>
      </div>
    </div>
  );
}
