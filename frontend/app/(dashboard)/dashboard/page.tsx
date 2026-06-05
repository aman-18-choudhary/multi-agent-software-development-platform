import ProjectList from "@/components/projects/ProjectList";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata = {
  title: "Dashboard | MASDP",
  description: "Manage your autonomous software architecture projects",
};

export default function DashboardPage() {
  return (
    <div className="relative overflow-hidden w-full h-full pb-12 mt-4">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-40 -right-20 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute top-40 -left-20 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl opacity-50"></div>
      </div>

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 space-y-6 md:space-y-0">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 tracking-tight">
            Your Projects
          </h1>
          <p className="text-gray-500 mt-3 text-lg font-medium max-w-xl">
            Manage and monitor your autonomous software architecture plans in real-time.
          </p>
        </div>
        <Link 
          href="/projects/new" 
          className="group flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg hover:shadow-2xl hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>Create Project</span>
        </Link>
      </header>
      
      <ProjectList />
    </div>
  );
}
