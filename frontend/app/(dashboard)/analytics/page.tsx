"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { analyticsApi } from "@/lib/api-client";
import { BarChart3, Clock, Database, Zap, Loader2, Network, Award, ShieldAlert, AlertTriangle, Download } from "lucide-react";

export default function AnalyticsPage() {
  const { getToken } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [quality, setQuality] = useState<any>(null);
  const [models, setModels] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ragData, qualData, modelData] = await Promise.all([
          analyticsApi.getSystemMetrics(getToken).catch(() => ({})),
          analyticsApi.getQualityMetrics(getToken).catch(() => ({})),
          analyticsApi.getModelMetrics(getToken).catch(() => ({}))
        ]);
        setMetrics(ragData);
        setQuality(qualData);
        setModels(modelData);
      } catch (e) {
        console.error("Failed to load metrics", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [getToken]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!metrics || Object.keys(metrics).length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Analytics Data Yet</h2>
          <p className="text-gray-500">Interact with the Project Knowledge Assistant to generate RAG telemetry.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Analytics</h1>
        <p className="mt-2 text-gray-500">Telemetry, performance, and architecture quality metrics.</p>
      </div>

      {quality && Object.keys(quality).length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Architecture Quality Review</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-2xl shadow-md text-white">
              <div className="flex items-center gap-3 mb-4 opacity-80">
                <Award className="w-6 h-6" />
                <h3 className="font-semibold text-lg">Avg Quality Score</h3>
              </div>
              <p className="text-5xl font-black">{quality.average_score?.toFixed(0) || "--"}<span className="text-2xl text-indigo-200 font-bold">/100</span></p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">Highest Rated</p>
              <p className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{quality.highest_project || "--"}</p>
              <div className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold w-max">
                <Award className="w-4 h-4" />
                <span>{quality.highest_score}</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">Lowest Rated</p>
              <p className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{quality.lowest_project || "--"}</p>
              <div className="inline-flex items-center space-x-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-bold w-max">
                <AlertTriangle className="w-4 h-4" />
                <span>{quality.lowest_score}</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-red-600">
                  <ShieldAlert className="w-5 h-5" />
                  <h3 className="font-semibold text-gray-900">Top Security Issues</h3>
                </div>
                <div className="space-y-3">
                  {quality.common_security_issues?.map((issue: any, i: number) => (
                    <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <span className="text-sm text-gray-700">{issue.label}</span>
                      <span className="text-xs font-bold bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{issue.count}</span>
                    </div>
                  ))}
                  {(!quality.common_security_issues || quality.common_security_issues.length === 0) && (
                    <p className="text-sm text-gray-500">No security issues found.</p>
                  )}
                </div>
             </div>
             
             <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-semibold text-gray-900">Common Weaknesses</h3>
                </div>
                <div className="space-y-3">
                  {quality.common_weaknesses?.map((issue: any, i: number) => (
                    <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <span className="text-sm text-gray-700 line-clamp-1">{issue.label}</span>
                      <span className="text-xs font-bold bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{issue.count}</span>
                    </div>
                  ))}
                  {(!quality.common_weaknesses || quality.common_weaknesses.length === 0) && (
                    <p className="text-sm text-gray-500">No common weaknesses found.</p>
                  )}
                </div>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
             <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center text-center">
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">Total Exports</p>
                <p className="text-4xl font-bold text-blue-600 mb-2">{quality.export_count || 0}</p>
             </div>
             <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center text-center">
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">Total Shares</p>
                <p className="text-4xl font-bold text-purple-600 mb-2">{quality.share_count || 0}</p>
             </div>
             <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center text-center">
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">Avg Iterations</p>
                <p className="text-4xl font-bold text-indigo-600 mb-2">{quality.average_iterations?.toFixed(1) || "1.0"}</p>
             </div>
             <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center text-center">
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">Score Improvement</p>
                <p className="text-4xl font-bold text-emerald-600 mb-2">+{quality.average_score_improvement?.toFixed(1) || "0.0"}</p>
             </div>
          </div>

          {quality.most_downloaded_format && quality.most_downloaded_format !== "None" && (
             <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-6 flex justify-between items-center">
                <div className="flex flex-col">
                  <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Most Downloaded Format</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1 capitalize">{quality.most_downloaded_format}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Download className="w-6 h-6 text-blue-600" />
                </div>
             </div>
          )}
          
          {quality.common_improvements && quality.common_improvements.length > 0 && (
             <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mt-6">
                <div className="flex items-center gap-3 mb-4 text-blue-600">
                  <Zap className="w-5 h-5" />
                  <h3 className="font-semibold text-gray-900">Common Architecture Improvements</h3>
                </div>
                <div className="space-y-3">
                  {quality.common_improvements.map((issue: any, i: number) => (
                    <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <span className="text-sm text-gray-700">{issue.label}</span>
                      <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{issue.count}</span>
                    </div>
                  ))}
                </div>
             </div>
          )}
        </div>
      )}

      <div className="pt-8 border-t border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">RAG Retrieval Telemetry</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Usage Stats */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900">Usage</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Total Questions</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.total_questions}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Projects Queried</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.projects_queried}</p>
              </div>
            </div>
          </div>

          {/* Retrieval Stats */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-cyan-100 text-cyan-600 rounded-lg">
                <Network className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900">Retrieval</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Average Similarity</p>
                <p className="text-2xl font-bold text-gray-900">{(metrics.avg_similarity * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Chunks Retrieved</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.avg_chunks_retrieved?.toFixed(1)}</p>
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900">Performance Latency</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Average</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.avg_response_time_ms?.toFixed(0)} <span className="text-sm font-normal text-gray-500">ms</span></p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fastest</p>
                <p className="text-2xl font-bold text-emerald-600">{metrics.fastest_query_ms} <span className="text-sm font-normal text-gray-500">ms</span></p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Slowest</p>
                <p className="text-2xl font-bold text-orange-500">{metrics.slowest_query_ms} <span className="text-sm font-normal text-gray-500">ms</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sources Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-6">Source Agent Utilization</h3>
        <div className="space-y-4">
          {Object.entries(metrics.sources || {}).map(([agent, percent]: [string, any]) => (
            <div key={agent}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700 capitalize">{agent}</span>
                <span className="text-gray-500">{percent.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full" 
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {models && Object.keys(models).length > 0 && models.providers && (
        <div className="pt-8 border-t border-gray-100 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">LLM Provider Benchmarks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
             <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">Best Cloud Model</p>
                <p className="text-2xl font-bold text-blue-600 capitalize">{models.best_cloud_model}</p>
             </div>
             <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-1">Best Local Model</p>
                <p className="text-2xl font-bold text-indigo-600 capitalize">{models.best_local_model}</p>
             </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-4 px-6 font-bold text-gray-500 text-sm uppercase tracking-wider">Provider</th>
                  <th className="py-4 px-6 font-bold text-gray-500 text-sm uppercase tracking-wider">Type</th>
                  <th className="py-4 px-6 font-bold text-gray-500 text-sm uppercase tracking-wider">Avg Score</th>
                  <th className="py-4 px-6 font-bold text-gray-500 text-sm uppercase tracking-wider">Avg Latency</th>
                  <th className="py-4 px-6 font-bold text-gray-500 text-sm uppercase tracking-wider">Runs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {models.providers.map((p: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-900 capitalize">{p.provider}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${p.type === 'local' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'}`}>
                        {p.type === 'local' ? 'Local' : 'Cloud'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-emerald-600">{p.avg_score?.toFixed(1)}</td>
                    <td className="py-4 px-6 text-gray-600">{(p.avg_latency_ms / 1000).toFixed(2)}s</td>
                    <td className="py-4 px-6 text-gray-600">{p.runs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
