"use client";

import { use } from 'react';
import { GoalDetailPage } from '@/lib/goals-engine/components/detail/GoalDetailPage';

interface PageProps {
  params: Promise<{ goalId: string }>;
}

export default function GoalDetailRoute({ params }: PageProps) {
  const resolvedParams = use(params);
  const goalId = parseInt(resolvedParams.goalId, 10);
  
  if (isNaN(goalId)) {
    return <div className="p-8 text-rose-600">Invalid Goal ID</div>;
  }

  return <GoalDetailPage goalId={goalId} />;
}
