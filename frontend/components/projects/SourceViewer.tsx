import { X } from "lucide-react";

interface Source {
  source_agent: string;
  similarity: number;
  chunk_id: string;
  project_id: string;
  project_title?: string;
  chunk_text: string;
}

export function SourceViewer({ sources, onClose }: { sources: Source[], onClose: () => void }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 m-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 className="font-semibold text-gray-900">Retrieved Context Sources</h3>
            <p className="text-xs text-gray-500 font-medium">The exact data chunks the AI used to answer your question.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {sources.map((src, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase bg-indigo-50 text-indigo-600 rounded border border-indigo-100">
                    {src.source_agent}
                  </span>
                  {src.project_title && (
                    <span className="text-xs font-semibold text-gray-700">{src.project_title}</span>
                  )}
                </div>
                <span className="text-[10px] font-mono font-medium text-gray-500">
                  Similarity: {(src.similarity * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-4 bg-gray-50/30 overflow-x-auto">
                <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {src.chunk_text}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
