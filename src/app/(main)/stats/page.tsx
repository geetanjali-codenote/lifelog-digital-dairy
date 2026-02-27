import Link from "next/link";
import { ChevronLeft, BarChart3, TrendingUp, TrendingDown, Clock, Search, Filter } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { StaggeredList, StaggeredItem } from "@/components/motion/StaggeredList";
import { HoverLift } from "@/components/motion/HoverLift";

// Mock Data for the Stats Page
const transactions = [
  { id: 1, type: "income", title: "Freelance Project", description: "Website redesign for local cafe", amount: 1200, date: "Oct 24, 2023" },
  { id: 2, type: "expense", title: "Grocery Run", description: "Weekly organics and supplies", amount: 85.50, date: "Oct 23, 2023" },
  { id: 3, type: "expense", title: "Netflix Subscription", description: "Monthly recurring plan", amount: 15.99, date: "Oct 22, 2023" },
  { id: 4, type: "income", title: "Sold Old Camera", description: "Facebook marketplace sale", amount: 350, date: "Oct 20, 2023" },
  { id: 5, type: "expense", title: "Dinner Date", description: "Sushi downtown", amount: 112.40, date: "Oct 18, 2023" },
  { id: 6, type: "expense", title: "Gas Station", description: "Full tank", amount: 45.00, date: "Oct 18, 2023" },
];

export default function StatsPage() {
  const totalIncome = transactions.filter(t => t.type === "income").reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((acc, curr) => acc + curr.amount, 0);
  const netBalance = totalIncome - totalExpense;

  return (
    <div className="flex flex-col min-h-full pb-6 px-4 pt-6 overflow-y-auto w-full lg:px-8 lg:pt-10 lg:max-w-4xl lg:mx-auto">
      {/* Mobile Top App Bar */}
      <div className="flex justify-between items-center mb-6 h-8 lg:hidden">
        <Link href="/dashboard" className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-gray-900" />
        </Link>
        <span className="font-bold text-gray-900 text-lg">Finances</span>
        <button className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors">
          <BarChart3 className="w-6 h-6 text-gray-900" />
        </button>
      </div>

      {/* Desktop Header */}
      <FadeIn className="hidden lg:flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Financial Overview</h1>
          <p className="text-gray-500 text-sm">Track your incomes and expenses across all your memories.</p>
        </div>
        <div className="flex space-x-3">
          <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <button className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </FadeIn>

      {/* Balance Card Section */}
      <FadeIn delay={0.1}>
        <div className="bg-brand text-white rounded-[24px] p-6 lg:p-8 mb-8 relative overflow-hidden shadow-lg shadow-brand/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

          <div className="relative z-10">
            <p className="text-white/80 text-sm font-medium mb-1 tracking-wide">NET BALANCE</p>
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">
              ${netBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>

            <div className="grid grid-cols-2 gap-4 lg:gap-8 pt-6 border-t border-white/20">
              <div>
                <div className="flex items-center space-x-2 text-emerald-300 font-semibold text-xs tracking-wider mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>TOTAL INCOME</span>
                </div>
                <div className="text-2xl font-bold">${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              </div>

              <div>
                <div className="flex items-center space-x-2 text-red-300 font-semibold text-xs tracking-wider mb-2">
                  <TrendingDown className="w-4 h-4" />
                  <span>TOTAL SPEND</span>
                </div>
                <div className="text-2xl font-bold">${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.2} className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-lg lg:text-xl font-bold text-gray-900">Recent Transactions</h2>
        <button className="text-sm font-semibold text-brand hover:underline">Download CSV</button>
      </FadeIn>

      {/* Transactions List */}
      <StaggeredList className="space-y-3" staggerDelay={0.05}>
        {transactions.map((tx) => (
          <StaggeredItem key={tx.id}>
            <HoverLift>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center hover:border-gray-200 transition-colors">
                <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center mr-4 ${tx.type === "income" ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"
                  }`}>
                  {tx.type === "income" ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                </div>

                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-sm font-bold text-gray-900 truncate mb-1">{tx.title}</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center text-xs text-gray-500">
                    <span className="truncate max-w-[180px] sm:max-w-xs">{tx.description}</span>
                    <span className="hidden sm:inline mx-2 text-gray-300">•</span>
                    <span className="flex items-center mt-1 sm:mt-0 opacity-70">
                      <Clock className="w-3 h-3 mr-1" />
                      {tx.date}
                    </span>
                  </div>
                </div>

                <div className={`shrink-0 text-base font-bold ${tx.type === "income" ? "text-emerald-600" : "text-gray-900"
                  }`}>
                  {tx.type === "income" ? "+" : "-"}${tx.amount.toFixed(2)}
                </div>
              </div>
            </HoverLift>
          </StaggeredItem>
        ))}
      </StaggeredList>

    </div>
  );
}
