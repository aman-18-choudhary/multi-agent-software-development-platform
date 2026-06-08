"use client";

import Link from "next/link";
import { Bot, ArrowRight, Sparkles, Code2, Zap } from "lucide-react";
import { motion } from "framer-motion";
import FloatingShapes from "@/components/landing/FloatingShapes";

export default function LandingContent() {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* 3D Background */}
      <FloatingShapes />

      {/* Header (Glassmorphism) */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute inset-x-0 top-0 z-50 border-b border-white/10 bg-black/20 backdrop-blur-md"
      >
        <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2 group">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-[0_0_20px_rgba(139,92,246,0.5)] group-hover:shadow-[0_0_30px_rgba(139,92,246,0.8)] transition-all">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                MASDP
              </span>
            </Link>
          </div>
          <div className="flex flex-1 justify-end items-center gap-6">
            <Link href="/sign-in" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors">
              Log in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white shadow-sm border border-white/20 hover:bg-white/20 backdrop-blur-md transition-all flex items-center gap-2 group"
            >
              Get Started
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </nav>
      </motion.header>

      {/* Main Content */}
      <main className="relative isolate px-6 pt-32 lg:px-8 min-h-screen flex items-center justify-center">
        {/* Soft glowing ambient orbs behind text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-600/20 rounded-full blur-[100px] -z-10 pointer-events-none" />

        <div className="mx-auto max-w-4xl text-center z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-gray-300 backdrop-blur-md"
          >
            <Sparkles className="h-4 w-4 text-pink-400" />
            <span>The future of software architecture is here</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-6xl font-bold tracking-tight text-balance text-white sm:text-8xl leading-tight"
          >
            Your AI Software <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400">
              Engineering Team
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="mt-8 text-xl font-medium text-pretty text-gray-400 sm:text-2xl/8 max-w-2xl mx-auto"
          >
            Describe your idea in plain English. Our specialized AI agents will autonomously generate your complete software architecture, schemas, and documentation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="mt-12 flex items-center justify-center gap-x-6"
          >
            <Link
              href="/sign-up"
              className="rounded-full bg-gradient-to-r from-violet-600 to-pink-600 px-8 py-4 text-lg font-semibold text-white shadow-[0_0_40px_rgba(139,92,246,0.4)] hover:shadow-[0_0_60px_rgba(139,92,246,0.6)] hover:scale-105 transition-all flex items-center gap-2 group"
            >
              Start Building Now
              <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto text-left"
          >
            {[
              {
                icon: <Bot className="h-6 w-6 text-violet-400" />,
                title: "5 Autonomous Agents",
                desc: "Planner, PM, Architect, Database, and Documentation agents working in harmony.",
              },
              {
                icon: <Code2 className="h-6 w-6 text-pink-400" />,
                title: "Production Ready",
                desc: "Outputs complete architecture diagrams, schemas, and Markdown packages.",
              },
              {
                icon: <Zap className="h-6 w-6 text-amber-400" />,
                title: "Iterative Evolution",
                desc: "Ask the agents to pivot or evolve the system design iteratively.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md hover:bg-white/10 transition-colors"
              >
                <div className="mb-4 inline-block rounded-lg bg-white/10 p-3">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
