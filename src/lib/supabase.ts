import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Habitat = {
  id: string;
  name: string;
  location: string;
  zone_type: string;
  area_sqkm: number;
  coordinates: any;
  status: string;
  created_at: string;
  updated_at: string;
};

export type Species = {
  id: string;
  common_name: string;
  scientific_name: string;
  conservation_status: string;
  species_type: string;
  habitat_requirements: any;
  created_at: string;
};

export type Observation = {
  id: string;
  habitat_id: string;
  species_id: string;
  observation_date: string;
  count: number;
  behavior: string;
  location_detail: string;
  coordinates: any;
  observer_notes: string;
  health_status: string;
  created_at: string;
};

export type ZoneAssignment = {
  id: string;
  habitat_id: string;
  species_id: string;
  priority_level: number;
  compatibility_score: number;
  assigned_at: string;
  status: string;
  backtracking_metadata: any;
};

export type MonitoringSession = {
  id: string;
  habitat_id: string;
  session_date: string;
  start_time: string;
  end_time: string | null;
  weather_conditions: string;
  team_size: number;
  areas_covered: any;
  summary: string;
  created_at: string;
};
