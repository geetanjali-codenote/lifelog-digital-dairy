"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, MoreHorizontal, Calendar, Sparkles, Heart, Wallet, Image as ImageIcon, Edit3, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import toast from "react-hot-toast";

interface TransactionData {
  id: string;
  type: "income" | "expense";
  amount: number;
  title: string;
  description: string | null;
  category: string | null;
}

interface MemoryDetail {
  id: string;
  title: string | null;
  content: string;
  mood: string;
  entryDate: string;
  highlight: string | null;
  gratitude: string | null;
  expense: number | null;
  createdAt: string;
  tags: { id: string; name: string; color: string | null }[];
  attachments: { id: string; fileUrl: string }[];
  transactions: TransactionData[];
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

function getMoodLabel(mood: string) {
  return "Feeling " + mood.charAt(0).toUpperCase() + mood.slice(1);
}

export default function MemoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [memory, setMemory] = useState<MemoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/memories/${params.id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Not found");
          return res.json();
        })
        .then((data) => setMemory(data))
        .catch(() => setMemory(null))
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  const handleDelete = async () => {
    setDeleting(true);
    const loadingToast = toast.loading("Deleting memory...");
    try {
      const res = await fetch(`/api/memories/${params.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Memory deleted", { id: loadingToast });
        router.push("/dashboard");
      } else {
        throw new Error("Failed to delete memory");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "An error occurred", { id: loadingToast });
    }
    setDeleting(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-full pb-8 px-4 pt-6 w-full lg:px-8 lg:pt-10 lg:max-w-5xl lg:mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-100 rounded w-32" />
          <div className="h-8 bg-gray-100 rounded w-3/4" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
            <div className="h-4 bg-gray-100 rounded w-4/5" />
          </div>
        </div>
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-4 pt-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Memory Not Found</h2>
        <p className="text-gray-500 mb-6">This memory doesn&apos;t exist or you don&apos;t have access to it.</p>
        <Link href="/dashboard" className="px-6 py-3 bg-brand text-white rounded-xl font-semibold hover:bg-brand-dark transition-colors">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const date = new Date(memory.entryDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const title = memory.title || `Your Reflection on ${date}`;

  return (
    <div className="flex flex-col min-h-full pb-8 px-4 pt-6 overflow-y-auto w-full relative lg:px-8 lg:pt-10 lg:max-w-5xl lg:mx-auto">
      {/* Mobile Top App Bar */}
      <div className="flex justify-between items-center mb-6 lg:hidden">
        <Link href="/dashboard" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <span className="font-bold text-gray-900 text-lg">Memory</span>
        <button className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors">
          <MoreHorizontal className="w-6 h-6 text-gray-900" />
        </button>
      </div>

      {/* Desktop Back */}
      <FadeIn className="hidden lg:flex items-center space-x-3 mb-8">
        <Link href="/dashboard" className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </FadeIn>

      <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-10">
        <div>
          <FadeIn delay={0.1}>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 leading-tight tracking-tight">
              {title}
            </h1>
          </FadeIn>

          {/* Mobile meta */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-8 text-sm font-medium text-gray-600 lg:hidden">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>{date}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xl">{getMoodEmoji(memory.mood)}</span>
              <span>{getMoodLabel(memory.mood)}</span>
            </div>
          </div>

          <FadeIn delay={0.2}>
            <div className="space-y-6 text-gray-700 leading-relaxed text-[15px] lg:text-base mb-10 lg:leading-7">
              {memory.content.split("\n").map((paragraph, i) => (
                paragraph.trim() ? <p key={i}>{paragraph}</p> : null
              ))}
            </div>
          </FadeIn>

          {memory.highlight && (
            <FadeIn delay={0.25}>
              <div className="bg-brand-light/40 rounded-[20px] p-6 mb-4 relative overflow-hidden border border-brand/5">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand"></div>
                <div className="flex items-center space-x-2 text-brand mb-3 font-bold tracking-widest text-[10px]">
                  <Sparkles className="w-4 h-4" />
                  <span>THE HIGHLIGHT</span>
                </div>
                <p className="italic text-gray-800 font-medium leading-relaxed">&ldquo;{memory.highlight}&rdquo;</p>
              </div>
            </FadeIn>
          )}

          {memory.gratitude && (
            <FadeIn delay={0.3}>
              <div className="bg-emerald-50/70 rounded-[20px] p-6 mb-8 border border-emerald-100/50 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-400"></div>
                <div className="flex items-center space-x-2 text-emerald-600 mb-3 font-bold tracking-widest text-[10px]">
                  <Heart className="w-4 h-4" fill="currentColor" />
                  <span>GRATITUDE</span>
                </div>
                <p className="text-gray-800 font-medium leading-relaxed">{memory.gratitude}</p>
              </div>
            </FadeIn>
          )}

          {memory.transactions && memory.transactions.length > 0 && (
            <FadeIn delay={0.32}>
              <div className="bg-gray-50/80 rounded-[20px] p-5 mb-8 border border-gray-100 lg:hidden">
                <div className="flex items-center space-x-2 text-gray-600 mb-3 font-bold tracking-widest text-[10px]">
                  <Wallet className="w-4 h-4" />
                  <span>TRANSACTIONS</span>
                </div>
                <div className="space-y-2">
                  {memory.transactions.map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${txn.type === "income" ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"}`}>
                          {txn.type === "income" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{txn.title}</p>
                          {txn.category && <p className="text-[10px] text-gray-400">{txn.category}</p>}
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${txn.type === "income" ? "text-emerald-500" : "text-red-500"}`}>
                        {txn.type === "income" ? "+" : "-"}${txn.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          {memory.attachments.length > 0 && (
            <FadeIn delay={0.35}>
              <div className="mb-8">
                <div className="flex items-center space-x-2 mb-4">
                  <ImageIcon className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-bold text-gray-900">Gallery</h2>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {memory.attachments.map((att) => (
                    <div key={att.id} className="w-full aspect-square rounded-2xl overflow-hidden shadow-sm">
                      <img src={att.fileUrl} alt="Attachment" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          {memory.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10 lg:hidden">
              {memory.tags.map((tag) => (
                <span key={tag.id} className="px-4 py-2 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">#{tag.name}</span>
              ))}
            </div>
          )}

          <FadeIn delay={0.4}>
            <div className="flex space-x-3 mb-10">
              <Link
                href={`/memory/${memory.id}/edit`}
                className="flex-1 bg-brand hover:bg-brand-dark text-white rounded-2xl py-4 flex items-center justify-center space-x-2 font-semibold shadow-md shadow-brand/20 transition-all active:scale-[0.98]"
              >
                <Edit3 className="w-5 h-5" />
                <span>Edit Memory</span>
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-16 bg-red-50 text-red-500 hover:bg-red-100 rounded-2xl flex items-center justify-center transition-colors active:scale-95"
              >
                <Trash2 className="w-6 h-6" />
              </button>
            </div>
          </FadeIn>
        </div>

        {/* Desktop sidebar */}
        <FadeIn delay={0.2} direction="right" className="hidden lg:block">
          <div className="sticky top-10 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-xs font-bold text-gray-400 tracking-wider mb-4">DETAILS</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Date</p>
                    <p className="text-sm font-semibold text-gray-900">{date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center">
                    <span className="text-lg">{getMoodEmoji(memory.mood)}</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Mood</p>
                    <p className="text-sm font-semibold text-gray-900">{getMoodLabel(memory.mood)}</p>
                  </div>
                </div>
              </div>
            </div>

            {memory.transactions && memory.transactions.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-xs font-bold text-gray-400 tracking-wider mb-3">TRANSACTIONS</h3>
                <div className="space-y-2.5">
                  {memory.transactions.map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${txn.type === "income" ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"}`}>
                          {txn.type === "income" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-sm text-gray-700 font-medium">{txn.title}</span>
                      </div>
                      <span className={`text-sm font-bold ${txn.type === "income" ? "text-emerald-500" : "text-red-500"}`}>
                        {txn.type === "income" ? "+" : "-"}${txn.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {memory.tags.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-xs font-bold text-gray-400 tracking-wider mb-4">TAGS</h3>
                <div className="flex flex-wrap gap-2">
                  {memory.tags.map((tag) => (
                    <span key={tag.id} className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs font-medium rounded-full border border-gray-100">#{tag.name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </FadeIn>
      </div>

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white dark:bg-surface rounded-2xl p-6 w-full max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Memory?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex space-x-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 disabled:opacity-50">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
