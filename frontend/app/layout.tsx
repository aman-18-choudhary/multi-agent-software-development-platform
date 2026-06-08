import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MASDP",
  description: "Multi-Agent Autonomous Software Development Platform",
};

import { dark } from "@clerk/themes";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: { colorPrimary: "#8b5cf6" },
        elements: {
          card: "bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl",
          headerTitle: "text-white",
          headerSubtitle: "text-gray-400",
          socialButtonsBlockButton: "bg-white/5 border border-white/10 hover:bg-white/10 text-white",
          formButtonPrimary: "bg-violet-600 hover:bg-violet-700",
          formFieldInput: "bg-white/5 border-white/10 text-white",
          formFieldLabel: "text-gray-300",
          footerActionLink: "text-violet-400 hover:text-violet-300",
        }
      }}
    >
      <html
        lang="en"
        className={`${outfit.variable} ${outfit.className} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col font-sans bg-black text-white">{children}</body>
      </html>
    </ClerkProvider>
  );
}
