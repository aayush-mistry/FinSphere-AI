import React from 'react';
import { ComparisonResultData } from '../../../types';
import { PrivacyMask, usePrivacyMode } from '@/lib/privacy';

interface SimulatedInsightProps {
  comparison: ComparisonResultData | null;
}

export function SimulatedInsight({ comparison }: SimulatedInsightProps) {
  const { isPrivacyMode } = usePrivacyMode();
  
  if (!comparison) {
    return (
      <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 shadow-sm mt-4 animate-pulse">
        <div className="h-4 bg-indigo-200/50 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-indigo-200/50 rounded w-1/2"></div>
      </div>
    );
  }

  let insightSentence = "This scenario doesn't change your expected completion timeline.";
  
  if (comparison.months_saved > 0) {
    insightSentence = `This scenario moves your completion date forward by approximately ${comparison.months_saved} month${comparison.months_saved > 1 ? 's' : ''}.`;
  } else if (comparison.months_lost > 0) {
    insightSentence = `This scenario delays your goal completion by ${comparison.months_lost} month${comparison.months_lost > 1 ? 's' : ''}.`;
  }

  let statusSentence = '';
  if (comparison.status === 'Behind') {
    statusSentence = " You would fall behind your target date.";
  } else if (comparison.status === 'Ahead') {
    statusSentence = " You would comfortably beat your target date.";
  } else {
    statusSentence = " You would remain on track for your target date.";
  }

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 shadow-sm mt-4">
      <p className="text-indigo-900 leading-relaxed font-medium">
        <PrivacyMask 
          isPrivacyMode={isPrivacyMode}
          value={`${insightSentence}${statusSentence}`}
          mask="Simulation insight hidden in privacy mode."
        />
      </p>
    </div>
  );
}
