import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Species } from '../lib/supabase';

interface SpeciesCardProps {
  species: Species;
  observationCount?: number;
  onClick?: () => void;
}

const conservationStatusConfig: Record<string, { label: string; color: string; icon: any }> = {
  LC: { label: 'Least Concern', color: 'emerald', icon: CheckCircle2 },
  NT: { label: 'Near Threatened', color: 'yellow', icon: AlertTriangle },
  VU: { label: 'Vulnerable', color: 'amber', icon: AlertTriangle },
  EN: { label: 'Endangered', color: 'orange', icon: AlertCircle },
  CR: { label: 'Critically Endangered', color: 'red', icon: AlertCircle },
  EW: { label: 'Extinct in Wild', color: 'red', icon: AlertCircle },
  EX: { label: 'Extinct', color: 'slate', icon: AlertCircle },
};

const speciesTypeEmoji: Record<string, string> = {
  mammal: '🦌',
  bird: '🦅',
  reptile: '🦎',
  amphibian: '🐸',
  fish: '🐟',
  insect: '🦋',
};

export function SpeciesCard({ species, observationCount = 0, onClick }: SpeciesCardProps) {
  const statusConfig = conservationStatusConfig[species.conservation_status] || conservationStatusConfig.LC;
  const StatusIcon = statusConfig.icon;
  const emoji = speciesTypeEmoji[species.species_type] || '🐾';

  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/30 p-5 backdrop-blur-sm transition-all duration-300 hover:border-slate-600 hover:shadow-xl hover:shadow-slate-900/50 hover:-translate-y-1 cursor-pointer"
    >
      <div className="absolute top-0 right-0 w-24 h-24 opacity-5 text-5xl flex items-center justify-center">
        {emoji}
      </div>

      <div className="relative">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-slate-700/50 flex items-center justify-center text-2xl border border-slate-600/50">
            {emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white mb-0.5 truncate group-hover:text-emerald-400 transition-colors">
              {species.common_name}
            </h3>
            <p className="text-sm text-slate-400 italic truncate">{species.scientific_name}</p>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 capitalize">Type</span>
            <span className="font-medium text-slate-300 capitalize">{species.species_type}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Observations</span>
            <span className="font-medium text-white">{observationCount}</span>
          </div>
        </div>

        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border bg-${statusConfig.color}-500/5 border-${statusConfig.color}-500/30`}>
          <StatusIcon className={`h-4 w-4 text-${statusConfig.color}-400 flex-shrink-0`} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400">Conservation Status</p>
            <p className={`text-sm font-medium text-${statusConfig.color}-400 truncate`}>
              {statusConfig.label}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
