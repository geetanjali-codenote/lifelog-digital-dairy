"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Search, BookOpen, Plus, Filter } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { HoverLift } from "@/components/motion/HoverLift";

interface EntryData {
  id: string;
  title: string | null;
  content: string;
  mood: string;
  entryDate: string;
  expense: number | null;
  tags: { id: string; name: string; color: string | null }[];
}

const moodEmoji: Record<string, string> = {
  happy: "😊", joyful: "😊", excited: "🤩", peaceful: "😌", calm: "😌",
  grateful: "🙏", loved: "🥰", productive: "💪", creative: "🎨",
  sad: "😢", anxious: "😰", stressed: "😫", angry: "😤",
  tired: "😴", neutral: "😐", reflective: "🤔", hopeful: "🌟",
};

const moodFilters = [
  { value: "", label: "All Moods" },
  { value: "happy", label: "😊 Happy" },
  { value: "excited", label: "🤩 Excited" },
  { value: "peaceful", label: "😌 Peaceful" },
  { value: "productive", label: "💪 Productive" },
  { value: "sad", label: "😢 Sad" },
  { value: "neutral", label: "😐 Neutral" },
];

export default function TimelinePage() {
  const [entries, setEntries] = useState<EntryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moodFilter, setMoodFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "12" });
    if (search) params.set("q", search);
    if (moodFilter) params.set("mood", moodFilter);

    try {
      const res = await fetch(`/api/memories?${params}`);
      const data = await res.json();
      setEntries(data.entries || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch { /* ignore */ }
    setLoading(false);
  }, [page, search, moodFilter]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEntries();
  };

  return (
    <div className="flex flex-col min-h-full pb-8 px-4 pt-6 overflow-y-auto w-full lg:px-8 lg:pt-10 lg:max-w-6xl lg:mx-auto">
      {/* Header */}
      <FadeIn>
        <div className="flex justify-between items-center mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">All Entries</h1>
          <Link
            href="/memory/new"
            className="flex items-center space-x-2 px-4 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden lg:inline">New Entry</span>
          </Link>
        </div>
      </FadeIn>

      {/* Search & Filters */}
      <FadeIn delay={0.1}>
        <form onSubmit={handleSearch} className="flex items-center space-x-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search entries..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
          </div>
          <button type="button" onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border transition-colors ${showFilters ? "bg-brand text-white border-brand" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
            <Filter className="w-5 h-5" />
          </button>
        </form>

        {showFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {moodFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => { setMoodFilter(f.value); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  moodFilter === f.value ? "bg-brand text-white border-brand" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </FadeIn>

      {/* Entries */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 animate-pulse">
          {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-gray-100 rounded-2xl" />)}
        </div>
      ) : entries.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {entries.map((entry) => (
              <HoverLift key={entry.id}>
                <Link href={`/memory/${entry.id}`} className="block">
                  <div className="bg-white p-4 lg:p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col relative overflow-hidden h-full hover:border-gray-200 transition-all duration-200">
                    <div className="absolute top-4 right-4 text-2xl">
                      {moodEmoji[entry.mood.toLowerCase()] || "😊"}
                    </div>
                    <div className="text-xs text-gray-400 font-medium mb-1">
                      {new Date(entry.entryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-2 pr-8">
                      {entry.title || entry.content.substring(0, 40) + "..."}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-4">
                      {entry.content.length > 100 ? entry.content.substring(0, 100) + "..." : entry.content}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {entry.tags.slice(0, 3).map((tag) => (
                        <span key={tag.id} className="px-2.5 py-1 bg-brand-light/50 text-brand text-[10px] font-bold rounded-full tracking-wider uppercase">
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </HoverLift>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-4 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 px-4">
          <div className="w-20 h-20 bg-brand-light/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-brand/60" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {search || moodFilter ? "No entries found" : "No entries yet"}
          </h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            {search || moodFilter ? "Try adjusting your search or filters." : "Start capturing your journey. Create your first diary entry!"}
          </p>
          {!search && !moodFilter && (
            <Link href="/memory/new" className="inline-flex items-center space-x-2 px-6 py-3 bg-brand hover:bg-brand-dark text-white rounded-xl font-semibold shadow-md shadow-brand/20 transition-all">
              <Plus className="w-5 h-5" />
              <span>Create First Entry</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
