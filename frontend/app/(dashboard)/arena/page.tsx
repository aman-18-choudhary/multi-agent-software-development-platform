"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { arenaApi } from "@/lib/api-client";
import { Trophy, Clock, Cpu, DollarSign, Play, Loader2, ChevronDown, ChevronRight } from "lucide-react";

export default function ArenaPage() {
  const { getToken } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [selectedProviders, setSelectedProviders] = useState<string[]>(["groq", "gemini"]);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const providersList = [
    { id: "groq", name: "Groq (Llama 3.1)" },
    { id: "gemini", name: "Google Gemini (Flash)" },
    { id: "ollama", name: "Ollama (Local Llama 3.1)" },
  ];

  const fetchHistory = async () => {
    try {
      const h = await arenaApi.getHistory(getToken);
      setHistory(h || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleRun = async () => {
    if (!prompt.trim() || selectedProviders.length === 0) return;
    setRunning(true);
    setResults([]);
    try {
      const res = await arenaApi.runBenchmark(prompt, selectedProviders, getToken);
      setResults(res);
      fetchHistory();
    } catch (e) {
      console.error(e);
      alert("Failed to run benchmark");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl relative z-10">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">AI Architecture Arena</h1>
        <p className="text-gray-400 mt-2">Benchmark multiple LLMs simultaneously on complex software architecture tasks.</p>
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10 p-8">
        <h2 className="text-lg font-bold text-white mb-4">New Benchmark Run</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Architecture Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., Build a scalable food delivery platform similar to Uber Eats..."
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent min-h-[120px]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Select Models</label>
            <div className="flex flex-wrap gap-4">
              {providersList.map(p => (
                <label key={p.id} className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={selectedProviders.includes(p.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedProviders([...selectedProviders, p.id]);
                      else setSelectedProviders(selectedProviders.filter(id => id !== p.id));
                    }}
                    className="w-4 h-4 text-violet-600 bg-black/50 border-white/20 rounded focus:ring-violet-500 focus:ring-offset-black"
                  />
                  <span className="text-sm font-medium text-gray-300">{p.name}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="pt-4 flex flex-col items-end gap-3">
            <button
              onClick={handleRun}
              disabled={running || !prompt.trim() || selectedProviders.length === 0}
              className="flex items-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all"
            >
              {running ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
              <span>{running ? "Benchmarking... (~60s)" : "Run Arena"}</span>
            </button>
            {running && (
              <p className="text-xs text-gray-400 font-medium animate-pulse">
                Simulating full 6-agent lifecycle. This requires multiple sequential AI steps and takes about 45-60 seconds.
              </p>
            )}
          </div>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl p-8 border border-amber-500/20 shadow-sm relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Trophy className="w-32 h-32 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2 mb-2 relative z-10">
              <Trophy className="w-6 h-6 text-amber-400" /> Winner: {results[0]?.provider.toUpperCase()}
            </h2>
            <p className="text-amber-200/80 font-medium relative z-10">Achieved the highest critic score of {results[0]?.score} out of 100.</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-sm border border-white/10 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/40 border-b border-white/10">
                  <th className="py-4 px-6 font-bold text-gray-400 text-sm uppercase tracking-wider">Provider</th>
                  <th className="py-4 px-6 font-bold text-gray-400 text-sm uppercase tracking-wider">Type</th>
                  <th className="py-4 px-6 font-bold text-gray-400 text-sm uppercase tracking-wider">Score</th>
                  <th className="py-4 px-6 font-bold text-gray-400 text-sm uppercase tracking-wider">Time</th>
                  <th className="py-4 px-6 font-bold text-gray-400 text-sm uppercase tracking-wider">Tokens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {results.map((res, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-bold text-gray-200 capitalize">{res.provider}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${res.provider === 'ollama' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-blue-500/20 text-blue-300'}`}>
                        {res.provider === 'ollama' ? 'Local' : 'Cloud'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-emerald-400">{res.score}</td>
                    <td className="py-4 px-6 text-gray-400 whitespace-nowrap"><Clock className="w-4 h-4 inline mr-2 text-gray-500" /> {(res.latency_ms / 1000).toFixed(1)}s</td>
                    <td className="py-4 px-6 text-gray-400 whitespace-nowrap"><Cpu className="w-4 h-4 inline mr-2 text-gray-500" /> {res.tokens}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-white/10 p-8 mt-12">
          <h2 className="text-lg font-bold text-white mb-6">Recent Benchmark History</h2>
          <div className="space-y-4">
            {history.map((h, i) => (
              <div key={i} className="border border-white/10 rounded-xl overflow-hidden">
                <button 
                  onClick={() => setExpanded(expanded === h.id ? null : h.id)}
                  className="w-full flex items-center justify-between p-4 bg-black/20 hover:bg-black/40 transition-colors"
                >
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-gray-200 capitalize">{h.provider}</span>
                    <span className="text-sm text-gray-400 truncate max-w-md">{h.prompt}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-emerald-400">Score: {h.score}</span>
                    {expanded === h.id ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
                  </div>
                </button>
                {expanded === h.id && (
                  <div className="p-6 bg-black/40 border-t border-white/10 space-y-4 text-sm">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-white/5 border border-white/10 p-3 rounded-lg"><span className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Type</span><span className="font-medium text-lg capitalize text-gray-200">{h.provider === 'ollama' ? 'Local' : 'Cloud'}</span></div>
                      <div className="bg-white/5 border border-white/10 p-3 rounded-lg"><span className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Latency</span><span className="font-medium text-lg text-gray-200">{(h.latency_ms/1000).toFixed(1)}s</span></div>
                      <div className="bg-white/5 border border-white/10 p-3 rounded-lg"><span className="block text-gray-500 text-xs uppercase tracking-wider mb-1">Tokens</span><span className="font-medium text-lg text-gray-200">{h.token_usage}</span></div>
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-3 text-base">Critic Review</h4>
                      <pre className="bg-[#0a0a0a] border border-white/10 text-gray-300 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(h.critic_output, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
