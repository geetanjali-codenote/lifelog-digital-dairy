"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, Sparkles, Heart, DollarSign, Tag, X, Plus,
  Image as ImageIcon, Trash2, TrendingUp, TrendingDown, AlertCircle
} from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";

const moods = [
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

interface TagData {
  id: string;
  name: string;
  color: string | null;
}

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

export default function NewEntryPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tags, setTags] = useState<TagData[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [form, setForm] = useState({
    title: "",
    content: "",
    mood: "happy",
    entryDate: new Date().toISOString().split("T")[0],
    highlight: "",
    gratitude: "",
    tagIds: [] as string[],
    images: [] as string[],
  });

  useEffect(() => {
    fetch("/api/tags").then((r) => r.json()).then(setTags).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.content.trim()) {
      setError("Please write something in your entry.");
      return;
    }
    if (!form.mood) {
      setError("Please select a mood.");
      return;
    }

    // Validate transactions
    const validTransactions = transactions.filter(t => t.amount && t.title);
    for (const t of validTransactions) {
      if (parseFloat(t.amount) <= 0) {
        setError("Transaction amounts must be positive.");
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title || undefined,
          content: form.content,
          mood: form.mood,
          entryDate: form.entryDate,
          highlight: form.highlight || undefined,
          gratitude: form.gratitude || undefined,
          tagIds: form.tagIds.length > 0 ? form.tagIds : undefined,
          images: form.images.length > 0 ? form.images : undefined,
          transactions: validTransactions.length > 0
            ? validTransactions.map(t => ({
                type: t.type,
                amount: parseFloat(t.amount),
                title: t.title,
                description: t.description || undefined,
                category: t.category || undefined,
              }))
            : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save entry");
      }

      const entry = await res.json();
      router.push(`/memory/${entry.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setForm(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
    }
  };

  const removeImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addTransaction = () => {
    setTransactions(prev => [...prev, createEmptyTransaction()]);
  };

  const removeTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const updateTransaction = (id: string, field: keyof TransactionItem, value: string) => {
    setTransactions(prev =>
      prev.map(t => t.id === id ? { ...t, [field]: value } : t)
    );
  };

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand placeholder:text-gray-400 text-gray-900 bg-white";

  return (
    <div className="flex flex-col min-h-full pb-8 px-4 pt-6 overflow-y-auto w-full lg:px-8 lg:pt-10 lg:max-w-5xl lg:mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6 lg:mb-8">
        <Link href="/dashboard" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <h1 className="flex-1 text-center text-lg lg:text-2xl font-bold text-gray-900 mr-8">New Memory</h1>
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
            {/* Left Column - Main Content */}
            <div className="space-y-5">
              {/* Date & Title row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.entryDate}
                    onChange={(e) => setForm({ ...form, entryDate: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Give your memory a title..."
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Mood */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-3">
                  How are you feeling? <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {moods.map((mood) => (
                    <button
                      key={mood.value}
                      type="button"
                      onClick={() => setForm({ ...form, mood: mood.value })}
                      className={`flex flex-col items-center p-2.5 rounded-xl border-2 transition-all ${
                        form.mood === mood.value
                          ? "border-brand bg-brand-light/50 scale-105"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <span className="text-xl mb-0.5">{mood.emoji}</span>
                      <span className="text-[10px] font-medium text-gray-600">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  What&apos;s on your mind? <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={6}
                  placeholder="Write about your day..."
                  className={`${inputClass} resize-none leading-relaxed`}
                />
              </div>

              {/* Highlight & Gratitude side by side on desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-4 h-4 text-brand" />
                    <label className="text-sm font-medium text-gray-700">Highlight</label>
                  </div>
                  <input
                    type="text"
                    value={form.highlight}
                    onChange={(e) => setForm({ ...form, highlight: e.target.value })}
                    placeholder="Best part of your day?"
                    className={inputClass}
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Heart className="w-4 h-4 text-emerald-500" />
                    <label className="text-sm font-medium text-gray-700">Gratitude</label>
                  </div>
                  <input
                    type="text"
                    value={form.gratitude}
                    onChange={(e) => setForm({ ...form, gratitude: e.target.value })}
                    placeholder="What are you grateful for?"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Photos */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <ImageIcon className="w-4 h-4 text-gray-400" />
                  <label className="text-sm font-medium text-gray-700">Photos</label>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {form.images.map((src, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm">
                      <img src={src} alt="Upload preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className="flex flex-col items-center justify-center aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-colors cursor-pointer text-gray-500 hover:text-gray-700">
                    <Plus className="w-5 h-5 mb-1" />
                    <span className="text-xs font-medium">Add</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Transactions, Tags */}
            <div className="space-y-5 mt-5 lg:mt-0">
              {/* Transactions */}
              <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <DollarSign className="w-5 h-5 text-blue-500" />
                    <label className="text-sm font-bold">Transactions</label>
                  </div>
                  <button
                    type="button"
                    onClick={addTransaction}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-brand text-white text-xs font-semibold rounded-lg hover:bg-brand-dark transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {transactions.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 text-sm">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>No transactions yet</p>
                    <p className="text-xs mt-1">Click &quot;Add&quot; to track spending</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((txn) => (
                      <div key={txn.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        {/* Type toggle + remove */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex bg-gray-100 p-0.5 rounded-lg">
                            <button
                              type="button"
                              onClick={() => updateTransaction(txn.id, "type", "expense")}
                              className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                                txn.type === "expense" ? "bg-white text-red-500 shadow-sm" : "text-gray-400"
                              }`}
                            >
                              <TrendingDown className="w-3 h-3" />
                              <span>Expense</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => updateTransaction(txn.id, "type", "income")}
                              className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                                txn.type === "income" ? "bg-white text-emerald-500 shadow-sm" : "text-gray-400"
                              }`}
                            >
                              <TrendingUp className="w-3 h-3" />
                              <span>Income</span>
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeTransaction(txn.id)}
                            className="p-1 text-gray-300 hover:text-red-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Amount + Title */}
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <input
                            type="number"
                            step="0.01"
                            value={txn.amount}
                            onChange={(e) => updateTransaction(txn.id, "amount", e.target.value)}
                            placeholder="$0.00"
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand placeholder:text-gray-400 text-gray-900"
                          />
                          <input
                            type="text"
                            value={txn.title}
                            onChange={(e) => updateTransaction(txn.id, "title", e.target.value)}
                            placeholder="Title"
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand placeholder:text-gray-400 text-gray-900"
                          />
                        </div>

                        {/* Category + Description */}
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={txn.category}
                            onChange={(e) => updateTransaction(txn.id, "category", e.target.value)}
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-gray-600 bg-white"
                          >
                            <option value="">Category</option>
                            {transactionCategories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={txn.description}
                            onChange={(e) => updateTransaction(txn.id, "description", e.target.value)}
                            placeholder="Note"
                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand placeholder:text-gray-400 text-gray-900"
                          />
                        </div>
                      </div>
                    ))}

                    {/* Quick summary */}
                    {transactions.some(t => t.amount) && (
                      <div className="flex justify-between items-center pt-2 px-1 text-xs font-medium">
                        <span className="text-gray-400">Summary</span>
                        <div className="flex space-x-3">
                          {(() => {
                            const income = transactions.filter(t => t.type === "income").reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
                            const expense = transactions.filter(t => t.type === "expense").reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
                            return (
                              <>
                                {income > 0 && <span className="text-emerald-500">+${income.toFixed(2)}</span>}
                                {expense > 0 && <span className="text-red-500">-${expense.toFixed(2)}</span>}
                              </>
                            );
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
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        form.tagIds.includes(tag.id)
                          ? "bg-brand text-white border-brand"
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {form.tagIds.includes(tag.id) && <span className="mr-1">✓</span>}
                      {tag.name}
                    </button>
                  ))}
                  {tags.length === 0 && (
                    <p className="text-xs text-gray-400">No tags yet. Create one below.</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="New tag..."
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCreateTag())}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand placeholder:text-gray-400 bg-white"
                  />
                  <button type="button" onClick={handleCreateTag} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Submit - full width */}
          <div className="flex space-x-3 pt-6 mt-2">
            <Link href="/dashboard" className="flex-1 py-4 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors text-center">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-4 bg-brand hover:bg-brand-dark text-white rounded-xl font-semibold shadow-md shadow-brand/20 transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Memory"}
            </button>
          </div>
        </form>
      </FadeIn>
    </div>
  );
}
