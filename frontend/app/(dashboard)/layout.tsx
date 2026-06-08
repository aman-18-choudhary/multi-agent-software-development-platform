import { Navbar } from "@/components/layout/Navbar";
import FloatingShapes from "@/components/landing/FloatingShapes";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col overflow-hidden">
      <FloatingShapes />
      <Navbar />
      <main className="flex-1 relative z-10">
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
