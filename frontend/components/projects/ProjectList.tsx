"use client";

import { useProjects } from "@/hooks/useProjects";
import { ProjectCard } from "./ProjectCard";
import { LayoutGrid, PlusCircle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function ProjectList() {
  const { projects, isLoading, error } = useProjects();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="h-44 rounded-2xl bg-white/5 border border-white/10 animate-pulse backdrop-blur-md"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 backdrop-blur-md shadow-sm">
        <h3 className="font-bold text-lg mb-2">Error loading projects</h3>
        <p className="text-sm font-medium opacity-90">{error}</p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-24 rounded-3xl border-2 border-dashed border-white/20 bg-white/5 backdrop-blur-md transition-all hover:bg-white/10"
      >
        <div className="flex justify-center mb-6">
          <div className="p-5 bg-white/10 rounded-full text-violet-400 shadow-inner">
            <LayoutGrid className="w-10 h-10" />
          </div>
        </div>
        <h3 className="text-2xl font-extrabold text-white mb-3 tracking-tight">No projects yet</h3>
        <p className="text-gray-400 mb-8 max-w-sm mx-auto font-medium">Create your first software architecture project to get started with autonomous planning.</p>
        <Link 
          href="/projects/new" 
          className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white font-semibold py-3.5 px-8 rounded-xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:-translate-y-0.5"
        >
          <PlusCircle className="w-5 h-5" />
          <span>New Project</span>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {projects.map((project) => (
        <motion.div key={project.id} variants={itemVariants}>
          <ProjectCard project={project} />
        </motion.div>
      ))}
    </motion.div>
  );
}
