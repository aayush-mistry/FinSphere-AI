import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Bill, CreateBillPayload, BillCategory, BillFrequency, BillStatus } from '../types';
import { PrivacyMask } from '../../privacy';

interface BillFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<CreateBillPayload>) => void;
  initialData?: Bill | null;
  isSubmitting?: boolean;
}

const CATEGORIES: BillCategory[] = [
  "Housing", "Utilities", "Internet", "Mobile", "Insurance", 
  "Loan", "Credit Card", "Subscription", "Education", 
  "Healthcare", "Investment", "Other"
];

const FREQUENCIES: BillFrequency[] = [
  "Weekly", "Monthly", "Quarterly", "Half-Yearly", "Yearly"
];

export function BillForm({ isOpen, onClose, onSubmit, initialData, isSubmitting }: BillFormProps) {
  const [formData, setFormData] = useState<Partial<CreateBillPayload>>({
    name: '',
    category: 'Utilities',
    amount: 0,
    frequency: 'Monthly',
    due_day: 1,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    account_id: '',
    auto_pay: false,
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          category: initialData.category,
          amount: initialData.amount,
          frequency: initialData.frequency,
          due_day: initialData.due_day,
          start_date: initialData.start_date.split('T')[0],
          end_date: initialData.end_date ? initialData.end_date.split('T')[0] : '',
          account_id: initialData.account_id || '',
          auto_pay: initialData.auto_pay,
          notes: initialData.notes || ''
        });
      } else {
        setFormData({
          name: '',
          category: 'Utilities',
          amount: 0,
          frequency: 'Monthly',
          due_day: 1,
          start_date: new Date().toISOString().split('T')[0],
          end_date: '',
          account_id: '',
          auto_pay: false,
          notes: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Bill name is required";
    if (!formData.amount || formData.amount <= 0) newErrors.amount = "Amount must be greater than 0";
    if (!formData.due_day || formData.due_day < 1 || formData.due_day > 31) newErrors.due_day = "Due day must be between 1 and 31";
    if (!formData.start_date) newErrors.start_date = "Start date is required";
    
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        newErrors.end_date = "End date must be after start date";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const submissionData = {
        ...formData,
        end_date: formData.end_date || null,
        account_id: formData.account_id || null,
      };
      onSubmit(submissionData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">
            {initialData ? 'Edit Bill' : 'Create Bill'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <form id="bill-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Bill Name</label>
              <input 
                type="text"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="e.g. Netflix, Rent, Electric"
              />
              {errors.name && <p className="text-rose-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value as BillCategory})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Amount (₹)</label>
                <input 
                  type="number"
                  value={formData.amount || ''}
                  onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
                {errors.amount && <p className="text-rose-500 text-sm mt-1">{errors.amount}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={e => setFormData({...formData, frequency: e.target.value as BillFrequency})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Due Day (1-31)</label>
                <input 
                  type="number"
                  value={formData.due_day || ''}
                  onChange={e => setFormData({...formData, due_day: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  min="1"
                  max="31"
                />
                {errors.due_day && <p className="text-rose-500 text-sm mt-1">{errors.due_day}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                <input 
                  type="date"
                  value={formData.start_date}
                  onChange={e => setFormData({...formData, start_date: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                {errors.start_date && <p className="text-rose-500 text-sm mt-1">{errors.start_date}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">End Date (Optional)</label>
                <input 
                  type="date"
                  value={formData.end_date || ''}
                  onChange={e => setFormData({...formData, end_date: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                {errors.end_date && <p className="text-rose-500 text-sm mt-1">{errors.end_date}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Linked Account (Optional)</label>
              <input 
                type="text"
                value={formData.account_id || ''}
                onChange={e => setFormData({...formData, account_id: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="e.g. HDFC Checking"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="auto_pay"
                checked={formData.auto_pay || false}
                onChange={e => setFormData({...formData, auto_pay: e.target.checked})}
                className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <label htmlFor="auto_pay" className="text-sm font-medium text-slate-700">
                Auto Pay Enabled
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Notes (Optional)</label>
              <textarea 
                value={formData.notes || ''}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Any additional details..."
                rows={2}
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
            form="bill-form"
            disabled={isSubmitting}
            className="px-6 py-2.5 font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center min-w-[140px]"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              initialData ? 'Save Changes' : 'Create Bill'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
