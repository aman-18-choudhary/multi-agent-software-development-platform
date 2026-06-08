import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { projectsApi } from "@/lib/api-client";
import { GitCommit, ArrowRight, Loader2, Award } from "lucide-react";
import { CompareView } from "./CompareView";

export function VersionHistory({ projectId }: { projectId: string }) {
  const { getToken } = useAuth();
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [compareMode, setCompareMode] = useState<{v1: number, v2: number} | null>(null);

  useEffect(() => {
    projectsApi.listVersions(projectId, getToken)
      .then(v => setVersions(v))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [projectId, getToken]);

  if (loading) return <Loader2 className="w-6 h-6 animate-spin text-gray-400" />;

  if (versions.length <= 1) {
    return null;
  }

  if (compareMode) {
    return (
      <div className="space-y-4">
        <button onClick={() => setCompareMode(null)} className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center">
          <ArrowRight className="w-4 h-4 mr-1 rotate-180" /> Back to Timeline
        </button>
        <CompareView projectId={projectId} v1={compareMode.v1} v2={compareMode.v2} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
        <GitCommit className="w-5 h-5 mr-2 text-indigo-500" />
        Version History
      </h3>
      <div className="space-y-3">
        {versions.map((v, i) => (
          <div key={v.version} className="flex justify-between items-center p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                v{v.version}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Architecture Iteration</p>
                <p className="text-xs text-gray-500">{new Date(v.created_at).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-sm font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                <Award className="w-4 h-4" />
                <span>Score: {v.score || '--'}</span>
              </div>
              {i > 0 && (
                <button 
                  onClick={() => setCompareMode({ v1: versions[i-1].version, v2: v.version })}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Compare w/ previous
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
