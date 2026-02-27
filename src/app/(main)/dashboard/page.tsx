"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { BookOpen, Plus, FileText, DollarSign, Smile, Flame, Search } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { StaggeredList, StaggeredItem } from "@/components/motion/StaggeredList";
import { HoverLift } from "@/components/motion/HoverLift";
import { useCurrency } from "@/hooks/useCurrency";

interface DashboardStats {
  totalMemories: number;
  totalEntries: number;
  totalExpenses: number;
  streak: number;
  topMood: string | null;
  recentMemories: MemoryData[];
  recentEntries: MemoryData[];
}

const dailyQuotes = [
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", emoji: "🌱" },
  { text: "Every day is a new beginning. Take a deep breath and start again.", emoji: "🌅" },
  { text: "Your life is your story. Write well. Edit often.", emoji: "✍️" },
  { text: "Be yourself; everyone else is already taken.", emoji: "💫" },
  { text: "The only way to do great work is to love what you do.", emoji: "❤️" },
  { text: "Today is a good day to have a good day.", emoji: "☀️" },
  { text: "Small steps every day lead to big changes.", emoji: "👣" },
  { text: "You are braver than you believe, stronger than you seem.", emoji: "🦁" },
  { text: "Happiness is not by chance, but by choice.", emoji: "🌻" },
  { text: "What you do today can improve all your tomorrows.", emoji: "🚀" },
  { text: "Life is 10% what happens and 90% how you react.", emoji: "🎯" },
  { text: "The journey of a thousand miles begins with one step.", emoji: "🏔️" },
  { text: "Be the change you wish to see in the world.", emoji: "🌍" },
  { text: "Collect moments, not things.", emoji: "📸" },
  { text: "Every moment is a fresh beginning.", emoji: "🌸" },
  { text: "Turn your wounds into wisdom.", emoji: "🦋" },
  { text: "Breathe. It's just a bad day, not a bad life.", emoji: "🍃" },
  { text: "Stars can't shine without darkness.", emoji: "✨" },
  { text: "Do more of what makes you happy.", emoji: "🎉" },
  { text: "You are enough, just as you are.", emoji: "💜" },
  { text: "Make today so awesome, yesterday gets jealous.", emoji: "🔥" },
  { text: "Progress, not perfection.", emoji: "📈" },
  { text: "Be gentle with yourself. You're doing the best you can.", emoji: "🤗" },
  { text: "Every ending is a new beginning in disguise.", emoji: "🌈" },
  { text: "Your vibe attracts your tribe.", emoji: "🫶" },
  { text: "Dream big. Start small. Act now.", emoji: "💭" },
  { text: "Gratitude turns what we have into enough.", emoji: "🙏" },
  { text: "Let your light shine bright.", emoji: "🌟" },
  { text: "Adventures await around every corner.", emoji: "🗺️" },
  { text: "You're one step closer than you were yesterday.", emoji: "🎯" },
  { text: "Create the life you can't wait to wake up to.", emoji: "🌞" },
];

function getDailyQuote() {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return dailyQuotes[dayOfYear % dailyQuotes.length];
}

interface MemoryData {
  id: string;
  title: string | null;
  content: string;
  mood: string;
  memoryDate: string;
  expense: number | null;
  tags: { id: string; name: string; color: string | null }[];
}

const moodEmoji: Record<string, string> = {
  happy: "😊", joyful: "😊", excited: "🤩", peaceful: "😌", calm: "😌",
  grateful: "🙏", loved: "🥰", productive: "💪", creative: "🎨",
  sad: "😢", anxious: "😰", stressed: "😫", angry: "😤",
  tired: "😴", neutral: "😐", reflective: "🤔", hopeful: "🌟",
};

function getMoodEmoji(mood: string) {
  return moodEmoji[mood.toLowerCase()] || "😊";
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { symbol } = useCurrency();

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats({
          ...data,
          totalMemories: data.totalMemories ?? data.totalEntries ?? 0,
          recentMemories: data.recentMemories ?? data.recentEntries ?? [],
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const firstName = session?.user?.name?.split(" ")[0] || "there";
  const quote = getDailyQuote();

  return (
    <div className="flex flex-col min-h-full pb-6 px-4 pt-6 overflow-y-auto w-full lg:px-8 lg:pt-10 lg:max-w-6xl lg:mx-auto">
      {/* Mobile Top App Bar */}
      <div className="flex justify-between items-center mb-8 lg:hidden">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-gray-900 text-lg">LifeLog</span>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/memory/new"
            className="w-8 h-8 bg-brand-light text-brand rounded-full flex items-center justify-center hover:bg-brand/20 transition-colors"
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          </Link>
          <Link href="/profile" className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center overflow-hidden border border-orange-200">
            {session?.user?.image ? (
              <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <UserAvatarPlaceholder />
            )}
          </Link>
        </div>
      </div>

      {/* Desktop Header */}
      <FadeIn className="hidden lg:flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
            {getGreeting()}, {firstName} 👋
          </h1>
          <p className="text-gray-500 text-base">Ready to capture today&apos;s moments?</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search memories..."
            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all w-64"
          />
        </div>
      </FadeIn>

      {/* Mobile Greeting */}
      <div className="mb-6 lg:hidden">
        <h1 className="text-[28px] leading-tight font-bold text-gray-900 mb-1">
          {getGreeting()}, {firstName} 👋
        </h1>
        <p className="text-gray-500 text-sm">Ready to capture today&apos;s moments?</p>
      </div>

      {/* Daily Inspiration Quote */}
      <FadeIn delay={0.05}>
        <div className="bg-brand/5 border border-brand/10 rounded-2xl p-4 lg:p-5 mb-6 lg:mb-8">
          <div className="flex items-start space-x-3">
            <span className="text-2xl shrink-0">{quote.emoji}</span>
            <div>
              <p className="text-sm lg:text-base text-gray-700 italic leading-relaxed">&ldquo;{quote.text}&rdquo;</p>
              <p className="text-[10px] font-semibold text-brand/60 mt-1.5 tracking-wider">DAILY INSPIRATION</p>
            </div>
          </div>
        </div>
      </FadeIn>

      {loading ? (
        <StatsLoadingSkeleton />
      ) : (
        <>
          {/* Stats Grid */}
          <StaggeredList className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5 mb-8 lg:mb-10">
            <StaggeredItem>
              <HoverLift className="bg-brand-light/60 rounded-2xl p-4 lg:p-5 flex flex-col justify-between h-28 lg:h-32">
                <div className="flex items-center space-x-2 text-brand font-semibold text-xs tracking-wider">
                  <FileText className="w-4 h-4" />
                  <span>TOTAL MEMORIES</span>
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-gray-900">{stats?.totalMemories ?? 0}</div>
              </HoverLift>
            </StaggeredItem>
            <StaggeredItem>
              <HoverLift className="bg-blue-50/80 rounded-2xl p-4 lg:p-5 flex flex-col justify-between h-28 lg:h-32">
                <div className="flex items-center space-x-2 text-blue-600 font-semibold text-xs tracking-wider">
                  <DollarSign className="w-4 h-4" />
                  <span>EXPENSES</span>
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {symbol}{stats?.totalExpenses?.toFixed(0) ?? "0"}
                </div>
              </HoverLift>
            </StaggeredItem>
            <StaggeredItem>
              <HoverLift className="bg-purple-50/80 rounded-2xl p-4 lg:p-5 flex flex-col justify-between h-28 lg:h-32">
                <div className="flex items-center space-x-2 text-purple-600 font-semibold text-xs tracking-wider">
                  <Smile className="w-4 h-4" />
                  <span>TOP MOOD</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{stats?.topMood ? getMoodEmoji(stats.topMood) : "—"}</span>
                  <span className="text-base font-semibold text-gray-700 capitalize">{stats?.topMood || "None yet"}</span>
                </div>
              </HoverLift>
            </StaggeredItem>
            <StaggeredItem>
              <HoverLift className="bg-sky-50/80 rounded-2xl p-4 lg:p-5 flex flex-col justify-between h-28 lg:h-32">
                <div className="flex items-center space-x-2 text-sky-600 font-semibold text-xs tracking-wider">
                  <Flame className="w-4 h-4" />
                  <span>STREAK</span>
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {stats?.streak ?? 0} {(stats?.streak ?? 0) === 1 ? "Day" : "Days"}
                </div>
              </HoverLift>
            </StaggeredItem>
          </StaggeredList>

          {/* Recent Memories Header */}
          <FadeIn delay={0.2} className="flex justify-between items-center mb-4 lg:mb-6 px-1">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900">Recent Memories</h2>
            <Link href="/timeline" className="text-sm font-semibold text-brand hover:underline">
              View All
            </Link>
          </FadeIn>

          {/* Memories List */}
          {stats?.recentMemories && stats.recentMemories.length > 0 ? (
            <StaggeredList
              className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-5"
              staggerDelay={0.1}
            >
              {stats.recentMemories.map((memory) => (
                <StaggeredItem key={memory.id}>
                  <MemoryCard memory={memory} />
                </StaggeredItem>
              ))}
            </StaggeredList>
          ) : (
            <FadeIn delay={0.3}>
              <div className="text-center py-16 px-4">
                <div className="text-6xl mb-4">📖✨</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to LifeLog!</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  Your story starts here. Create your first memory and begin capturing the beautiful moments of your life.
                </p>
                <Link
                  href="/memory/new"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-brand hover:bg-brand-dark text-white rounded-xl font-semibold shadow-md shadow-brand/20 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create First Memory</span>
                </Link>
              </div>
            </FadeIn>
          )}
        </>
      )}

      {/* FAB — mobile only */}
      <div className="fixed bottom-24 right-5 z-[60] lg:hidden">
        <Link
          href="/memory/new"
          className="w-14 h-14 bg-brand hover:bg-brand-dark text-white rounded-full flex items-center justify-center shadow-lg shadow-brand/30 transition-transform active:scale-95"
        >
          <Plus className="w-8 h-8" strokeWidth={2} />
        </Link>
      </div>
    </div>
  );
}

function MemoryCard({ memory }: { memory: MemoryData }) {
  const date = new Date(memory.memoryDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const title = memory.title || memory.content.substring(0, 40) + "...";
  const preview = memory.content.length > 100 ? memory.content.substring(0, 100) + "..." : memory.content;

  return (
    <HoverLift>
      <div className="bg-white p-4 lg:p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col relative overflow-hidden h-full lg:hover:border-gray-200 transition-all duration-200">
        <div className="absolute top-4 right-4 text-2xl">{getMoodEmoji(memory.mood)}</div>
        <div className="text-xs text-gray-400 font-medium mb-1">{date}</div>
        <h3 className="text-base font-bold text-gray-900 mb-2 pr-8">{title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-4">{preview}</p>
        <div className="flex justify-between items-center mt-auto">
          <div className="flex flex-wrap gap-2">
            {memory.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="px-2.5 py-1 bg-brand-light/50 text-brand text-[10px] font-bold rounded-full tracking-wider uppercase"
              >
                {tag.name}
              </span>
            ))}
          </div>
          <Link
            href={`/memory/${memory.id}`}
            className="px-4 py-1.5 bg-brand-light text-brand text-xs font-semibold rounded-full hover:bg-brand hover:text-white transition-colors"
          >
            View
          </Link>
        </div>
      </div>
    </HoverLift>
  );
}

function StatsLoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-2xl h-28 lg:h-32" />
        ))}
      </div>
      <div className="h-6 bg-gray-100 rounded w-40" />
      <div className="space-y-4 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-5 lg:space-y-0">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-2xl h-40" />
        ))}
      </div>
    </div>
  );
}

function UserAvatarPlaceholder() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#FDBA74" />
      <path d="M12.0002 14.5C6.99016 14.5 2.91016 17.86 2.91016 22C2.91016 22.28 3.13016 22.5 3.41016 22.5H20.5902C20.8702 22.5 21.0902 22.28 21.0902 22C21.0902 17.86 17.0102 14.5 12.0002 14.5Z" fill="#FDBA74" />
    </svg>
  );
}
