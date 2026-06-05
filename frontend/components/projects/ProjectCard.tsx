import Link from "next/link";
import { ProjectResponse } from "@/types/project";
import { Calendar, ArrowRight } from "lucide-react";

export default function ProjectCard({ project }: { project: ProjectResponse }) {
  const statusConfig = {
    pending: { style: "bg-gray-100 text-gray-800 border-gray-200", label: "Pending" },
    running: { style: "bg-blue-100 text-blue-800 border-blue-200 animate-pulse", label: "Running" },
    complete: { style: "bg-emerald-100 text-emerald-800 border-emerald-200", label: "Complete" },
    failed: { style: "bg-rose-100 text-rose-800 border-rose-200", label: "Failed" },
  };

  const status = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="group relative block overflow-hidden rounded-2xl border border-gray-200/60 bg-white/60 backdrop-blur-md p-6 shadow-sm hover:shadow-2xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 pr-4 leading-tight">
            {project.title}
          </h3>
          <span className={`px-3 py-1 text-xs font-bold tracking-wide rounded-full border ${status.style}`}>
            {status.label}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mt-10">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{new Date(project.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transform group-hover:translate-x-1.5 transition-all" />
        </div>
      </div>
    </Link>
  );
}
