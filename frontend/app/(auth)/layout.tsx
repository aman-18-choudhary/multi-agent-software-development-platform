import FloatingShapes from "@/components/landing/FloatingShapes";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col overflow-hidden">
      <FloatingShapes />
      <div className="relative z-10 flex-1 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
