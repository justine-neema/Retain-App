import { useState } from "react";
import { formatDate } from "../../lib/format";
import { useFetch } from "../../hooks/useFetch";
import DataTable, { Column } from "../../components/DataTable";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  created_at: string;
}

export default function AdminUsers() {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Replaced useState + useEffect with our custom hook
  const { data, loading, error } = useFetch<{ users: AdminUser[] }>("/admin/users");
  
  const users = data?.users ?? [];

  const filtered = users.filter((u) => 
    u.name.toLowerCase().includes(query.toLowerCase()) || 
    u.email.toLowerCase().includes(query.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const columns: Column<AdminUser>[] = [
    {
      key: "user",
      header: "User",
      render: (u) => (
        <div>
          <p className="text-sm font-medium text-slate-900">{u.name}</p>
          <p className="text-xs text-slate-500">{u.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (u) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
          u.role === "ADMIN" ? "bg-[#ecfdf5] text-[#047857] ring-1 ring-inset ring-[#d1fae5]" : "bg-slate-100 text-slate-600"
        }`}>
          {u.role}
        </span>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      isRight: true,
      render: (u) => <span className="text-sm text-slate-600">{formatDate(u.created_at)}</span>,
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Users</h1>
          <p className="text-sm text-slate-500 mt-1">All accounts registered on Retain.</p>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }}
          placeholder="Search by name or email…"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm bg-white w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-[#047857]"
        />
      </div>

      {error && <div className="mb-6 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>}

      <DataTable
        data={paginated}
        columns={columns}
        keyExtractor={(u) => u.id}
        loading={loading}
        emptyMessage="No users found."
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filtered.length}
      />
    </div>
  );
}