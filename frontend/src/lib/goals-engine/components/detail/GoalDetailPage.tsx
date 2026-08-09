import React from 'react';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useGoalIntelligence } from '../../hooks/useGoalsEngine';
import { GoalOverview } from './GoalOverview';
import { TargetInformation } from './TargetInformation';
import { SavingsPace } from './SavingsPace';
import { ProjectionChart } from './ProjectionChart';
import { ContributionHistory } from './ContributionHistory';
import { FinancialInsight } from './FinancialInsight';

export function GoalDetailPage({ goalId }: { goalId: number }) {
  const { data, isLoading, isError } = useGoalIntelligence(goalId);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto pb-12 animate-pulse">
        <div className="w-32 h-6 bg-slate-200 rounded mb-8"></div>
        <div className="w-64 h-10 bg-slate-200 rounded mb-2"></div>
        <div className="w-48 h-6 bg-slate-200 rounded mb-8"></div>
        <div className="h-64 bg-slate-200 rounded-3xl mb-8"></div>
        <div className="h-32 bg-slate-200 rounded-3xl mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-96 bg-slate-200 rounded-3xl"></div>
          <div className="h-96 bg-slate-200 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (isError || !data || !data.detail) {
    return (
      <div className="max-w-4xl mx-auto pb-12">
        <Link href="/goals" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Goals
        </Link>
        <div className="bg-rose-50 border border-rose-200 p-12 rounded-3xl text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-rose-800 mb-2">Unable to load this goal.</h3>
          <p className="text-rose-600 mb-6">There was a problem retrieving the financial data for this goal.</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => window.location.reload()} className="bg-rose-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-rose-700 transition-colors">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { detail, projection, contributions } = data;

  let statusColor = "bg-slate-100 text-slate-700 border-slate-200";
  if (detail.status === "Completed") statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
  else if (detail.status === "On Track") statusColor = "bg-blue-50 text-blue-700 border-blue-200";
  else if (detail.status === "At Risk" || detail.status === "Overdue") statusColor = "bg-rose-50 text-rose-700 border-rose-200";

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <Link href="/goals" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Goals
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">{detail.name}</h1>
          <p className="text-slate-500 font-medium">
            {detail.category} • {detail.priority} Priority
          </p>
        </div>
        <div className={`px-4 py-1.5 rounded-full border text-sm font-bold tracking-wide uppercase ${statusColor}`}>
          {detail.status}
        </div>
      </div>

      <div className="mb-8">
        <GoalOverview 
          current={detail.current_amount} 
          target={detail.target_amount} 
          remaining={detail.remaining_amount} 
          progress={detail.progress} 
        />
      </div>

      <div className="mb-8">
        <TargetInformation 
          targetDate={detail.target_date} 
          projectedCompletionDate={projection.projected_completion_date} 
          monthsRemaining={detail.months_remaining} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <SavingsPace 
            required={detail.required_monthly_contribution} 
            planned={detail.planned_monthly_contribution} 
          />
          {projection.projection_available && projection.monthly_projection_data ? (
            <ProjectionChart 
              data={projection.monthly_projection_data} 
              targetAmount={detail.target_amount}
              targetDate={detail.target_date}
            />
          ) : (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Goal Projection</h3>
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 border-dashed text-center">
                <p className="text-slate-500 font-medium mb-1">Projection unavailable</p>
                <p className="text-sm text-slate-400">
                  Continue recording contributions to build enough history for a more reliable projection.
                </p>
              </div>
            </div>
          )}
        </div>
        <div>
          <ContributionHistory contributions={contributions} />
          <FinancialInsight goal={detail} projection={projection} />
        </div>
      </div>
    </div>
  );
}
