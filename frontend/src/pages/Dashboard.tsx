// frontend/src/pages/Dashboard.tsx

import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">
        Welcome, {user?.name}
      </h1>
      <p className="text-sm text-slate-500 mb-6">
        Dashboard widgets coming next.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-xs uppercase text-slate-500">Total spent (this month)</p>
          <p className="text-2xl font-bold text-slate-800 mt-2">—</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-xs uppercase text-slate-500">Monthly budget</p>
          <p className="text-2xl font-bold text-slate-800 mt-2">—</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-xs uppercase text-slate-500">Remaining</p>
          <p className="text-2xl font-bold text-slate-800 mt-2">—</p>
        </div>
      </div>
    </div>
  );
}