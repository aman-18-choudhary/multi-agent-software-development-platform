"use client";

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Box as BoxIcon, Database, Layers, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ArchitectureViewer from '@/components/3d-viewer/ArchitectureViewer';
import InspectorPanel from '@/components/3d-viewer/InspectorPanel';
import PlaybackControls from '@/components/3d-viewer/PlaybackControls';
import { useViewerStore } from '@/lib/store/useViewerStore';

export default function ArchitectureViewerPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const setVersions = useViewerStore((state) => state.setVersions);
  const [loading, setLoading] = useState(true);

  // Fetch versions
  useEffect(() => {
    async function fetchVersions() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/projects/${params.id}/versions`);
        const data = await res.json();
        
        // Data usually comes back sorted by version desc, let's reverse it to chronological order
        const sortedData = data.sort((a: any, b: any) => a.version_number - b.version_number);
        setVersions(sortedData);
      } catch (err) {
        console.error("Failed to fetch versions", err);
      } finally {
        setLoading(false);
      }
    }
    fetchVersions();
  }, [params.id, setVersions]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-white font-sans">
      
      {/* Left Sidebar */}
      <div className="w-[260px] bg-zinc-950 border-r border-white/10 flex flex-col p-4">
        <div className="flex items-center gap-2 mb-8">
          <BoxIcon size={24} className="text-indigo-500" />
          <h1 className="text-xl font-bold tracking-tight">MASDP Viewer</h1>
        </div>
        
        <div className="flex flex-col gap-2 flex-1">
          <button 
            onClick={() => router.push(`/dashboard/projects/${params.id}`)}
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors w-full text-left"
          >
            <LayoutDashboard size={18} />
            Project Dashboard
          </button>
          <button 
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-indigo-400 bg-indigo-500/10 rounded-lg transition-colors w-full text-left"
          >
            <Layers size={18} />
            3D Architecture
          </button>
          <button 
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors w-full text-left"
          >
            <Database size={18} />
            Data Models
          </button>
        </div>

        <button 
          onClick={() => router.push('/dashboard')}
          className="flex items-center justify-center gap-2 px-4 py-2 mt-auto text-sm font-medium text-gray-300 border border-white/10 hover:bg-white/5 rounded-lg transition-colors w-full"
        >
          <ArrowLeft size={18} />
          Back to Hub
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative bg-[#09090b]">
        
        {/* Top Nav */}
        <div className="h-[60px] border-b border-white/10 flex items-center px-6 bg-zinc-950/50 backdrop-blur-sm z-10">
          <h2 className="text-base font-semibold text-gray-200">Premium Architecture Visualization</h2>
        </div>

        {/* 3D Canvas Area */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-400 animate-pulse">Loading spatial data...</p>
            </div>
          ) : (
            <>
              <ArchitectureViewer />
              <InspectorPanel />
              <PlaybackControls />
            </>
          )}
        </div>

      </div>
    </div>
  );
}
