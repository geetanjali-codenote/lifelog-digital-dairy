import { BottomNav } from "@/components/BottomNav";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { Chatbot } from "@/components/Chatbot";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      {/* Desktop sidebar — hidden on mobile */}
      <DesktopSidebar />

      {/* Main content area — offset on desktop for sidebar */}
      <main className="flex-1 w-full bg-background pb-20 lg:pb-0 lg:pl-[260px]">
        {children}
      </main>

      {/* Mobile bottom nav — hidden on desktop */}
      <div className="lg:hidden">
        <BottomNav />
      </div>

      {/* Global AI Chatbot */}
      <Chatbot />
    </div>
  );
}
