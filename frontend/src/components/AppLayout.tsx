import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const USER_NAV = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/expenses", label: "Expenses" },
  { to: "/budget", label: "Budget" },
];

const ADMIN_NAV = [
  { to: "/admin/dashboard", label: "Admin dashboard" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/expenses", label: "All expenses" },
  { to: "/admin/categories", label: "Categories" },
];

function initials(name?: string): string {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    setMobileOpen(false);
    setProfileOpen(false);
    logout();
    navigate("/login");
  }

  const isAdmin = user?.role === "ADMIN";
  const items = isAdmin ? ADMIN_NAV : USER_NAV;

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? "bg-[#047857] text-white" 
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    
    <div className="h-screen overflow-hidden bg-[#f9fafb] lg:flex">
      
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 h-14 bg-[#0f172a] text-white flex items-center justify-between px-4 shrink-0">
        <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 rounded-md hover:bg-slate-800">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-bold tracking-wide">Retain</span>
        <div className="w-10" />
         <div className="content-end">
           <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-red-600 hover:text-red-700 w-full text-left"
                >
                  Log out
                </button>
         </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-[#0f172a] text-white flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:inset-auto lg:shrink-0 lg:h-full
        `}
      >
        <div className="flex items-center px-6 h-20 shrink-0">
          <h1 className="text-xl font-bold tracking-tight">Retain</h1>
        </div>

        {/* Scrollable nav area if menu gets too long */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-1 mt-2">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClasses} onClick={() => setMobileOpen(false)}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto">
        
        {/* Desktop Top Bar */}
        <header className="hidden lg:flex h-20 bg-white items-center justify-end px-8 border-b border-slate-100 shrink-0 sticky top-0 z-10">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 hover:bg-slate-50 rounded-full pl-2 pr-1 py-1 transition-colors"
            >
              <span className="text-sm font-medium text-slate-700">{user?.name}</span>
              <div className="h-10 w-10 rounded-full bg-[#0f172a] text-white flex items-center justify-center text-sm font-bold">
                {initials(user?.name)}
              </div>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-100 p-4 z-50">
                <p className="text-sm font-medium text-slate-900 truncate">{user?.email}</p>
                <p className="text-xs text-slate-500 mt-1 capitalize">Role: {user?.role.toLowerCase()}</p>
                <hr className="my-3 border-slate-100" />
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-red-600 hover:text-red-700 w-full text-left"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}