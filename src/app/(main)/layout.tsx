"use client";

import { useSession } from "next-auth/react";
import { BottomNav } from "@/components/BottomNav";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { PublicNavbar } from "@/components/PublicNavbar";
import { Chatbot } from "@/components/Chatbot";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      {/* Desktop: sidebar for auth, top navbar for public */}
      {isAuthenticated ? <DesktopSidebar /> : <PublicNavbar />}

      {/* Main content area */}
      <main
        className={`flex-1 w-full bg-background pb-20 lg:pb-0 ${
          isAuthenticated ? "lg:pl-[260px]" : "lg:pt-16"
        }`}
      >
        {children}
      </main>

      {/* Mobile bottom nav */}
      <div className="lg:hidden">
        <BottomNav />
      </div>

      {/* Global AI Chatbot — authenticated only */}
      {isAuthenticated && <Chatbot />}
    </div>
  );
}
