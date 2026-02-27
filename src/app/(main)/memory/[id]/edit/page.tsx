"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, Sparkles, Heart, DollarSign, Tag, Plus, X,
  Image as ImageIcon, Trash2, TrendingUp, TrendingDown, AlertCircle, Smile
} from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { useCurrency } from "@/hooks/useCurrency";
import toast from "react-hot-toast";
import { EmojiPicker, getMoodFromEmoji, getEmojiForMood } from "@/components/EmojiPicker";

const quickMoods = [
  { value: "happy", emoji: "😊", label: "Happy" },
  { value: "excited", emoji: "🤩", label: "Excited" },
  { value: "peaceful", emoji: "😌", label: "Peaceful" },
  { value: "grateful", emoji: "🙏", label: "Grateful" },
  { value: "productive", emoji: "💪", label: "Productive" },
  { value: "creative", emoji: "🎨", label: "Creative" },
  { value: "neutral", emoji: "😐", label: "Neutral" },
  { value: "reflective", emoji: "🤔", label: "Reflective" },
  { value: "tired", emoji: "😴", label: "Tired" },
  { value: "sad", emoji: "😢", label: "Sad" },
  { value: "anxious", emoji: "😰", label: "Anxious" },
  { value: "stressed", emoji: "😫", label: "Stressed" },
];

const transactionCategories = [
  "Food & Dining", "Shopping", "Transport", "Bills & Utilities",
  "Entertainment", "Health", "Education", "Travel",
  "Salary", "Freelance", "Investment", "Gift", "Other"
];

interface TagData { id: string; name: string; color: string | null }

interface TransactionItem {
  id: string;
  type: "income" | "expense";
  amount: string;
  title: string;
  description: string;
  category: string;
}

function createEmptyTransaction(): TransactionItem {
  return {
    id: crypto.randomUUID(),
    type: "expense",
    amount: "",
    title: "",
    description: "",
    category: "",
  };
}

export default function EditEntryPage() {
  const router = useRouter();
  const params = useParams();
  const { symbol } = useCurrency();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tags, setTags] = useState<TagData[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showTextEmojiPicker, setShowTextEmojiPicker] = useState(false);
  const [moodEmoji, setMoodEmoji] = useState("😊");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    mood: "happy",
    entryDate: "",
    highlight: "",
    gratitude: "",
    tagIds: [] as string[],
    images: [] as string[],
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/memories/${params.id}`).then((r) => r.json()),
      fetch("/api/tags").then((r) => r.json()),
    ]).then(([entry, allTags]) => {
      const mood = entry.mood || "happy";
      setForm({
        title: entry.title || "",
        content: entry.content || "",
        mood,
        entryDate: entry.entryDate ? entry.entryDate.split("T")[0] : "",
        highlight: entry.highlight || "",
        gratitude: entry.gratitude || "",
        tagIds: entry.tags?.map((t: TagData) => t.id) || [],
        images: entry.attachments?.map((a: { fileUrl: string }) => a.fileUrl) || [],
      });
      setMoodEmoji(getEmojiForMood(mood));
      // Load existing transactions
      if (entry.transactions && entry.transactions.length > 0) {
        setTransactions(entry.transactions.map((t: { id: string; type: string; amount: number; title: string; description: string | null; category: string | null }) => ({
          id: t.id,
          type: t.type as "income" | "expense",
          amount: String(t.amount),
          title: t.title,
          description: t.description || "",
          category: t.category || "",
        })));
      }
      setTags(allTags);
    }).catch(() => setError("Failed to load entry"))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.content.trim()) {
      setError("Content is required.");
      return;
    }

    const validTransactions = transactions.filter(t => t.amount && t.title);
    for (const t of validTransactions) {
      if (parseFloat(t.amount) <= 0) {
        setError("Transaction amounts must be positive.");
        return;
      }
    }

    setSaving(true);
    const loadingToast = toast.loading("Updating memory...");
    try {
      const res = await fetch(`/api/memories/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title || undefined,
          content: form.content,
          mood: form.mood,
          entryDate: form.entryDate,
          highlight: form.highlight || null,
          gratitude: form.gratitude || null,
          tagIds: form.tagIds,
          images: form.images,
          transactions: validTransactions.map(t => ({
            type: t.type,
            amount: parseFloat(t.amount),
            title: t.title,
            description: t.description || undefined,
            category: t.category || undefined,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update entry");
      }

      toast.success("Memory updated successfully!", { id: loadingToast });
      router.push(`/memory/${params.id}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      toast.error(errorMessage, { id: loadingToast });
      setError(errorMessage);
    }
    setSaving(false);
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim() }),
      });
      if (res.ok) {
        const tag = await res.json();
        setTags((prev) => [...prev, tag]);
        setForm((prev) => ({ ...prev, tagIds: [...prev.tagIds, tag.id] }));
        setNewTagName("");
      }
    } catch { /* ignore */ }
  };

  const toggleTag = (tagId: string) => {
    setForm((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch {
      toast.error("Failed to upload images");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const addTransaction = () => {
    setTransactions(prev => [...prev, createEmptyTransaction()]);
  };

  const removeTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const updateTransaction = (id: string, field: keyof TransactionItem, value: string) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand placeholder:text-gray-400 text-gray-900 bg-white";

  if (loading) {
    return (
      <div className="flex flex-col min-h-full pb-8 px-4 pt-6 w-full lg:px-8 lg:pt-10 lg:max-w-5xl lg:mx-auto animate-pulse space-y-6">
        <div className="h-8 bg-gray-100 rounded w-32" />
        <div className="h-12 bg-gray-100 rounded-xl" />
        <div className="h-40 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full pb-8 px-4 pt-6 overflow-y-auto w-full lg:px-8 lg:pt-10 lg:max-w-5xl lg:mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6 lg:mb-8">
        <Link href={`/memory/${params.id}`} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <h1 className="flex-1 text-center text-lg lg:text-2xl font-bold text-gray-900 mr-8">Edit Memory</h1>
      </div>

      {error && (
        <div className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <FadeIn>
        <form onSubmit={handleSubmit}>
          <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-8">
            {/* Left Column */}
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Date <span className="text-red-400">*</span>
                  </label>
                  <input type="date" value={form.entryDate} onChange={(e) => setForm({ ...form, entryDate: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Title</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Give your memory a title..." className={inputClass} />
                </div>
              </div>

              {/* Mood */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-3">
                  What&apos;s your mood? Tell us! <span className="text-red-400">*</span>
                </label>

                <div className="flex items-center space-x-3 mb-3">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowMoodPicker(!showMoodPicker)}
                      className="w-14 h-14 flex items-center justify-center text-3xl bg-brand-light/50 border-2 border-brand rounded-2xl hover:scale-105 transition-all"
                    >
                      {moodEmoji}
                    </button>
                    {showMoodPicker && (
                      <div className="absolute top-16 left-0 z-50">
                        <EmojiPicker
                          onSelect={(emoji) => {
                            setMoodEmoji(emoji);
                            setForm((prev) => ({ ...prev, mood: getMoodFromEmoji(emoji) }));
                            setShowMoodPicker(false);
                          }}
                          onClose={() => setShowMoodPicker(false)}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 capitalize">{form.mood}</p>
                    <p className="text-xs text-gray-400">Tap emoji to change</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {quickMoods.map((mood) => (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => { setForm({ ...form, mood: mood.value }); setMoodEmoji(mood.emoji); }}
                      className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-full border text-xs font-medium transition-all ${form.mood === mood.value
                          ? "border-brand bg-brand-light/50 text-brand"
                          : "border-gray-100 text-gray-500 hover:border-gray-200"
                        }`}
                    >
                      <span>{mood.emoji}</span>
                      <span>{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  What&apos;s on your mind? <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <textarea ref={textareaRef} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} placeholder="Write about your day..."
                    className={`${inputClass} resize-none leading-relaxed pr-12`} />
                  <div className="absolute bottom-2 right-2">
                    <button
                      type="button"
                      onClick={() => setShowTextEmojiPicker(!showTextEmojiPicker)}
                      className={`p-2 rounded-lg transition-colors ${showTextEmojiPicker ? "bg-brand/10 text-brand" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"}`}
                      title="Insert emoji"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                    {showTextEmojiPicker && (
                      <div className="absolute bottom-10 right-0 z-50">
                        <EmojiPicker
                          onSelect={(emoji) => {
                            const ta = textareaRef.current;
                            if (ta) {
                              const start = ta.selectionStart;
                              const end = ta.selectionEnd;
                              const newContent = form.content.slice(0, start) + emoji + form.content.slice(end);
                              setForm((prev) => ({ ...prev, content: newContent }));
                              requestAnimationFrame(() => {
                                ta.focus();
                                const pos = start + emoji.length;
                                ta.setSelectionRange(pos, pos);
                              });
                            } else {
                              setForm((prev) => ({ ...prev, content: prev.content + emoji }));
                            }
                          }}
                          onClose={() => setShowTextEmojiPicker(false)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Highlight & Gratitude */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-4 h-4 text-brand" />
                    <label className="text-sm font-medium text-gray-700">Highlight</label>
                  </div>
                  <input type="text" value={form.highlight} onChange={(e) => setForm({ ...form, highlight: e.target.value })} placeholder="Best part of your day?" className={inputClass} />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Heart className="w-4 h-4 text-emerald-500" />
                    <label className="text-sm font-medium text-gray-700">Gratitude</label>
                  </div>
                  <input type="text" value={form.gratitude} onChange={(e) => setForm({ ...form, gratitude: e.target.value })} placeholder="What are you grateful for?" className={inputClass} />
                </div>
              </div>

              {/* Photos & Videos */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <ImageIcon className="w-4 h-4 text-gray-400" />
                  <label className="text-sm font-medium text-gray-700">Photos & Videos</label>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {form.images.map((src, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm bg-gray-100">
                      {/\.(mp4|webm|mov)$/i.test(src) ? (
                        <video src={src} className="w-full h-full object-cover" muted preload="metadata" />
                      ) : (
                        <img src={src} alt="Upload preview" className="w-full h-full object-cover" />
                      )}
                      <button type="button" onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className={`flex flex-col items-center justify-center aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-colors cursor-pointer text-gray-500 hover:text-gray-700 ${uploading ? "pointer-events-none opacity-50" : ""}`}>
                    {uploading ? (
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mb-1" />
                        <span className="text-xs font-medium">Add</span>
                      </>
                    )}
                    <input type="file" accept="image/*,video/mp4,video/webm,video/quicktime" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5 mt-5 lg:mt-0">
              {/* Transactions */}
              <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <DollarSign className="w-5 h-5 text-blue-500" />
                    <label className="text-sm font-bold">Transactions</label>
                  </div>
                  <button type="button" onClick={addTransaction}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-brand text-white text-xs font-semibold rounded-lg hover:bg-brand-dark transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {transactions.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-sm">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>No transactions</p>
                    <p className="text-xs mt-1">Click &quot;Add&quot; to track spending</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((txn) => (
                      <div key={txn.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex bg-gray-100 p-0.5 rounded-lg">
                            <button type="button" onClick={() => updateTransaction(txn.id, "type", "expense")}
                              className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${txn.type === "expense" ? "bg-white text-red-500 shadow-sm" : "text-gray-400"}`}>
                              <TrendingDown className="w-3 h-3" /><span>Expense</span>
                            </button>
                            <button type="button" onClick={() => updateTransaction(txn.id, "type", "income")}
                              className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${txn.type === "income" ? "bg-white text-emerald-500 shadow-sm" : "text-gray-400"}`}>
                              <TrendingUp className="w-3 h-3" /><span>Income</span>
                            </button>
                          </div>
                          <button type="button" onClick={() => removeTransaction(txn.id)} className="p-1 text-gray-300 hover:text-red-400 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <input type="number" step="0.01" value={txn.amount} onChange={(e) => updateTransaction(txn.id, "amount", e.target.value)} placeholder="0.00"
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand placeholder:text-gray-400 text-gray-900" />
                          <input type="text" value={txn.title} onChange={(e) => updateTransaction(txn.id, "title", e.target.value)} placeholder="Title"
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand placeholder:text-gray-400 text-gray-900" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <select value={txn.category} onChange={(e) => updateTransaction(txn.id, "category", e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-gray-600 bg-white">
                            <option value="">Category</option>
                            {transactionCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                          </select>
                          <input type="text" value={txn.description} onChange={(e) => updateTransaction(txn.id, "description", e.target.value)} placeholder="Note"
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand placeholder:text-gray-400 text-gray-900" />
                        </div>
                      </div>
                    ))}
                    {transactions.some(t => t.amount) && (
                      <div className="flex justify-between items-center pt-2 px-1 text-xs font-medium">
                        <span className="text-gray-400">Summary</span>
                        <div className="flex space-x-3">
                          {(() => {
                            const income = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
                            const expense = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
                            return (<>{income > 0 && <span className="text-emerald-500">+{symbol}{income.toFixed(2)}</span>}{expense > 0 && <span className="text-red-500">-{symbol}{expense.toFixed(2)}</span>}</>);
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
                <div className="flex items-center space-x-2 mb-3">
                  <Tag className="w-4 h-4 text-purple-500" />
                  <label className="text-sm font-bold text-gray-700">Tags</label>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag) => (
                    <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${form.tagIds.includes(tag.id) ? "bg-brand text-white border-brand" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}>
                      {form.tagIds.includes(tag.id) && <span className="mr-1">✓</span>}{tag.name}
                    </button>
                  ))}
                  {tags.length === 0 && <p className="text-xs text-gray-400">No tags yet.</p>}
                </div>
                <div className="flex items-center space-x-2">
                  <input type="text" value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="New tag..."
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCreateTag())}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand placeholder:text-gray-400 bg-white" />
                  <button type="button" onClick={handleCreateTag} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex space-x-3 pt-6 mt-2">
            <Link href={`/memory/${params.id}`} className="flex-1 py-4 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors text-center">Cancel</Link>
            <button type="submit" disabled={saving}
              className="flex-1 py-4 bg-brand hover:bg-brand-dark text-white rounded-xl font-semibold shadow-md shadow-brand/20 transition-all disabled:opacity-50">
              {saving ? "Saving..." : "Update Memory"}
            </button>
          </div>
        </form>
      </FadeIn>
    </div>
  );
}
