import { ProjectDetailResponse } from "@/types/project";

export function ProjectHeader({ project }: { project: ProjectDetailResponse }) {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    running: "bg-blue-100 text-blue-800 animate-pulse",
    complete: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
          <p className="text-gray-600 max-w-3xl">{project.description}</p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-semibold capitalize whitespace-nowrap ${statusColors[project.status as keyof typeof statusColors] || statusColors.pending}`}>
          {project.status}
        </span>
      </div>
    </div>
  );
}
