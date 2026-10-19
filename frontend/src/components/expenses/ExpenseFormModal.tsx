import { useEffect, useState, type FormEvent } from "react";
import { api } from "../../lib/api";
import type { Category, CategoryListResponse } from "../../types/category";
import type { Expense, ExpenseInput } from "../../types/expense"; // Removed ExpenseResponse
import { PAYMENT_METHODS } from "../../lib/constants";
import { toDateInputValue } from "../../lib/format";
import Modal from "../Modal";

type FormState = Omit<ExpenseInput, "amount"> & { amount: string | number };

const emptyForm: FormState = {
  title: "",
  amount: "",
  categoryId: "",
  date: toDateInputValue(),
  paymentMethod: "cash",
  notes: "",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expenseToEdit?: Expense | null;
}

export default function ExpenseFormModal({ isOpen, onClose, onSuccess, expenseToEdit }: Props) {
  const isEdit = Boolean(expenseToEdit);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setFieldErrors({});

    if (expenseToEdit) {
      setForm({
        title: expenseToEdit.title,
        amount: expenseToEdit.amount,
        categoryId: expenseToEdit.categoryId,
        date: expenseToEdit.date.slice(0, 10),
        paymentMethod: expenseToEdit.paymentMethod,
        notes: expenseToEdit.notes ?? "",
      });
      return;
    }

    setForm({ ...emptyForm, date: toDateInputValue() });

    api
      .get<CategoryListResponse>("/categories")
      .then((res) => {
        const fetchedCategories = res.data.categories;
        setCategories(fetchedCategories);

        if (fetchedCategories.length > 0) {
          setForm((prev) => ({
            ...prev,
            ...emptyForm,
            date: toDateInputValue(),
            categoryId: fetchedCategories[0].id,
            paymentMethod: "cash",
          }));
        }
      })
      .catch(() => setCategories([]));
  }, [isOpen, expenseToEdit]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key as string]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    }
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = "Title is required";
    const amountNumber = Number(form.amount);
    if (form.amount === "" || !Number.isFinite(amountNumber) || amountNumber <= 0)
      errors.amount = "Amount must be > 0";
    if (!form.categoryId) errors.categoryId = "Category is required";
    if (!form.date) errors.date = "Date is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setSaving(true);
    try {
      const payload: ExpenseInput = { ...form, amount: Number(form.amount) };
      if (isEdit && expenseToEdit) await api.put(`/expenses/${expenseToEdit.id}`, payload);
      else await api.post("/expenses", payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#047857] focus:border-[#047857]";
  const errorClass = "text-xs text-red-600 mt-1";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit expense" : "Add expense"}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="expense-form"
            disabled={saving}
            className="rounded-md bg-[#047857] text-white px-4 py-2 text-sm font-medium hover:bg-[#065f46] disabled:opacity-60"
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create expense"}
          </button>
        </>
      }
    >
      <form id="expense-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. Groceries"
            className={inputClass}
          />
          {fieldErrors.title && <p className={errorClass}>{fieldErrors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Amount (RWF)</label>
          <input
            type="number"
            min={0}
            step="1"
            value={form.amount}
            onChange={(e) => update("amount", e.target.value)}
            placeholder="Enter amount"
            className={inputClass}
          />
          {fieldErrors.amount && <p className={errorClass}>{fieldErrors.amount}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              value={form.categoryId}
              onChange={(e) => update("categoryId", e.target.value)}
              className={inputClass}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Payment method</label>
          <select
            value={form.paymentMethod}
            onChange={(e) => update("paymentMethod", e.target.value)}
            className={inputClass}
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Notes <span className="text-slate-400">(optional)</span>
          </label>
          <textarea
            value={form.notes ?? ""}
            onChange={(e) => update("notes", e.target.value)}
            rows={2}
            className={inputClass}
          />
        </div>
      </form>
    </Modal>
  );
}