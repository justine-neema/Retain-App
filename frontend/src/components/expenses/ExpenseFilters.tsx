import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/store";
import {
  resetFilters,
  setDateFrom,
  setDateTo,
  setSearch,
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

  const [searchText, setSearchText] = useState(filters.search);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchText !== filters.search) {
        dispatch(setSearch(searchText));
      }
    }, 350);
    return () => clearTimeout(t);
  }, [searchText, filters.search, dispatch]);

  // Sync search box when filters are reset externally.
  useEffect(() => {
    setSearchText(filters.search);
  }, [filters.search]);

  // Single-select helpers (backend accepts one at a time)
  const selectedCategoryId = filters.categoryIds[0] ?? "";
  const selectedPaymentMethod = filters.paymentMethods[0] ?? "";

  function handleCategoryChange(value: string) {
    if (filters.categoryIds[0])
      dispatch(toggleCategory(filters.categoryIds[0]));
    if (value) dispatch(toggleCategory(value));
  }

  function handlePaymentMethodChange(value: string) {
    if (filters.paymentMethods[0])
      dispatch(togglePaymentMethod(filters.paymentMethods[0]));
    if (value) dispatch(togglePaymentMethod(value));
  }

  const hasActiveFilters =
    filters.search !== "" ||
    filters.categoryIds.length > 0 ||
    filters.paymentMethods.length > 0 ||
    filters.dateFrom !== null ||
    filters.dateTo !== null;

  const inputClass =
    "w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  const labelClass = "block text-xs font-medium text-slate-600 mb-1";

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        {/* Search */}
        <div className="lg:col-span-4">
          <label className={labelClass}>Search</label>
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Title or notes…"
            className={inputClass}
          />
        </div>

        {/* Category */}
        <div className="lg:col-span-2">
          <label className={labelClass}>Category</label>
          <select
            value={selectedCategoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className={inputClass}
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Payment */}
        <div className="lg:col-span-2">
          <label className={labelClass}>Payment</label>
          <select
            value={selectedPaymentMethod}
            onChange={(e) => handlePaymentMethodChange(e.target.value)}
            className={inputClass}
          >
            <option value="">All</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date range */}
        <div className="lg:col-span-4">
          <label className={labelClass}>Date range</label>
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={filters.dateFrom ?? ""}
              onChange={(e) =>
                dispatch(setDateFrom(e.target.value || null))
              }
              className={inputClass}
            />
            <span className="text-slate-400 text-sm px-1">→</span>
            <input
              type="date"
              value={filters.dateTo ?? ""}
              onChange={(e) => dispatch(setDateTo(e.target.value || null))}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Clear all — only when active */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => dispatch(resetFilters())}
            className="text-xs text-blue-700 hover:text-blue-800"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}