// frontend/src/pages/Dashboard.tsx

import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { DashboardResponse } from "../types/expense";
import {
  formatCurrency,
  formatDate,
  formatMonthLabel,
  toMonthKey,
} from "../lib/format";
import { paymentMethodLabel } from "../lib/constants";

// Blues-only palette, dark → light.
const CHART_COLORS = [
  "#1E3A8A", // blue-900
  "#1E40AF", // blue-800
  "#1D4ED8", // blue-700
  "#2563EB", // blue-600
  "#3B82F6", // blue-500
  "#60A5FA", // blue-400
  "#7DA9F0",
  "#A5C4F3",
];

export default function Dashboard() {
  const { user } = useAuth();
  const [month, setMonth] = useState<string>(toMonthKey());
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Admins don't have a user dashboard ---
  if (user?.role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .get<DashboardResponse>("/expenses/dashboard", {
        params: { month },
      })
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err?.response?.data?.message ?? "Failed to load dashboard"
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [month]);

  if (loading) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (error || !data) {
    return (
      <div className="rounded-md bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3">
        {error ?? "Something went wrong"}
      </div>
    );
  }

  const {
    totalSpentThisMonth,
    totalSpentAllTime,
    highestExpense,
    monthlyBudget,
    recentExpenses,
    spendingByCategory,
  } = data;

  const remaining = monthlyBudget - totalSpentThisMonth;
  const ratio =
    monthlyBudget > 0
      ? Math.min((totalSpentThisMonth / monthlyBudget) * 100, 100)
      : 0;

  const status =
    monthlyBudget <= 0
      ? "none"
      : totalSpentThisMonth > monthlyBudget
      ? "over"
      : totalSpentThisMonth / monthlyBudget >= 0.8
      ? "approaching"
      : "within";

  const statusMeta = {
    none: {
      label: "No budget set",
      pill: "bg-slate-50 text-slate-700 border border-slate-200",
      bar: "bg-slate-400",
    },
    within: {
      label: "Within budget",
      pill: "bg-blue-50 text-blue-900 border border-blue-200",
      bar: "bg-blue-800",
    },
    approaching: {
      label: "Approaching budget",
      pill: "bg-amber-50 text-amber-900 border border-amber-200",
      bar: "bg-amber-500",
    },
    over: {
      label: "Over budget",
      pill: "bg-red-50 text-red-900 border border-red-200",
      bar: "bg-red-500",
    },
  }[status];

  // Bar chart data: categories sorted high → low, blues dark → light.
  const chartData = [...spendingByCategory]
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total)
    .map((c, i) => ({
      name: c.category,
      total: c.total,
      fill: CHART_COLORS[i % CHART_COLORS.length],
    }));

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Welcome, {user?.name}
          </h1>
          <p className="text-sm text-slate-500">
            Here's how your finances look for {formatMonthLabel(month)}.
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

      {/* Top stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Spent this month"
          value={formatCurrency(totalSpentThisMonth)}
          sub={formatMonthLabel(month)}
        />
        <StatCard
          label="Monthly budget"
          value={monthlyBudget > 0 ? formatCurrency(monthlyBudget) : "—"}
          sub={monthlyBudget > 0 ? "Your limit" : "Not set"}
        />
        <StatCard
          label="Remaining"
          value={monthlyBudget > 0 ? formatCurrency(remaining) : "—"}
          sub={
            monthlyBudget > 0
              ? remaining >= 0
                ? "Available to spend"
                : "Over your budget"
              : "Set a budget"
          }
          accent={remaining < 0 ? "text-red-700" : "text-slate-800"}
        />
        <StatCard
          label="All-time spent"
          value={formatCurrency(totalSpentAllTime)}
          sub="Since you started"
        />
      </div>

      {/* Budget status + highest expense */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-slate-700">
              Budget status
            </h2>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusMeta.pill}`}
            >
              {statusMeta.label}
            </span>
          </div>

          {monthlyBudget > 0 ? (
            <>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span>{formatCurrency(totalSpentThisMonth)} spent</span>
                <span>{Math.round(ratio)}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full ${statusMeta.bar} transition-all`}
                  style={{ width: `${ratio}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {remaining >= 0
                  ? `${formatCurrency(remaining)} left of ${formatCurrency(monthlyBudget)}.`
                  : `${formatCurrency(-remaining)} over your budget.`}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-500 py-6">
              You haven't set a budget for this month.{" "}
              <Link to="/budget" className="text-blue-700 hover:underline">
                Set one →
              </Link>
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-slate-700 mb-3">
            Highest expense
          </h2>
          {highestExpense > 0 ? (
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {formatCurrency(highestExpense)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Largest single expense so far
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500 py-4">
              No expenses recorded yet.
            </p>
          )}
        </div>
      </div>

      {/* Bar chart + recent expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-slate-700 mb-4">
            Spending by category
          </h2>

          {chartData.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">
              No spending yet for {formatMonthLabel(month)}.
            </p>
          ) : (
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
                >
                  <CartesianGrid
                    stroke="#E2E8F0"
                    strokeDasharray="3 3"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12, fill: "#64748B" }}
                    tickFormatter={(v) => formatCurrency(Number(v))}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#334155" }}
                    width={110}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #E2E8F0",
                      fontSize: 12,
                      background: "#FFFFFF",
                    }}
                  />
                  <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-slate-700">
              Recent expenses
            </h2>
            <Link
              to="/expenses"
              className="text-xs text-blue-700 hover:text-blue-800"
            >
              View all →
            </Link>
          </div>

          {recentExpenses.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">
              Nothing here yet.{" "}
              <Link
                to="/expenses/new"
                className="text-blue-700 hover:underline"
              >
                Add one →
              </Link>
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
                        {formatDate(exp.date)} · {exp.categoryName} ·{" "}
                        {paymentMethodLabel(exp.paymentMethod)}
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
    <div className="bg-white rounded-lg shadow p-5">
      <p className="text-xs uppercase tracking-wide text-slate-600 font-medium">
        {label}
      </p>
      <p className={`text-2xl font-bold mt-2 ${accent}`}>{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}