import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CreditCard, Zap, Home, Film, Wallet } from "lucide-react";
import { MOCK_BILLS } from "@/lib/mockData";
import { formatCurrency } from "@/lib/format";
import { Bill, BillStatus } from "@/lib/types";

export default function UpcomingBills() {
  const getBillIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("electricity")) return <Zap className="h-4 w-4 text-amber-500" />;
    if (lowerName.includes("credit card")) return <CreditCard className="h-4 w-4 text-blue-500" />;
    if (lowerName.includes("netflix") || lowerName.includes("entertainment")) return <Film className="h-4 w-4 text-red-500" />;
    if (lowerName.includes("home") || lowerName.includes("rent")) return <Home className="h-4 w-4 text-emerald-500" />;
    return <Wallet className="h-4 w-4 text-slate-500" />;
  };

  const getStatusColor = (status: BillStatus) => {
    switch (status) {
      case "paid": return "bg-emerald-100 text-emerald-700";
      case "upcoming": return "bg-blue-100 text-blue-700";
      case "overdue": return "bg-rose-100 text-rose-700";
      case "critical": return "bg-amber-100 text-amber-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <Card className="border-slate-100 shadow-sm bg-white flex flex-col">
      <CardHeader className="pb-3 border-b border-slate-50">
        <CardTitle className="text-slate-900 text-base flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-indigo-500" />
          Upcoming Bills
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 flex-1">
        <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
          {MOCK_BILLS.map((bill: Bill) => (
            <div key={bill.id} className="relative pl-6">
              {/* Timeline Dot */}
              <div className="absolute -left-[11px] top-1 h-5 w-5 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-slate-300" />
              </div>

              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg shrink-0">
                    {getBillIcon(bill.name)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-800">{bill.name}</h4>
                    <p className="text-xs font-medium text-slate-500">{bill.dueDate}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-medium px-1.5 py-0.5 bg-slate-50 rounded">
                        {bill.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(bill.amount)}
                  </span>
                  <Badge variant="secondary" className={`text-[10px] uppercase tracking-wider px-1.5 py-0 ${getStatusColor(bill.status)}`}>
                    {bill.status}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
