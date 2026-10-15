import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { Expense, ExpenseResponse } from "../types/expense";
import { formatCurrency, formatDate } from "../lib/format";
import { paymentMethodLabel } from "../lib/constants";

export default function ExpenseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);

    api
      .get<ExpenseResponse>(`/expenses/${id}`)
      .then((res) => {
        if (!cancelled) setExpense(res.data.expense);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err?.response?.data?.message ?? "Failed to load expense"
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleDelete() {
    if (!id) return;
    setDeleting(true);
    try {
      await api.delete(`/expenses/${id}`);
      navigate("/expenses");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to delete expense");
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (error || !expense) {
    return (
      <div>
        <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error ?? "Expense not found"}
        </div>
        <Link
          to="/expenses"
          className="inline-block mt-4 text-sm text-blue-600 hover:underline"
        >
          ← Back to expenses
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="min-w-0">
          <Link
            to="/expenses"
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            ← Back to expenses
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 mt-2 break-words">
            {expense.title}
          </h1>
        </div>
        <p className="text-2xl font-bold text-slate-800 whitespace-nowrap">
          {formatCurrency(expense.amount)}
        </p>
      </div>

      {/* Details card */}
      <div className="bg-white rounded-lg shadow divide-y divide-slate-200">
        <Row label="Date">{formatDate(expense.date)}</Row>
        <Row label="Category">
          <span className="inline-flex items-center gap-2">
            {expense.categoryColor && (
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: expense.categoryColor }}
              />
            )}
            {expense.categoryName}
          </span>
        </Row>
        <Row label="Payment method">
          {paymentMethodLabel(expense.paymentMethod)}
        </Row>
        {expense.notes && <Row label="Notes">{expense.notes}</Row>}
        <Row label="Created">{formatDate(expense.createdAt)}</Row>
        <Row label="Last updated">{formatDate(expense.updatedAt)}</Row>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-6">
        <Link
          to={`/expenses/${expense.id}/edit`}
          className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="rounded-md border border-red-300 text-red-700 px-4 py-2 text-sm font-medium hover:bg-red-50"
        >
          Delete
        </button>
      </div>

      {/* Confirm delete modal */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => !deleting && setConfirmOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-slate-800 mb-2">
              Delete this expense?
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              "{expense.title}" will be permanently removed. This cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={deleting}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-md bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between px-6 py-4 gap-4">
      <span className="text-sm text-slate-500 whitespace-nowrap">{label}</span>
      <span className="text-sm text-slate-800 text-right break-words">
        {children}
      </span>
    </div>
  );
}