import React, { useState, useEffect, useRef } from 'react';
import { SimulatorControls } from './SimulatorControls';
import { SimulatorComparison } from './SimulatorComparison';
import { SimulatorImpactCards } from './SimulatorImpactCards';
import { SimulatedInsight } from './SimulatedInsight';
import { useSimulateGoal } from '../../../hooks/useGoalsEngine';
import { GoalSimulationScenario, GoalSimulationOut } from '../../../types';

interface GoalSimulatorProps {
  goalId: number;
  onSimulationData: (data: GoalSimulationOut | null) => void;
}

const DEFAULT_SCENARIO: GoalSimulationScenario = {
  additional_monthly_savings: 0,
  monthly_income_change: 0,
  monthly_expense_change: 0,
  one_time_contribution: 0
};

export function GoalSimulator({ goalId, onSimulationData }: GoalSimulatorProps) {
  const [scenario, setScenario] = useState<GoalSimulationScenario>(DEFAULT_SCENARIO);
  const [simulationData, setSimulationData] = useState<GoalSimulationOut | null>(null);
  
  const { mutate: runSimulation, isPending, isError } = useSimulateGoal(goalId);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Determine if scenario is strictly baseline
  const isBaseline = 
    scenario.additional_monthly_savings === 0 &&
    scenario.monthly_income_change === 0 &&
    scenario.monthly_expense_change === 0 &&
    scenario.one_time_contribution === 0;

  useEffect(() => {
    if (isBaseline) {
      setSimulationData(null);
      onSimulationData(null);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      runSimulation(scenario, {
        onSuccess: (data) => {
          setSimulationData(data);
          onSimulationData(data);
        }
      });
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [scenario, runSimulation, onSimulationData, isBaseline]);

  const handleScenarioChange = (field: string, value: number) => {
    setScenario(prev => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setScenario(DEFAULT_SCENARIO);
  };

  return (
    <div className="mt-12 bg-slate-50 border-t border-slate-200 -mx-4 md:-mx-8 px-4 md:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Interactive What-If Simulator</h2>
        <p className="text-slate-500 mb-8">
          Experiment with your savings behavior to see how it instantly impacts your goal timeline.
          This does not modify your actual goal data.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Left Column: Controls */}
          <div className="lg:col-span-5">
            <SimulatorControls 
              scenario={scenario} 
              onChange={handleScenarioChange} 
              onReset={handleReset} 
            />
          </div>

          {/* Right Column: Comparison & Results */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {isError ? (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-3xl">
                Unable to simulate this scenario. Please try adjusting your parameters.
              </div>
            ) : simulationData ? (
              <>
                <SimulatorComparison baseline={simulationData.baseline} simulation={simulationData.simulation} />
                <SimulatorImpactCards comparison={simulationData.comparison} />
              </>
            ) : isPending ? (
              <SimulatorImpactCards comparison={null} />
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center h-full flex flex-col justify-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-slate-400">?</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Ready to Simulate</h3>
                <p className="text-slate-500">
                  Adjust the sliders on the left to see how changes affect your completion timeline.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Insight generated if simulation exists */}
        {simulationData && !isError && (
          <SimulatedInsight comparison={simulationData.comparison} />
        )}
      </div>
    </div>
  );
}
