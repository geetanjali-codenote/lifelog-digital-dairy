"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, Filter, Sparkles, BarChart2, MapPin, Smile, CalendarDays, Star, PlayCircle, Image as ImageIcon, Video, Loader2 } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import toast from "react-hot-toast";
import { RecapModal } from "@/components/RecapModal";

interface AnalyticsData {
  totalMemories: number;
  mostActiveMonth: string;
  topMood: string;
  topPlace: string;
  monthlyBreakdown: { month: string; count: number }[];
  moodSummary: { mood: string; emoji: string; count: number }[];
}

export default function HighlightAnalyticsPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [dateRange, setDateRange] = useState("All Time");
  const [mediaType, setMediaType] = useState("All");
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const fetchAnalytics = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();

    if (dateRange !== "All Time" && dateRange !== "Custom Range...") {
      const now = new Date();
      if (dateRange === "This Year (2025)") {
        params.set("startDate", new Date(now.getFullYear(), 0, 1).toISOString());
      } else if (dateRange === "Last Year (2024)") {
        params.set("startDate", new Date(now.getFullYear() - 1, 0, 1).toISOString());
        params.set("endDate", new Date(now.getFullYear() - 1, 11, 31).toISOString());
      } else if (dateRange === "This Month") {
        params.set("startDate", new Date(now.getFullYear(), now.getMonth(), 1).toISOString());
      } else if (dateRange === "Last 30 Days") {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        params.set("startDate", d.toISOString());
      }
    }

    if (selectedMoods.length > 0) {
      params.set("mood", selectedMoods[0]);
    }

    if (favoritesOnly) {
      params.set("favorite", "true");
    }

    fetch(`/api/analytics/highlight?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch analytics");
        return res.json();
      })
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load highlights");
        setLoading(false);
      });
  }, [dateRange, selectedMoods, favoritesOnly]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-full h-[80vh] items-center justify-center w-full">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
        <p className="mt-4 text-gray-500 font-medium">Loading highlights...</p>
      </div>
    );
  }

  if (!analytics) return null;

  const mockAnalytics = analytics;

  // A helper for the mini bar chart
  const maxMonthCount = Math.max(...mockAnalytics.monthlyBreakdown.map(m => m.count), 1);

  return (
    <div className="flex flex-col min-h-full pb-6 px-4 pt-6 overflow-y-auto w-full lg:px-8 lg:pt-10 lg:max-w-6xl lg:mx-auto">
      {/* Mobile Top App Bar */}
      <div className="flex justify-between items-center mb-6 h-8 lg:hidden">
        <Link href="/dashboard" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <span className="font-bold text-gray-900 text-lg">Highlight</span>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2 -mr-2 rounded-full transition-colors ${showFilters ? "bg-brand/10 text-brand" : "hover:bg-gray-100 text-gray-900"}`}
        >
          <Filter className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop Header */}
      <FadeIn className="hidden lg:flex justify-between items-center mb-8">
        <div>
          <h1 className="flex items-center space-x-3 text-3xl font-bold text-gray-900 tracking-tight mb-2">
            <Sparkles className="w-8 h-8 text-brand" />
            <span>Memory Highlights & Analytics</span>
          </h1>
          <p className="text-gray-500 text-sm">Deep insights into your digital diary journey.</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold transition-colors ${showFilters ? "bg-brand text-white shadow-md shadow-brand/20" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"}`}
        >
          <Filter className="w-5 h-5" />
          <span>Advanced Filters</span>
        </button>
      </FadeIn>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Advanced Filter Drawer / Sidebar */}
        {showFilters && (
          <FadeIn className="w-full lg:w-72 shrink-0 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-5">Filter Highlights</h3>

              <div className="space-y-5">
                {/* Date Range */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-2 block">Date Range</label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                  >
                    <option>All Time</option>
                    <option>This Year (2025)</option>
                    <option>Last Year (2024)</option>
                    <option>This Month</option>
                    <option>Last 30 Days</option>
                    <option>Custom Range...</option>
                  </select>
                </div>

                {/* Media Type */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-2 block">Media Type</label>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setMediaType(mediaType === "Images" ? "All" : "Images")}
                      className={`flex-1 flex items-center justify-center space-x-1 py-2 border rounded-lg text-sm font-medium ${mediaType === "Images" ? "bg-brand/10 text-brand border-brand/20" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"}`}
                    >
                      <ImageIcon className="w-4 h-4" /> <span>Images</span>
                    </button>
                    <button
                      onClick={() => setMediaType(mediaType === "Video" ? "All" : "Video")}
                      className={`flex-1 flex items-center justify-center space-x-1 py-2 border rounded-lg text-sm font-medium ${mediaType === "Video" ? "bg-brand/10 text-brand border-brand/20" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"}`}
                    >
                      <Video className="w-4 h-4" /> <span>Video</span>
                    </button>
                  </div>
                </div>

                {/* Mood */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-2 block">Moods</label>
                  <div className="flex flex-wrap gap-2">
                    {mockAnalytics.moodSummary.map(m => {
                      const isSelected = selectedMoods.includes(m.mood);
                      return (
                        <button
                          key={m.mood}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedMoods(selectedMoods.filter(mood => mood !== m.mood));
                            } else {
                              setSelectedMoods([m.mood]); // only one for now
                            }
                          }}
                          className={`px-2.5 py-1.5 border rounded-lg text-sm transition-colors ${isSelected ? "bg-brand text-white border-brand" : "bg-gray-50 border-gray-200 hover:bg-gray-100"}`}
                        >
                          {m.emoji}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-2 block">Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {["Personal", "Travel", "Work", "Family", "Festival"].map(cat => {
                      const isSelected = selectedCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedCategories(selectedCategories.filter(c => c !== cat));
                            } else {
                              setSelectedCategories([...selectedCategories, cat]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border ${isSelected ? "bg-brand text-white border-brand" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Extras */}
                <div className="pt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded text-brand focus:ring-brand"
                      checked={favoritesOnly}
                      onChange={(e) => setFavoritesOnly(e.target.checked)}
                    />
                    <span className="text-sm font-semibold text-gray-700 flex items-center"><Star className="w-4 h-4 text-yellow-400 mr-1 fill-yellow-400" /> Favorites Only</span>
                  </label>
                </div>
              </div>

              <button className="w-full mt-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-semibold shadow-md transition-all">
                Apply Filters
              </button>
            </div>
          </FadeIn>
        )}

        {/* Main Analytics Area */}
        <div className="flex-1 space-y-6">

          {/* Top Recap Banner */}
          <FadeIn delay={0.1}>
            <div className="relative overflow-hidden bg-gradient-to-br from-brand to-violet-600 rounded-3xl p-6 lg:p-8 text-white shadow-lg shadow-brand/20">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Relive Your Year</h2>
                  <p className="text-brand-light/80 text-sm max-w-sm mb-4">You've logged {mockAnalytics.totalMemories} memories this year. Watch a personalized recap of your best moments in 2025.</p>
                  <button
                    onClick={() => setShowRecap(true)}
                    className="inline-flex items-center space-x-2 bg-white text-brand px-5 py-2.5 rounded-full font-bold shadow-md hover:scale-105 transition-transform"
                  >
                    <PlayCircle className="w-5 h-5 fill-brand text-white" />
                    <span>Play Recap</span>
                  </button>
                </div>
                {/* Mockup visual of a polaroid/video stack */}
                <div className="hidden md:flex relative w-40 h-32">
                  <div className="absolute right-4 top-2 w-28 h-28 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 rotate-6 shadow-xl" />
                  <div className="absolute right-8 top-0 w-28 h-28 bg-white/40 backdrop-blur-md rounded-xl border border-white/50 -rotate-3 shadow-xl" />
                  <div className="absolute right-12 mt-2 w-28 h-28 bg-white rounded-xl border border-white shadow-xl overflow-hidden flex items-center justify-center">
                    <img src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=300&q=80" alt="Recap cover" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Quick Stats Grid */}
          <FadeIn delay={0.2} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-3">
                <BarChart2 className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Memories</p>
              <h3 className="text-2xl font-bold text-gray-900">{mockAnalytics.totalMemories}</h3>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center mb-3">
                <CalendarDays className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Most Active</p>
              <h3 className="text-2xl font-bold text-gray-900">{mockAnalytics.mostActiveMonth}</h3>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center mb-3">
                <Smile className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Top Mood</p>
              <h3 className="text-2xl font-bold text-gray-900 capitalize flex items-center">
                {mockAnalytics.topMood} <span className="ml-2">😊</span>
              </h3>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
              <div className="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Top Place</p>
              <h3 className="text-lg font-bold text-gray-900 truncate" title={mockAnalytics.topPlace}>{mockAnalytics.topPlace}</h3>
            </div>
          </FadeIn>

          {/* Detailed Analytics Grid */}
          <FadeIn delay={0.3} className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
            {/* Monthly Activity Chart */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm border-t-4 border-t-brand">
              <h3 className="font-bold text-gray-900 mb-6">Monthly Breakdown</h3>
              <div className="flex items-end space-x-2 h-48">
                {mockAnalytics.monthlyBreakdown.map((item) => (
                  <div key={item.month} className="flex-1 flex flex-col items-center justify-end relative group">
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 bg-gray-900 text-white text-[10px] py-1 px-2 rounded font-bold transition-opacity whitespace-nowrap z-10 pointer-events-none">
                      {item.count} memories
                    </div>
                    {/* Bar */}
                    <div
                      className="w-full bg-brand/20 group-hover:bg-brand rounded-t-lg transition-all duration-300"
                      style={{ height: `${(item.count / maxMonthCount) * 100}%` }}
                    />
                    {/* Label */}
                    <span className="text-[10px] font-semibold text-gray-400 mt-2">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mood Summary List */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm border-t-4 border-t-orange-400 flex flex-col">
              <h3 className="font-bold text-gray-900 mb-6">Mood-wise Summary</h3>
              <div className="space-y-4 flex-1">
                {mockAnalytics.moodSummary.map((item) => {
                  const percentage = Math.round((item.count / mockAnalytics.totalMemories) * 100);
                  return (
                    <div key={item.mood} className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-xl shrink-0">
                        {item.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-semibold capitalize text-gray-700">{item.mood}</span>
                          <span className="text-xs font-bold text-gray-500">{item.count} <span className="font-normal text-gray-400">({percentage}%)</span></span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-400 rounded-full" style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </FadeIn>

        </div>
      </div>

      {showRecap && (
        <RecapModal
          onClose={() => setShowRecap(false)}
          filters={{ mood: selectedMoods[0] }}
        />
      )}
    </div>
  );
}
