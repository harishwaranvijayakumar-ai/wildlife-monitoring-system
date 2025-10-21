import { Habitat, Species, ZoneAssignment } from '../lib/supabase';

export interface AssignmentConstraints {
  maxSpeciesPerHabitat?: number;
  minCompatibilityScore?: number;
  respectPriorityLevels?: boolean;
}

export interface OptimizationResult {
  assignments: ZoneAssignment[];
  totalCompatibility: number;
  iterations: number;
  success: boolean;
  metadata: {
    backtrackCount: number;
    solutionsExplored: number;
    timeElapsed: number;
  };
}

export class HabitatBacktracking {
  private habitats: Habitat[];
  private species: Species[];
  private constraints: AssignmentConstraints;
  private backtrackCount: number = 0;
  private solutionsExplored: number = 0;
  private startTime: number = 0;

  constructor(
    habitats: Habitat[],
    species: Species[],
    constraints: AssignmentConstraints = {}
  ) {
    this.habitats = habitats;
    this.species = species;
    this.constraints = {
      maxSpeciesPerHabitat: constraints.maxSpeciesPerHabitat || 5,
      minCompatibilityScore: constraints.minCompatibilityScore || 0.3,
      respectPriorityLevels: constraints.respectPriorityLevels !== false,
    };
  }

  calculateCompatibility(habitat: Habitat, species: Species): number {
    const requirements = species.habitat_requirements || {};
    const preferredZones = requirements.preferred_zones || [];
    const minArea = requirements.min_area || 0;

    let score = 0;

    if (preferredZones.includes(habitat.zone_type)) {
      score += 0.5;
    }

    if (habitat.area_sqkm >= minArea) {
      score += 0.3;
    } else if (habitat.area_sqkm >= minArea * 0.7) {
      score += 0.15;
    }

    const conservationBonus = {
      CR: 0.2,
      EN: 0.15,
      VU: 0.1,
      NT: 0.05,
      LC: 0.0,
    };
    score += conservationBonus[species.conservation_status as keyof typeof conservationBonus] || 0;

    return Math.min(score, 1.0);
  }

  private isValidAssignment(
    assignment: Map<string, string[]>,
    habitatId: string,
    speciesId: string,
    species: Species
  ): boolean {
    const habitat = this.habitats.find((h) => h.id === habitatId);
    if (!habitat) return false;

    const compatibility = this.calculateCompatibility(habitat, species);
    if (compatibility < (this.constraints.minCompatibilityScore || 0)) {
      return false;
    }

    const currentAssignments = assignment.get(habitatId) || [];
    if (currentAssignments.length >= (this.constraints.maxSpeciesPerHabitat || 5)) {
      return false;
    }

    if (currentAssignments.includes(speciesId)) {
      return false;
    }

    return true;
  }

  private backtrack(
    speciesIndex: number,
    currentAssignment: Map<string, string[]>,
    bestResult: { score: number; assignment: Map<string, string[]> }
  ): void {
    this.solutionsExplored++;

    if (speciesIndex >= this.species.length) {
      const totalScore = this.calculateTotalScore(currentAssignment);
      if (totalScore > bestResult.score) {
        bestResult.score = totalScore;
        bestResult.assignment = new Map(
          Array.from(currentAssignment.entries()).map(([k, v]) => [k, [...v]])
        );
      }
      return;
    }

    const currentSpecies = this.species[speciesIndex];

    const habitatScores = this.habitats.map((habitat) => ({
      habitat,
      score: this.calculateCompatibility(habitat, currentSpecies),
    }));

    habitatScores.sort((a, b) => b.score - a.score);

    for (const { habitat } of habitatScores) {
      if (this.isValidAssignment(currentAssignment, habitat.id, currentSpecies.id, currentSpecies)) {
        const assignments = currentAssignment.get(habitat.id) || [];
        assignments.push(currentSpecies.id);
        currentAssignment.set(habitat.id, assignments);

        this.backtrack(speciesIndex + 1, currentAssignment, bestResult);

        this.backtrackCount++;
        assignments.pop();
        if (assignments.length === 0) {
          currentAssignment.delete(habitat.id);
        }
      }
    }

    this.backtrack(speciesIndex + 1, currentAssignment, bestResult);
  }

  private calculateTotalScore(assignment: Map<string, string[]>): number {
    let totalScore = 0;
    for (const [habitatId, speciesIds] of assignment.entries()) {
      const habitat = this.habitats.find((h) => h.id === habitatId);
      if (!habitat) continue;

      for (const speciesId of speciesIds) {
        const species = this.species.find((s) => s.id === speciesId);
        if (species) {
          totalScore += this.calculateCompatibility(habitat, species);
        }
      }
    }
    return totalScore;
  }

  optimize(): OptimizationResult {
    this.startTime = Date.now();
    this.backtrackCount = 0;
    this.solutionsExplored = 0;

    const bestResult = {
      score: -1,
      assignment: new Map<string, string[]>(),
    };

    this.backtrack(0, new Map(), bestResult);

    const assignments: ZoneAssignment[] = [];
    for (const [habitatId, speciesIds] of bestResult.assignment.entries()) {
      const habitat = this.habitats.find((h) => h.id === habitatId);
      if (!habitat) continue;

      speciesIds.forEach((speciesId, index) => {
        const species = this.species.find((s) => s.id === speciesId);
        if (species) {
          const compatibility = this.calculateCompatibility(habitat, species);
          assignments.push({
            id: crypto.randomUUID(),
            habitat_id: habitatId,
            species_id: speciesId,
            priority_level: 5 - index,
            compatibility_score: compatibility,
            assigned_at: new Date().toISOString(),
            status: 'proposed',
            backtracking_metadata: {
              algorithm: 'backtracking',
              iterations: this.solutionsExplored,
              backtrackCount: this.backtrackCount,
            },
          });
        }
      });
    }

    return {
      assignments,
      totalCompatibility: bestResult.score,
      iterations: this.solutionsExplored,
      success: assignments.length > 0,
      metadata: {
        backtrackCount: this.backtrackCount,
        solutionsExplored: this.solutionsExplored,
        timeElapsed: Date.now() - this.startTime,
      },
    };
  }

  optimizeGreedy(): OptimizationResult {
    this.startTime = Date.now();
    const assignments: ZoneAssignment[] = [];
    const habitatAssignmentCount = new Map<string, number>();

    const speciesWithScores = this.species.flatMap((species) => {
      return this.habitats.map((habitat) => ({
        species,
        habitat,
        compatibility: this.calculateCompatibility(habitat, species),
      }));
    });

    speciesWithScores.sort((a, b) => b.compatibility - a.compatibility);

    for (const { species, habitat, compatibility } of speciesWithScores) {
      const currentCount = habitatAssignmentCount.get(habitat.id) || 0;
      const alreadyAssigned = assignments.some(
        (a) => a.species_id === species.id && a.habitat_id === habitat.id
      );

      if (
        !alreadyAssigned &&
        currentCount < (this.constraints.maxSpeciesPerHabitat || 5) &&
        compatibility >= (this.constraints.minCompatibilityScore || 0.3)
      ) {
        assignments.push({
          id: crypto.randomUUID(),
          habitat_id: habitat.id,
          species_id: species.id,
          priority_level: 5 - currentCount,
          compatibility_score: compatibility,
          assigned_at: new Date().toISOString(),
          status: 'proposed',
          backtracking_metadata: {
            algorithm: 'greedy',
            fastOptimization: true,
          },
        });
        habitatAssignmentCount.set(habitat.id, currentCount + 1);
      }
    }

    const totalCompatibility = assignments.reduce((sum, a) => sum + a.compatibility_score, 0);

    return {
      assignments,
      totalCompatibility,
      iterations: speciesWithScores.length,
      success: assignments.length > 0,
      metadata: {
        backtrackCount: 0,
        solutionsExplored: speciesWithScores.length,
        timeElapsed: Date.now() - this.startTime,
      },
    };
  }
}
