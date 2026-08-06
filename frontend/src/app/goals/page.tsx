"use client";

import { useState } from 'react';
import { GoalModel } from '@/lib/goal-engine/types';
import { useGoalEngine } from '@/lib/goal-engine/hooks/useGoalEngine';
import { GoalCard } from '@/components/goals/GoalCard';
import { ProjectionChart } from '@/components/goals/ProjectionChart';
import { ScenarioSimulator } from '@/components/goals/ScenarioSimulator';
import { RecommendationPanel } from '@/components/goals/RecommendationPanel';
import { formatCurrency } from '@/lib/format';

const mockGoals: GoalModel[] = [
  {
    id: 'goal-1',
    name: 'Buy a House',
    type: 'house',
    targetAmount: 100000,
    currentAmount: 25000,
    monthlyContribution: 1500,
    expectedReturnRate: 0.05,
    inflationRate: 0.025,
    priority: 'high',
    deadline: '2028-12-31T00:00:00.000Z',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'goal-2',
    name: 'Emergency Fund',
    type: 'emergency_fund',
    targetAmount: 30000,
    currentAmount: 28000,
    monthlyContribution: 500,
    expectedReturnRate: 0.02,
    inflationRate: 0.025,
    priority: 'critical',
    deadline: '2026-12-31T00:00:00.000Z',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  }
];

export default function GoalsDashboard() {
  const [selectedGoalId, setSelectedGoalId] = useState<string>(mockGoals[0].id);
  
  const selectedGoal = mockGoals.find(g => g.id === selectedGoalId) || mockGoals[0];
  const engine = useGoalEngine(selectedGoal);

  // When selected goal changes, we update the engine's goal state
  // We can just use the selected goal to re-init the hook, but since it's a hook we just pass it down.
  // Wait, to properly switch goals, we might want to just render a "GoalDetail" component that has its own `useGoalEngine` hook,
  // or call `updateGoal` when `selectedGoalId` changes.

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Goal Prediction Engine</h2>
          <p className="text-slate-500">Intelligent forecasting and AI planning for your financial future.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockGoals.map(goal => (
          <div 
            key={goal.id} 
            className={`transition-all rounded-2xl border-2 ${selectedGoalId === goal.id ? 'border-indigo-600 ring-4 ring-indigo-50' : 'border-transparent'}`}
          >
            <GoalCard 
              initialGoal={goal} 
              onClick={() => {
                setSelectedGoalId(goal.id);
                engine.updateGoal(goal);
                engine.resetModifiers();
              }} 
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Simulator */}
        <div className="lg:col-span-1 space-y-6">
          <ScenarioSimulator 
            modifiers={engine.modifiers} 
            updateModifier={engine.updateModifier} 
            resetModifiers={engine.resetModifiers} 
          />
          <RecommendationPanel recommendations={engine.result.recommendations} />
        </div>

        {/* Right Column: Charts & Metrics */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Wealth Projection & Scenarios</h3>
            <ProjectionChart data={engine.result.timeline} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard title="Success Probability" value={`${engine.result.metrics.successProbability.toFixed(0)}%`} />
            <MetricCard title="Required Monthly" value={formatCurrency(engine.result.metrics.requiredMonthlySavings)} />
            <MetricCard title="Inflation Impact" value={formatCurrency(engine.result.metrics.impactOfInflation)} />
            <MetricCard title="Compound Growth" value={formatCurrency(engine.result.metrics.compoundGrowthTotal)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <p className="text-xs text-slate-500 mb-1 font-medium">{title}</p>
      <p className="text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}
