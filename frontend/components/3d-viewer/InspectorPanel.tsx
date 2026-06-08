"use client";

import React from 'react';
import { X } from 'lucide-react';
import { useViewerStore } from '@/lib/store/useViewerStore';

export default function InspectorPanel() {
  const selectedNode = useViewerStore((state) => state.selectedNode);
  const setSelectedNode = useViewerStore((state) => state.setSelectedNode);

  if (!selectedNode) return null;

  return (
    <div className="absolute top-4 right-4 w-80 max-h-[calc(100vh-32px)] overflow-y-auto rounded-xl shadow-lg p-5 flex flex-col gap-4 z-10 bg-white/10 backdrop-blur-md border border-white/10 text-white">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold">{selectedNode.label}</h2>
          <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium bg-indigo-500/20 text-indigo-300 rounded-md">
            {selectedNode.type.toUpperCase()}
          </span>
        </div>
        <button 
          onClick={() => setSelectedNode(null)}
          className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="h-px w-full bg-white/10" />

      <div>
        <h3 className="text-sm font-semibold mb-2 text-gray-300">System Context</h3>
        <p className="text-sm text-gray-400 leading-relaxed">
          {selectedNode.details?.system_design || 'No specific design context found for this node. This node was automatically inferred from the architecture graph.'}
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-2 text-gray-300">ID</h3>
        <p className="text-xs font-mono bg-black/40 p-2 rounded-md text-gray-400 break-all">
          {selectedNode.id}
        </p>
      </div>
    </div>
  );
}
