import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Bot } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <Link href="/dashboard" className="flex flex-shrink-0 items-center gap-2">
              <Bot className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">MASDP</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <UserButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
