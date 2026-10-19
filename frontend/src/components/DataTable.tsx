import { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  isRight?: boolean;
  hideOnMobile?: boolean;
}

interface Props<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  loading?: boolean;
  emptyMessage?: string;
  // Pagination
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

export default function DataTable<T>({
  data,
  columns,
  keyExtractor,
  loading,
  emptyMessage = "No data found.",
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}: Props<T>) {
  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* ---------- DESKTOP TABLE ---------- */}
      <div className="hidden md:block">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-4 px-6 text-sm font-semibold text-slate-600 ${
                    col.isRight ? "text-right" : ""
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={keyExtractor(item)}
                  className="hover:bg-slate-50 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-4 px-6 ${col.isRight ? "text-right" : ""}`}
                    >
                      {col.render(item)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- MOBILE CARDS ---------- */}
      <ul className="md:hidden divide-y divide-slate-100">
        {loading ? (
          <li className="p-8 text-center text-slate-500">Loading…</li>
        ) : data.length === 0 ? (
          <li className="p-8 text-center text-slate-500">{emptyMessage}</li>
        ) : (
          data.map((item) => (
            <li key={keyExtractor(item)} className="p-4 space-y-2">
              {columns
                .filter((col) => !col.hideOnMobile)
                .map((col) => (
                  <div key={col.key} className={col.isRight ? "text-right" : ""}>
                    {col.render(item)}
                  </div>
                ))}
            </li>
          ))
        )}
      </ul>

      {/* ---------- PAGINATION FOOTER ---------- */}
      {!loading && data.length > 0 && (
        <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-medium text-slate-900">{startIndex + 1}–{Math.min(startIndex + itemsPerPage, totalItems)}</span>{" "}
            of <span className="font-medium text-slate-900">{totalItems}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}