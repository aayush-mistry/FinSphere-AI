import React from 'react';
import { formatCurrency } from '@/lib/format';

interface SimulatorControlsProps {
  scenario: {
    additional_monthly_savings: number;
    monthly_expense_change: number;
    monthly_income_change: number;
    one_time_contribution: number;
  };
  onChange: (field: string, value: number) => void;
  onReset: () => void;
}

export function SimulatorControls({ scenario, onChange, onReset }: SimulatorControlsProps) {
  
  const hasChanges = Object.values(scenario).some(val => val !== 0);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-900">Scenario Controls</h3>
        {hasChanges && (
          <button 
            onClick={onReset}
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      <div className="space-y-8 flex-1">
        
        {/* Additional Monthly Savings */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700">Monthly Savings Change</label>
            <span className="text-sm font-bold text-slate-900">{scenario.additional_monthly_savings > 0 ? '+' : ''}{formatCurrency(scenario.additional_monthly_savings)}</span>
          </div>
          <input 
            type="range" 
            min="-20000" 
            max="50000" 
            step="1000"
            value={scenario.additional_monthly_savings}
            onChange={(e) => onChange('additional_monthly_savings', parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>-₹20k</span>
            <span>+₹50k</span>
          </div>
        </div>

        {/* Monthly Income Change */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700">Income Change</label>
            <span className="text-sm font-bold text-slate-900">{scenario.monthly_income_change > 0 ? '+' : ''}{formatCurrency(scenario.monthly_income_change)}</span>
          </div>
          <input 
            type="range" 
            min="-50000" 
            max="50000" 
            step="1000"
            value={scenario.monthly_income_change}
            onChange={(e) => onChange('monthly_income_change', parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>-₹50k</span>
            <span>+₹50k</span>
          </div>
        </div>

        {/* Monthly Expense Change */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700">Expense Change</label>
            <span className="text-sm font-bold text-slate-900">{scenario.monthly_expense_change > 0 ? '+' : ''}{formatCurrency(scenario.monthly_expense_change)}</span>
          </div>
          <input 
            type="range" 
            min="-30000" 
            max="30000" 
            step="1000"
            value={scenario.monthly_expense_change}
            onChange={(e) => onChange('monthly_expense_change', parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>-₹30k</span>
            <span>+₹30k</span>
          </div>
        </div>

        {/* One-Time Contribution */}
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700">One-Time Contribution</label>
            <span className="text-sm font-bold text-slate-900">{formatCurrency(scenario.one_time_contribution)}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="500000" 
            step="5000"
            value={scenario.one_time_contribution}
            onChange={(e) => onChange('one_time_contribution', parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>₹0</span>
            <span>+₹500k</span>
          </div>
        </div>

      </div>
    </div>
  );
}
