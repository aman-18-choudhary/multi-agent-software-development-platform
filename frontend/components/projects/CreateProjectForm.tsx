"use client";

import { useState } from "react";
import { useCreateProject } from "@/hooks/useCreateProject";
import { Loader2, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

export default function CreateProjectForm() {
  const { createProject, isSubmitting, error, successMessage } = useCreateProject();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation Alignment (Mandatory constraints)
    if (!title.trim()) {
      setValidationError("Title is required.");
      return;
    }
    if (title.length > 500) {
      setValidationError("Title must not exceed 500 characters.");
      return;
    }
    if (!description.trim()) {
      setValidationError("Description is required.");
      return;
    }
    if (description.length < 20) {
      setValidationError("Description must be at least 20 characters.");
      return;
    }

    try {
      await createProject(title, description);
    } catch (err) {
      // API Error is handled in the hook and passed back via `error` prop
    }
  };

  if (successMessage) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-emerald-200/60 bg-emerald-50/60 backdrop-blur-md shadow-xl transition-all">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-6 animate-bounce" />
        <h3 className="text-2xl font-bold text-emerald-900 mb-2">Success!</h3>
        <p className="text-emerald-700 text-lg font-medium">{successMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative rounded-3xl border border-white/60 bg-white/40 backdrop-blur-xl p-8 md:p-10 shadow-2xl transition-all">
      
      {(error || validationError) && (
        <div className="mb-6 p-4 rounded-xl bg-red-50/90 border border-red-200 text-red-700 flex items-start space-x-3 backdrop-blur-md">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span className="text-sm font-semibold">{validationError || error}</span>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-bold text-gray-800 mb-2">
            Project Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            placeholder="e.g. E-commerce Microservices Platform"
            className="w-full px-5 py-4 bg-white/60 border border-gray-200/80 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-gray-400 font-medium text-gray-900"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-bold text-gray-800 mb-2">
            Describe your software idea
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            rows={6}
            placeholder="I need a scalable e-commerce platform with a React frontend, a FastAPI backend, and PostgreSQL..."
            className="w-full px-5 py-4 bg-white/60 border border-gray-200/80 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder-gray-400 font-medium text-gray-900 resize-none"
          />
          <div className="mt-2 flex justify-end">
            <span className={`text-xs font-semibold ${description.length > 0 && description.length < 20 ? 'text-red-500' : 'text-gray-400'}`}>
              {description.length} / 20 min characters
            </span>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative w-full flex justify-center items-center space-x-2 py-4 px-8 border border-transparent text-lg font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-2xl transition-all overflow-hidden"
        >
          {isSubmitting ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Generate Architecture</span>
            </>
          )}
          
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
        </button>
      </div>
    </form>
  );
}
