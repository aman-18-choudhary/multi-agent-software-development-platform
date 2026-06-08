import { projectsApi } from "@/lib/api-client";
import { DocViewer } from "@/components/projects/DocViewer";
import { AgentTimeline } from "@/components/projects/AgentTimeline";
import { Shield } from "lucide-react";
import { notFound } from "next/navigation";

// Since API_BASE_URL might need adjusting for server-side fetches
const SERVER_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default async function SharedReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  let projectData;
  try {
    const response = await fetch(`${SERVER_API_URL}/api/v1/share/${token}`, {
        cache: 'no-store'
    });
    if (!response.ok) throw new Error("Not found");
    projectData = await response.json();
  } catch (e) {
    notFound();
  }
  
  if (!projectData) notFound();

  const mockProject = {
    id: "shared",
    title: projectData.title,
    description: projectData.description,
    status: "complete",
    agents: [
      { name: "planner", status: "complete", output: projectData.outputs?.planner },
      { name: "pm", status: "complete", output: projectData.outputs?.pm },
      { name: "architect", status: "complete", output: projectData.outputs?.architect },
      { name: "database", status: "complete", output: projectData.outputs?.database },
      { name: "documentation", status: "complete", output: projectData.outputs?.documentation },
      { name: "critic", status: "complete", output: projectData.outputs?.critic },
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 relative z-10">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{projectData.title}</h1>
                <div className="flex items-center space-x-1 text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  <Shield className="w-3 h-3" />
                  <span>Read-Only Report</span>
                </div>
              </div>
              <p className="text-gray-600 max-w-3xl">{projectData.description}</p>
            </div>
            <div className="flex items-center space-x-4 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
              <div className="text-center">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Version</p>
                <p className="text-lg font-bold text-gray-900">{projectData.version}</p>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-center">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Quality</p>
                <p className="text-lg font-bold text-emerald-600">{projectData.score}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <AgentTimeline agents={mockProject.agents as any} />
          </div>
          <div className="lg:col-span-2">
            <DocViewer project={mockProject as any} />
          </div>
        </div>
      </div>
    </div>
  );
}
