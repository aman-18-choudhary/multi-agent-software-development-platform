"use client";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { projectsApi } from "@/lib/api-client";
import { Download, FileText, FileJson, Presentation, FileArchive, Loader2 } from "lucide-react";

export function ExportCenter({ projectId, version }: { projectId: string, version?: number }) {
  const { getToken } = useAuth();
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (format: string, filename: string) => {
    setExporting(format);
    try {
      const blob = await projectsApi.exportProject(projectId, format, getToken, version);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (e) {
      console.error(e);
      alert(`Failed to export ${format}`);
    } finally {
      setExporting(null);
    }
  };

  const options = [
    { id: "pdf", label: "PDF Report", icon: FileText, filename: `project_${projectId}.pdf` },
    { id: "markdown", label: "Markdown Bundle", icon: FileArchive, filename: `project_${projectId}.zip` },
    { id: "json", label: "JSON Bundle", icon: FileJson, filename: `project_${projectId}.json` },
    { id: "pptx", label: "PowerPoint", icon: Presentation, filename: `project_${projectId}.pptx` }
  ];

  return (
    <div className="relative group inline-block">
      <button className="flex items-center space-x-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-xl transition-colors shadow-sm">
        <Download className="w-4 h-4" />
        <span>Export</span>
      </button>
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="p-2 space-y-1">
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                disabled={exporting !== null}
                onClick={() => handleExport(opt.id, opt.filename)}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {exporting === opt.id ? <Loader2 className="w-4 h-4 animate-spin text-indigo-600" /> : <Icon className="w-4 h-4 text-gray-500" />}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
