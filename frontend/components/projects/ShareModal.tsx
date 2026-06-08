"use client";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { projectsApi } from "@/lib/api-client";
import { Share2, Link as LinkIcon, Check, Loader2, X } from "lucide-react";

export function ShareModal({ projectId, version }: { projectId: string, version?: number }) {
  const { getToken } = useAuth();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    setShow(true);
    if (link) return;
    
    setLoading(true);
    try {
      const res = await projectsApi.createShareLink(projectId, getToken, version);
      setLink(window.location.origin + res.url);
    } catch (e) {
      console.error(e);
      alert("Failed to generate share link");
      setShow(false);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button 
        onClick={handleShare}
        className="flex items-center space-x-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium py-2.5 px-4 rounded-xl transition-colors shadow-sm"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </button>

      {show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 flex items-center"><Share2 className="w-5 h-5 mr-2 text-indigo-600" /> Share Project</h3>
              <button onClick={() => setShow(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Anyone with this link can view a read-only version of this architecture report.
              </p>
              
              {loading ? (
                <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                    <LinkIcon className="w-4 h-4 text-gray-400 mr-2" />
                    <input type="text" readOnly value={link} className="bg-transparent w-full text-sm text-gray-700 outline-none" />
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="flex items-center space-x-1 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : "Copy"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
