"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { projectsApi } from "@/lib/api-client";
import { Send, Loader2, Bot, User, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

export function ProjectChat({ projectId }: { projectId: string }) {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your Project Knowledge Assistant. Ask me anything about the architecture, database schema, or requirements for this project.",
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userQuestion = input.trim();
    setInput("");
    
    // Add user message
    const userMessageId = Date.now().toString();
    setMessages((prev) => [...prev, { id: userMessageId, role: "user", content: userQuestion }]);
    setIsLoading(true);

    try {
      const response = await projectsApi.askProjectQuestion(projectId, userQuestion, getToken);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.answer,
          sources: response.sources,
        },
      ]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Error: ${error.message || "Failed to fetch answer. Please try again."}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center space-x-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Project Knowledge Assistant</h3>
          <p className="text-xs text-gray-500 font-medium">Powered by RAG & Groq</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${
                msg.role === "user" ? "bg-blue-600 text-white ml-3" : "bg-indigo-600 text-white mr-3"
              }`}>
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Bubble */}
              <div className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm ${
                  msg.role === "user" 
                    ? "bg-blue-600 text-white rounded-tr-sm" 
                    : "bg-white border border-gray-100 text-gray-800 shadow-sm rounded-tl-sm"
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
                
                {/* Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {msg.sources.map((src) => (
                      <span key={src} className="px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase bg-indigo-50 text-indigo-600 rounded border border-indigo-100">
                        {src}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex flex-row max-w-[85%]">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white mr-3">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-4 py-3 bg-white border border-gray-100 text-gray-500 shadow-sm rounded-2xl rounded-tl-sm flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this project..."
            disabled={isLoading}
            className="w-full pl-5 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
