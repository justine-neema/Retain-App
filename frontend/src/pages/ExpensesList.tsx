// frontend/src/pages/ExpensesList.tsx

import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { resetFilters, setSort } from "../redux/filtersSlice";
import type { Category, CategoryListResponse } from "../types/category";
import type { Expense, ExpenseListResponse } from "../types/expense";
import { formatCurrency, formatDate } from "../lib/format";
import { paymentMethodLabel } from "../lib/constants";
import ExpenseFilters from "../components/expenses/ExpenseFilters";

export default function ExpensesList() {
  const { user } = useAuth();
  const filters = useAppSelector((s) => s.filters);
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageFromUrl = Number(searchParams.get("page") || filters.page);
  const page = pageFromUrl > 0 ? pageFromUrl : 1;

  useEffect(() => {
    api
      .get<CategoryListResponse>("/categories")
      .then((res) => setCategories(res.data.categories))
      .catch(() => setCategories([]));
  }, []);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set("q", filters.search);
    if (filters.categoryIds.length === 1)
      params.set("categoryId", filters.categoryIds[0]);
    if (filters.paymentMethods.length === 1)
      params.set("paymentMethod", filters.paymentMethods[0]);
    if (filters.dateFrom) params.set("startDate", filters.dateFrom);
    if (filters.dateTo) params.set("endDate", filters.dateTo);
    params.set("sortBy", filters.sortBy);
    params.set("order", filters.sortOrder);
    return params.toString();
  }, [filters]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .get<ExpenseListResponse>(`/expenses/search?${query}`)
      .then((res) => {
        if (!cancelled) setExpenses(res.data.expenses);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err?.response?.data?.message ?? "Failed to load expenses");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  useEffect(() => {
    if (page !== filters.page) {
      const next = new URLSearchParams(searchParams);
      next.set("page", String(filters.page));
      setSearchParams(next, { replace: true });
    }
  }, [filters.page, page, searchParams, setSearchParams]);

  // --- Admins use /admin/expenses, not the personal list ---
  if (user?.role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Expenses</h1>
          <p className="text-sm text-slate-500">
            Track and filter your spending.
          </p>
        </div>
        <Link
          to="/expenses/new"
          className="rounded-md bg-blue-700 text-white px-4 py-2 text-sm font-medium hover:bg-blue-800"
        >
          + Add expense
        </Link>
      </div>

      <ExpenseFilters categories={categories} />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 sm:px-6 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-slate-500">
            {loading
              ? "Loading…"
              : `${expenses.length} ${
                  expenses.length === 1 ? "expense" : "expenses"
                }`}
          </p>

          <div className="flex items-center gap-2">
            <label
              htmlFor="sort"
              className="text-xs text-slate-500 whitespace-nowrap"
            >
              Sort by
            </label>
            <select
              id="sort"
              value={`${filters.sortBy}:${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split(":") as [
                  typeof filters.sortBy,
                  typeof filters.sortOrder,
                ];
                dispatch(setSort({ sortBy, sortOrder }));
              }}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs bg-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="date:desc">Newest first</option>
              <option value="date:asc">Oldest first</option>
              <option value="amount:desc">Amount: high → low</option>
              <option value="amount:asc">Amount: low → high</option>
              <option value="title:asc">Title: A → Z</option>
              <option value="title:desc">Title: Z → A</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading…</p>
        ) : error ? (
          <p className="p-6 text-sm text-red-600">{error}</p>
        ) : expenses.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-slate-500 mb-3">
              No expenses match these filters.
            </p>
            <button
              onClick={() => dispatch(resetFilters())}
              className="text-sm text-blue-700 hover:text-blue-800"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {expenses.map((exp) => (
              <li key={exp.id}>
                <Link
                  to={`/expenses/${exp.id}`}
                  className="flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {exp.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {formatDate(exp.date)} · {exp.categoryName} ·{" "}
                      {paymentMethodLabel(exp.paymentMethod)}
                    </p>
                  </div>
                  <p className="ml-4 text-sm font-semibold text-slate-800 whitespace-nowrap">
                    {formatCurrency(exp.amount)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}