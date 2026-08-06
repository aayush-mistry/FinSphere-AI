import { BillModel } from '@/lib/bill-engine/types';
import { BillCard } from './BillCard';

interface UpcomingBillsProps {
  bills: BillModel[];
  onToggleAutoPay: (id: string) => void;
  onPayEarly: (id: string) => void;
}

export function UpcomingBills({ bills, onToggleAutoPay, onPayEarly }: UpcomingBillsProps) {
  // Sort by due date (closest first)
  const sortedBills = [...bills].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  return (
    <div className="space-y-4">
      {sortedBills.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
          <p className="text-slate-500 font-medium">No upcoming bills found.</p>
        </div>
      ) : (
        sortedBills.map(bill => (
          <BillCard 
            key={bill.id} 
            bill={bill} 
            onToggleAutoPay={onToggleAutoPay} 
            onPayEarly={onPayEarly} 
          />
        ))
      )}
    </div>
  );
}
