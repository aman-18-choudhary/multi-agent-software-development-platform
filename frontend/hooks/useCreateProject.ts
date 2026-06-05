import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { projectsApi } from "@/lib/api-client";

export function useCreateProject() {
  const { getToken } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const createProject = async (title: string, description: string) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await projectsApi.create(title, description, getToken);
      
      setSuccessMessage("Project created successfully. Agents have started processing your idea.");
      
      // Keep success state visible briefly, then redirect
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
      
      return response;
    } catch (err: any) {
      setError(err.message || "Failed to create project");
      setIsSubmitting(false);
      throw err;
    }
  };

  return { createProject, isSubmitting, error, successMessage };
}
