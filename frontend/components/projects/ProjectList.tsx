"use client";

import { useProjects } from "@/hooks/useProjects";
import ProjectCard from "./ProjectCard";
import { LayoutGrid, PlusCircle } from "lucide-react";
import Link from "next/link";

export default function ProjectList() {
  const { projects, isLoading, error } = useProjects();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="h-44 rounded-2xl bg-white/40 border border-gray-100 animate-pulse backdrop-blur-md"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-50/80 text-rose-600 border border-rose-200 backdrop-blur-md shadow-sm">
        <h3 className="font-bold text-lg mb-2">Error loading projects</h3>
        <p className="text-sm font-medium opacity-90">{error}</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-24 rounded-3xl border-2 border-dashed border-gray-200 bg-white/40 backdrop-blur-md transition-all hover:bg-white/60">
        <div className="flex justify-center mb-6">
          <div className="p-5 bg-blue-50 rounded-full text-blue-500 shadow-inner">
            <LayoutGrid className="w-10 h-10" />
          </div>
        </div>
        <h3 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">No projects yet</h3>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">Create your first software architecture project to get started with autonomous planning.</p>
        <Link 
          href="/projects/new" 
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <PlusCircle className="w-5 h-5" />
          <span>New Project</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
