export function TypingIndicator() {
  return (
    <div className="flex space-x-1.5 p-4 bg-white border border-slate-100 shadow-sm rounded-2xl rounded-tl-sm w-20 items-center justify-center h-12">
      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}
