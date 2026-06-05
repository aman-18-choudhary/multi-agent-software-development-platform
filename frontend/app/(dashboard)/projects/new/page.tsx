import CreateProjectForm from "@/components/projects/CreateProjectForm";

export const metadata = {
  title: "New Project | MASDP",
  description: "Create a new autonomous software architecture plan",
};

export default function NewProjectPage() {
  return (
    <div className="relative overflow-hidden w-full h-full min-h-[calc(100vh-100px)] py-12 flex flex-col items-center justify-center mt-4">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[100px] opacity-60"></div>
        <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[100px] opacity-60"></div>
      </div>

      <div className="w-full max-w-3xl px-4 z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 tracking-tight mb-4">
            Initialize New Project
          </h1>
          <p className="text-gray-500 text-lg font-medium max-w-xl mx-auto">
            Provide a detailed description of your software idea. Our autonomous agents will generate a complete architectural plan.
          </p>
        </div>
        
        <CreateProjectForm />
      </div>
    </div>
  );
}
