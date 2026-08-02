export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Transactions</h2>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[400px]">
        <div className="text-slate-500 text-center py-20 flex flex-col items-center justify-center">
          <p>Your transactions history will appear here.</p>
        </div>
      </div>
    </div>
  );
}
