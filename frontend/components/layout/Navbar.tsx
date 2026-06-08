"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Bot } from "lucide-react";
import { motion } from "framer-motion";

export function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="border-b border-white/10 bg-black/20 backdrop-blur-md relative z-50"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <Link href="/dashboard" className="flex flex-shrink-0 items-center gap-2 group">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-[0_0_15px_rgba(139,92,246,0.5)] group-hover:shadow-[0_0_25px_rgba(139,92,246,0.8)] transition-all">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                MASDP
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/arena" className="text-sm font-medium text-gray-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all">
              Arena
            </Link>
            <Link href="/search" className="text-sm font-medium text-gray-300 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all">
              Knowledge Base
            </Link>
            <UserButton appearance={{ elements: { userButtonAvatarBox: "border-2 border-white/20" } }} />
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
