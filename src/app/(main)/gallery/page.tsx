"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft, Image as ImageIcon, LayoutGrid, Columns, Plus, X,
  CalendarDays, Tag as TagIcon, Loader2, UploadCloud, Trash2
} from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { StaggeredList, StaggeredItem } from "@/components/motion/StaggeredList";
import toast from "react-hot-toast";

interface MediaItem {
  id: string;
  fileUrl: string;
  createdAt: string;
  entry: {
    id: string;
    title: string | null;
    entryDate: string;
    mood: string;
    tags: { id: string; name: string; color: string | null }[];
  };
}

interface FilterData {
  moods: string[];
  tags: { id: string; name: string }[];
  months: string[];
}

interface TagData {
  id: string;
  name: string;
  color: string | null;
}

const moodEmoji: Record<string, string> = {
  happy: "😊", joyful: "😊", excited: "🤩", peaceful: "😌", calm: "😌",
  grateful: "🙏", loved: "🥰", productive: "💪", creative: "🎨",
  sad: "😢", anxious: "😰", stressed: "😫", angry: "😤",
  tired: "😴", neutral: "😐", reflective: "🤔", hopeful: "🌟",
};

const quickMoods = [
  { value: "happy", emoji: "😊" }, { value: "excited", emoji: "🤩" },
  { value: "peaceful", emoji: "😌" }, { value: "grateful", emoji: "🙏" },
  { value: "loved", emoji: "🥰" }, { value: "creative", emoji: "🎨" },
  { value: "reflective", emoji: "🤔" }, { value: "neutral", emoji: "😐" },
];

function formatMonth(monthStr: string) {
  const [year, month] = monthStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function isVideoUrl(url: string) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

export default function GalleryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [filters, setFilters] = useState<FilterData>({ moods: [], tags: [], months: [] });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"masonry" | "grid">("masonry");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Active filters
  const [moodFilter, setMoodFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  // Lightbox
  const [lightboxItem, setLightboxItem] = useState<MediaItem | null>(null);

  // Upload modal
  const [showUpload, setShowUpload] = useState(false);
  const [uploadUrls, setUploadUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadMood, setUploadMood] = useState("happy");
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split("T")[0]);
  const [uploadTagIds, setUploadTagIds] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<TagData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "30" });
    if (moodFilter) params.set("mood", moodFilter);
    if (tagFilter) params.set("tag", tagFilter);
    if (monthFilter) params.set("month", monthFilter);

    try {
      const res = await fetch(`/api/gallery?${params}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      setMedia(data.media || []);
      setFilters(data.filters || { moods: [], tags: [], months: [] });
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch {
      // ignore
    }
    setLoading(false);
  }, [page, moodFilter, tagFilter, monthFilter]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  useEffect(() => {
    setPage(1);
  }, [moodFilter, tagFilter, monthFilter]);

  // Fetch tags for upload modal
  useEffect(() => {
    fetch("/api/tags").then((r) => r.json()).then(setAllTags).catch(() => {});
  }, []);

  const clearFilters = () => {
    setMoodFilter("");
    setTagFilter("");
    setMonthFilter("");
    setPage(1);
  };

  const hasFilters = moodFilter || tagFilter || monthFilter;

  // Handle file selection for upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(e.target.files).forEach((file) => formData.append("files", file));
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Upload failed");
        return;
      }
      const { urls } = await res.json();
      setUploadUrls((prev) => [...prev, ...urls]);
    } catch {
      toast.error("Failed to upload files");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeUploadUrl = (index: number) => {
    setUploadUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveUpload = async () => {
    if (uploadUrls.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/gallery/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urls: uploadUrls,
          mood: uploadMood,
          entryDate: uploadDate,
          tagIds: uploadTagIds.length > 0 ? uploadTagIds : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to save");
        setSaving(false);
        return;
      }
      toast.success(`${uploadUrls.length} file${uploadUrls.length > 1 ? "s" : ""} added to gallery!`);
      setShowUpload(false);
      setUploadUrls([]);
      setUploadMood("happy");
      setUploadDate(new Date().toISOString().split("T")[0]);
      setUploadTagIds([]);
      fetchGallery();
    } catch {
      toast.error("An error occurred");
    }
    setSaving(false);
  };

  const openUploadModal = () => {
    setUploadUrls([]);
    setUploadMood("happy");
    setUploadDate(new Date().toISOString().split("T")[0]);
    setUploadTagIds([]);
    setShowUpload(true);
  };

  // Group media by month
  const grouped = media.reduce<Record<string, MediaItem[]>>((acc, item) => {
    const d = item.entry.entryDate;
    const key = d.substring(0, 7);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
  const groupedKeys = Object.keys(grouped).sort().reverse();

  return (
    <div className="flex flex-col min-h-full pb-6 px-4 pt-6 overflow-y-auto w-full lg:px-8 lg:pt-10 lg:max-w-6xl lg:mx-auto">
      {/* Mobile Top App Bar */}
      <div className="flex justify-between items-center mb-6 h-8 lg:hidden">
        <Link href="/dashboard" className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-gray-900 dark:text-white" />
        </Link>
        <span className="font-bold text-gray-900 dark:text-white text-lg">My Photos</span>
        <button onClick={openUploadModal} className="p-2 -mr-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors">
          <UploadCloud className="w-5 h-5 text-brand" />
        </button>
      </div>

      {/* Desktop Header */}
      <FadeIn className="hidden lg:flex justify-between items-end mb-8">
        <div>
          <h1 className="flex items-center space-x-3 text-3xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
            <ImageIcon className="w-8 h-8 text-brand" />
            <span>My Photos</span>
          </h1>
          <p className="text-gray-500 text-sm">
            {total > 0 ? `${total} photos & videos from your memories` : "All your uploaded images and videos in one place."}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 dark:bg-white/10 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("masonry")}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === "masonry" ? "bg-white dark:bg-white/20 text-brand shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
            >
              <Columns className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-white dark:bg-white/20 text-brand shadow-sm" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={openUploadModal}
            className="flex items-center space-x-2 bg-brand text-white px-4 py-2.5 rounded-xl font-semibold shadow-md shadow-brand/20 hover:bg-brand-dark transition-all"
          >
            <UploadCloud className="w-5 h-5" />
            <span>Upload</span>
          </button>
        </div>
      </FadeIn>

      {/* Mobile view toggle */}
      <div className="flex items-center justify-between mb-4 lg:hidden">
        <div className="flex bg-gray-100 dark:bg-white/10 p-1 rounded-xl">
          <button
            onClick={() => setViewMode("masonry")}
            className={`p-1.5 rounded-lg transition-colors ${viewMode === "masonry" ? "bg-white dark:bg-white/20 text-brand shadow-sm" : "text-gray-500"}`}
          >
            <Columns className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-white dark:bg-white/20 text-brand shadow-sm" : "text-gray-500"}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
        <span className="text-xs text-gray-400">{total} items</span>
      </div>

      {/* Filter Bar */}
      {(filters.moods.length > 0 || filters.tags.length > 0 || filters.months.length > 0) && (
        <FadeIn className="mb-6 space-y-3">
          {filters.months.length > 0 && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-1">
              <CalendarDays className="w-4 h-4 text-gray-400 shrink-0" />
              <button
                onClick={() => setMonthFilter("")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all ${!monthFilter ? "bg-brand text-white border-brand" : "bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10"}`}
              >
                All Time
              </button>
              {filters.months.map((m) => (
                <button
                  key={m}
                  onClick={() => setMonthFilter(monthFilter === m ? "" : m)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all ${monthFilter === m ? "bg-brand text-white border-brand" : "bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10"}`}
                >
                  {formatMonth(m)}
                </button>
              ))}
            </div>
          )}
          {filters.moods.length > 0 && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-1">
              <span className="text-sm shrink-0">😊</span>
              {filters.moods.map((mood) => (
                <button
                  key={mood}
                  onClick={() => setMoodFilter(moodFilter === mood ? "" : mood)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all ${moodFilter === mood ? "bg-purple-500 text-white border-purple-500" : "bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10"}`}
                >
                  {moodEmoji[mood] || "😊"} {mood}
                </button>
              ))}
            </div>
          )}
          {filters.tags.length > 0 && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-1">
              <TagIcon className="w-4 h-4 text-gray-400 shrink-0" />
              {filters.tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setTagFilter(tagFilter === tag.name ? "" : tag.name)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all ${tagFilter === tag.name ? "bg-brand text-white border-brand" : "bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10"}`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center space-x-1 text-xs text-brand font-medium hover:underline">
              <X className="w-3 h-3" />
              <span>Clear all filters</span>
            </button>
          )}
        </FadeIn>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand animate-spin mb-4" />
          <p className="text-gray-400 text-sm">Loading your photos...</p>
        </div>
      ) : media.length === 0 ? (
        <FadeIn>
          <div className="text-center py-20 px-4">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {hasFilters ? "No media matches your filters" : "No photos yet"}
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              {hasFilters
                ? "Try removing some filters to see more results."
                : "Upload your favourite photos and videos here!"}
            </p>
            {!hasFilters && (
              <button
                onClick={openUploadModal}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-brand hover:bg-brand-dark text-white rounded-xl font-semibold shadow-md shadow-brand/20 transition-all"
              >
                <UploadCloud className="w-5 h-5" />
                <span>Upload Photos</span>
              </button>
            )}
          </div>
        </FadeIn>
      ) : (
        <div className="space-y-8">
          {groupedKeys.map((monthKey) => (
            <div key={monthKey}>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 px-1">
                {formatMonth(monthKey)}
              </h2>

              {viewMode === "masonry" ? (
                <StaggeredList className="columns-2 lg:columns-3 xl:columns-4 gap-3 space-y-3" staggerDelay={0.04}>
                  {grouped[monthKey].map((item) => (
                    <StaggeredItem key={item.id} className="break-inside-avoid">
                      <button
                        onClick={() => setLightboxItem(item)}
                        className="group block relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer bg-gray-100 dark:bg-white/5 w-full min-h-[140px]"
                      >
                        {isVideoUrl(item.fileUrl) ? (
                          <video src={item.fileUrl} className="w-full h-auto object-cover" muted preload="metadata" />
                        ) : (
                          <img src={item.fileUrl} alt={item.entry.title || "Memory"} className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                          <p className="text-white text-sm font-bold truncate mb-1">
                            {item.entry.title || new Date(item.entry.entryDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                          <div className="flex items-center space-x-2 text-[10px] text-white/80">
                            <span>{moodEmoji[item.entry.mood] || "😊"} {item.entry.mood}</span>
                            {item.entry.tags.slice(0, 2).map((t) => (
                              <span key={t.id} className="bg-white/20 px-1.5 py-0.5 rounded backdrop-blur-sm">{t.name}</span>
                            ))}
                          </div>
                        </div>
                      </button>
                    </StaggeredItem>
                  ))}
                </StaggeredList>
              ) : (
                <StaggeredList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3" staggerDelay={0.04}>
                  {grouped[monthKey].map((item) => (
                    <StaggeredItem key={item.id}>
                      <button
                        onClick={() => setLightboxItem(item)}
                        className="group block relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer aspect-square bg-gray-100 dark:bg-white/5 w-full"
                      >
                        {isVideoUrl(item.fileUrl) ? (
                          <video src={item.fileUrl} className="w-full h-full object-cover" muted preload="metadata" />
                        ) : (
                          <img src={item.fileUrl} alt={item.entry.title || "Memory"} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <p className="text-white text-xs font-bold truncate">{item.entry.title || "Untitled"}</p>
                          <span className="text-[10px] text-white/70">{moodEmoji[item.entry.mood] || "😊"} {item.entry.mood}</span>
                        </div>
                      </button>
                    </StaggeredItem>
                  ))}
                </StaggeredList>
              )}
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-4 pt-4">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                Previous
              </button>
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightboxItem && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxItem(null)}>
          <button onClick={() => setLightboxItem(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10">
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[85vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            {isVideoUrl(lightboxItem.fileUrl) ? (
              <video src={lightboxItem.fileUrl} controls className="max-w-full max-h-[70vh] rounded-xl" />
            ) : (
              <img src={lightboxItem.fileUrl} alt={lightboxItem.entry.title || "Memory"} className="max-w-full max-h-[70vh] rounded-xl object-contain" />
            )}
            <div className="mt-4 text-center text-white">
              <h3 className="text-lg font-bold mb-1">{lightboxItem.entry.title || "Untitled Memory"}</h3>
              <div className="flex items-center justify-center space-x-3 text-sm text-white/70">
                <span>
                  {new Date(lightboxItem.entry.entryDate).toLocaleDateString("en-US", {
                    weekday: "short", month: "long", day: "numeric", year: "numeric",
                  })}
                </span>
                <span>{moodEmoji[lightboxItem.entry.mood] || "😊"} {lightboxItem.entry.mood}</span>
              </div>
              {lightboxItem.entry.tags.length > 0 && (
                <div className="flex items-center justify-center space-x-2 mt-2">
                  {lightboxItem.entry.tags.map((t) => (
                    <span key={t.id} className="px-2.5 py-1 bg-white/10 text-white/80 text-xs rounded-full">{t.name}</span>
                  ))}
                </div>
              )}
              <Link href={`/memory/${lightboxItem.entry.id}`} className="inline-block mt-3 text-brand text-sm font-semibold hover:underline">
                View Memory
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowUpload(false)}>
          <FadeIn className="bg-white dark:bg-surface rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-2xl" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/10">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <UploadCloud className="w-5 h-5 text-brand" />
                <span>Upload Photos & Videos</span>
              </h2>
              <button onClick={() => setShowUpload(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* File Picker Area */}
              <div
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${uploading ? "border-brand/30 bg-brand/5" : "border-gray-200 dark:border-white/10 hover:border-brand/50 bg-gray-50 dark:bg-white/5"}`}
              >
                <input ref={fileInputRef} type="file" multiple accept="image/*,video/mp4,video/webm,video/quicktime" onChange={handleFileSelect} className="hidden" disabled={uploading} />
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-brand animate-spin mb-3" />
                ) : (
                  <UploadCloud className="w-8 h-8 text-gray-400 mb-3" />
                )}
                <p className="text-gray-900 dark:text-white font-semibold text-sm mb-1">
                  {uploading ? "Uploading..." : "Click to select files"}
                </p>
                <p className="text-gray-400 text-xs">JPG, PNG, GIF, MP4, WebM (max 10MB each)</p>
              </div>

              {/* Preview */}
              {uploadUrls.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {uploadUrls.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                      {isVideoUrl(url) ? (
                        <video src={url} className="w-full h-full object-cover" muted preload="metadata" />
                      ) : (
                        <img src={url} alt="preview" className="w-full h-full object-cover" />
                      )}
                      <button
                        onClick={() => removeUploadUrl(i)}
                        className="absolute top-1.5 right-1.5 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Mood */}
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-2">Mood</label>
                <div className="flex flex-wrap gap-2">
                  {quickMoods.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setUploadMood(m.value)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${uploadMood === m.value ? "bg-brand text-white border-brand" : "bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10"}`}
                    >
                      <span>{m.emoji}</span>
                      <span className="capitalize">{m.value}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-2">Date</label>
                <input
                  type="date"
                  value={uploadDate}
                  onChange={(e) => setUploadDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-gray-900 dark:text-white"
                />
              </div>

              {/* Tags */}
              {allTags.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() =>
                          setUploadTagIds((prev) =>
                            prev.includes(tag.id) ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
                          )
                        }
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${uploadTagIds.includes(tag.id) ? "bg-brand text-white border-brand" : "bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10"}`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-100 dark:border-white/10 flex space-x-3">
              <button onClick={() => setShowUpload(false)}
                className="flex-1 py-3 border border-gray-200 dark:border-white/10 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-sm">
                Cancel
              </button>
              <button
                onClick={handleSaveUpload}
                disabled={uploadUrls.length === 0 || saving}
                className="flex-1 py-3 bg-brand hover:bg-brand-dark text-white rounded-xl font-semibold shadow-md shadow-brand/20 transition-all disabled:opacity-50 text-sm"
              >
                {saving ? "Saving..." : `Save ${uploadUrls.length > 0 ? `(${uploadUrls.length})` : ""}`}
              </button>
            </div>
          </FadeIn>
        </div>
      )}

      {/* FAB - mobile */}
      <div className="fixed bottom-24 right-5 z-[60] lg:hidden">
        <button
          onClick={openUploadModal}
          className="w-14 h-14 bg-brand hover:bg-brand-dark text-white rounded-full flex items-center justify-center shadow-lg shadow-brand/30 transition-transform active:scale-95"
        >
          <UploadCloud className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
