import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { projectsApi } from "@/lib/api-client";
import { Loader2, ArrowUpRight, CheckCircle2, ShieldAlert, Database, Blocks } from "lucide-react";

export function CompareView({ projectId, v1, v2 }: { projectId: string, v1: number, v2: number }) {
  const { getToken } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectsApi.compareVersions(projectId, v1, v2, getToken)
      .then(d => setData(d))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, [projectId, v1, v2, getToken]);

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  if (!data) return <div className="text-red-500">Failed to load comparison data.</div>;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Comparing v{v1} vs v{v2}</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm font-semibold text-gray-500">Score: {data.v1_score} &rarr; <span className="text-emerald-600">{data.v2_score}</span></div>
          <div className="flex items-center space-x-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-bold text-sm">
            <ArrowUpRight className="w-4 h-4" />
            <span>+{data.score_delta}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-bold flex items-center text-gray-900"><Blocks className="w-5 h-5 mr-2 text-blue-500" /> Architecture Updates</h3>
          <ul className="space-y-2">
            {data.architecture_updates?.map((u: string, i: number) => (
              <li key={i} className="flex items-start bg-blue-50/50 p-3 rounded-lg border border-blue-100 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                {u}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold flex items-center text-gray-900"><Database className="w-5 h-5 mr-2 text-indigo-500" /> Database Updates</h3>
          <ul className="space-y-2">
            {data.database_updates?.map((u: string, i: number) => (
              <li key={i} className="flex items-start bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 text-sm text-gray-700">
                <CheckCircle2 className="w-4 h-4 text-indigo-500 mr-2 mt-0.5 flex-shrink-0" />
                {u}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <h3 className="font-bold flex items-center text-gray-900 mb-4"><ShieldAlert className="w-5 h-5 mr-2 text-emerald-500" /> Security & Scalability Improvements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ul className="space-y-2">
            {data.security_improvements?.map((u: string, i: number) => (
              <li key={i} className="flex items-start text-sm text-gray-600 border-l-2 border-emerald-500 pl-3 py-1">
                {u}
              </li>
            ))}
          </ul>
          <ul className="space-y-2">
            {data.scalability_improvements?.map((u: string, i: number) => (
              <li key={i} className="flex items-start text-sm text-gray-600 border-l-2 border-purple-500 pl-3 py-1">
                {u}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
