import Link from "next/link";
import { ProjectResponse } from "@/types/project";
import { Clock, CheckCircle2, AlertCircle, Loader2, Calendar } from "lucide-react";

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
      <div className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden">
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors line-clamp-1 pr-4">
              {project.title}
            </h3>
            <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full border text-xs font-semibold capitalize whitespace-nowrap ${getStatusBadgeColors(project.status)}`}>
              {getStatusIcon(project.status)}
              <span>{project.status}</span>
            </div>
          </div>
          
          <div className="mt-6 flex items-center space-x-4 text-sm text-gray-500 font-medium">
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-4 h-4" />
              <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
            </div>
            {project.completed_at && (
              <div className="flex items-center space-x-1.5 border-l border-gray-200 pl-4">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Done: {new Date(project.completed_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
