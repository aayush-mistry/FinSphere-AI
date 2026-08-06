import { BillModel } from '@/lib/bill-engine/types';
import { formatCurrency } from '@/lib/format';
import { calculateDaysUntilDue } from '@/lib/bill-engine/calculators';
import { Zap, CreditCard, Shield, Home, Repeat, FileText, Briefcase, HelpCircle, CheckCircle2 } from 'lucide-react';

interface BillCardProps {
  bill: BillModel;
  onToggleAutoPay?: (id: string) => void;
  onPayEarly?: (id: string) => void;
}

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case 'utilities': return <Zap className="w-5 h-5" />;
    case 'credit_cards': return <CreditCard className="w-5 h-5" />;
    case 'insurance': return <Shield className="w-5 h-5" />;
    case 'housing': return <Home className="w-5 h-5" />;
    case 'subscriptions': return <Repeat className="w-5 h-5" />;
    case 'loans': return <FileText className="w-5 h-5" />;
    case 'business': return <Briefcase className="w-5 h-5" />;
    default: return <HelpCircle className="w-5 h-5" />;
  }
};

export function BillCard({ bill, onToggleAutoPay, onPayEarly }: BillCardProps) {
  const daysUntilDue = calculateDaysUntilDue(bill.dueDate);
  
  let statusColor = 'text-slate-500 bg-slate-100';
  let statusText = `Due in ${daysUntilDue} days`;
  
  if (bill.status === 'paid') {
    statusColor = 'text-emerald-700 bg-emerald-100';
    statusText = 'Paid';
  } else if (daysUntilDue < 0) {
    statusColor = 'text-rose-700 bg-rose-100';
    statusText = `Overdue by ${Math.abs(daysUntilDue)} days`;
  } else if (daysUntilDue <= 3) {
    statusColor = 'text-amber-700 bg-amber-100';
    statusText = `Due very soon (${daysUntilDue} days)`;
  }

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bill.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
          {bill.status === 'paid' ? <CheckCircle2 className="w-6 h-6" /> : <CategoryIcon category={bill.category} />}
        </div>
        <div>
          <h4 className="font-bold text-slate-900">{bill.name}</h4>
          <p className="text-sm text-slate-500">{bill.provider}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor}`}>
              {statusText}
            </span>
            {bill.autoPayEnabled && bill.status !== 'paid' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-indigo-700 bg-indigo-100">
                AutoPay Enabled
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="text-right">
        <p className="font-bold text-xl text-slate-900">{formatCurrency(bill.amount)}</p>
        <div className="flex gap-2 mt-2 justify-end">
          {bill.status !== 'paid' && onPayEarly && (
            <button 
              onClick={() => onPayEarly(bill.id)}
              className="text-xs px-3 py-1 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800"
            >
              Pay Now
            </button>
          )}
          {onToggleAutoPay && bill.status !== 'paid' && (
            <button 
              onClick={() => onToggleAutoPay(bill.id)}
              className="text-xs px-3 py-1 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200"
            >
              {bill.autoPayEnabled ? 'Disable AutoPay' : 'Enable AutoPay'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
