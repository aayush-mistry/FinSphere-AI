import { useState } from "react";
import { useTransactions } from "../hooks/useBalanceEngine";
import { formatCurrency } from "@/lib/format";
import { ArrowDownLeft, ArrowUpRight, Plus, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { Transaction, TransactionStatus, TransactionType } from "../types";

export const RecentTransactions = () => {
  const { data: transactions, isLoading } = useTransactions();
  const queryClient = useQueryClient();

  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("cash");
  const [name, setName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    if (!amount || !name) return;

    const newTransaction: Transaction = {
      id: `txn_manual_${Date.now()}`,
      accountId: 'acc_checking_1', // default mock account
      category: mode === 'cash' ? 'Cash' : 'Transfer',
      merchant: name,
      description: `Manual ${mode} entry`,
      amount: -Math.abs(parseFloat(amount)), // Assuming expense for this form, or we can make it dynamic. Let's assume expense.
      type: TransactionType.EXPENSE,
      date: new Date().toISOString(),
      status: TransactionStatus.COMPLETED,
      currency: 'INR',
      tags: ['manual', mode]
    };

    queryClient.setQueryData(['balance-engine', 'transactions'], (old: Transaction[] | undefined) => {
      if (!old) return [newTransaction];
      return [newTransaction, ...old];
    });

    setIsOpen(false);
    setAmount("");
    setName("");
    setMode("cash");
  };

  if (isLoading || !transactions) return <div className="h-64 bg-slate-100 animate-pulse rounded-2xl"></div>;

  const recentTxns = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
        <div className="flex items-center gap-3">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger render={
              <button className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                <Plus className="w-4 h-4" /> Add
              </button>
            } />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Cash Transaction</DialogTitle>
                <DialogDescription>
                  Enter the details for your manual cash transaction.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="amount" className="text-sm font-medium text-slate-700">Amount</label>
                  <input 
                    id="amount" 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00" 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="mode" className="text-sm font-medium text-slate-700">Mode of Transaction</label>
                  <select 
                    id="mode" 
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-slate-700">User Name / Payee</label>
                  <input 
                    id="name" 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Who is this transaction for?" 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
                  />
                </div>
              </div>
              <DialogFooter showCloseButton={false}>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                  Save Transaction
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Link href="/transactions" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">View All</Link>
        </div>
      </div>
      
      <div className="space-y-4">
        {recentTxns.map((txn) => {
          const isIncome = txn.amount > 0;
          return (
            <div key={txn.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'}`}>
                  {isIncome ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{txn.merchant}</p>
                  <p className="text-xs text-slate-500">{txn.category} • {new Date(txn.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className={`font-bold ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
                {isIncome ? '+' : ''}{formatCurrency(txn.amount)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
