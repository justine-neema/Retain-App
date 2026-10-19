import { useState, type FormEvent, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useFetch } from "../hooks/useFetch";
import type { BudgetResponse } from "../types/budget"; // Removed Budget
import type { ExpenseSummary } from "../types/expense";
import { formatDate, formatMonthLabel, toMonthKey } from "../lib/format";

type Status = "within" | "approaching" | "over" | "none";

export default function BudgetPage() {
  const [month, setMonth] = useState<string>(toMonthKey());
  const [amountInput, setAmountInput] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: budgetData, loading: budgetLoading, error: budgetError, refetch } = useFetch<BudgetResponse>("/budgets", { params: { month } });
  const { data: summaryData, loading: summaryLoading, error: summaryError, refetch: refetchSummary } = useFetch<ExpenseSummary>("/expenses/summary", { params: { month } });

  const loading = budgetLoading || summaryLoading;
  const errorLoading = budgetError || summaryError;

  useEffect(() => {
    if (budgetData?.budget) {
      setAmountInput(String(budgetData.budget.amount));
    } else {
      setAmountInput("");
    }
  }, [budgetData]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const amount = Number(amountInput);
    if (amountInput === "" || !Number.isFinite(amount) || amount <= 0) {
      setError("Budget must be greater than zero");
      return;
    }

    setSaving(true);
    try {
      await api.post<BudgetResponse>("/budgets", { month, amount });
      setSuccess("Budget saved");
      setTimeout(() => setSuccess(null), 2500);
      refetch();
      refetchSummary();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to save budget");
    } finally {
      setSaving(false);
    }
  }

  const formatAmount = (amount: number) => new Intl.NumberFormat("en-RW").format(amount);

  if (loading) return <p className="text-sm text-slate-500 py-10">Loading budget…</p>;
  if (errorLoading) return <div className="text-red-600 text-sm py-10">{errorLoading}</div>;

  const budgetAmount = budgetData?.budget ? Number(budgetData.budget.amount) : 0;
  const spent = summaryData?.totalSpent ?? 0;
  const recentExpenses = summaryData?.recentExpenses ?? [];
  
  const remaining = budgetAmount - spent;
  const ratio = budgetAmount > 0 ? Math.min((spent / budgetAmount) * 100, 100) : 0;

  const isOver = ratio > 100;
  const isApproaching = ratio >= 80 && ratio <= 100;
  
  const status: Status = 
    budgetAmount <= 0 ? "none" :
    isOver ? "over" :
    isApproaching ? "approaching" : "within";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Budget</h1>
          <p className="text-sm text-slate-500 mt-1">Set a limit and track how your spending compares</p>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm bg-white w-full sm:w-auto
                     focus:outline-none focus:ring-2 focus:ring-[#047857]"
        />
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 rounded-md bg-[#ecfdf5] border border-[#d1fae5] text-[#047857] text-sm px-4 py-3">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <p className="text-sm font-medium text-slate-600 mb-2">Budget</p>
          <p className="text-3xl font-bold text-slate-900 font-money">{formatAmount(budgetAmount)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <p className="text-sm font-medium text-slate-600 mb-2">Spent</p>
          <p className={`text-3xl font-bold font-money ${isOver ? "text-red-600" : isApproaching ? "text-[#b45309]" : "text-slate-900"}`}>
            {formatAmount(spent)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <p className="text-sm font-medium text-slate-600 mb-2">Remaining</p>
          <p className={`text-3xl font-bold font-money ${remaining < 0 ? "text-red-600" : "text-slate-900"}`}>
            {formatAmount(remaining)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-base font-semibold text-slate-900 font-money">
            Monthly budget: {formatAmount(budgetAmount)}
          </p>
          {status !== "none" && (
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium
              ${isOver ? "bg-red-50 text-red-700" : isApproaching ? "bg-[#fffbeb] text-[#b45309]" : "bg-[#ecfdf5] text-[#047857]"}
            `}>
              {isOver ? "Over budget" : isApproaching ? "Approaching budget" : "Within budget"} · {Math.round(ratio)}%
            </span>
          )}
        </div>

        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden mb-4">
          <div
            className={`h-full transition-all ${isOver ? "bg-red-500" : isApproaching ? "bg-[#c2410c]" : "bg-[#047857]"}`}
            style={{ width: `${ratio}%` }}
          />
        </div>

        {budgetAmount > 0 && (
          <p className="text-sm text-slate-500">
            {remaining >= 0
              ? `${formatAmount(remaining)} left of ${formatAmount(budgetAmount)}.`
              : `${formatAmount(-remaining)} over your budget.`}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-8 h-fit">
          <div className="max-w-md mx-auto">
            <h2 className="text-lg font-semibold text-slate-900 mb-6 text-center">
              {budgetAmount > 0 ? "Update budget" : "Set a budget"} for {formatMonthLabel(month)}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Amount (RWF)
                </label>
                <input
                  type="number"
                  min={0}
                  step="1"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="e.g. 500000"
                  className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm text-slate-900
                             focus:outline-none focus:ring-2 focus:ring-[#047857] focus:border-[#047857]"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Set how much you plan to spend this month.
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-md bg-[#047857] text-white px-4 py-2.5 text-sm font-semibold
                           hover:bg-[#065f46] disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2"
              >
                {saving ? "Saving…" : budgetAmount > 0 ? "Update budget" : "Save budget"}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              Expenses this month
            </h2>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {recentExpenses.length}
            </span>
          </div>

          {recentExpenses.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">
              No expenses yet for {formatMonthLabel(month)}.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentExpenses.map((exp) => (
                <li key={exp.id}>
                  <Link
                    to={`/expenses/${exp.id}`}
                    className="flex items-center justify-between py-3 hover:bg-slate-50 transition-colors -mx-2 px-2 rounded-md"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {exp.title}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {formatDate(exp.date)} · {exp.categoryName}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-slate-900 font-money whitespace-nowrap">
                      {formatAmount(exp.amount)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link to="/expenses" className="text-sm font-medium text-[#047857] hover:text-[#065f46]">
              View all expenses →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}