// frontend/src/components/ProtectedRoute.tsx

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Blocks access to its child routes unless the user is logged in.
 * While auth state is loading (bootstrap check), renders a neutral loader
 * so we don't flash-redirect on refresh.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-500 text-sm">Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Remember where the user wanted to go so login can send them back.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

/**
 * Same as ProtectedRoute but also requires ADMIN role.
 * Must be nested INSIDE <ProtectedRoute />.
 */
export function AdminRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-slate-500 text-sm">Loading…</p>
      </div>
    );
  }

  if (user?.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}