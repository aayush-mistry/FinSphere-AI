import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { GoalOut, GoalCreate } from '../types';

interface GoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<GoalCreate>) => void;
  initialData?: GoalOut | null;
  isSubmitting?: boolean;
}

const CATEGORIES = [
  "Emergency Fund", "Travel", "Vehicle", "Home", 
  "Education", "Electronics", "Investment", 
  "Debt Payoff", "Retirement", "Other"
];

const PRIORITIES = ["Low", "Medium", "High"];

export function GoalFormModal({ isOpen, onClose, onSubmit, initialData, isSubmitting }: GoalFormModalProps) {
  const [formData, setFormData] = useState<Partial<GoalCreate>>({
    name: '',
    category: 'Emergency Fund',
    target_amount: 0,
    target_date: '',
    priority: 'Medium',
    monthly_contribution: 0,
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          category: initialData.category,
          target_amount: initialData.target_amount,
          target_date: initialData.target_date.split('T')[0],
          priority: initialData.priority,
          monthly_contribution: initialData.monthly_contribution,
          description: initialData.description || ''
        });
      } else {
        setFormData({
          name: '',
          category: 'Emergency Fund',
          target_amount: 0,
          target_date: '',
          priority: 'Medium',
          monthly_contribution: 0,
          description: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.target_amount || formData.target_amount <= 0) newErrors.target_amount = "Target amount must be > 0";
    if (formData.monthly_contribution === undefined || formData.monthly_contribution < 0) newErrors.monthly_contribution = "Monthly contribution cannot be negative";
    
    if (!formData.target_date) {
      newErrors.target_date = "Target date is required";
    } else {
      const target = new Date(formData.target_date);
      if (target <= new Date()) {
        newErrors.target_date = "Target date must be in the future";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">
            {initialData ? 'Edit Goal' : 'Create Goal'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <form id="goal-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Goal Name</label>
              <input 
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="e.g. Dream Vacation"
              />
              {errors.name && <p className="text-rose-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Target Amount (₹)</label>
                <input 
                  type="number"
                  value={formData.target_amount || ''}
                  onChange={e => setFormData({...formData, target_amount: parseFloat(e.target.value)})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                {errors.target_amount && <p className="text-rose-500 text-sm mt-1">{errors.target_amount}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Target Date</label>
                <input 
                  type="date"
                  value={formData.target_date}
                  onChange={e => setFormData({...formData, target_date: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                {errors.target_date && <p className="text-rose-500 text-sm mt-1">{errors.target_date}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Monthly Contribution (₹)</label>
              <input 
                type="number"
                value={formData.monthly_contribution || ''}
                onChange={e => setFormData({...formData, monthly_contribution: parseFloat(e.target.value)})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              <p className="text-sm text-slate-500 mt-1">How much you plan to save each month.</p>
              {errors.monthly_contribution && <p className="text-rose-500 text-sm mt-1">{errors.monthly_contribution}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description (Optional)</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Any additional details..."
                rows={3}
              />
            </div>
          </form>
        </div>
        
        <div className="p-6 border-t border-slate-100 flex justify-end gap-4 bg-slate-50">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2.5 font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="goal-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Goal')}
          </button>
        </div>
      </div>
    </div>
  );
}
