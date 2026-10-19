import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useFetch } from "../../hooks/useFetch";

interface InsightsResponse {
  totalUsers: number;
  totalExpenses: number;
  totalExpenseValue: number;
  expensesThisMonth: number;
  totalSpendingPerCategory: { category: string; total: number }[];
  top5MostUsedCategories: { category: string; usageCount: number }[];
  bottom5LeastUsedCategories: { category: string; usageCount: number }[];
}

export default function AdminDashboard() {
  const { user } = useAuth();
  
  // Replaced useState + useEffect with our custom hook
  const { data, loading, error } = useFetch<InsightsResponse>("/admin/insights");

  if (loading) return <p className="text-sm text-slate-500 py-10">Loading dashboard…</p>;
  if (error || !data) return <div className="text-red-600 text-sm py-10">{error ?? "Something went wrong"}</div>;

  const formatAmount = (amount: number) => new Intl.NumberFormat("en-RW").format(amount);
  const maxCategoryTotal = Math.max(1, ...data.totalSpendingPerCategory.map(c => c.total));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Welcome, {user?.name}. Here's the platform overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Link to="/admin/users" className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow group">
          <p className="text-sm font-medium text-slate-600 mb-2 group-hover:text-[#047857] transition-colors">Total users</p>
          <p className="text-3xl font-bold text-slate-900 font-money">{formatAmount(data.totalUsers)}</p>
        </Link>
        <Link to="/admin/expenses" className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow group">
          <p className="text-sm font-medium text-slate-600 mb-2 group-hover:text-[#047857] transition-colors">Total expenses</p>
          <p className="text-3xl font-bold text-slate-900 font-money">{formatAmount(data.totalExpenses)}</p>
        </Link>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <p className="text-sm font-medium text-slate-600 mb-2">Total value</p>
          <p className="text-3xl font-bold text-slate-900 font-money">{formatAmount(data.totalExpenseValue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <p className="text-sm font-medium text-slate-600 mb-2">This month</p>
          <p className="text-3xl font-bold text-slate-900 font-money">{formatAmount(data.expensesThisMonth)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6">Total spending per category</h2>
        {data.totalSpendingPerCategory.length === 0 ? (
          <p className="text-sm text-slate-500">No expenses recorded yet.</p>
        ) : (
          <div className="space-y-5">
            {data.totalSpendingPerCategory.map((c) => (
              <div key={c.category}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-700 font-medium">{c.category}</span>
                  <span className="text-slate-900 font-bold font-money">{formatAmount(c.total)}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-[#047857] rounded-full" style={{ width: `${(c.total / maxCategoryTotal) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Top 5 most-used categories</h2>
          <ol className="space-y-3">
            {data.top5MostUsedCategories.map((c, i) => (
              <li key={c.category} className="flex items-center justify-between text-sm">
                <span className="text-slate-800 flex items-center gap-3">
                  <span className="h-6 w-6 rounded-full bg-[#ecfdf5] text-[#047857] flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  {c.category}
                </span>
                <span className="text-slate-500 font-medium">{c.usageCount} uses</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Bottom 5 least-used categories</h2>
          <ol className="space-y-3">
            {data.bottom5LeastUsedCategories.map((c, i) => (
              <li key={c.category} className="flex items-center justify-between text-sm">
                <span className="text-slate-800 flex items-center gap-3">
                  <span className="h-6 w-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  {c.category}
                </span>
                <span className="text-slate-500 font-medium">{c.usageCount} uses</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}