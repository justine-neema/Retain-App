import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAppDispatch, useAppSelector } from "../redux/store";
import { setPage } from "../redux/filtersSlice";
import { useFetch } from "../hooks/useFetch";
import type { Category, CategoryListResponse } from "../types/category";
import type { Expense, ExpenseListResponse } from "../types/expense";
import { formatCurrency, formatDate } from "../lib/format";
import { paymentMethodLabel } from "../lib/constants";
import ExpenseFilters from "../components/expenses/ExpenseFilters";
import ExpenseFormModal from "../components/expenses/ExpenseFormModal";

export default function ExpensesList() {
  const { user } = useAuth();
  const filters = useAppSelector((s) => s.filters);
  const dispatch = useAppDispatch();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  // Fetch categories for the dropdown
  const { data: categoriesData } = useFetch<CategoryListResponse>("/categories");
  const categories: Category[] = categoriesData?.categories ?? [];

  // Build the query string
  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("q", filters.search);
    if (filters.categoryIds.length === 1) params.set("categoryId", filters.categoryIds[0]);
    if (filters.paymentMethods.length === 1) params.set("paymentMethod", filters.paymentMethods[0]);
    if (filters.dateFrom) params.set("startDate", filters.dateFrom);
    if (filters.dateTo) params.set("endDate", filters.dateTo);
    params.set("sortBy", filters.sortBy);
    params.set("order", filters.sortOrder);
    params.set("page", String(filters.page));
    params.set("limit", String(filters.limit));
    return params.toString();
  }, [filters]);

  // Use our hook for the main list
  const { data: expensesData, loading, error, refetch } = useFetch<ExpenseListResponse>(
    `/expenses/search?${query}`
  );

  const expenses = expensesData?.expenses ?? [];
  const totalItems = expensesData?.totalItems ?? 0;
  const totalPages = expensesData?.totalPages ?? 1;

  if (user?.role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;

  function openAddModal() { setExpenseToEdit(null); setIsModalOpen(true); }
  function openEditModal(expense: Expense) { setExpenseToEdit(expense); setIsModalOpen(true); }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Expenses</h1>
          <p className="text-sm text-slate-500 mt-1">Track and filter your spending.</p>
        </div>
        <button
          onClick={openAddModal}
          className="rounded-md bg-[#047857] text-white px-5 py-2.5 text-sm font-semibold
                     hover:bg-[#065f46] text-center transition-colors shadow-sm"
        >
          + Add expense
        </button>
      </div>

      <ExpenseFilters categories={categories} />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
        {loading ? (
          <p className="p-8 text-center text-slate-500">Loading…</p>
        ) : error ? (
          <p className="p-8 text-center text-red-600">{error}</p>
        ) : expenses.length === 0 ? (
          <p className="p-8 text-center text-slate-500">No expenses found.</p>
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="py-4 px-6 text-sm font-semibold text-slate-600">Title</th>
                    <th className="py-4 px-6 text-sm font-semibold text-slate-600">Category</th>
                    <th className="py-4 px-6 text-sm font-semibold text-slate-600">Payment</th>
                    <th className="py-4 px-6 text-sm font-semibold text-slate-600">Date</th>
                    <th className="py-4 px-6 text-sm font-semibold text-slate-600 text-right">Amount</th>
                    <th className="py-4 px-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-4 px-6 text-sm font-medium text-slate-900">{exp.title}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center rounded-full bg-[#ecfdf5] px-2.5 py-1 text-xs font-medium text-[#047857] ring-1 ring-inset ring-[#d1fae5]">
                          {exp.categoryName}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-600">{paymentMethodLabel(exp.paymentMethod)}</td>
                      <td className="py-4 px-6 text-sm text-slate-600">{formatDate(exp.date)}</td>
                      <td className="py-4 px-6 text-sm font-bold text-slate-900 text-right font-money">
                        {formatCurrency(exp.amount)}
                      </td>
                      <td className="py-4 px-6 text-right text-slate-600">
                        <div className="flex items-center justify-end gap-2  group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(exp)} className="rounded border border-slate-300  px-3 py-1 text-xs font-medium text-slate-900 hover:bg-slate-50">Edit</button>
                          <Link to={`/expenses/${exp.id}`} className="rounded border border-red-200 bg-white px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Delete</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="md:hidden divide-y divide-slate-100">
              {expenses.map((exp) => (
                <li key={exp.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Link to={`/expenses/${exp.id}`} className="font-semibold text-slate-900 truncate">{exp.title}</Link>
                    <span className="font-money font-bold text-slate-900">{formatCurrency(exp.amount)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                    <span className="inline-flex rounded-full bg-[#ecfdf5] px-2 py-0.5 text-[#047857]">{exp.categoryName}</span>
                    <span>{formatDate(exp.date)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(exp)} className="flex-1 text-center rounded border border-slate-300 py-1.5 text-xs font-medium">Edit</button>
                    <Link to={`/expenses/${exp.id}`} className="flex-1 text-center rounded border border-red-200 text-red-600 py-1.5 text-xs font-medium">Delete</Link>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Pagination Footer */}
        {!loading && expenses.length > 0 && (
          <div className="border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-900">{(filters.page - 1) * filters.limit + 1}–{Math.min(filters.page * filters.limit, totalItems)}</span> of <span className="font-medium text-slate-900">{totalItems}</span>
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => dispatch(setPage(filters.page - 1))}
                disabled={filters.page === 1}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button 
                onClick={() => dispatch(setPage(filters.page + 1))}
                disabled={filters.page >= totalPages}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* The onSuccess now calls refetch() instead of a custom function! */}
      <ExpenseFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={refetch} expenseToEdit={expenseToEdit} />
    </div>
  );
}