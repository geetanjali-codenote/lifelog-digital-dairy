"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  DollarSign, TrendingUp, TrendingDown, Filter, Search, Plus,
  ChevronLeft, Calendar, ArrowUpDown, X, Wallet, PieChart,
  AlertCircle
} from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { StaggeredList, StaggeredItem } from "@/components/motion/StaggeredList";

interface TransactionData {
  id: string;
  type: "income" | "expense";
  amount: number;
  title: string;
  description: string | null;
  category: string | null;
  date: string;
  entry: { id: string; title: string | null; mood: string } | null;
}

interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

interface CategoryItem {
  category: string;
  type: string;
  total: number;
  count: number;
}

interface MonthlyData {
  [month: string]: { income: number; expense: number };
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const categoryIcons: Record<string, string> = {
  "Food & Dining": "🍔", "Shopping": "🛍️", "Transport": "🚗", "Bills & Utilities": "💡",
  "Entertainment": "🎬", "Health": "🏥", "Education": "📚", "Travel": "✈️",
  "Salary": "💼", "Freelance": "💻", "Investment": "📈", "Gift": "🎁",
  "Other": "📦", "Uncategorized": "📌",
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary>({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryItem[]>([]);
  const [monthly, setMonthly] = useState<MonthlyData>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | "income" | "expense">("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Add transaction modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    type: "expense" as "income" | "expense",
    amount: "",
    title: "",
    description: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [addError, setAddError] = useState("");
  const [addSaving, setAddSaving] = useState(false);

  const categories = Array.from(new Set(categoryBreakdown.map(c => c.category)));

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "15" });
    if (search) params.set("q", search);
    if (typeFilter) params.set("type", typeFilter);
    if (categoryFilter) params.set("category", categoryFilter);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);

    try {
      const res = await fetch(`/api/transactions?${params}`);
      const data = await res.json();
      setTransactions(data.transactions || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setSummary(data.summary || { totalIncome: 0, totalExpense: 0, balance: 0 });
      setCategoryBreakdown(data.categoryBreakdown || []);
      setMonthly(data.monthly || {});
    } catch { /* ignore */ }
    setLoading(false);
  }, [page, search, typeFilter, categoryFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("");
    setCategoryFilter("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    if (!addForm.amount || !addForm.title) {
      setAddError("Amount and title are required.");
      return;
    }
    if (parseFloat(addForm.amount) <= 0) {
      setAddError("Amount must be positive.");
      return;
    }

    setAddSaving(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: addForm.type,
          amount: parseFloat(addForm.amount),
          title: addForm.title,
          description: addForm.description || undefined,
          category: addForm.category || undefined,
          date: addForm.date,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add transaction");
      }
      setShowAddModal(false);
      setAddForm({ type: "expense", amount: "", title: "", description: "", category: "", date: new Date().toISOString().split("T")[0] });
      fetchTransactions();
    } catch (err: unknown) {
      setAddError(err instanceof Error ? err.message : "An error occurred");
    }
    setAddSaving(false);
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      fetchTransactions();
    } catch { /* ignore */ }
  };

  const hasFilters = search || typeFilter || categoryFilter || dateFrom || dateTo;

  // Monthly chart data
  const maxMonthly = Math.max(
    ...Object.values(monthly).map(m => Math.max(m.income, m.expense)),
    1
  );

  // Expense categories for pie breakdown
  const expenseCategories = categoryBreakdown.filter(c => c.type === "expense").sort((a, b) => b.total - a.total);
  const totalExpenseForPie = expenseCategories.reduce((s, c) => s + c.total, 0) || 1;

  const categoryColors = [
    "bg-brand", "bg-blue-500", "bg-purple-500", "bg-emerald-500",
    "bg-orange-500", "bg-pink-500", "bg-cyan-500", "bg-amber-500",
  ];

  return (
    <div className="flex flex-col min-h-full pb-8 px-4 pt-6 overflow-y-auto w-full lg:px-8 lg:pt-10 lg:max-w-6xl lg:mx-auto">
      {/* Header */}
      <FadeIn>
        <div className="flex justify-between items-center mb-6 lg:mb-8">
          <div className="flex items-center space-x-3">
            <Link href="/dashboard" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors lg:hidden">
              <ChevronLeft className="w-6 h-6 text-gray-900" />
            </Link>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Transactions</h1>
              <p className="text-sm text-gray-500 hidden lg:block">Track your income and expenses</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Transaction</span>
          </button>
        </div>
      </FadeIn>

      {/* Summary Cards */}
      <FadeIn delay={0.05}>
        <div className="grid grid-cols-3 gap-3 lg:gap-5 mb-6">
          <div className="bg-emerald-50/80 rounded-2xl p-4 lg:p-5">
            <div className="flex items-center space-x-2 text-emerald-600 font-semibold text-[10px] tracking-wider mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>INCOME</span>
            </div>
            <div className="text-xl lg:text-2xl font-bold text-gray-900">${summary.totalIncome.toFixed(0)}</div>
          </div>
          <div className="bg-red-50/80 rounded-2xl p-4 lg:p-5">
            <div className="flex items-center space-x-2 text-red-500 font-semibold text-[10px] tracking-wider mb-2">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>EXPENSE</span>
            </div>
            <div className="text-xl lg:text-2xl font-bold text-gray-900">${summary.totalExpense.toFixed(0)}</div>
          </div>
          <div className={`rounded-2xl p-4 lg:p-5 ${summary.balance >= 0 ? "bg-blue-50/80" : "bg-orange-50/80"}`}>
            <div className={`flex items-center space-x-2 font-semibold text-[10px] tracking-wider mb-2 ${summary.balance >= 0 ? "text-blue-600" : "text-orange-600"}`}>
              <Wallet className="w-3.5 h-3.5" />
              <span>BALANCE</span>
            </div>
            <div className="text-xl lg:text-2xl font-bold text-gray-900">
              {summary.balance >= 0 ? "+" : "-"}${Math.abs(summary.balance).toFixed(0)}
            </div>
          </div>
        </div>
      </FadeIn>

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-8">
        {/* Left: Transaction List */}
        <div>
          {/* Search & Filters */}
          <FadeIn delay={0.1}>
            <form onSubmit={handleSearch} className="flex items-center space-x-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search transactions..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2.5 rounded-xl border transition-colors ${showFilters ? "bg-brand text-white border-brand" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}
              >
                <Filter className="w-5 h-5" />
              </button>
            </form>

            {showFilters && (
              <div className="bg-gray-50/80 rounded-xl p-4 mb-4 space-y-3 border border-gray-100">
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setTypeFilter("")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${!typeFilter ? "bg-brand text-white border-brand" : "bg-white text-gray-600 border-gray-200"}`}>
                    All Types
                  </button>
                  <button onClick={() => setTypeFilter("income")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${typeFilter === "income" ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-gray-600 border-gray-200"}`}>
                    Income
                  </button>
                  <button onClick={() => setTypeFilter("expense")}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${typeFilter === "expense" ? "bg-red-500 text-white border-red-500" : "bg-white text-gray-600 border-gray-200"}`}>
                    Expense
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button key={cat} onClick={() => setCategoryFilter(categoryFilter === cat ? "" : cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${categoryFilter === cat ? "bg-brand text-white border-brand" : "bg-white text-gray-600 border-gray-200"}`}>
                      {categoryIcons[cat] || "📌"} {cat}
                    </button>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>From</span>
                  </div>
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                    className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20" />
                  <span className="text-xs text-gray-400">to</span>
                  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                    className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20" />
                </div>
                {hasFilters && (
                  <button onClick={clearFilters} className="flex items-center space-x-1 text-xs text-brand font-medium hover:underline">
                    <X className="w-3 h-3" /><span>Clear all filters</span>
                  </button>
                )}
              </div>
            )}
          </FadeIn>

          {/* Transaction List */}
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl" />)}
            </div>
          ) : transactions.length > 0 ? (
            <StaggeredList className="space-y-2" staggerDelay={0.03}>
              {transactions.map((txn) => (
                <StaggeredItem key={txn.id}>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4 hover:border-gray-200 transition-all group">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      txn.type === "income" ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"
                    }`}>
                      {txn.type === "income" ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{txn.title}</h3>
                        {txn.category && (
                          <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium hidden sm:inline">
                            {categoryIcons[txn.category] || "📌"} {txn.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-xs text-gray-400">
                          {new Date(txn.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                        {txn.description && <span className="text-xs text-gray-400 truncate max-w-[150px]">{txn.description}</span>}
                        {txn.entry && (
                          <Link href={`/memory/${txn.entry.id}`} className="text-[10px] text-brand font-medium hover:underline">
                            View Memory
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-base font-bold ${txn.type === "income" ? "text-emerald-500" : "text-red-500"}`}>
                        {txn.type === "income" ? "+" : "-"}${txn.amount.toFixed(2)}
                      </span>
                      <button onClick={() => handleDeleteTransaction(txn.id)}
                        className="p-1 text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </StaggeredItem>
              ))}
            </StaggeredList>
          ) : (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-blue-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {hasFilters ? "No transactions found" : "No transactions yet"}
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                {hasFilters ? "Try adjusting your filters." : "Start tracking your finances by adding a transaction."}
              </p>
              {!hasFilters && (
                <button onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand text-white rounded-xl font-semibold text-sm hover:bg-brand-dark transition-colors">
                  <Plus className="w-4 h-4" /><span>Add Transaction</span>
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-4 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors">
                Previous
              </button>
              <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-gray-50 transition-colors">
                Next
              </button>
            </div>
          )}
        </div>

        {/* Right: Analytics Sidebar */}
        <div className="hidden lg:block space-y-5 mt-0">
          {/* Monthly Overview Chart */}
          <FadeIn delay={0.15}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center space-x-2 mb-4">
                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                <h3 className="text-xs font-bold text-gray-400 tracking-wider">MONTHLY OVERVIEW</h3>
              </div>
              <div className="flex items-end justify-between h-32 gap-1">
                {months.map((label, i) => {
                  const key = String(i + 1).padStart(2, "0");
                  const data = monthly[key] || { income: 0, expense: 0 };
                  const incomeH = (data.income / maxMonthly) * 100;
                  const expenseH = (data.expense / maxMonthly) * 100;
                  return (
                    <div key={label} className="flex flex-col items-center flex-1 group" title={`${label}: Income $${data.income.toFixed(0)}, Expense $${data.expense.toFixed(0)}`}>
                      <div className="flex items-end space-x-0.5 w-full justify-center h-24">
                        <div className="w-1.5 bg-emerald-400 rounded-t transition-all" style={{ height: `${Math.max(incomeH, 2)}%` }} />
                        <div className="w-1.5 bg-red-400 rounded-t transition-all" style={{ height: `${Math.max(expenseH, 2)}%` }} />
                      </div>
                      <span className="text-[8px] text-gray-400 mt-1 font-medium">{label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center space-x-4 mt-3 text-[10px] text-gray-400">
                <span className="flex items-center"><span className="w-2 h-2 bg-emerald-400 rounded-full mr-1" />Income</span>
                <span className="flex items-center"><span className="w-2 h-2 bg-red-400 rounded-full mr-1" />Expense</span>
              </div>
            </div>
          </FadeIn>

          {/* Category Breakdown */}
          <FadeIn delay={0.2}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center space-x-2 mb-4">
                <PieChart className="w-4 h-4 text-gray-400" />
                <h3 className="text-xs font-bold text-gray-400 tracking-wider">SPENDING BY CATEGORY</h3>
              </div>
              {expenseCategories.length > 0 ? (
                <div className="space-y-3">
                  {/* Bar visualization */}
                  <div className="flex h-3 rounded-full overflow-hidden">
                    {expenseCategories.slice(0, 6).map((cat, i) => (
                      <div
                        key={cat.category}
                        className={`${categoryColors[i % categoryColors.length]} transition-all`}
                        style={{ width: `${(cat.total / totalExpenseForPie) * 100}%` }}
                        title={`${cat.category}: $${cat.total.toFixed(0)}`}
                      />
                    ))}
                  </div>
                  {/* Legend */}
                  <div className="space-y-2">
                    {expenseCategories.slice(0, 6).map((cat, i) => (
                      <div key={cat.category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${categoryColors[i % categoryColors.length]}`} />
                          <span className="text-xs text-gray-600 font-medium">
                            {categoryIcons[cat.category] || "📌"} {cat.category}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-gray-900">${cat.total.toFixed(0)}</span>
                          <span className="text-[10px] text-gray-400">
                            {((cat.total / totalExpenseForPie) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-center text-sm text-gray-400 py-4">No expense data yet</p>
              )}
            </div>
          </FadeIn>

          {/* Quick Stats */}
          <FadeIn delay={0.25}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-xs font-bold text-gray-400 tracking-wider mb-4">QUICK STATS</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total transactions</span>
                  <span className="text-sm font-bold text-gray-900">
                    {categoryBreakdown.reduce((s, c) => s + c.count, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. expense</span>
                  <span className="text-sm font-bold text-gray-900">
                    ${expenseCategories.length > 0
                      ? (summary.totalExpense / expenseCategories.reduce((s, c) => s + c.count, 0) || 0).toFixed(2)
                      : "0.00"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Top category</span>
                  <span className="text-sm font-bold text-gray-900">
                    {expenseCategories[0]?.category || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white dark:bg-surface rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Add Transaction</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {addError && (
              <div className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-sm mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddTransaction} className="space-y-4">
              {/* Type toggle */}
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button type="button" onClick={() => setAddForm({ ...addForm, type: "expense" })}
                  className={`flex-1 flex items-center justify-center space-x-1.5 py-2 text-sm font-semibold rounded-lg transition-colors ${addForm.type === "expense" ? "bg-white text-red-500 shadow-sm" : "text-gray-500"}`}>
                  <TrendingDown className="w-4 h-4" /><span>Expense</span>
                </button>
                <button type="button" onClick={() => setAddForm({ ...addForm, type: "income" })}
                  className={`flex-1 flex items-center justify-center space-x-1.5 py-2 text-sm font-semibold rounded-lg transition-colors ${addForm.type === "income" ? "bg-white text-emerald-500 shadow-sm" : "text-gray-500"}`}>
                  <TrendingUp className="w-4 h-4" /><span>Income</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Amount <span className="text-red-400">*</span></label>
                  <input type="number" step="0.01" value={addForm.amount} onChange={(e) => setAddForm({ ...addForm, amount: e.target.value })}
                    placeholder="$0.00" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Date</label>
                  <input type="date" value={addForm.date} onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-gray-900" />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Title <span className="text-red-400">*</span></label>
                <input type="text" value={addForm.title} onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                  placeholder="e.g. Groceries" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Category</label>
                <select value={addForm.category} onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand text-gray-600 bg-white">
                  <option value="">Select category</option>
                  {["Food & Dining", "Shopping", "Transport", "Bills & Utilities", "Entertainment", "Health", "Education", "Travel", "Salary", "Freelance", "Investment", "Gift", "Other"].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Note</label>
                <input type="text" value={addForm.description} onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  placeholder="Description" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand" />
              </div>

              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={addSaving}
                  className="flex-1 py-3 bg-brand hover:bg-brand-dark text-white rounded-xl font-semibold shadow-md shadow-brand/20 transition-all disabled:opacity-50 text-sm">
                  {addSaving ? "Adding..." : "Add Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
