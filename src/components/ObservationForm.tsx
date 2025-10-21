import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { supabase, Habitat, Species } from '../lib/supabase';

interface ObservationFormProps {
  habitats: Habitat[];
  species: Species[];
  onClose: () => void;
  onSuccess: () => void;
}

export function ObservationForm({ habitats, species, onClose, onSuccess }: ObservationFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    habitat_id: '',
    species_id: '',
    count: 1,
    behavior: '',
    location_detail: '',
    observer_notes: '',
    health_status: 'healthy',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('observations').insert([
        {
          ...formData,
          observation_date: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating observation:', error);
      alert('Failed to create observation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">New Observation</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Habitat <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.habitat_id}
                onChange={(e) => setFormData({ ...formData, habitat_id: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Select habitat...</option>
                {habitats.map((habitat) => (
                  <option key={habitat.id} value={habitat.id}>
                    {habitat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Species <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.species_id}
                onChange={(e) => setFormData({ ...formData, species_id: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Select species...</option>
                {species.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.common_name} ({s.scientific_name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Count <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.count}
                onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Health Status
              </label>
              <select
                value={formData.health_status}
                onChange={(e) => setFormData({ ...formData, health_status: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="healthy">Healthy</option>
                <option value="injured">Injured</option>
                <option value="sick">Sick</option>
                <option value="deceased">Deceased</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Location Detail
            </label>
            <input
              type="text"
              value={formData.location_detail}
              onChange={(e) => setFormData({ ...formData, location_detail: e.target.value })}
              placeholder="e.g., Near the northern creek"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Behavior Observed
            </label>
            <input
              type="text"
              value={formData.behavior}
              onChange={(e) => setFormData({ ...formData, behavior: e.target.value })}
              placeholder="e.g., Foraging, Resting, Hunting"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Observer Notes
            </label>
            <textarea
              value={formData.observer_notes}
              onChange={(e) => setFormData({ ...formData, observer_notes: e.target.value })}
              rows={4}
              placeholder="Additional observations and notes..."
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-700 rounded-lg text-slate-300 font-medium hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Observation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
