import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import LandingContent from "@/components/landing/LandingContent";

export default async function LandingPage() {
  const { userId } = await auth();

  // If already logged in, redirect to dashboard so they don't get stuck on the landing page
  if (userId) {
    redirect("/dashboard");
  }

  return <LandingContent />;
}
