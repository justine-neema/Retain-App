// frontend/src/pages/admin/Insights.tsx

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { formatCurrency } from "../../lib/format";

interface InsightsResponse {
  totalUsers: number;
  totalExpenses: number;
  totalExpenseValue: number;
  expensesThisMonth: number;
  totalSpendingPerCategory: { category: string; total: number }[];
  top5MostUsedCategories: { category: string; usageCount: number }[];
  bottom5LeastUsedCategories: { category: string; usageCount: number }[];
  recentlyAddedExpenses: {
    id: string;
    title: string;
    amount: string;
    date: string;
    user_email: string;
  }[];
  recentlyRegisteredUsers: {
    id: string;
    name: string;
    email: string;
    created_at: string;
  }[];
}

export default function AdminInsights() {
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    api
      .get<InsightsResponse>("/admin/insights")
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err?.response?.data?.message ?? "Failed to load insights");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;

  if (error || !data) {
    return (
      <div className="rounded-md bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3">
        {error ?? "Something went wrong"}
      </div>
    );
  }

  const maxCategoryTotal = Math.max(
    1,
    ...data.totalSpendingPerCategory.map((c) => c.total)
  );

  return (
    <div className="space-y-6">
      {/* Top stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total users" value={String(data.totalUsers)} />
        <StatCard
          label="Total expenses"
          value={String(data.totalExpenses)}
        />
        <StatCard
          label="Total value"
          value={formatCurrency(data.totalExpenseValue)}
        />
        <StatCard
          label="Expenses this month"
          value={String(data.expensesThisMonth)}
        />
      </div>

      {/* Spending per category */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-sm font-medium text-slate-700 mb-4">
          Total spending per category
        </h2>

        {data.totalSpendingPerCategory.length === 0 ? (
          <p className="text-sm text-slate-500">No expenses recorded yet.</p>
        ) : (
          <ul className="space-y-3">
            {data.totalSpendingPerCategory.map((c) => {
              const pct = (c.total / maxCategoryTotal) * 100;
              return (
                <li key={c.category}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium">
                      {c.category}
                    </span>
                    <span className="text-slate-500">
                      {formatCurrency(c.total)}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-blue-700 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Top / bottom used categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-slate-700 mb-4">
            Top 5 most-used categories
          </h2>
          {data.top5MostUsedCategories.length === 0 ? (
            <p className="text-sm text-slate-500">No data yet.</p>
          ) : (
            <ol className="space-y-2">
              {data.top5MostUsedCategories.map((c, i) => (
                <li
                  key={c.category}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-slate-700">
                    <span className="text-slate-400 mr-2">{i + 1}.</span>
                    {c.category}
                  </span>
                  <span className="text-slate-500 text-xs">
                    {c.usageCount} use{c.usageCount === 1 ? "" : "s"}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-slate-700 mb-4">
            Bottom 5 least-used categories
          </h2>
          {data.bottom5LeastUsedCategories.length === 0 ? (
            <p className="text-sm text-slate-500">No data yet.</p>
          ) : (
            <ol className="space-y-2">
              {data.bottom5LeastUsedCategories.map((c, i) => (
                <li
                  key={c.category}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-slate-700">
                    <span className="text-slate-400 mr-2">{i + 1}.</span>
                    {c.category}
                  </span>
                  <span className="text-slate-500 text-xs">
                    {c.usageCount} use{c.usageCount === 1 ? "" : "s"}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-slate-700 mb-4">
            Recently added expenses
          </h2>
          {data.recentlyAddedExpenses.length === 0 ? (
            <p className="text-sm text-slate-500">No expenses yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recentlyAddedExpenses.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-slate-800 truncate">
                      {e.title}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {e.user_email} · {e.date?.slice(0, 10)}
                    </p>
                  </div>
                  <p className="ml-3 text-sm font-medium text-slate-800 whitespace-nowrap">
                    {formatCurrency(Number(e.amount))}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-slate-700 mb-4">
            Recently registered users
          </h2>
          {data.recentlyRegisteredUsers.length === 0 ? (
            <p className="text-sm text-slate-500">No users yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recentlyRegisteredUsers.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-slate-800 truncate">
                      {u.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {u.email}
                    </p>
                  </div>
                  <p className="ml-3 text-xs text-slate-500 whitespace-nowrap">
                    {new Date(u.created_at).toLocaleDateString()}
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-5">
      <p className="text-xs uppercase tracking-wide text-slate-600 font-medium">
        {label}
      </p>
      <p className="text-2xl font-bold mt-2 text-slate-800">{value}</p>
    </div>
  );
}