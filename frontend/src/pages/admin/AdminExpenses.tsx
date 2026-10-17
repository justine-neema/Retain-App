// frontend/src/pages/admin/AdminExpenses.tsx

import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { formatCurrency, formatDate } from "../../lib/format";
import { paymentMethodLabel } from "../../lib/constants";

interface AdminExpense {
  id: string;
  title: string;
  amount: number;
  date: string;
  paymentMethod: string;
  notes: string;
  createdAt: string;
  categoryName: string;
  userEmail: string;
  userName: string;
}

interface AdminExpensesResponse {
  expenses: AdminExpense[];
}

export default function AdminExpenses() {
  const [expenses, setExpenses] = useState<AdminExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    api
      .get<AdminExpensesResponse>("/admin/expenses")
      .then((res) => {
        if (!cancelled) setExpenses(res.data.expenses);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err?.response?.data?.message ?? "Failed to load expenses");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return expenses;
    const q = query.toLowerCase();
    return expenses.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.userEmail.toLowerCase().includes(q) ||
        e.categoryName.toLowerCase().includes(q)
    );
  }, [expenses, query]);

  const totalValue = filtered.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">All expenses</h1>
          <p className="text-sm text-slate-500">
            Every expense recorded across all users.
          </p>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, user, or category…"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm bg-white w-full sm:w-80
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm px-3 py-2">
          {error}
        </div>
      )}

      {/* Summary band */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <SummaryCard
            label="Showing"
            value={`${filtered.length} of ${expenses.length}`}
            sub={filtered.length === 1 ? "expense" : "expenses"}
          />
          <SummaryCard
            label="Total value"
            value={formatCurrency(totalValue)}
            sub="Sum of shown expenses"
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Table header (desktop) */}
        <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-medium">
          <span className="col-span-5">Expense</span>
          <span className="col-span-3">User</span>
          <span className="col-span-2">Date</span>
          <span className="col-span-2 text-right">Amount</span>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-slate-500 text-center">
            {query ? "No expenses match your search." : "No expenses yet."}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((e) => (
              <li
                key={e.id}
                className="px-5 py-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
              >
                {/* Expense */}
                <div className="md:col-span-5 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {e.title}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {e.categoryName} · {paymentMethodLabel(e.paymentMethod)}
                  </p>
                </div>

                {/* User */}
                <div className="md:col-span-3 min-w-0">
                  <p className="text-sm text-slate-800 truncate">
                    {e.userName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {e.userEmail}
                  </p>
                </div>

                {/* Date */}
                <div className="md:col-span-2 text-xs text-slate-500">
                  {formatDate(e.date)}
                </div>

                {/* Amount */}
                <div className="md:col-span-2 md:text-right text-sm font-semibold text-slate-800 tabular-nums">
                  {formatCurrency(e.amount)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <p className="text-xs uppercase tracking-wide text-slate-600 font-medium">
        {label}
      </p>
      <p className="text-2xl font-bold mt-2 text-slate-800 tabular-nums">
        {value}
      </p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}