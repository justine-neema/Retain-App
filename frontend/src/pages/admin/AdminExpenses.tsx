import { useState } from "react";
import { formatCurrency, formatDate } from "../../lib/format";
import { paymentMethodLabel } from "../../lib/constants";
import { useFetch } from "../../hooks/useFetch";
import DataTable, { Column } from "../../components/DataTable";

interface AdminExpense {
  id: string; 
  title: string; 
  amount: number; 
  date: string; 
  paymentMethod: string;
  notes: string; 
  createdAt: string; 
  categoryName: string; 
  userEmail: string; 
  userName: string;
}

export default function AdminExpenses() {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Replaced useState + useEffect with our custom hook
  const { data, loading, error } = useFetch<{ expenses: AdminExpense[] }>("/admin/expenses");
  
  const expenses = data?.expenses ?? [];

  const filtered = expenses.filter((e) => 
    e.title.toLowerCase().includes(query.toLowerCase()) || 
    e.userEmail.toLowerCase().includes(query.toLowerCase()) || 
    e.categoryName.toLowerCase().includes(query.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const columns: Column<AdminExpense>[] = [
    {
      key: "expense",
      header: "Expense",
      render: (e) => (
        <div>
          <p className="text-sm font-medium text-slate-900">{e.title}</p>
          <p className="text-xs text-slate-500">{e.categoryName} · {paymentMethodLabel(e.paymentMethod)}</p>
        </div>
      ),
    },
    {
      key: "user",
      header: "User",
      render: (e) => (
        <div>
          <p className="text-sm text-slate-900">{e.userName}</p>
          <p className="text-xs text-slate-500">{e.userEmail}</p>
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (e) => <span className="text-sm text-slate-600">{formatDate(e.date)}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      isRight: true,
      render: (e) => <span className="text-sm font-bold text-slate-900 font-money">{formatCurrency(e.amount)}</span>,
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">All Expenses</h1>
          <p className="text-sm text-slate-500 mt-1">Every expense recorded across all users.</p>
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }}
          placeholder="Search by title, user, or category…"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm bg-white w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-[#047857]"
        />
      </div>

      {error && <div className="mb-6 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>}

      <DataTable
        data={paginated}
        columns={columns}
        keyExtractor={(e) => e.id}
        loading={loading}
        emptyMessage="No expenses found."
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={filtered.length}
      />
    </div>
  );
}