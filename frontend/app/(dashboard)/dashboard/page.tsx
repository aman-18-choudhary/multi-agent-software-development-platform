"use client";

import ProjectList from "@/components/projects/ProjectList";
import Link from "next/link";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  return (
    <div className="relative overflow-visible w-full h-full pb-12 mt-4 z-10">
      <motion.header 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 space-y-6 md:space-y-0"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 tracking-tight drop-shadow-[0_0_15px_rgba(217,70,239,0.3)]">
            Your Projects
          </h1>
          <p className="text-gray-400 mt-3 text-lg font-medium max-w-xl">
            Manage and monitor your autonomous software architecture plans in real-time.
          </p>
        </div>
        <Link 
          href="/projects/new" 
          className="group flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>Create Project</span>
        </Link>
      </motion.header>
      
      <ProjectList />
    </div>
  );
}
