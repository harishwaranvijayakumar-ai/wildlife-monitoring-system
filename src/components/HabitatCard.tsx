import { MapPin, TrendingUp, Activity } from 'lucide-react';
import { Habitat } from '../lib/supabase';

interface HabitatCardProps {
  habitat: Habitat;
  observationCount?: number;
  speciesCount?: number;
  onClick?: () => void;
}

const zoneTypeColors: Record<string, string> = {
  forest: 'emerald',
  wetland: 'blue',
  grassland: 'amber',
  coastal: 'cyan',
  mountain: 'slate',
};

const zoneTypeIcons: Record<string, string> = {
  forest: '🌲',
  wetland: '💧',
  grassland: '🌾',
  coastal: '🌊',
  mountain: '⛰️',
};

export function HabitatCard({ habitat, observationCount = 0, speciesCount = 0, onClick }: HabitatCardProps) {
  const color = zoneTypeColors[habitat.zone_type] || 'slate';
  const icon = zoneTypeIcons[habitat.zone_type] || '📍';

  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/30 p-6 backdrop-blur-sm transition-all duration-300 hover:border-slate-600 hover:shadow-xl hover:shadow-slate-900/50 hover:-translate-y-1 cursor-pointer"
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5 text-6xl flex items-center justify-center">
        {icon}
      </div>

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
              {habitat.name}
            </h3>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <MapPin className="h-4 w-4" />
              <span>{habitat.location}</span>
            </div>
          </div>
          <div className={`rounded-lg bg-${color}-500/10 px-3 py-1 border border-${color}-500/30`}>
            <span className={`text-xs font-medium text-${color}-400 capitalize`}>
              {habitat.zone_type}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Area</span>
            <span className="font-medium text-white">{habitat.area_sqkm} km²</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-slate-800/50 p-3 border border-slate-700/30">
              <Activity className="h-4 w-4 text-emerald-400" />
              <div>
                <p className="text-xs text-slate-400">Species</p>
                <p className="text-lg font-bold text-white">{speciesCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-slate-800/50 p-3 border border-slate-700/30">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <div>
                <p className="text-xs text-slate-400">Observations</p>
                <p className="text-lg font-bold text-white">{observationCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
            habitat.status === 'active'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
          }`}>
            <div className={`h-1.5 w-1.5 rounded-full ${
              habitat.status === 'active' ? 'bg-emerald-400' : 'bg-slate-400'
            }`} />
            {habitat.status}
          </div>
        </div>
      </div>
    </div>
  );
}
