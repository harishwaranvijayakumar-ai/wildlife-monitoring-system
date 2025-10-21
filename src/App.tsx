import { useState, useEffect } from 'react';
import {
  Activity,
  TrendingUp,
  AlertCircle,
  Plus,
  MapPin,
  Leaf,
  Eye,
  BarChart3,
} from 'lucide-react';
import { supabase, Habitat, Species, Observation, ZoneAssignment } from './lib/supabase';
import { StatCard } from './components/StatCard';
import { HabitatCard } from './components/HabitatCard';
import { SpeciesCard } from './components/SpeciesCard';
import { ObservationForm } from './components/ObservationForm';
import { BacktrackingVisualizer } from './components/BacktrackingVisualizer';
import { OptimizationResult } from './algorithms/backtracking';

type Tab = 'dashboard' | 'habitats' | 'species' | 'observations' | 'optimizer';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [habitats, setHabitats] = useState<Habitat[]>([]);
  const [species, setSpecies] = useState<Species[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [zoneAssignments, setZoneAssignments] = useState<ZoneAssignment[]>([]);
  const [showObservationForm, setShowObservationForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [habitatsRes, speciesRes, observationsRes, assignmentsRes] = await Promise.all([
        supabase.from('habitats').select('*').order('created_at', { ascending: false }),
        supabase.from('species').select('*').order('common_name', { ascending: true }),
        supabase.from('observations').select('*').order('observation_date', { ascending: false }),
        supabase.from('zone_assignments').select('*').order('assigned_at', { ascending: false }),
      ]);

      if (habitatsRes.data) setHabitats(habitatsRes.data);
      if (speciesRes.data) setSpecies(speciesRes.data);
      if (observationsRes.data) setObservations(observationsRes.data);
      if (assignmentsRes.data) setZoneAssignments(assignmentsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizationComplete = async (result: OptimizationResult) => {
    try {
      await supabase.from('zone_assignments').delete().eq('status', 'proposed');

      const { error } = await supabase.from('zone_assignments').insert(
        result.assignments.map(({ id, ...rest }) => rest)
      );

      if (error) throw error;

      loadData();
    } catch (error) {
      console.error('Error saving assignments:', error);
    }
  };

  const getHabitatStats = (habitatId: string) => {
    const observationCount = observations.filter((o) => o.habitat_id === habitatId).length;
    const speciesCount = new Set(
      observations.filter((o) => o.habitat_id === habitatId).map((o) => o.species_id)
    ).size;
    return { observationCount, speciesCount };
  };

  const getSpeciesObservationCount = (speciesId: string) => {
    return observations.filter((o) => o.species_id === speciesId).length;
  };

  const totalObservations = observations.length;
  const activeHabitats = habitats.filter((h) => h.status === 'active').length;
  const endangeredSpecies = species.filter((s) =>
    ['CR', 'EN', 'VU'].includes(s.conservation_status)
  ).length;
  const totalAssignments = zoneAssignments.filter((a) => a.status === 'proposed').length;

  const tabs = [
    { id: 'dashboard' as Tab, name: 'Dashboard', icon: BarChart3 },
    { id: 'habitats' as Tab, name: 'Habitats', icon: MapPin },
    { id: 'species' as Tab, name: 'Species', icon: Leaf },
    { id: 'observations' as Tab, name: 'Observations', icon: Eye },
    { id: 'optimizer' as Tab, name: 'Zone Optimizer', icon: Activity },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-4">
            <Activity className="h-8 w-8 text-emerald-400 animate-pulse" />
          </div>
          <p className="text-white font-medium">Loading Wildlife Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/20">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Wildlife Monitor</h1>
                <p className="text-sm text-slate-400">Habitat Analysis System</p>
              </div>
            </div>
            <button
              onClick={() => setShowObservationForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5"
            >
              <Plus className="h-5 w-5" />
              New Observation
            </button>
          </div>

          <div className="flex gap-1 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'text-emerald-400 border-b-2 border-emerald-400 bg-slate-800/50'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Observations"
                value={totalObservations}
                icon={Eye}
                color="emerald"
                trend={{ value: 12.5, isPositive: true }}
              />
              <StatCard
                title="Active Habitats"
                value={activeHabitats}
                icon={MapPin}
                color="blue"
              />
              <StatCard
                title="At-Risk Species"
                value={endangeredSpecies}
                icon={AlertCircle}
                color="amber"
              />
              <StatCard
                title="Zone Assignments"
                value={totalAssignments}
                icon={Activity}
                color="emerald"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-400" />
                  Recent Habitats
                </h2>
                <div className="space-y-4">
                  {habitats.slice(0, 3).map((habitat) => {
                    const stats = getHabitatStats(habitat.id);
                    return (
                      <HabitatCard
                        key={habitat.id}
                        habitat={habitat}
                        observationCount={stats.observationCount}
                        speciesCount={stats.speciesCount}
                      />
                    );
                  })}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-emerald-400" />
                  Monitored Species
                </h2>
                <div className="space-y-4">
                  {species.slice(0, 3).map((s) => (
                    <SpeciesCard
                      key={s.id}
                      species={s}
                      observationCount={getSpeciesObservationCount(s.id)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                Recent Observations
              </h2>
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800/50 border-b border-slate-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Species
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Habitat
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Count
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Health
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                      {observations.slice(0, 5).map((obs) => {
                        const habitat = habitats.find((h) => h.id === obs.habitat_id);
                        const speciesData = species.find((s) => s.id === obs.species_id);
                        return (
                          <tr key={obs.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                              {new Date(obs.observation_date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                              {speciesData?.common_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                              {habitat?.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {obs.count}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  obs.health_status === 'healthy'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                }`}
                              >
                                {obs.health_status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'habitats' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">All Habitats</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {habitats.map((habitat) => {
                const stats = getHabitatStats(habitat.id);
                return (
                  <HabitatCard
                    key={habitat.id}
                    habitat={habitat}
                    observationCount={stats.observationCount}
                    speciesCount={stats.speciesCount}
                  />
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'species' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Species Catalog</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {species.map((s) => (
                <SpeciesCard
                  key={s.id}
                  species={s}
                  observationCount={getSpeciesObservationCount(s.id)}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'observations' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Observation Log</h2>
              <div className="text-sm text-slate-400">
                Total: <span className="text-white font-medium">{observations.length}</span> observations
              </div>
            </div>
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50 border-b border-slate-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Species
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Habitat
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Count
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Behavior
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Health
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/30">
                    {observations.map((obs) => {
                      const habitat = habitats.find((h) => h.id === obs.habitat_id);
                      const speciesData = species.find((s) => s.id === obs.species_id);
                      return (
                        <tr key={obs.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                            {new Date(obs.observation_date).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="font-medium text-white">{speciesData?.common_name}</div>
                            <div className="text-xs text-slate-400 italic">
                              {speciesData?.scientific_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                            {habitat?.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                            {obs.count}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-300">
                            {obs.behavior || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                obs.health_status === 'healthy'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : obs.health_status === 'injured'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
                              }`}
                            >
                              {obs.health_status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'optimizer' && (
          <div>
            <BacktrackingVisualizer
              habitats={habitats}
              species={species}
              onOptimizationComplete={handleOptimizationComplete}
            />

            {zoneAssignments.length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-white mb-6">Current Zone Assignments</h2>
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-800/50 border-b border-slate-700/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Species
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Habitat
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Priority
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Compatibility
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/30">
                        {zoneAssignments.slice(0, 20).map((assignment) => {
                          const habitat = habitats.find((h) => h.id === assignment.habitat_id);
                          const speciesData = species.find((s) => s.id === assignment.species_id);
                          return (
                            <tr key={assignment.id} className="hover:bg-slate-800/30 transition-colors">
                              <td className="px-6 py-4 text-sm">
                                <div className="font-medium text-white">
                                  {speciesData?.common_name}
                                </div>
                                <div className="text-xs text-slate-400 italic">
                                  {speciesData?.scientific_name}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-300">
                                {habitat?.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                                  P{assignment.priority_level}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                                      style={{
                                        width: `${assignment.compatibility_score * 100}%`,
                                      }}
                                    />
                                  </div>
                                  <span className="text-sm font-medium text-white">
                                    {(assignment.compatibility_score * 100).toFixed(0)}%
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 capitalize">
                                  {assignment.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showObservationForm && (
        <ObservationForm
          habitats={habitats}
          species={species}
          onClose={() => setShowObservationForm(false)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}

export default App;
