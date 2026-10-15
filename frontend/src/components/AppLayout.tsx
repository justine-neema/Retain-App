// frontend/src/components/AppLayout.tsx

import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface NavItem {
  to: string;
  label: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/expenses", label: "Expenses" },
  { to: "/budget", label: "Budget" },
  { to: "/admin", label: "Admin", adminOnly: true },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    setMobileOpen(false);
    logout();
    navigate("/login");
  }

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || user?.role === "ADMIN"
  );

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      {/* ============================================================
          MOBILE / TABLET TOP BAR
          Visible below lg. Sticky at the top.
         ============================================================ */}
      <header className="lg:hidden sticky top-0 z-30 h-14 bg-slate-900 text-white flex items-center justify-between px-4 shadow">
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="p-2 -ml-2 rounded-md hover:bg-slate-800"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <span className="font-semibold tracking-wide">Retain</span>

        {/* Placeholder keeps title visually centered */}
        <div className="w-10" />
      </header>

      {/* ============================================================
          MOBILE / TABLET BACKDROP
          Covers the rest of the screen while the drawer is open.
         ============================================================ */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ============================================================
          SIDEBAR
          - < lg: fixed drawer, translated off-screen unless open
          - ≥ lg: sticky, always visible, full height
         ============================================================ */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64
          bg-slate-900 text-white flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-auto
        `}
      >
        {/* ------ Brand block (always visible) ------ */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800">
          <div>
            <h1 className="text-xl font-bold leading-tight">Retain</h1>
            <p className="text-xs text-slate-400 mt-1">
              Personal finance tracker
            </p>
          </div>

          {/* Close button — mobile/tablet only */}
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="lg:hidden p-1.5 -mr-1 rounded-md hover:bg-slate-800"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l12 12M6 18L18 6"
              />
            </svg>
          </button>
        </div>

        {/* ------ Navigation ------ */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClasses}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* ------ User + Sign out ------ */}
        <div className="border-t border-slate-800 p-4">
          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          <p className="text-xs text-slate-500 mb-3">
            Role: {user?.role}
          </p>
          <button
            onClick={handleLogout}
            className="w-full rounded-md bg-slate-800 text-slate-200 px-3 py-2 text-sm hover:bg-slate-700 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ============================================================
          MAIN CONTENT
         ============================================================ */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}