import { BookOpen } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left branding panel — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center p-12 bg-brand">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand-dark to-[#2D26A6]" />

        {/* Decorative blurred shapes */}
        <div className="absolute top-20 left-16 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-16 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-3xl" />

        {/* Content */}
        <div className="relative z-10 text-center max-w-md">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-black/10">
            <BookOpen className="w-10 h-10 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">LifeLog</h1>
          <p className="text-lg text-white/70 leading-relaxed">
            Capture your journey, one day at a time. Track moods, expenses, and life&apos;s best moments.
          </p>

          {/* Testimonial-style quote */}
          <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-left border border-white/10">
            <p className="text-white/80 text-sm leading-relaxed italic mb-4">
              &ldquo;LifeLog helped me rediscover the joy of journaling. I&apos;ve been logging every day for 6 months now.&rdquo;
            </p>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full" />
              <div>
                <p className="text-white text-xs font-semibold">Sarah K.</p>
                <p className="text-white/50 text-xs">Daily user since 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <main className="w-full lg:w-1/2 bg-white dark:bg-surface min-h-screen flex flex-col relative overflow-hidden">
        {children}
      </main>
    </div>
  );
}
