// frontend/src/pages/admin/AdminExpenses.tsx

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            All expenses
          </h2>
          <p className="text-sm text-slate-500">
            {loading
              ? "Loading…"
              : `${filtered.length} of ${expenses.length} ${
                  expenses.length === 1 ? "expense" : "expenses"
                } · ${formatCurrency(totalValue)} total`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, user, or category…"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm bg-white
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Link
            to="/admin/insights"
            className="text-xs text-blue-700 hover:text-blue-800 whitespace-nowrap"
          >
            ← Back to insights
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm px-3 py-2">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No expenses match.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((e) => (
              <li key={e.id} className="px-5 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {e.title}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {e.userName} ({e.userEmail}) · {formatDate(e.date)} ·{" "}
                      {e.categoryName} · {paymentMethodLabel(e.paymentMethod)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 whitespace-nowrap">
                    {formatCurrency(e.amount)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}