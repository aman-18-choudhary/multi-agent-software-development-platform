"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { searchApi } from "@/lib/api-client";
import { Search, Loader2, Bot, User, Sparkles, BookOpen } from "lucide-react";
import { SourceViewer } from "@/components/projects/SourceViewer";

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

export default function SearchPage() {
  const { getToken } = useAuth();
  
  // Chat state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [viewingSources, setViewingSources] = useState<Source[] | null>(null);

  // Raw search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Source[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatLoading]);

  // Load history
  useEffect(() => {
    async function loadHistory() {
      try {
        const history = await searchApi.getGlobalChatHistory(getToken);
        if (history && history.length > 0) {
          const formatted = history.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.message,
            sources: msg.metadata?.sources || []
          }));
          setChatMessages(formatted);
        } else {
          setChatMessages([{
            id: "welcome",
            role: "assistant",
            content: "I am your Global Architecture Assistant. I can search across all your projects to answer architectural questions, find patterns, and summarize choices."
          }]);
        }
      } catch (err) {
        console.error("Failed to load global chat history", err);
      } finally {
        setIsInitializing(false);
      }
    }
    loadHistory();
  }, [getToken]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const q = chatInput.trim();
    setChatInput("");
    
    const userMsgId = Date.now().toString();
    const asstMsgId = (Date.now() + 1).toString();
    
    setChatMessages(prev => [...prev, { id: userMsgId, role: "user", content: q }]);
    setChatMessages(prev => [...prev, { id: asstMsgId, role: "assistant", content: "" }]);
    setIsChatLoading(true);

    try {
      const response = await searchApi.streamGlobalQuestion(q, getToken);
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
                setChatMessages(prev => prev.map(msg => 
                  msg.id === asstMsgId ? { ...msg, content: msg.content + `\n\nError: ${data.error}` } : msg
                ));
              } else if (data.done) {
                setChatMessages(prev => prev.map(msg => 
                  msg.id === asstMsgId ? { ...msg, sources: data.sources } : msg
                ));
              } else if (data.text) {
                setChatMessages(prev => prev.map(msg => 
                  msg.id === asstMsgId ? { ...msg, content: msg.content + data.text } : msg
                ));
              }
            } catch (e) {
              console.error("Parse stream error", e);
            }
          }
        }
      }
    } catch (error: any) {
      setChatMessages(prev => prev.map(msg => 
        msg.id === asstMsgId ? { ...msg, content: `Error: ${error.message}` } : msg
      ));
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await searchApi.clearGlobalChatHistory(getToken);
      setChatMessages([{
        id: "welcome",
        role: "assistant",
        content: "Chat history cleared. How can I help you?",
      }]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isSearchLoading) return;

    setIsSearchLoading(true);
    setHasSearched(true);
    try {
      const res = await searchApi.searchGlobalChunks(searchQuery, getToken);
      setSearchResults(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSearchLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="flex justify-center items-center h-[600px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in zoom-in-95 duration-300">
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Architecture Knowledge Base</h1>
          <p className="mt-2 text-gray-500">Query your entire portfolio using semantic search and AI assistance.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Global Chat */}
          <div className="flex flex-col h-[600px] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Global AI Assistant</h3>
                  <p className="text-xs text-gray-500 font-medium">Ask across all projects...</p>
                </div>
              </div>
              <button onClick={handleClearChat} className="text-xs font-medium text-gray-500 hover:text-red-600 transition-colors">
                Clear Chat
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${msg.role === "user" ? "bg-blue-600 text-white ml-3" : "bg-indigo-600 text-white mr-3"}`}>
                      {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                      <div className={`px-4 py-3 rounded-2xl text-sm ${msg.role === "user" ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white border border-gray-100 text-gray-800 shadow-sm rounded-tl-sm"}`}>
                        {msg.content === "" && isChatLoading ? (
                          <div className="flex items-center space-x-2 text-gray-400">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        )}
                      </div>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="flex items-center flex-wrap gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            {Array.from(new Set(msg.sources.map(s => s.project_title))).map((title, i) => (
                              <span key={i} className="px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase bg-emerald-50 text-emerald-600 rounded border border-emerald-100">
                                {title}
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
              <div ref={chatEndRef} />
            </div>
            
            <div className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={handleChatSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Which projects use React?..."
                  disabled={isChatLoading}
                  className="w-full pl-5 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50"
                />
                <button type="submit" disabled={!chatInput.trim() || isChatLoading} className="absolute right-2 p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50">
                  {isChatLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                </button>
              </form>
            </div>
          </div>

          {/* Raw Chunk Search */}
          <div className="flex flex-col h-[600px] bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center space-x-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Document Retrieval</h3>
                <p className="text-xs text-gray-500 font-medium">Semantic search across raw chunks</p>
              </div>
            </div>

            <div className="p-4 border-b border-gray-100">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search raw context chunks..."
                  className="w-full pl-5 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button type="submit" disabled={!searchQuery.trim() || isSearchLoading} className="absolute right-2 p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50">
                  {isSearchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
              </form>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30">
              {hasSearched && searchResults.length === 0 && !isSearchLoading && (
                <div className="text-center text-gray-500 mt-10">No chunks found matching your query.</div>
              )}
              
              <div className="space-y-4">
                {searchResults.map((res, i) => (
                  <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-sm text-gray-900">{res.project_title}</h4>
                      <span className="text-[10px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {(res.similarity * 100).toFixed(1)}% match
                      </span>
                    </div>
                    <span className="inline-block px-2 py-0.5 mb-3 text-[10px] font-medium tracking-wide uppercase bg-purple-50 text-purple-600 rounded border border-purple-100">
                      Source: {res.source_agent}
                    </span>
                    <p className="text-xs text-gray-600 line-clamp-4 leading-relaxed font-mono">
                      {res.chunk_text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {viewingSources && <SourceViewer sources={viewingSources} onClose={() => setViewingSources(null)} />}
    </>
  );
}
