import { AgentRunDetail } from "@/types/project";
import { CheckCircle, CircleDashed, Loader2, XCircle } from "lucide-react";

export function AgentTimeline({ agents }: { agents: AgentRunDetail[] }) {
  const order = ["planner", "pm", "architect", "database", "documentation"];
  
  // Sort agents based on pipeline order
  const sortedAgents = [...agents].sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete": return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "running": return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
      case "failed": return <XCircle className="w-6 h-6 text-red-500" />;
      default: return <CircleDashed className="w-6 h-6 text-gray-300" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Execution Timeline</h2>
      <div className="relative">
        <div className="absolute top-0 bottom-0 left-3 w-0.5 bg-gray-100"></div>
        <div className="space-y-6">
          {sortedAgents.map((agent, index) => (
            <div key={index} className="relative flex items-start group">
              <div className="relative bg-white z-10 rounded-full shadow-sm">{getStatusIcon(agent.status)}</div>
              <div className="ml-6 flex-1 bg-gray-50/50 rounded-xl p-4 border border-gray-100 transition-colors group-hover:border-blue-100 group-hover:bg-blue-50/10">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-sm font-bold text-gray-800 capitalize">{agent.name}</h3>
                  <span className="text-xs font-semibold text-gray-500 capitalize">{agent.status}</span>
                </div>
                {agent.duration_ms && (
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-2">
                    <span className="bg-white px-2 py-1 rounded shadow-sm border border-gray-100">⏱️ {(agent.duration_ms / 1000).toFixed(1)}s</span>
                    {agent.llm_model && <span className="bg-white px-2 py-1 rounded shadow-sm border border-gray-100">🤖 {agent.llm_model.split('/').pop()}</span>}
                    {agent.prompt_tokens && <span className="bg-white px-2 py-1 rounded shadow-sm border border-gray-100">↑ {agent.prompt_tokens}</span>}
                    {agent.completion_tokens && <span className="bg-white px-2 py-1 rounded shadow-sm border border-gray-100">↓ {agent.completion_tokens}</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
