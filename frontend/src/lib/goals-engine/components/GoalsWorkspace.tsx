import React, { useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { GoalSummaryCards } from './GoalSummaryCards';
import { GoalStatusSummary } from './GoalStatusSummary';
import { GoalCard } from './GoalCard';
import { GoalFormModal } from './GoalFormModal';
import { 
  useGoalsSummary, 
  useGoalPredictionSummary, 
  useGoalComparison, 
  useGoalsDetailedList,
  useCreateGoal
} from '../hooks/useGoalsEngine';

export function GoalsWorkspace() {
  const { data: summary, isLoading: isLoadingSummary, isError: isErrorSummary } = useGoalsSummary();
  const { data: predictionSummary, isLoading: isLoadingPrediction } = useGoalPredictionSummary();
  const { data: comparisons, isLoading: isLoadingComparison } = useGoalComparison();
  const { data: goals, isLoading: isLoadingGoals, isError: isErrorGoals } = useGoalsDetailedList();
  
  const createGoalMutation = useCreateGoal();
  const [filter, setFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isLoading = isLoadingSummary || isLoadingPrediction || isLoadingComparison || isLoadingGoals;
  const isError = isErrorSummary || isErrorGoals;

  const handleCreateGoal = (data: any) => {
    createGoalMutation.mutate(data, {
      onSuccess: () => {
        setIsModalOpen(false);
      }
    });
  };

  if (isError) {
    return (
      <div className="bg-rose-50 border border-rose-200 p-8 rounded-3xl text-center max-w-2xl mx-auto mt-12">
        <h3 className="text-xl font-bold text-rose-800 mb-2">Unable to load your financial goals.</h3>
        <p className="text-rose-600 mb-6">There was a problem connecting to the goals engine.</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-rose-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-rose-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Determine if empty. Exclude archived goals from empty state count if 'All' filter doesn't include them? 
  // Wait, if all goals are archived, maybe we still show them if filter is Archived. 
  // Let's just use `goals` length.
  const isEmpty = !isLoading && (!goals || goals.length === 0);

  // Filter goals. "All" should exclude Archived unless explicitly selected.
  const filteredGoals = goals?.filter(g => {
    if (filter === 'All') return g.status !== 'Archived';
    return g.status === filter;
  }) || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Financial Goals</h1>
          <p className="text-slate-500">Track your progress and understand when you'll reach your goals.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Create Goal
        </button>
      </div>

      {!isEmpty && (
        <>
          <GoalSummaryCards summary={summary} isLoading={isLoading} />
          <GoalStatusSummary summary={predictionSummary} isLoading={isLoading} />

          <div className="pt-4 flex gap-2 border-b border-slate-200 overflow-x-auto pb-px">
            {['All', 'On Track', 'At Risk', 'Overdue', 'Completed', 'Archived'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
                  filter === f 
                    ? 'border-indigo-600 text-indigo-700' 
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {isLoading ? (
              // Goal Card Skeletons
              [1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 animate-pulse" />
              ))
            ) : filteredGoals.length > 0 ? (
              filteredGoals.map(goal => {
                const prediction = comparisons?.find(c => c.goal_id === goal.id);
                return (
                  <GoalCard 
                    key={goal.id} 
                    goal={goal} 
                    prediction={prediction} 
                  />
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                No goals match the current filter.
              </div>
            )}
          </div>
        </>
      )}

      {isEmpty && (
        <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-12 text-center max-w-2xl mx-auto mt-12">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Target className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No financial goals yet</h2>
          <p className="text-slate-500 mb-8 max-w-md mx-auto">
            Create a goal to start tracking your savings progress. You can set targets for emergencies, vacations, or major purchases.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Create Goal
          </button>
        </div>
      )}

      <GoalFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateGoal}
        isSubmitting={createGoalMutation.isPending}
      />
    </div>
  );
}
