import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { Expense, ExpenseResponse } from "../types/expense";
import { formatCurrency, formatDate } from "../lib/format"; // Using shared formatCurrency
import { paymentMethodLabel } from "../lib/constants";
import ExpenseFormModal from "../components/expenses/ExpenseFormModal";
import Modal from "../components/Modal";

export default function ExpenseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);

    api.get<ExpenseResponse>(`/expenses/${id}`)
      .then((res) => { if (!cancelled) setExpense(res.data.expense); })
      .catch((err) => { if (!cancelled) setError(err?.response?.data?.message ?? "Failed to load"); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  async function handleDelete() {
    if (!id) return;
    setDeleting(true);
    try {
      await api.delete(`/expenses/${id}`);
      navigate("/expenses");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to delete");
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  function handleEditSuccess() {
    if (!id) return;
    api.get<ExpenseResponse>(`/expenses/${id}`).then((res) => setExpense(res.data.expense));
  }

  if (loading) return <p className="text-sm text-slate-500 py-10">Loading…</p>;
  if (error || !expense) return <div className="text-red-600 text-sm py-10">{error ?? "Not found"}</div>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="min-w-0">
          <Link to="/expenses" className="text-xs text-slate-500 hover:text-slate-700">← Back to expenses</Link>
          <h1 className="text-3xl font-bold text-slate-900 mt-2 break-words">{expense.title}</h1>
        </div>
        <p className="text-3xl font-bold text-slate-900 whitespace-nowrap font-money">
          {formatCurrency(expense.amount)}
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
        <Row label="Date">{formatDate(expense.date)}</Row>
        <Row label="Category">
          <span className="inline-flex items-center gap-2">
            {expense.categoryColor && <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: expense.categoryColor }} />}
            {expense.categoryName}
          </span>
        </Row>
        <Row label="Payment method">{paymentMethodLabel(expense.paymentMethod)}</Row>
        {expense.notes && <Row label="Notes">{expense.notes}</Row>}
        <Row label="Created">{formatDate(expense.createdAt)}</Row>
        <Row label="Last updated">{formatDate(expense.updatedAt)}</Row>
      </div>

      <div className="flex items-center gap-3 mt-6">
        <button onClick={() => setIsEditModalOpen(true)} className="rounded-md bg-[#047857] text-white px-4 py-2 text-sm font-medium hover:bg-[#065f46] transition-colors">
          Edit
        </button>
        <button onClick={() => setConfirmOpen(true)} className="rounded-md border border-red-300 text-red-700 px-4 py-2 text-sm font-medium hover:bg-red-50 transition-colors">
          Delete
        </button>
      </div>

      <ExpenseFormModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSuccess={handleEditSuccess} expenseToEdit={expense} />

      <Modal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete this expense?"
        maxWidth="max-w-sm"
        footer={
          <>
            <button onClick={() => setConfirmOpen(false)} disabled={deleting} className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60">Cancel</button>
            <button onClick={handleDelete} disabled={deleting} className="rounded-md bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-60">{deleting ? "Deleting…" : "Delete"}</button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          "{expense.title}" will be permanently removed. This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between px-6 py-4 gap-4">
      <span className="text-sm text-slate-500 whitespace-nowrap">{label}</span>
      <span className="text-sm font-medium text-slate-900 text-right break-words">{children}</span>
    </div>
  );
}