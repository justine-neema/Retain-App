// frontend/src/pages/admin/AdminLayout.tsx

import { NavLink, Outlet } from "react-router-dom";

const TABS = [
  { to: "/admin/insights", label: "Insights" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/expenses", label: "All expenses" },
  { to: "/admin/categories", label: "Categories" },
];

export default function AdminLayout() {
  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? "bg-blue-700 text-white"
        : "text-slate-600 hover:bg-slate-100"
    }`;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Admin</h1>
        <p className="text-sm text-slate-500">
          Manage categories and view platform insights.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-3">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} className={linkClasses}>
            {t.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}