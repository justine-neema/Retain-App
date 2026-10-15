import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  resetFilters,
  setDateFrom,
  setDateTo,
  setSearch,
  setSort,
  toggleCategory,
  togglePaymentMethod,
} from "../../redux/filtersSlice";
import { PAYMENT_METHODS } from "../../lib/constants";
import type { Category } from "../../types/category";

interface Props {
  categories: Category[];
}

export default function ExpenseFilters({ categories }: Props) {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((s) => s.filters);

  // Local state for the search input, debounced before dispatching to Redux.
  const [searchText, setSearchText] = useState(filters.search);

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchText !== filters.search) {
        dispatch(setSearch(searchText));
      }
    }, 350);
    return () => clearTimeout(t);
  }, [searchText, filters.search, dispatch]);

  // Keep the local text in sync when filters are reset externally.
  useEffect(() => {
    setSearchText(filters.search);
  }, [filters.search]);

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4 space-y-4">
      {/* Row 1: search + sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search by title or notes…"
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        <select
          value={`${filters.sortBy}:${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split(":") as [
              typeof filters.sortBy,
              typeof filters.sortOrder,
            ];
            dispatch(setSort({ sortBy, sortOrder }));
          }}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm bg-white
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

      {/* Row 2: categories */}
      <div>
        <p className="text-xs font-medium text-slate-500 mb-2">Categories</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const active = filters.categoryIds.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => dispatch(toggleCategory(c.id))}
                className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                  active
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 3: payment methods */}
      <div>
        <p className="text-xs font-medium text-slate-500 mb-2">Payment method</p>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_METHODS.map((m) => {
            const active = filters.paymentMethods.includes(m.value);
            return (
              <button
                key={m.value}
                type="button"
                onClick={() => dispatch(togglePaymentMethod(m.value))}
                className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                  active
                    ? "bg-slate-800 text-white border-slate-800"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Row 4: date range + reset */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <div className="flex gap-2 flex-1">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">
              From
            </label>
            <input
              type="date"
              value={filters.dateFrom ?? ""}
              onChange={(e) =>
                dispatch(setDateFrom(e.target.value || null))
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-500 mb-1">
              To
            </label>
            <input
              type="date"
              value={filters.dateTo ?? ""}
              onChange={(e) => dispatch(setDateTo(e.target.value || null))}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => dispatch(resetFilters())}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700
                     hover:bg-slate-50 whitespace-nowrap"
        >
          Reset filters
        </button>
      </div>
    </div>
  );
}