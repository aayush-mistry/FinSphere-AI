export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h2>
      
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center">
        <h3 className="text-xl font-semibold text-slate-700 mb-2">Welcome to FinSphere</h3>
        <p className="text-slate-500 max-w-md">
          This is a clean foundation ready for the new financial architecture. Select an option from the sidebar to begin.
        </p>
      </div>
    </div>
  );
}
