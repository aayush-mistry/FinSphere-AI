"use client";

import { useAccounts } from "../hooks/useBalanceEngine";
import { formatCurrency } from "@/lib/format";
import { CreditCard, Landmark, PiggyBank, Wallet } from "lucide-react";
import { AccountType } from "../types";
import { groupAccountsByType } from "../calculators/balance";

const AccountIcon = ({ type }: { type: AccountType }) => {
  switch (type) {
    case AccountType.CHECKING:
    case AccountType.SAVINGS:
      return <PiggyBank className="w-5 h-5 text-emerald-600" />;
    case AccountType.CREDIT_CARD:
      return <CreditCard className="w-5 h-5 text-indigo-600" />;
    case AccountType.INVESTMENT:
      return <Landmark className="w-5 h-5 text-blue-600" />;
    default:
      return <Wallet className="w-5 h-5 text-slate-600" />;
  }
};

export const AccountOverview = () => {
  const { data: accounts, isLoading } = useAccounts();

  if (isLoading || !accounts) return <div className="h-64 bg-slate-100 animate-pulse rounded-2xl"></div>;

  const groupedAccounts = groupAccountsByType(accounts);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Accounts Overview</h3>
      
      <div className="space-y-6">
        {Object.entries(groupedAccounts).map(([type, accs]) => (
          <div key={type}>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{type}</h4>
            <div className="space-y-3">
              {accs.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-xl">
                      <AccountIcon type={account.type} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{account.name}</p>
                      <p className="text-xs text-slate-500">{account.institution.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{formatCurrency(account.currentBalance)}</p>
                    {account.type === AccountType.CREDIT_CARD && account.creditLimit && (
                      <p className="text-xs text-slate-500">
                        Limit: {formatCurrency(account.creditLimit)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
