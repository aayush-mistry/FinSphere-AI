import { TransactionTable } from "@/lib/balance-engine/components/TransactionTable";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TransactionsPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div>
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Transactions</h1>
          <p className="text-slate-500">View and search your complete transaction history.</p>
        </div>
      </div>
      
      <TransactionTable />
    </div>
  );
}
