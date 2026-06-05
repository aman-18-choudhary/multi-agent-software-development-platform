import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { projectsApi } from "@/lib/api-client";
import { ProjectResponse } from "@/types/project";

export function useProjects() {
  const { getToken } = useAuth();
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchProjects() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await projectsApi.list(1, 50, getToken);
        if (isMounted) {
          setProjects(data.projects || []);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to fetch projects");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, [getToken]);

  return { projects, isLoading, error };
}
