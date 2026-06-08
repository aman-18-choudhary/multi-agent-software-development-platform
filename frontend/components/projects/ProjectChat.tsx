"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { projectsApi } from "@/lib/api-client";
import { Send, Loader2, Bot, User, Sparkles, BookOpen } from "lucide-react";
import { SourceViewer } from "./SourceViewer";

interface Source {
  source_agent: string;
  similarity: number;
  chunk_id: string;
  project_id: string;
  project_title?: string;
  chunk_text: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

export function ProjectChat({ projectId }: { projectId: string }) {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [viewingSources, setViewingSources] = useState<Source[] | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Load history on mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const history = await projectsApi.getProjectChatHistory(projectId, getToken);
        if (history && history.length > 0) {
          const formatted = history.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.message,
            sources: msg.metadata?.sources || []
          }));
          setMessages(formatted);
        } else {
          // Default welcome message
          setMessages([{
            id: "welcome",
            role: "assistant",
            content: "Hello! I'm your Project Knowledge Assistant. Ask me anything about the architecture, database schema, or requirements for this project.",
          }]);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      } finally {
        setIsInitializing(false);
      }
    }
    loadHistory();
  }, [projectId, getToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userQuestion = input.trim();
    setInput("");
    
    const userMessageId = Date.now().toString();
    const assistantMessageId = (Date.now() + 1).toString();
    
    setMessages((prev) => [...prev, { id: userMessageId, role: "user", content: userQuestion }]);
    
    // Add empty assistant message that we will stream into
    setMessages((prev) => [...prev, { id: assistantMessageId, role: "assistant", content: "" }]);
    setIsLoading(true);

    try {
      const response = await projectsApi.streamProjectQuestion(projectId, userQuestion, getToken);
      if (!response.body) throw new Error("No response body");
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (!dataStr) continue;
            
            try {
              const data = JSON.parse(dataStr);
              if (data.error) {
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId ? { ...msg, content: msg.content + `\n\nError: ${data.error}` } : msg
                ));
              } else if (data.done) {
                // Finalize with sources
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId ? { ...msg, sources: data.sources } : msg
                ));
              } else if (data.text) {
                // Append text chunk
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId ? { ...msg, content: msg.content + data.text } : msg
                ));
              }
            } catch (e) {
              console.error("Failed to parse stream chunk", e);
            }
          }
        }
      }
    } catch (error: any) {
      setMessages((prev) => prev.map(msg => 
        msg.id === assistantMessageId ? { ...msg, content: `Error: ${error.message || "Failed to fetch answer. Please try again."}` } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    try {
      await projectsApi.clearProjectChatHistory(projectId, getToken);
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: "Chat history cleared. How can I help you?",
      }]);
    } catch (e) {
      console.error(e);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex justify-center items-center h-[500px] bg-white rounded-2xl border border-gray-100 shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-[500px] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Project Knowledge Assistant</h3>
              <p className="text-xs text-gray-500 font-medium">Powered by Streaming RAG & Groq</p>
            </div>
          </div>
          <button onClick={handleClear} className="text-xs font-medium text-gray-500 hover:text-red-600 transition-colors">
            Clear Chat
          </button>
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
                    {msg.content === "" && isLoading ? (
                      <div className="flex items-center space-x-2 text-gray-400">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    )}
                  </div>
                  
                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="flex items-center flex-wrap gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        {msg.sources.map((src, i) => (
                          <span key={i} className="px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase bg-indigo-50 text-indigo-600 rounded border border-indigo-100">
                            {src.source_agent}
                          </span>
                        ))}
                      </div>
                      <button 
                        onClick={() => setViewingSources(msg.sources!)}
                        className="flex items-center gap-1 text-[10px] font-medium text-gray-500 hover:text-indigo-600 transition-colors ml-2"
                      >
                        <BookOpen className="w-3 h-3" />
                        View Sources
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
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
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>

      {viewingSources && <SourceViewer sources={viewingSources} onClose={() => setViewingSources(null)} />}
    </>
  );
}
