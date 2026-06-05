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

  /** Ask a question using the RAG Chat API */
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
};
