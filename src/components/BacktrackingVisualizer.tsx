import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Zap, Brain } from 'lucide-react';
import { HabitatBacktracking, OptimizationResult } from '../algorithms/backtracking';
import { Habitat, Species } from '../lib/supabase';

interface BacktrackingVisualizerProps {
  habitats: Habitat[];
  species: Species[];
  onOptimizationComplete: (result: OptimizationResult) => void;
}

export function BacktrackingVisualizer({ habitats, species, onOptimizationComplete }: BacktrackingVisualizerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [algorithm, setAlgorithm] = useState<'backtracking' | 'greedy'>('backtracking');

  const runOptimization = async (useGreedy: boolean = false) => {
    setIsRunning(true);
    setResult(null);

    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const optimizer = new HabitatBacktracking(habitats, species, {
        maxSpeciesPerHabitat: 5,
        minCompatibilityScore: 0.3,
      });

      const optimizationResult = useGreedy ? optimizer.optimizeGreedy() : optimizer.optimize();
      setResult(optimizationResult);
      onOptimizationComplete(optimizationResult);
    } catch (error) {
      console.error('Optimization error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRun = () => {
    runOptimization(algorithm === 'greedy');
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/30 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Zone Assignment Optimizer</h2>
          <p className="text-slate-400 text-sm">
            Using {algorithm === 'backtracking' ? 'backtracking' : 'greedy'} algorithm to optimize species-habitat assignments
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as 'backtracking' | 'greedy')}
            disabled={isRunning}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="backtracking">Backtracking</option>
            <option value="greedy">Greedy (Fast)</option>
          </select>
          <button
            onClick={handleReset}
            disabled={isRunning || !result}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Optimization
              </>
            )}
          </button>
        </div>
      </div>

      {isRunning && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-4">
              <Brain className="h-8 w-8 text-emerald-400 animate-pulse" />
            </div>
            <p className="text-white font-medium mb-1">Analyzing habitat compatibility...</p>
            <p className="text-slate-400 text-sm">
              {algorithm === 'backtracking' ? 'Exploring all possible assignments' : 'Finding optimal greedy solution'}
            </p>
          </div>
        </div>
      )}

      {result && !isRunning && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-slate-400">Assignments</span>
              </div>
              <p className="text-2xl font-bold text-white">{result.assignments.length}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-slate-400">Compatibility</span>
              </div>
              <p className="text-2xl font-bold text-white">{result.totalCompatibility.toFixed(2)}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <RotateCcw className="h-4 w-4 text-amber-400" />
                <span className="text-sm text-slate-400">Iterations</span>
              </div>
              <p className="text-2xl font-bold text-white">{result.iterations.toLocaleString()}</p>
            </div>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Play className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-slate-400">Time</span>
              </div>
              <p className="text-2xl font-bold text-white">{result.metadata.timeElapsed}ms</p>
            </div>
          </div>

          <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Algorithm Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Backtrack Count:</span>
                <span className="ml-2 font-medium text-white">{result.metadata.backtrackCount.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400">Solutions Explored:</span>
                <span className="ml-2 font-medium text-white">{result.metadata.solutionsExplored.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400">Status:</span>
                <span className={`ml-2 font-medium ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
                  {result.success ? 'Success' : 'Failed'}
                </span>
              </div>
            </div>
          </div>

          {result.assignments.length > 0 && (
            <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-4">
              <h3 className="text-sm font-medium text-slate-300 mb-3">Top Assignments</h3>
              <div className="space-y-2">
                {result.assignments.slice(0, 5).map((assignment, index) => {
                  const habitat = habitats.find((h) => h.id === assignment.habitat_id);
                  const speciesData = species.find((s) => s.id === assignment.species_id);
                  return (
                    <div key={index} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3 border border-slate-700/30">
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{speciesData?.common_name}</p>
                        <p className="text-slate-400 text-xs">{habitat?.name}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <div className="text-xs text-slate-400">Score:</div>
                          <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 text-xs font-medium">
                            {(assignment.compatibility_score * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {!result && !isRunning && (
        <div className="text-center py-12 text-slate-400">
          <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Click "Run Optimization" to start analyzing habitat assignments</p>
        </div>
      )}
    </div>
  );
}
