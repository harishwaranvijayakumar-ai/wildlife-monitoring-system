/*
  # Wildlife Habitat Monitoring System Schema

  ## Overview
  This migration creates the complete database schema for a wildlife habitat monitoring system
  that uses backtracking algorithms to analyze and optimize habitat zones.

  ## New Tables

  ### 1. `habitats`
  Stores information about different wildlife habitat zones
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Habitat name
  - `location` (text) - Geographic location
  - `zone_type` (text) - Type of habitat zone (forest, wetland, grassland, etc.)
  - `area_sqkm` (numeric) - Area in square kilometers
  - `coordinates` (jsonb) - Geographic coordinates for mapping
  - `status` (text) - Current status (active, inactive, under_review)
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `species`
  Catalog of wildlife species being monitored
  - `id` (uuid, primary key) - Unique identifier
  - `common_name` (text) - Common name of species
  - `scientific_name` (text) - Scientific name
  - `conservation_status` (text) - IUCN status (LC, NT, VU, EN, CR, EW, EX)
  - `species_type` (text) - Category (mammal, bird, reptile, amphibian, fish, insect)
  - `habitat_requirements` (jsonb) - Preferred habitat conditions
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. `observations`
  Wildlife sighting and observation records
  - `id` (uuid, primary key) - Unique identifier
  - `habitat_id` (uuid, foreign key) - Reference to habitat
  - `species_id` (uuid, foreign key) - Reference to species
  - `observation_date` (timestamptz) - When observation was made
  - `count` (integer) - Number of individuals observed
  - `behavior` (text) - Observed behavior
  - `location_detail` (text) - Specific location within habitat
  - `coordinates` (jsonb) - Precise coordinates
  - `observer_notes` (text) - Additional notes
  - `health_status` (text) - Health condition observed
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. `zone_assignments`
  Tracks which species are assigned to which habitat zones (used for backtracking optimization)
  - `id` (uuid, primary key) - Unique identifier
  - `habitat_id` (uuid, foreign key) - Reference to habitat
  - `species_id` (uuid, foreign key) - Reference to species
  - `priority_level` (integer) - Priority for this assignment (1-5)
  - `compatibility_score` (numeric) - Algorithm-calculated compatibility
  - `assigned_at` (timestamptz) - When assignment was made
  - `status` (text) - Assignment status (proposed, active, archived)
  - `backtracking_metadata` (jsonb) - Metadata from backtracking algorithm

  ### 5. `monitoring_sessions`
  Records of monitoring activities and expeditions
  - `id` (uuid, primary key) - Unique identifier
  - `habitat_id` (uuid, foreign key) - Reference to habitat
  - `session_date` (date) - Date of monitoring session
  - `start_time` (timestamptz) - Session start time
  - `end_time` (timestamptz) - Session end time
  - `weather_conditions` (text) - Weather during session
  - `team_size` (integer) - Number of observers
  - `areas_covered` (jsonb) - Areas monitored in session
  - `summary` (text) - Session summary notes
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on all tables
  - Public read access for viewing data
  - Authenticated users can insert and update records
*/

-- Create habitats table
CREATE TABLE IF NOT EXISTS habitats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  zone_type text NOT NULL,
  area_sqkm numeric NOT NULL DEFAULT 0,
  coordinates jsonb DEFAULT '{}',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create species table
CREATE TABLE IF NOT EXISTS species (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  common_name text NOT NULL,
  scientific_name text NOT NULL,
  conservation_status text NOT NULL DEFAULT 'LC',
  species_type text NOT NULL,
  habitat_requirements jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create observations table
CREATE TABLE IF NOT EXISTS observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habitat_id uuid NOT NULL REFERENCES habitats(id) ON DELETE CASCADE,
  species_id uuid NOT NULL REFERENCES species(id) ON DELETE CASCADE,
  observation_date timestamptz NOT NULL DEFAULT now(),
  count integer NOT NULL DEFAULT 1,
  behavior text DEFAULT '',
  location_detail text DEFAULT '',
  coordinates jsonb DEFAULT '{}',
  observer_notes text DEFAULT '',
  health_status text DEFAULT 'healthy',
  created_at timestamptz DEFAULT now()
);

-- Create zone_assignments table
CREATE TABLE IF NOT EXISTS zone_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habitat_id uuid NOT NULL REFERENCES habitats(id) ON DELETE CASCADE,
  species_id uuid NOT NULL REFERENCES species(id) ON DELETE CASCADE,
  priority_level integer NOT NULL DEFAULT 3,
  compatibility_score numeric NOT NULL DEFAULT 0,
  assigned_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'proposed',
  backtracking_metadata jsonb DEFAULT '{}'
);

-- Create monitoring_sessions table
CREATE TABLE IF NOT EXISTS monitoring_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habitat_id uuid NOT NULL REFERENCES habitats(id) ON DELETE CASCADE,
  session_date date NOT NULL DEFAULT CURRENT_DATE,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  weather_conditions text DEFAULT '',
  team_size integer DEFAULT 1,
  areas_covered jsonb DEFAULT '[]',
  summary text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_observations_habitat ON observations(habitat_id);
CREATE INDEX IF NOT EXISTS idx_observations_species ON observations(species_id);
CREATE INDEX IF NOT EXISTS idx_observations_date ON observations(observation_date);
CREATE INDEX IF NOT EXISTS idx_zone_assignments_habitat ON zone_assignments(habitat_id);
CREATE INDEX IF NOT EXISTS idx_zone_assignments_species ON zone_assignments(species_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_sessions_habitat ON monitoring_sessions(habitat_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_sessions_date ON monitoring_sessions(session_date);

-- Enable Row Level Security
ALTER TABLE habitats ENABLE ROW LEVEL SECURITY;
ALTER TABLE species ENABLE ROW LEVEL SECURITY;
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE zone_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for habitats
CREATE POLICY "Public can view habitats"
  ON habitats FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert habitats"
  ON habitats FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update habitats"
  ON habitats FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete habitats"
  ON habitats FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for species
CREATE POLICY "Public can view species"
  ON species FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert species"
  ON species FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update species"
  ON species FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete species"
  ON species FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for observations
CREATE POLICY "Public can view observations"
  ON observations FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert observations"
  ON observations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update observations"
  ON observations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete observations"
  ON observations FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for zone_assignments
CREATE POLICY "Public can view zone assignments"
  ON zone_assignments FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert zone assignments"
  ON zone_assignments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update zone assignments"
  ON zone_assignments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete zone assignments"
  ON zone_assignments FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for monitoring_sessions
CREATE POLICY "Public can view monitoring sessions"
  ON monitoring_sessions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert monitoring sessions"
  ON monitoring_sessions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update monitoring sessions"
  ON monitoring_sessions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete monitoring sessions"
  ON monitoring_sessions FOR DELETE
  TO authenticated
  USING (true);

-- Insert sample data for demonstration

-- Sample habitats
INSERT INTO habitats (name, location, zone_type, area_sqkm, coordinates, status) VALUES
  ('Emerald Forest Reserve', 'Northern Region', 'forest', 45.8, '{"lat": 42.3601, "lng": -71.0589}', 'active'),
  ('Blue Lake Wetlands', 'Eastern Region', 'wetland', 28.3, '{"lat": 41.8781, "lng": -87.6298}', 'active'),
  ('Prairie Grasslands', 'Central Region', 'grassland', 67.2, '{"lat": 39.7392, "lng": -104.9903}', 'active'),
  ('Coastal Wildlife Sanctuary', 'Southern Region', 'coastal', 34.5, '{"lat": 32.7157, "lng": -117.1611}', 'active')
ON CONFLICT DO NOTHING;

-- Sample species
INSERT INTO species (common_name, scientific_name, conservation_status, species_type, habitat_requirements) VALUES
  ('Gray Wolf', 'Canis lupus', 'LC', 'mammal', '{"preferred_zones": ["forest", "grassland"], "min_area": 20}'),
  ('Bald Eagle', 'Haliaeetus leucocephalus', 'LC', 'bird', '{"preferred_zones": ["wetland", "coastal"], "min_area": 10}'),
  ('White-tailed Deer', 'Odocoileus virginianus', 'LC', 'mammal', '{"preferred_zones": ["forest", "grassland"], "min_area": 5}'),
  ('Great Blue Heron', 'Ardea herodias', 'LC', 'bird', '{"preferred_zones": ["wetland", "coastal"], "min_area": 3}'),
  ('Red Fox', 'Vulpes vulpes', 'LC', 'mammal', '{"preferred_zones": ["forest", "grassland"], "min_area": 2}'),
  ('Osprey', 'Pandion haliaetus', 'LC', 'bird', '{"preferred_zones": ["wetland", "coastal"], "min_area": 5}'),
  ('American Bison', 'Bison bison', 'NT', 'mammal', '{"preferred_zones": ["grassland"], "min_area": 30}'),
  ('Mountain Lion', 'Puma concolor', 'LC', 'mammal', '{"preferred_zones": ["forest", "grassland"], "min_area": 25}')
ON CONFLICT DO NOTHING;