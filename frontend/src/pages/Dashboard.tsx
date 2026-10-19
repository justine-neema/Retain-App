import { useState } from "react";
import { Link } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import type { DashboardResponse } from "../types/expense";
import { toMonthKey } from "../lib/format";

export default function Dashboard() {
  const [month, setMonth] = useState<string>(toMonthKey());
  const { data, loading, error } = useFetch<DashboardResponse>(
    "/expenses/dashboard",
    { params: { month } }
  );

  if (loading) return <p className="text-sm text-slate-500 py-10">Loading dashboard…</p>;
  if (error || !data) return <div className="text-red-600 text-sm py-10">{error ?? "Something went wrong"}</div>;

  const { totalSpentThisMonth, highestExpense, monthlyBudget, recentExpenses, spendingByCategory } = data;
  const remaining = monthlyBudget - totalSpentThisMonth;
  const ratio = monthlyBudget > 0 ? Math.min((totalSpentThisMonth / monthlyBudget) * 100, 100) : 0;

  const isApproaching = ratio >= 80 && ratio <= 100;
  const isOver = ratio > 100;
  const maxCategoryTotal = Math.max(1, ...spendingByCategory.map(c => c.total));

  const formatAmount = (amount: number) => new Intl.NumberFormat("en-RW").format(amount);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Your spending for the selected month</p>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm bg-white w-full sm:w-auto
                     focus:outline-none focus:ring-2 focus:ring-[#047857]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <p className="text-sm font-medium text-slate-600 mb-2">Total spent</p>
          <p className="text-3xl font-bold text-slate-900 font-money">{formatAmount(totalSpentThisMonth)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <p className="text-sm font-medium text-slate-600 mb-2">Remaining budget</p>
          <p className="text-3xl font-bold text-slate-900 font-money">{formatAmount(remaining)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <p className="text-sm font-medium text-slate-600 mb-2">Highest expense</p>
          <p className="text-3xl font-bold text-slate-900 font-money">{formatAmount(highestExpense)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-base font-semibold text-slate-900 font-money">
            Monthly budget: {formatAmount(monthlyBudget)}
          </p>
          {monthlyBudget > 0 && (
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium
              ${isOver ? "bg-red-50 text-red-700" : isApproaching ? "bg-[#fffbeb] text-[#b45309]" : "bg-[#ecfdf5] text-[#047857]"}
            `}>
              {isOver ? "Over budget" : isApproaching ? "Approaching budget" : "Within budget"} · {Math.round(ratio)}%
            </span>
          )}
        </div>

        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden mb-6">
          <div
            className={`h-full transition-all ${isOver ? "bg-red-500" : isApproaching ? "bg-[#c2410c]" : "bg-[#047857]"}`}
            style={{ width: `${ratio}%` }}
          />
        </div>

        <Link to="/budget" className="inline-block rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
          Update budget
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Spending by category</h2>
          {spendingByCategory.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">No spending yet this month.</p>
          ) : (
            <div className="space-y-5">
              {spendingByCategory.filter(c => c.total > 0).sort((a, b) => b.total - a.total).map((c) => (
                <div key={c.category}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-700 font-medium">{c.category}</span>
                    <span className="text-slate-900 font-bold font-money">{formatAmount(c.total)}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-[#047857] rounded-full"
                      style={{ width: `${(c.total / maxCategoryTotal) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Recent expenses</h2>
          {recentExpenses.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">No recent expenses.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentExpenses.map((exp) => (
                <li key={exp.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <Link to={`/expenses/${exp.id}`} className="flex-1 min-w-0 pr-4 group">
                    <p className="text-sm font-medium text-slate-900 truncate group-hover:text-[#047857] transition-colors">
                      {exp.title} <span className="text-slate-400 font-normal">·</span> {exp.categoryName}
                    </p>
                  </Link>
                  <p className="text-sm font-bold text-slate-900 font-money whitespace-nowrap">
                    {formatAmount(exp.amount)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}