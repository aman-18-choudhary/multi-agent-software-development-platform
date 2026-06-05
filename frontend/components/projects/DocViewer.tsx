import { useState } from "react";
import { ProjectDetailResponse } from "@/types/project";
import ReactMarkdown from "react-markdown";
import { MermaidDiagram } from "./MermaidDiagram";

export function DocViewer({ project }: { project: ProjectDetailResponse }) {
  const [activeTab, setActiveTab] = useState<string>("planner");
  
  const getAgentOutput = (name: string) => {
    return project.agents.find(a => a.name === name)?.output;
  };

  const tabs = [
    { id: "planner", label: "Requirements" },
    { id: "pm", label: "Project Plan" },
    { id: "architect", label: "Architecture" },
    { id: "database", label: "Database" },
    { id: "documentation", label: "Documentation" }
  ];

  const renderContent = () => {
    const output = getAgentOutput(activeTab);
    if (!output) {
      return (
        <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          Agent output is not yet available or failed.
        </div>
      );
    }

    if (activeTab === "database") {
      return (
        <div className="space-y-8">
          {output.er_diagram_mermaid && (
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-bold mb-4 text-gray-900">Entity Relationship Diagram</h3>
              <MermaidDiagram chart={output.er_diagram_mermaid} />
            </div>
          )}
          <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto shadow-inner">
            <h3 className="font-bold text-gray-400 mb-4 text-xs tracking-wider uppercase">SQL DDL</h3>
            <pre className="text-gray-100 text-sm font-mono whitespace-pre-wrap">
              <code>{output.sql_ddl}</code>
            </pre>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
             <h3 className="font-bold text-gray-900 mb-4">Raw Schema JSON</h3>
             <pre className="bg-gray-50 p-4 rounded text-sm text-gray-800 overflow-x-auto border border-gray-100">{JSON.stringify(output.tables, null, 2)}</pre>
          </div>
        </div>
      );
    }

    if (activeTab === "architect") {
      return (
        <div className="space-y-8">
          {output.system_diagram_mermaid && (
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="font-bold mb-4 text-gray-900">System Architecture Diagram</h3>
              <MermaidDiagram chart={output.system_diagram_mermaid} />
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
               <h3 className="font-bold text-gray-900 mb-4">System Design</h3>
               <p className="text-gray-700 whitespace-pre-wrap">{output.system_design || output.architecture_pattern}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm overflow-auto">
               <h3 className="font-bold text-gray-900 mb-4">Tech Stack</h3>
               <pre className="bg-gray-50 p-4 rounded text-sm text-gray-800 border border-gray-100 font-mono">
                 {JSON.stringify(output.tech_stack, null, 2)}
               </pre>
            </div>
          </div>
        </div>
      );
    }
    
    if (activeTab === "documentation") {
      return (
        <div className="space-y-8">
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm prose max-w-none">
             <ReactMarkdown>{output.readme || "No README available."}</ReactMarkdown>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm overflow-auto max-h-[500px]">
               <h3 className="font-bold text-gray-400 mb-4 text-xs uppercase tracking-wider">API Docs</h3>
               <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap">{output.api_docs || output.api_documentation}</pre>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm prose overflow-auto max-h-[500px]">
               <h3 className="font-bold text-gray-900 mb-4 text-lg">Setup Guide</h3>
               <ReactMarkdown>{output.setup_guide || ""}</ReactMarkdown>
            </div>
          </div>
        </div>
      );
    }

    // Default JSON fallback for Planner and PM
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4 capitalize">{activeTab} Details</h3>
        <pre className="bg-gray-50 p-4 rounded text-sm text-gray-800 overflow-x-auto border border-gray-100 font-mono">
          {JSON.stringify(output, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="border-b border-gray-100 overflow-x-auto">
        <nav className="flex space-x-1 px-4 pt-4" aria-label="Tabs">
          {tabs.map((tab) => {
            const hasData = !!getAgentOutput(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors rounded-t-lg
                  ${activeTab === tab.id
                    ? "border-blue-500 text-blue-600 bg-blue-50/50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }
                  ${!hasData && "opacity-50"}
                `}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="p-6 bg-gray-50/30">
        {renderContent()}
      </div>
    </div>
  );
}
