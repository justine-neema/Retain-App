// frontend/src/pages/admin/Users.tsx

import { useEffect, useState } from "react";
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
      {/* Page header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Users</h1>
          <p className="text-sm text-slate-500">
            All accounts registered on Retain.
          </p>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email…"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm bg-white w-full sm:w-72
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm px-3 py-2">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-12 gap-3 px-5 py-3 border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-medium">
          <span className="col-span-6">User</span>
          <span className="col-span-3">Role</span>
          <span className="col-span-3 text-right">Joined</span>
        </div>

        {/* Rows */}
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-slate-500 text-center">
            {query ? "No users match your search." : "No users yet."}
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((u) => (
              <li
                key={u.id}
                className="px-5 py-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
              >
                {/* User col */}
                <div className="sm:col-span-6 flex items-center gap-3 min-w-0">
                  <Avatar name={u.name} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {u.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {u.email}
                    </p>
                  </div>
                </div>

                {/* Role col */}
                <div className="sm:col-span-3">
                  <RoleBadge role={u.role} />
                </div>

                {/* Joined col */}
                <div className="sm:col-span-3 sm:text-right text-xs text-slate-500">
                  {formatDate(u.created_at)}
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
            Showing {filtered.length} of {users.length}{" "}
            {users.length === 1 ? "user" : "users"}
          </div>
        )}
      </div>
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
    <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-blue-50 text-blue-800 border border-blue-100 text-xs font-medium shrink-0">
      {initials || "?"}
    </span>
  );
}

function RoleBadge({ role }: { role: "USER" | "ADMIN" }) {
  const cls =
    role === "ADMIN"
      ? "bg-blue-50 text-blue-800 border border-blue-200"
      : "bg-slate-100 text-slate-700 border border-slate-200";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${cls}`}
    >
      {role}
    </span>
  );
}