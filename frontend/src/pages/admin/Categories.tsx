// frontend/src/pages/admin/Categories.tsx

import { useEffect, useState, type FormEvent } from "react";
import { api } from "../../lib/api";
import type {
  Category,
  CategoryResponse,
} from "../../types/category";

// Admin's own category type (adds created_at)
interface AdminCategory extends Category {
  created_at?: string;
}

interface AdminListResponse {
  categories: AdminCategory[];
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Create form
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("tag");
  const [newColor, setNewColor] = useState("#3B82F6");
  const [creating, setCreating] = useState(false);

  // Edit inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("tag");
  const [editColor, setEditColor] = useState("#3B82F6");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadCategories() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<AdminListResponse>("/admin/categories");
      setCategories(res.data.categories);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const name = newName.trim();
    if (!name) {
      setError("Category name is required");
      return;
    }

    setCreating(true);
    try {
      const res = await api.post<CategoryResponse>("/admin/categories", {
        name,
        icon: newIcon || "tag",
        color: newColor || "#3B82F6",
      });
      setCategories((prev) =>
        [...prev, res.data.category].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );
      setNewName("");
      setNewIcon("tag");
      setNewColor("#3B82F6");
      setSuccess("Category created");
      setTimeout(() => setSuccess(null), 2500);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to create category");
    } finally {
      setCreating(false);
    }
  }

  function beginEdit(c: AdminCategory) {
    setEditingId(c.id);
    setEditName(c.name);
    setEditIcon(c.icon ?? "tag");
    setEditColor(c.color ?? "#3B82F6");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditIcon("tag");
    setEditColor("#3B82F6");
  }

  async function saveEdit(id: string) {
    const name = editName.trim();
    if (!name) {
      setError("Category name is required");
      return;
    }

    setSavingEdit(true);
    setError(null);
    try {
      const res = await api.put<CategoryResponse>(`/admin/categories/${id}`, {
        name,
        icon: editIcon || "tag",
        color: editColor || "#3B82F6",
      });
      setCategories((prev) =>
        prev
          .map((c) => (c.id === id ? { ...c, ...res.data.category } : c))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      cancelEdit();
      setSuccess("Category updated");
      setTimeout(() => setSuccess(null), 2500);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to update category");
    } finally {
      setSavingEdit(false);
    }
  }

  async function confirmDelete() {
    if (!deletingId) return;
    setDeleting(true);
    setError(null);
    try {
      await api.delete(`/admin/categories/${deletingId}`);
      setCategories((prev) => prev.filter((c) => c.id !== deletingId));
      setDeletingId(null);
      setSuccess(
        "Category deleted. Any expenses using it moved to Uncategorized."
      );
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to delete category");
    } finally {
      setDeleting(false);
    }
  }

  const pendingDelete = categories.find((c) => c.id === deletingId);

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm px-3 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-sm px-3 py-2">
          {success}
        </div>
      )}

      {/* Create form */}
      <form
        onSubmit={handleCreate}
        className="bg-white rounded-lg shadow p-5 mb-6"
      >
        <h2 className="text-sm font-medium text-slate-700 mb-3">
          Add a new category
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Groceries"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Icon (optional)
            </label>
            <input
              type="text"
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
              placeholder="tag"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Color
            </label>
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="w-full h-[38px] rounded-md border border-slate-300 bg-white cursor-pointer"
            />
          </div>

          <div className="sm:col-span-2 flex sm:items-end">
            <button
              type="submit"
              disabled={creating}
              className="w-full rounded-md bg-blue-700 text-white px-4 py-2 text-sm font-medium
                         hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {creating ? "Adding…" : "Add"}
            </button>
          </div>
        </div>
      </form>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200">
          <p className="text-xs text-slate-500">
            {loading
              ? "Loading…"
              : `${categories.length} ${
                  categories.length === 1 ? "category" : "categories"
                }`}
          </p>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading…</p>
        ) : categories.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">
            No categories yet. Add one above.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {categories.map((c) => {
              const isEditing = editingId === c.id;
              return (
                <li
                  key={c.id}
                  className="px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  {isEditing ? (
                    <>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm
                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          value={editIcon}
                          onChange={(e) => setEditIcon(e.target.value)}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm
                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="color"
                          value={editColor}
                          onChange={(e) => setEditColor(e.target.value)}
                          className="rounded-md border border-slate-300 bg-white h-[34px] cursor-pointer"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(c.id)}
                          disabled={savingEdit}
                          className="rounded-md bg-blue-700 text-white px-3 py-1.5 text-xs font-medium
                                     hover:bg-blue-800 disabled:opacity-60"
                        >
                          {savingEdit ? "Saving…" : "Save"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span
                          className="inline-block h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: c.color ?? "#CBD5E1" }}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {c.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            icon: {c.icon ?? "—"}
                            {c.isDefault && (
                              <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                                default
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => beginEdit(c)}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingId(c.id)}
                          disabled={c.isDefault}
                          title={
                            c.isDefault
                              ? "The default category cannot be deleted"
                              : "Delete this category"
                          }
                          className="rounded-md border border-red-300 text-red-700 px-3 py-1.5 text-xs
                                     hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deletingId && pendingDelete && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => !deleting && setDeletingId(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-slate-800 mb-2">
              Delete "{pendingDelete.name}"?
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              Any expenses using this category will be moved to{" "}
              <span className="font-medium">Uncategorized</span>. This cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingId(null)}
                disabled={deleting}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
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