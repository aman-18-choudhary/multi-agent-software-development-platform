/**
 * MASDP Frontend — API Client.
 * 
 * Base fetch wrapper configured to include Clerk auth headers.
 */

import { ProjectCreateResponse, ProjectListResponse, ProjectDetailResponse } from "@/types/project";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Helper to make authenticated requests to the backend.
 * Requires passing the getToken function from useAuth() or auth().
 */
async function fetchWithAuth(
  endpoint: string, 
  getToken: () => Promise<string | null>,
  options: RequestInit = {}
) {
  const token = await getToken();
  
  if (!token) {
    throw new ApiError(401, "Not authenticated");
  }

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);
  
  if (!headers.has("Content-Type") && options.method !== "GET" && options.method !== "DELETE") {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      // Ignored if not JSON
    }
    throw new ApiError(response.status, errorMessage);
  }

  if (response.status === 204) {
    return null; // No content
  }

  return response.json();
}

/**
 * Project API methods
 */
export const projectsApi = {
  /** Create a new project */
  create: (
    title: string, 
    description: string, 
    getToken: () => Promise<string | null>
  ): Promise<ProjectCreateResponse> => {
    return fetchWithAuth("/projects/", getToken, {
      method: "POST",
      body: JSON.stringify({ title, description }),
    });
  },

  /** List user projects */
  list: (
    page: number = 1, 
    limit: number = 10, 
    getToken: () => Promise<string | null>
  ): Promise<ProjectListResponse> => {
    return fetchWithAuth(`/projects/?page=${page}&limit=${limit}`, getToken);
  },

  /** Get project details */
  get: (
    projectId: string, 
    getToken: () => Promise<string | null>
  ): Promise<ProjectDetailResponse> => {
    return fetchWithAuth(`/projects/${projectId}`, getToken);
  },

  /** Delete a project */
  delete: (
    projectId: string, 
    getToken: () => Promise<string | null>
  ): Promise<void> => {
    return fetchWithAuth(`/projects/${projectId}`, getToken, {
      method: "DELETE",
    });
  },

  /** Request architecture improvement */
  requestImprovement: (
    projectId: string,
    goal: string,
    getToken: () => Promise<string | null>
  ): Promise<{ version: number, status: string }> => {
    return fetchWithAuth(`/projects/${projectId}/versions`, getToken, {
      method: "POST",
      body: JSON.stringify({ goal }),
    });
  },

  /** List project versions */
  listVersions: (
    projectId: string,
    getToken: () => Promise<string | null>
  ): Promise<any[]> => {
    return fetchWithAuth(`/projects/${projectId}/versions`, getToken);
  },

  /** Compare project versions */
  compareVersions: (
    projectId: string,
    v1: number,
    v2: number,
    getToken: () => Promise<string | null>
  ): Promise<any> => {
    return fetchWithAuth(`/projects/${projectId}/versions/compare?v1=${v1}&v2=${v2}`, getToken);
  },

  /** Export project */
  exportProject: async (
    projectId: string,
    format: string,
    getToken: () => Promise<string | null>,
    version?: number
  ): Promise<Blob> => {
    const token = await getToken();
    let url = `${API_BASE_URL}/api/v1/projects/${projectId}/export/${format}`;
    if (version) url += `?version=${version}`;
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) throw new Error("Failed to export");
    return response.blob();
  },

  /** Create Share Link */
  createShareLink: (
    projectId: string,
    getToken: () => Promise<string | null>,
    version?: number
  ): Promise<{ token: string, url: string }> => {
    let url = `/projects/${projectId}/share`;
    if (version) url += `?version=${version}`;
    return fetchWithAuth(url, getToken, { method: "POST" });
  },

  /** Get Shared Report (Public) */
  getSharedReport: async (token: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/share/${token}`);
    if (!response.ok) throw new Error("Shared report not found");
    return response.json();
  },

  /** Ask a question using the RAG Chat API (Legacy sync) */
  askProjectQuestion: (
    projectId: string,
    question: string,
    getToken: () => Promise<string | null>
  ): Promise<{ answer: string; sources: string[] }> => {
    return fetchWithAuth(`/projects/${projectId}/chat`, getToken, {
      method: "POST",
      body: JSON.stringify({ question }),
    });
  },

  /** Stream a question using RAG */
  streamProjectQuestion: async (
    projectId: string,
    question: string,
    getToken: () => Promise<string | null>
  ): Promise<Response> => {
    const token = await getToken();
    return fetch(`${API_BASE_URL}/api/v1/projects/${projectId}/chat/stream`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question })
    });
  },

  /** Get Project Chat History */
  getProjectChatHistory: (
    projectId: string,
    getToken: () => Promise<string | null>
  ): Promise<any[]> => {
    return fetchWithAuth(`/projects/${projectId}/chat`, getToken);
  },

  /** Clear Project Chat History */
  clearProjectChatHistory: (
    projectId: string,
    getToken: () => Promise<string | null>
  ): Promise<void> => {
    return fetchWithAuth(`/projects/${projectId}/chat`, getToken, { method: "DELETE" });
  },
};

/**
 * Search API methods
 */
export const searchApi = {
  /** Search for raw chunks globally */
  searchGlobalChunks: (
    query: string,
    getToken: () => Promise<string | null>
  ): Promise<any[]> => {
    return fetchWithAuth(`/search?query=${encodeURIComponent(query)}`, getToken);
  },

  /** Ask a question using the Global RAG API (Legacy sync) */
  askGlobalQuestion: (
    question: string,
    getToken: () => Promise<string | null>
  ): Promise<{ answer: string; projects: string[] }> => {
    return fetchWithAuth(`/search/chat`, getToken, {
      method: "POST",
      body: JSON.stringify({ question }),
    });
  },

  /** Stream Global RAG API */
  streamGlobalQuestion: async (
    question: string,
    getToken: () => Promise<string | null>
  ): Promise<Response> => {
    const token = await getToken();
    return fetch(`${API_BASE_URL}/api/v1/search/chat/stream`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question })
    });
  },

  /** Get Global Chat History */
  getGlobalChatHistory: (
    getToken: () => Promise<string | null>
  ): Promise<any[]> => {
    return fetchWithAuth(`/search/chat`, getToken);
  },

  /** Clear Global Chat History */
  clearGlobalChatHistory: (
    getToken: () => Promise<string | null>
  ): Promise<void> => {
    return fetchWithAuth(`/search/chat`, getToken, { method: "DELETE" });
  },
};

/**
 * Analytics API
 */
export const analyticsApi = {
  getSystemMetrics: (getToken: () => Promise<string | null>): Promise<any> => {
    return fetchWithAuth("/analytics/stats", getToken);
  },
  getQualityMetrics: (getToken: () => Promise<string | null>): Promise<any> => {
    return fetchWithAuth("/analytics/quality", getToken);
  },
  getModelMetrics: (getToken: () => Promise<string | null>): Promise<any> => {
    return fetchWithAuth("/analytics/models", getToken);
  }
};

export const arenaApi = {
  runBenchmark: (prompt: string, providers: string[], getToken: () => Promise<string | null>): Promise<any[]> => {
    return fetchWithAuth(`/arena/run`, getToken, {
      method: "POST",
      body: JSON.stringify({ prompt, providers })
    });
  },
  getHistory: (getToken: () => Promise<string | null>): Promise<any[]> => {
    return fetchWithAuth(`/arena/history`, getToken);
  }
};
