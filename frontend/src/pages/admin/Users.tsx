// frontend/src/pages/admin/Users.tsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import { formatDate } from "../../lib/format";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  created_at: string;
}

interface UsersResponse {
  users: AdminUser[];
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    api
      .get<UsersResponse>("/admin/users")
      .then((res) => {
        if (!cancelled) setUsers(res.data.users);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err?.response?.data?.message ?? "Failed to load users");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = users.filter((u) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">All users</h2>
          <p className="text-sm text-slate-500">
            {loading
              ? "Loading…"
              : `${filtered.length} of ${users.length} ${
                  users.length === 1 ? "user" : "users"
                }`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
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
          <p className="p-6 text-sm text-slate-500">No users match.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((u) => (
              <li
                key={u.id}
                className="px-5 py-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 truncate">
                    {u.name}
                    {u.role === "ADMIN" && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-blue-50 border border-blue-200 text-blue-800 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                        admin
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{u.email}</p>
                </div>
                <p className="text-xs text-slate-500 whitespace-nowrap">
                  Joined {formatDate(u.created_at)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}