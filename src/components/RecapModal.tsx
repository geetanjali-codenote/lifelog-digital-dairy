"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, Play, Pause, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MediaItem {
  id: string;
  fileUrl: string;
  entry: {
    title: string | null;
    entryDate: string;
    mood: string;
  };
}

interface RecapModalProps {
  onClose: () => void;
  filters: {
    startDate?: string;
    endDate?: string;
    mood?: string;
    favorite?: string;
  };
}

const DURATION_PER_SLIDE = 4000;

function isVideoUrl(url: string) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

export function RecapModal({ onClose, filters }: RecapModalProps) {
  const [slides, setSlides] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Fetch random images using the gallery endpoint
  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams({ limit: "50" });
        if (filters.mood) params.set("mood", filters.mood);
        // Note: The gallery endpoint expects date filter on 'date'.
        // For now, we'll just fetch a broad set and let the user see a random mix.
        const res = await fetch(`/api/gallery?${params}`);
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();

        // Pick up to 15 random items
        const all: MediaItem[] = data.media || [];
        const shuffled = [...all].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 15);

        setSlides(selected);
      } catch (e) {
        console.error("Recap load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filters]);

  useEffect(() => {
    if (loading || slides.length === 0 || !isPlaying) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, DURATION_PER_SLIDE);
    return () => clearInterval(timer);
  }, [loading, slides.length, isPlaying, currentIndex]); // depend on currentIndex to reset timer on manual navigation

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand mb-4" />
        <p>Curating your moments...</p>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <h2 className="text-2xl font-bold mb-4">No Memories Found</h2>
          <p className="text-gray-400 mb-8">We couldn't find any photos or videos matching your current filters.</p>
          <button onClick={onClose} className="px-6 py-2 bg-brand text-white rounded-full font-bold">Close Recap</button>
        </div>
      </div>
    );
  }

  const currentSlide = slides[currentIndex];

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col">
      {/* Progress Bars */}
      <div className="absolute top-0 left-0 right-0 z-50 flex space-x-1 p-4 bg-gradient-to-b from-black/80 to-transparent">
        {slides.map((_, i) => (
          <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white"
              initial={{ width: i < currentIndex ? "100%" : "0%" }}
              animate={(i === currentIndex && isPlaying) ? { width: "100%" } : { width: i < currentIndex ? "100%" : "0%" }}
              transition={{ duration: (i === currentIndex && isPlaying) ? DURATION_PER_SLIDE / 1000 : 0, ease: "linear" }}
            />
          </div>
        ))}
      </div>

      {/* Top Controls */}
      <div className="absolute top-8 left-0 right-0 z-50 flex items-center justify-between p-4 mix-blend-difference">
        <div className="flex items-center space-x-3">
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
          </button>
        </div>
        <div className="text-right">
          <p className="font-bold text-sm tracking-widest uppercase opacity-80">{new Date(currentSlide.entry.entryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</p>
        </div>
      </div>

      {/* Media Content */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center" onClick={() => setIsPlaying(!isPlaying)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center p-4 md:p-12"
          >
            {isVideoUrl(currentSlide.fileUrl) ? (
              <video src={currentSlide.fileUrl} autoPlay muted loop className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain pointer-events-none" />
            ) : (
              <img src={currentSlide.fileUrl} alt="memory" className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain pointer-events-none" />
            )}

            {/* Caption Overlay */}
            <div className="absolute bottom-10 left-0 right-0 flex justify-center z-20 pointer-events-none">
              <div className="bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 flex flex-col items-center shadow-lg">
                <span className="font-semibold text-white/90">{currentSlide.entry.title || "Untitled Memory"}</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Areas (Left/Right invisible clickable zones) */}
      <div className="absolute inset-y-0 left-0 w-1/4 z-40 hidden md:flex items-center justify-start p-4 hover:opacity-100 opacity-0 transition-opacity">
        <button onClick={goToPrev} className="p-3 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors backdrop-blur-sm">
          <ChevronLeft className="w-8 h-8" />
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 w-1/4 z-40 hidden md:flex items-center justify-end p-4 hover:opacity-100 opacity-0 transition-opacity">
        <button onClick={goToNext} className="p-3 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors backdrop-blur-sm">
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      {/* Mobile touch targets */}
      <div className="absolute inset-y-0 left-0 w-1/3 z-30 md:hidden" onClick={goToPrev} />
      <div className="absolute inset-y-0 right-0 w-1/3 z-30 md:hidden" onClick={goToNext} />
    </div>
  );
}
