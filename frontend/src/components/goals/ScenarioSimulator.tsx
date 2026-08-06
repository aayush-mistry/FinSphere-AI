import { ScenarioModifiers } from '@/lib/goal-engine/types';

interface ScenarioSimulatorProps {
  modifiers: ScenarioModifiers;
  updateModifier: (key: keyof ScenarioModifiers, value: number) => void;
  resetModifiers: () => void;
}

export function ScenarioSimulator({ modifiers, updateModifier, resetModifiers }: ScenarioSimulatorProps) {
  return (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-slate-800">Scenario Simulator</h4>
        <button 
          onClick={resetModifiers}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Reset All
        </button>
      </div>

      <div className="space-y-4">
        {/* Adjust Monthly Contribution */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <label className="text-slate-600 font-medium">Extra Savings / Month</label>
            <span className="text-slate-900 font-semibold">${modifiers.monthlyContributionAdjustment}</span>
          </div>
          <input 
            type="range" 
            min="-1000" 
            max="3000" 
            step="100" 
            value={modifiers.monthlyContributionAdjustment}
            onChange={(e) => updateModifier('monthlyContributionAdjustment', parseInt(e.target.value))}
            className="w-full accent-indigo-600"
          />
        </div>

        {/* Adjust Return Rate */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <label className="text-slate-600 font-medium">Market Return Variance</label>
            <span className="text-slate-900 font-semibold">{(modifiers.returnRateAdjustment * 100).toFixed(1)}%</span>
          </div>
          <input 
            type="range" 
            min="-0.05" 
            max="0.05" 
            step="0.005" 
            value={modifiers.returnRateAdjustment}
            onChange={(e) => updateModifier('returnRateAdjustment', parseFloat(e.target.value))}
            className="w-full accent-indigo-600"
          />
        </div>
        
        {/* Medical / Unexpected Expense */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <label className="text-slate-600 font-medium">Unexpected Expense (Hit to Savings)</label>
            <span className="text-slate-900 font-semibold">${modifiers.medicalExpense}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="20000" 
            step="1000" 
            value={modifiers.medicalExpense}
            onChange={(e) => updateModifier('medicalExpense', parseInt(e.target.value))}
            className="w-full accent-indigo-600"
          />
        </div>

      </div>
    </div>
  );
}
