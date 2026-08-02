export default function Home() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl shadow-sm transition-colors font-medium">
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Income</h3>
          <p className="text-3xl font-bold text-slate-900">$45,231.89</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-emerald-600 font-medium text-sm bg-emerald-50 px-2 py-1 rounded-full">+12.5%</span>
            <span className="text-slate-400 text-sm">vs last month</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Expenses</h3>
          <p className="text-3xl font-bold text-slate-900">$21,405.10</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-rose-600 font-medium text-sm bg-rose-50 px-2 py-1 rounded-full">+4.2%</span>
            <span className="text-slate-400 text-sm">vs last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Pending Invoices</h3>
          <p className="text-3xl font-bold text-slate-900">8</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-amber-600 font-medium text-sm bg-amber-50 px-2 py-1 rounded-full">Requires Attention</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[400px]">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Transactions</h3>
        <div className="text-slate-500 text-center py-20 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <div className="w-8 h-8 border-2 border-slate-200 rounded-full border-t-purple-600 animate-spin"></div>
          </div>
          <p>Loading transactions...</p>
        </div>
      </div>
    </div>
  );
}
