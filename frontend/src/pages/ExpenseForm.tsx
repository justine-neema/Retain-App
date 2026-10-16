// frontend/src/pages/ExpenseForm.tsx

import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import type { Category, CategoryListResponse } from "../types/category";
import type { Expense, ExpenseInput, ExpenseResponse } from "../types/expense";
import { PAYMENT_METHODS } from "../lib/constants";
import { toDateInputValue } from "../lib/format";

// Form-local state: `amount` is a string while typing so we can show empty.
type FormState = Omit<ExpenseInput, "amount"> & { amount: string | number };

const emptyForm: FormState = {
  title: "",
  amount: "",
  categoryId: "",
  date: toDateInputValue(),
  paymentMethod: "cash",
  notes: "",
};

export default function ExpenseForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Fetch categories
  useEffect(() => {
    api
      .get<CategoryListResponse>("/categories")
      .then((res) => {
        setCategories(res.data.categories);
        if (!isEdit && res.data.categories.length > 0) {
          setForm((prev) =>
            prev.categoryId
              ? prev
              : { ...prev, categoryId: res.data.categories[0].id }
          );
        }
      })
      .catch(() => setCategories([]));
  }, [isEdit]);

  // Fetch the expense (edit mode)
  useEffect(() => {
    if (!isEdit || !id) return;
    let cancelled = false;

    api
      .get<ExpenseResponse>(`/expenses/${id}`)
      .then((res) => {
        if (cancelled) return;
        const e: Expense = res.data.expense;
        setForm({
          title: e.title,
          amount: e.amount,
          categoryId: e.categoryId,
          date: e.date.slice(0, 10),
          paymentMethod: e.paymentMethod,
          notes: e.notes ?? "",
        });
      })
      .catch((err) => {
        if (!cancelled)
          setError(err?.response?.data?.message ?? "Expense not found");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

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
    if (
      form.amount === "" ||
      !Number.isFinite(amountNumber) ||
      amountNumber <= 0
    ) {
      errors.amount = "Amount must be greater than zero";
    }

    if (!form.categoryId) errors.categoryId = "Category is required";
    if (!form.date) errors.date = "Date is required";
    if (!form.paymentMethod)
      errors.paymentMethod = "Payment method is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setSaving(true);
    try {
      const payload: ExpenseInput = {
        title: form.title,
        amount: Number(form.amount),
        categoryId: form.categoryId,
        date: form.date,
        paymentMethod: form.paymentMethod,
        notes: form.notes,
      };

      if (isEdit && id) {
        await api.put<ExpenseResponse>(`/expenses/${id}`, payload);
      } else {
        await api.post<ExpenseResponse>("/expenses", payload);
      }

      navigate("/expenses");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to save expense");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  const inputClass =
    "w-full rounded-md border border-slate-300 px-3 py-2 text-sm " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const errorClass = "text-xs text-red-600 mt-1";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">
          {isEdit ? "Edit expense" : "Add expense"}
        </h1>
        <p className="text-sm text-slate-500">
          {isEdit
            ? "Update the details of this expense."
            : "Record a new expense."}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. Groceries"
            className={inputClass}
          />
          {fieldErrors.title && (
            <p className={errorClass}>{fieldErrors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Amount (RWF)
          </label>
          <input
            type="number"
            min={0}
            step="1"
            value={form.amount}
            onChange={(e) => update("amount", e.target.value)}
            placeholder="Enter amount"
            className={inputClass}
          />
          {fieldErrors.amount && (
            <p className={errorClass}>{fieldErrors.amount}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Category
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => update("categoryId", e.target.value)}
              className={inputClass}
            >
              {categories.length === 0 && (
                <option value="">No categories available</option>
              )}
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {fieldErrors.categoryId && (
              <p className={errorClass}>{fieldErrors.categoryId}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
              className={inputClass}
            />
            {fieldErrors.date && (
              <p className={errorClass}>{fieldErrors.date}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Payment method
          </label>
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
          {fieldErrors.paymentMethod && (
            <p className={errorClass}>{fieldErrors.paymentMethod}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Notes <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={form.notes ?? ""}
            onChange={(e) => update("notes", e.target.value)}
            rows={3}
            placeholder="Add any details…"
            className={inputClass}
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-medium
                       hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create expense"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/expenses")}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}