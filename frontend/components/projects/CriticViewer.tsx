import { CheckCircle, AlertTriangle, ShieldAlert, Zap, TrendingUp } from "lucide-react";

export function CriticViewer({ output }: { output: any }) {
  if (!output) return <div className="p-8 text-center text-gray-500">Quality review not available yet.</div>;

  const scoreColor = output.overall_score >= 90 ? "text-emerald-600" : output.overall_score >= 70 ? "text-blue-600" : "text-amber-600";
  const bgScoreColor = output.overall_score >= 90 ? "bg-emerald-50 border-emerald-100" : output.overall_score >= 70 ? "bg-blue-50 border-blue-100" : "bg-amber-50 border-amber-100";

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <div className={`p-8 rounded-3xl border flex items-center justify-between ${bgScoreColor}`}>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Architecture Quality Score</h2>
          <p className="text-gray-600 mt-1">Based on requirements, architecture, database, and documentation.</p>
        </div>
        <div className={`text-6xl font-black tracking-tighter ${scoreColor}`}>
          {output.overall_score}<span className="text-3xl text-gray-400 font-bold">/100</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Requirements", score: output.requirements_score },
          { label: "Architecture", score: output.architecture_score },
          { label: "Database", score: output.database_score },
          { label: "Documentation", score: output.documentation_score },
        ].map(metric => (
          <div key={metric.label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-end mb-3">
              <span className="font-semibold text-gray-700 text-sm">{metric.label}</span>
              <span className="font-bold text-gray-900">{metric.score}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${metric.score >= 90 ? 'bg-emerald-500' : metric.score >= 70 ? 'bg-blue-500' : 'bg-amber-500'}`} 
                style={{ width: `${metric.score}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-emerald-700">
            <CheckCircle className="w-5 h-5" />
            <h3 className="font-bold">Strengths</h3>
          </div>
          <ul className="space-y-3">
            {output.strengths?.map((s: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-amber-700">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold">Weaknesses</h3>
          </div>
          <ul className="space-y-3">
            {output.weaknesses?.map((s: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-red-700">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-bold">Security Concerns</h3>
          </div>
          <ul className="space-y-3">
            {output.security_concerns?.map((s: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                {s}
              </li>
            ))}
            {(!output.security_concerns || output.security_concerns.length === 0) && (
              <p className="text-sm text-gray-400 italic">No major security concerns identified.</p>
            )}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-purple-700">
            <Zap className="w-5 h-5" />
            <h3 className="font-bold">Scalability Concerns</h3>
          </div>
          <ul className="space-y-3">
            {output.scalability_concerns?.map((s: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                {s}
              </li>
            ))}
            {(!output.scalability_concerns || output.scalability_concerns.length === 0) && (
              <p className="text-sm text-gray-400 italic">No major scalability concerns identified.</p>
            )}
          </ul>
        </div>

        <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 shadow-sm md:col-span-2">
          <div className="flex items-center gap-2 mb-4 text-indigo-700">
            <TrendingUp className="w-5 h-5" />
            <h3 className="font-bold">Improvement Suggestions</h3>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {output.improvement_suggestions?.map((s: string, i: number) => (
              <li key={i} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-indigo-50 shadow-sm">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{s}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
