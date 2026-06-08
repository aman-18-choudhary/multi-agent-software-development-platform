import { ProjectDetailResponse } from "@/types/project";
import { useState } from "react";
import { projectsApi } from "@/lib/api-client";
import { useAuth } from "@clerk/nextjs";
import { Zap, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { ExportCenter } from "./ExportCenter";
import { ShareModal } from "./ShareModal";

export function ProjectHeader({ project }: { project: ProjectDetailResponse }) {
  const { getToken } = useAuth();
  const router = useRouter();
  const [improving, setImproving] = useState(false);
  const [goal, setGoal] = useState("");
  const [showModal, setShowModal] = useState(false);

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    running: "bg-blue-100 text-blue-800 animate-pulse",
    complete: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  };

  const handleImprove = async () => {
    if (!goal.trim()) return;
    setImproving(true);
    try {
      await projectsApi.requestImprovement(project.id, goal, getToken);
      setShowModal(false);
      router.refresh();
      window.location.reload(); // Simple refresh to show running state
    } catch (e) {
      console.error(e);
      alert("Failed to request improvement.");
    } finally {
      setImproving(false);
    }
  };

  return (
    <>
      <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10 p-8 mb-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{project.title}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap ${project.status === 'complete' ? 'bg-emerald-500/10 text-emerald-400' : project.status === 'running' ? 'bg-blue-500/10 text-blue-400 animate-pulse' : project.status === 'failed' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                {project.status}
              </span>
            </div>
            <p className="text-gray-400 max-w-3xl">{project.description}</p>
          </div>
          
          {project.status === "complete" && (
            <div className="flex flex-wrap items-center gap-3">
              <ExportCenter projectId={project.id} />
              <ShareModal projectId={project.id} />
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] transform hover:-translate-y-0.5"
              >
                <Zap className="w-4 h-4" />
                <span>Improve Architecture</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">Improve Architecture</h3>
              <button onClick={() => !improving && setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What should be improved?
              </label>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g., Improve security, Add caching layer, Optimize for high throughput..."
                className="w-full bg-black/50 rounded-xl border border-white/10 p-4 text-sm text-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 h-32 resize-none placeholder-gray-600"
                disabled={improving}
              />
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={improving}
                  className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImprove}
                  disabled={improving || !goal.trim()}
                  className="flex items-center space-x-2 px-5 py-2.5 text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                >
                  {improving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  <span>Generate New Version</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
