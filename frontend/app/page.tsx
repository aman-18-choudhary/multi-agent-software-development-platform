import Link from "next/link";
import { Bot, ArrowRight } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const { userId } = await auth();

  // If already logged in, redirect to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="bg-white min-h-screen">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5 flex items-center gap-2">
              <Bot className="h-8 w-8 text-blue-600" />
              <span className="font-bold text-xl text-gray-900">MASDP</span>
            </Link>
          </div>
          <div className="flex flex-1 justify-end">
            <Link href="/sign-in" className="text-sm/6 font-semibold text-gray-900">
              Log in <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </nav>
      </header>

      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
              Your AI Software Engineering Team
            </h1>
            <p className="mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
              Describe your idea in plain English. Our 5 specialized AI agents will autonomously generate your complete software planning package — requirements, architecture, schemas, and docs.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/sign-up"
                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 flex items-center gap-2"
              >
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="#" className="text-sm/6 font-semibold text-gray-900">
                View demo <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
