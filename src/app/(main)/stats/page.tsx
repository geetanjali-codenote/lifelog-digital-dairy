"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import {
  ChevronLeft, TrendingUp, TrendingDown, Clock,
  Download, Filter, X, Calendar
} from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { StaggeredList, StaggeredItem } from "@/components/motion/StaggeredList";
import { HoverLift } from "@/components/motion/HoverLift";
import { useCurrency } from "@/hooks/useCurrency";
import toast from "react-hot-toast";

interface TransactionData {
  id: string;
  type: "income" | "expense";
  amount: number;
  title: string;
  description: string | null;
  category: string | null;
  date: string;
}

interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export default function StatsPage() {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState<"" | "income" | "expense">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const { symbol } = useCurrency();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (typeFilter) params.set("type", typeFilter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const res = await fetch(`/api/transactions?${params}`);
      if (res.status === 401) {
        setTransactions([]);
        setSummary({ totalIncome: 0, totalExpense: 0, balance: 0 });
        setLoading(false);
        return;
      }
      if (!res.ok) {
        toast.error("Failed to load financial data");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setTransactions(data.transactions || []);
      setSummary(data.summary || { totalIncome: 0, totalExpense: 0, balance: 0 });
    } catch {
      toast.error("Failed to load financial data");
    }
    setLoading(false);
  }, [typeFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const clearFilters = () => {
    setTypeFilter("");
    setDateFrom("");
    setDateTo("");
  };

  const hasFilters = typeFilter || dateFrom || dateTo;

  const handleDownloadCSV = () => {
    if (transactions.length === 0) {
      toast("No data to export");
      return;
    }

    const headers = ["Date", "Type", "Title", "Category", "Description", "Amount"];
    const rows = transactions.map((tx) => [
      new Date(tx.date).toLocaleDateString("en-US"),
      tx.type,
      `"${(tx.title || "").replace(/"/g, '""')}"`,
      tx.category || "",
      `"${(tx.description || "").replace(/"/g, '""')}"`,
      tx.type === "income" ? `+${tx.amount.toFixed(2)}` : `-${tx.amount.toFixed(2)}`,
    ]);

    const summaryRows = [
      [],
      ["Summary"],
      ["Total Income", "", "", "", "", `${symbol}${summary.totalIncome.toFixed(2)}`],
      ["Total Expense", "", "", "", "", `${symbol}${summary.totalExpense.toFixed(2)}`],
      ["Net Balance", "", "", "", "", `${symbol}${summary.balance.toFixed(2)}`],
    ];

    const csv = [headers, ...rows, ...summaryRows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lifelog-finances-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded successfully");
  };

  return (
    <div className="flex flex-col min-h-full pb-6 px-4 pt-6 overflow-y-auto w-full lg:px-8 lg:pt-10 lg:max-w-4xl lg:mx-auto">
      {/* Mobile Top App Bar */}
      <div className="flex justify-between items-center mb-6 h-8 lg:hidden">
        <Link href="/dashboard" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <span className="font-bold text-gray-900 text-lg">Finances</span>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Filter className="w-6 h-6 text-gray-900" />
        </button>
      </div>

      {/* Desktop Header */}
      <FadeIn className="hidden lg:flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Financial Overview</h1>
          <p className="text-gray-500 text-sm">Track your incomes and expenses across all your memories.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2.5 border rounded-xl transition-colors text-sm font-medium ${
              showFilters ? "bg-brand text-white border-brand" : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          <button
            onClick={handleDownloadCSV}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </button>
        </div>
      </FadeIn>

      {/* Filters */}
      {showFilters && (
        <FadeIn className="bg-gray-50/80 rounded-xl p-4 mb-6 space-y-3 border border-gray-100">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setTypeFilter("")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${!typeFilter ? "bg-brand text-white border-brand" : "bg-white text-gray-600 border-gray-200"}`}>
              All
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
              <X className="w-3 h-3" />
              <span>Clear all filters</span>
            </button>
          )}
        </FadeIn>
      )}

      {/* Balance Card */}
      {loading ? (
        <div className="h-48 bg-gray-100 rounded-[24px] mb-8 animate-pulse" />
      ) : (
        <FadeIn delay={0.1}>
          <div className="bg-brand text-white rounded-[24px] p-6 lg:p-8 mb-8 relative overflow-hidden shadow-lg shadow-brand/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

            <div className="relative z-10">
              <p className="text-white/80 text-sm font-medium mb-1 tracking-wide">NET BALANCE</p>
              <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">
                {symbol}{summary.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </h2>

              <div className="grid grid-cols-2 gap-4 lg:gap-8 pt-6 border-t border-white/20">
                <div>
                  <div className="flex items-center space-x-2 text-emerald-300 font-semibold text-xs tracking-wider mb-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>TOTAL INCOME</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {symbol}{summary.totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-2 text-red-300 font-semibold text-xs tracking-wider mb-2">
                    <TrendingDown className="w-4 h-4" />
                    <span>TOTAL SPEND</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {symbol}{summary.totalExpense.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      )}

      <FadeIn delay={0.2} className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-lg lg:text-xl font-bold text-gray-900">Recent Transactions</h2>
        <button onClick={handleDownloadCSV} className="text-sm font-semibold text-brand hover:underline lg:hidden">
          Download CSV
        </button>
      </FadeIn>

      {/* Transactions List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl" />)}
        </div>
      ) : transactions.length > 0 ? (
        <StaggeredList className="space-y-3" staggerDelay={0.05}>
          {transactions.map((tx) => (
            <StaggeredItem key={tx.id}>
              <HoverLift>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center hover:border-gray-200 transition-colors">
                  <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                    tx.type === "income" ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"
                  }`}>
                    {tx.type === "income" ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                  </div>

                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="text-sm font-bold text-gray-900 truncate mb-1">{tx.title}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center text-xs text-gray-500">
                      {tx.category && <span className="truncate max-w-[180px]">{tx.category}</span>}
                      {tx.category && <span className="hidden sm:inline mx-2 text-gray-300">&bull;</span>}
                      <span className="flex items-center mt-1 sm:mt-0 opacity-70">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>

                  <div className={`shrink-0 text-base font-bold ${
                    tx.type === "income" ? "text-emerald-600" : "text-gray-900"
                  }`}>
                    {tx.type === "income" ? "+" : "-"}{symbol}{tx.amount.toFixed(2)}
                  </div>
                </div>
              </HoverLift>
            </StaggeredItem>
          ))}
        </StaggeredList>
      ) : (
        <FadeIn>
          <div className="text-center py-16 px-4">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {hasFilters ? "No transactions found" : "No financial data yet"}
            </h3>
            <p className="text-gray-500 text-sm">
              {hasFilters
                ? "Try adjusting your filters to see more results."
                : "Start tracking your finances by adding transactions to your memories."}
            </p>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
