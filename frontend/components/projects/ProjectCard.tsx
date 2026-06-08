import Link from "next/link";
import { ProjectResponse } from "@/types/project";
import { Clock, CheckCircle2, AlertCircle, Loader2, Calendar, Award } from "lucide-react";

export function ProjectCard({ project }: { project: ProjectResponse }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-5 h-5 text-yellow-500" />;
      case "running": return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case "complete": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "failed": return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  const getStatusBadgeColors = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "running": return "bg-blue-50 text-blue-700 border-blue-200";
      case "complete": return "bg-green-50 text-green-700 border-green-200";
      case "failed": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <Link href={`/projects/${project.id}`} className="block focus:outline-none focus:ring-4 focus:ring-blue-500/20 rounded-2xl">
      <div className="group bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:border-white/20 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-1 pr-4">
              {project.title}
            </h3>
            <div className="flex items-center space-x-2">
              {project.quality_score !== undefined && project.quality_score !== null && (
                <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full border text-xs font-bold ${project.quality_score >= 90 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : project.quality_score >= 70 ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                  <Award className="w-3.5 h-3.5" />
                  <span>Quality: {project.quality_score}</span>
                </div>
              )}
              <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-semibold capitalize whitespace-nowrap ${getStatusBadgeColors(project.status)}`}>
                {getStatusIcon(project.status)}
                <span>{project.status}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex items-center space-x-4 text-sm text-gray-400 font-medium">
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-4 h-4" />
              <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
            </div>
            {project.completed_at && (
              <div className="flex items-center space-x-1.5 border-l border-white/20 pl-4">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>Done: {new Date(project.completed_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
