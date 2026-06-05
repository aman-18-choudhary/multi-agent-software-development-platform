import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { projectsApi } from "@/lib/api-client";
import { ProjectDetailResponse } from "@/types/project";

export function useProjectDetail(projectId: string) {
  const { getToken } = useAuth();
  const [project, setProject] = useState<ProjectDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let pollInterval: NodeJS.Timeout;

    const fetchProject = async () => {
      try {
        const data = await projectsApi.get(projectId, getToken);
        if (isMounted) {
          setProject(data);
          setIsLoading(false);
          
          if (data.status === "running") {
            if (!pollInterval) {
              pollInterval = setInterval(fetchProject, 2500);
            }
          } else {
            if (pollInterval) clearInterval(pollInterval);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to fetch project");
          setIsLoading(false);
          if (pollInterval) clearInterval(pollInterval);
        }
      }
    };

    fetchProject();

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [projectId, getToken]);

  return { project, isLoading, error };
}
