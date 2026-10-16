// frontend/src/pages/Budget.tsx

import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { Budget, BudgetResponse } from "../types/budget";
import type { Expense, ExpenseSummary } from "../types/expense";
import {
  formatCurrency,
  formatDate,
  formatMonthLabel,
  toMonthKey,
} from "../lib/format";
import { BUDGET_THRESHOLDS } from "../lib/constants";

type Status = "within" | "approaching" | "over";

function getStatus(spent: number, budget: number): Status {
  if (budget <= 0) return "within";
  const ratio = spent / budget;
  if (ratio > BUDGET_THRESHOLDS.over) return "over";
  if (ratio >= BUDGET_THRESHOLDS.approaching) return "approaching";
  return "within";
}

// Blues only for "within" — softer surfaces, darker text for accessibility.
const STATUS_META: Record<
  Status,
  { label: string; bar: string; pill: string; ring: string }
> = {
  within: {
    label: "Within budget",
    bar: "bg-blue-800",
    pill: "bg-blue-50 text-blue-900 border border-blue-200",
    ring: "ring-blue-200",
  },
  approaching: {
    label: "Approaching budget",
    bar: "bg-amber-500",
    pill: "bg-amber-50 text-amber-900 border border-amber-200",
    ring: "ring-amber-200",
  },
  over: {
    label: "Over budget",
    bar: "bg-red-500",
    pill: "bg-red-50 text-red-900 border border-red-200",
    ring: "ring-red-200",
  },
};

export default function BudgetPage() {
  const [month, setMonth] = useState<string>(toMonthKey());
  const [budget, setBudget] = useState<Budget | null>(null);
  const [spent, setSpent] = useState<number>(0);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [amountInput, setAmountInput] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setSuccess(null);

    Promise.all([
      api.get<BudgetResponse>("/budgets", { params: { month } }),
      api.get<ExpenseSummary>("/expenses/summary", { params: { month } }),
    ])
      .then(([budgetRes, summaryRes]) => {
        if (cancelled) return;
        const b = budgetRes.data.budget;
        setBudget(b);
        setAmountInput(b ? String(b.amount) : "");
        setSpent(summaryRes.data.totalSpent);
        setRecentExpenses(summaryRes.data.recentExpenses ?? []);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err?.response?.data?.message ?? "Failed to load budget");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [month]);

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
      const res = await api.post<BudgetResponse>("/budgets", {
        month,
        amount,
      });
      setBudget(res.data.budget);
      setSuccess("Budget saved");
      setTimeout(() => setSuccess(null), 2500);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to save budget");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  const budgetAmount = budget ? Number(budget.amount) : 0;
  const remaining = budgetAmount - spent;
  const status = getStatus(spent, budgetAmount);
  const statusMeta = STATUS_META[status];
  const ratio =
    budgetAmount > 0 ? Math.min((spent / budgetAmount) * 100, 100) : 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Monthly budget</h1>
          <p className="text-sm text-slate-500">
            Set a limit and track how your spending compares.
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Month
          </label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm bg-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm px-3 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-sm px-3 py-2">
          {success}
        </div>
      )}

      {/* Top stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Budget"
          value={formatCurrency(budgetAmount)}
          sub={formatMonthLabel(month)}
        />
        <StatCard
          label="Spent"
          value={formatCurrency(spent)}
          sub={
            budgetAmount > 0
              ? `${Math.round(ratio)}% of budget`
              : "No budget set"
          }
          accent={
            status === "over"
              ? "text-red-700"
              : status === "approaching"
              ? "text-amber-700"
              : "text-slate-800"
          }
        />
        <StatCard
          label="Remaining"
          value={formatCurrency(remaining)}
          sub={remaining >= 0 ? "Available to spend" : "Over your budget"}
          accent={remaining < 0 ? "text-red-700" : "text-slate-800"}
        />
      </div>

      {/* Progress card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-slate-700">
            Progress — {formatMonthLabel(month)}
          </h2>
          {budgetAmount > 0 && (
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusMeta.pill}`}
            >
              {statusMeta.label}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span>{formatCurrency(spent)} spent</span>
          <span>{Math.round(ratio)}%</span>
        </div>

        <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className={`h-full ${statusMeta.bar} transition-all`}
            style={{ width: `${ratio}%` }}
          />
        </div>

        {budgetAmount > 0 && (
          <p className="text-xs text-slate-500 mt-2">
            {remaining >= 0
              ? `${formatCurrency(remaining)} left of ${formatCurrency(budgetAmount)}.`
              : `${formatCurrency(-remaining)} over your budget.`}
          </p>
        )}
      </div>

      {/* Bottom: form + expenses list */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-3 bg-white rounded-lg shadow p-6 space-y-4 h-fit"
        >
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              {budget ? "Update budget" : "Set a budget"}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              For {formatMonthLabel(month)}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Amount (RWF)
            </label>
            <input
              type="number"
              min={0}
              step="1"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="e.g. 500000"
              className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-base
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1.5">
              Set how much you plan to spend this month.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto rounded-md bg-blue-700 text-white px-5 py-2.5 text-sm font-medium
                         hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Saving…" : budget ? "Update budget" : "Save budget"}
            </button>
          </div>
        </form>

        <div className="lg:col-span-2 bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-slate-700">
              Expenses this month
            </h2>
            <span className="text-xs text-slate-500">
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
                    className="flex items-center justify-between py-2.5 -mx-2 px-2 rounded hover:bg-slate-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-800 truncate">
                        {exp.title}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {formatDate(exp.date)} · {exp.categoryName}
                      </p>
                    </div>
                    <p className="ml-3 text-sm font-medium text-slate-800 whitespace-nowrap">
                      {formatCurrency(exp.amount)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link
              to="/expenses"
              className="text-xs text-blue-700 hover:text-blue-800"
            >
              View all expenses →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent = "text-slate-800",
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <p className="text-xs uppercase tracking-wide text-slate-600 font-medium">
        {label}
      </p>
      <p className={`text-3xl font-bold mt-2 ${accent}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}