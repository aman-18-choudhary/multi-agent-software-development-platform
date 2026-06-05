"use client";

import { use } from "react";
import { useProjectDetail } from "@/hooks/useProjectDetail";
import { ProjectHeader } from "@/components/projects/ProjectHeader";
import { AgentTimeline } from "@/components/projects/AgentTimeline";
import { DocViewer } from "@/components/projects/DocViewer";
import { Loader2 } from "lucide-react";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { project, isLoading, error } = useProjectDetail(id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-8 rounded-2xl">
        <h2 className="text-2xl font-bold mb-2">Failed to load project</h2>
        <p>{error || "Project not found"}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in zoom-in-95 duration-300">
      <ProjectHeader project={project} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <AgentTimeline agents={project.agents} />
        </div>
        
        <div className="lg:col-span-2">
          <DocViewer project={project} />
        </div>
      </div>
    </div>
  );
}
