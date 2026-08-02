export default function AccountsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Accounts</h2>
        <button className="bg-indigo-900 hover:bg-indigo-800 text-white px-4 py-2 rounded-xl shadow-sm transition-colors font-medium">
          Add Account
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-h-[400px]">
        <div className="text-slate-500 text-center py-20 flex flex-col items-center justify-center">
          <p>Your connected accounts will appear here.</p>
        </div>
      </div>
    </div>
  );
}
