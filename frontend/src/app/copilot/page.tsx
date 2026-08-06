import { ChatLayout } from "@/components/copilot/ChatLayout";

export default function CopilotPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">AI Copilot</h2>
      </div>
      <ChatLayout />
    </div>
  );
}
