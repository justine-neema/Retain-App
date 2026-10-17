// frontend/src/pages/admin/AdminDashboard.tsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
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

export default function AdminDashboard() {
  const { user } = useAuth();
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
          setError(err?.response?.data?.message ?? "Failed to load dashboard");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="text-sm text-slate-500 py-12 text-center">
        Loading dashboard…
      </div>
    );
  }

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
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          Welcome, {user?.name}
        </h1>
        <p className="text-sm text-slate-500">
          Here's how Retain is doing across all users.
        </p>
      </div>

      {/* Primary stats — 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total users"
          value={String(data.totalUsers)}
          sub="Registered accounts"
          to="/admin/users"
        />
        <StatCard
          label="Total expenses"
          value={String(data.totalExpenses)}
          sub="Recorded across all users"
          to="/admin/expenses"
        />
        <StatCard
          label="Total value"
          value={formatCurrency(data.totalExpenseValue)}
          sub="Sum of all expenses"
        />
        <StatCard
          label="This month"
          value={String(data.expensesThisMonth)}
          sub="Expenses recorded"
        />
      </div>

      {/* Total spending per category */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-slate-800">
            Total spending per category
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Across all users, all time.
          </p>
        </div>

        {data.totalSpendingPerCategory.length === 0 ? (
          <EmptyState text="No expenses recorded yet." />
        ) : (
          <ul className="space-y-3">
            {data.totalSpendingPerCategory.map((c) => {
              const pct = (c.total / maxCategoryTotal) * 100;
              return (
                <li key={c.category}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-700 font-medium">
                      {c.category}
                    </span>
                    <span className="text-slate-500 tabular-nums">
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

      {/* Top 5 / Bottom 5 side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RankListCard
          title="Top 5 most-used categories"
          subtitle="Most expenses recorded"
          items={data.top5MostUsedCategories}
          tone="blue"
        />
        <RankListCard
          title="Bottom 5 least-used categories"
          subtitle="Fewest expenses recorded"
          items={data.bottom5LeastUsedCategories}
          tone="slate"
        />
      </div>

      {/* Recent activity — 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently added expenses */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Recently added expenses
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Latest across all users.
              </p>
            </div>
            <Link
              to="/admin/expenses"
              className="text-xs text-blue-700 hover:text-blue-800 whitespace-nowrap"
            >
              View all →
            </Link>
          </div>

          {data.recentlyAddedExpenses.length === 0 ? (
            <EmptyState text="No expenses yet." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recentlyAddedExpenses.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between py-2.5 gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-slate-800 truncate">
                      {e.title}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {e.user_email} · {e.date?.slice(0, 10)}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-slate-800 whitespace-nowrap tabular-nums">
                    {formatCurrency(Number(e.amount))}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recently registered users */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                Recently registered users
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Newest accounts on the platform.
              </p>
            </div>
            <Link
              to="/admin/users"
              className="text-xs text-blue-700 hover:text-blue-800 whitespace-nowrap"
            >
              View all →
            </Link>
          </div>

          {data.recentlyRegisteredUsers.length === 0 ? (
            <EmptyState text="No users yet." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recentlyRegisteredUsers.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between py-2.5 gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={u.name} />
                    <div className="min-w-0">
                      <p className="text-sm text-slate-800 truncate">
                        {u.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {u.email}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 whitespace-nowrap">
                    {new Date(u.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
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

/* -------------------- Reusable pieces -------------------- */

function StatCard({
  label,
  value,
  sub,
  to,
}: {
  label: string;
  value: string;
  sub?: string;
  to?: string;
}) {
  const inner = (
    <>
      <p className="text-xs uppercase tracking-wide text-slate-600 font-medium">
        {label}
      </p>
      <p className="text-2xl font-bold mt-2 text-slate-800 tabular-nums">
        {value}
      </p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      {to && <p className="text-xs text-blue-700 mt-2">View all →</p>}
    </>
  );

  const cls =
    "block bg-white rounded-lg shadow p-5 transition-shadow" +
    (to ? " hover:shadow-md cursor-pointer" : "");

  return to ? (
    <Link to={to} className={cls}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

function RankListCard({
  title,
  subtitle,
  items,
  tone,
}: {
  title: string;
  subtitle: string;
  items: { category: string; usageCount: number }[];
  tone: "blue" | "slate";
}) {
  const badgeCls =
    tone === "blue"
      ? "bg-blue-50 text-blue-800 border border-blue-200"
      : "bg-slate-100 text-slate-700 border border-slate-200";

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
      </div>

      {items.length === 0 ? (
        <EmptyState text="No data yet." />
      ) : (
        <ol className="space-y-2">
          {items.map((c, i) => (
            <li
              key={c.category}
              className="flex items-center justify-between py-2 gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium ${badgeCls} shrink-0`}
                >
                  {i + 1}
                </span>
                <span className="text-sm text-slate-800 truncate">
                  {c.category}
                </span>
              </div>
              <span className="text-xs text-slate-500 whitespace-nowrap tabular-nums">
                {c.usageCount} {c.usageCount === 1 ? "use" : "uses"}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-50 text-blue-800 border border-blue-100 text-xs font-medium shrink-0">
      {initials || "?"}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="text-sm text-slate-500 py-6 text-center">{text}</p>
  );
}