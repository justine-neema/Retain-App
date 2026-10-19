import { useEffect, useState, type FormEvent } from "react";
import { api } from "../../lib/api";
import type { Category, CategoryResponse } from "../../types/category";

interface AdminCategory extends Category { created_at?: string; }

export default function AdminCategories() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#047857");
  const [creating, setCreating] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("#047857");
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadCategories() {
    setLoading(true);
    try {
      const res = await api.get<{ categories: AdminCategory[] }>("/admin/categories");
      setCategories(res.data.categories);
    } catch (err: any) { setError(err?.response?.data?.message ?? "Failed to load"); } 
    finally { setLoading(false); }
  }

  useEffect(() => { loadCategories(); }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return setError("Name required");
    setCreating(true); setError(null);
    try {
      const res = await api.post<CategoryResponse>("/admin/categories", { name: newName.trim(), color: newColor });
      setCategories(prev => [...prev, res.data.category].sort((a,b) => a.name.localeCompare(b.name)));
      setNewName(""); setSuccess("Category created"); setTimeout(() => setSuccess(null), 2500);
    } catch (err: any) { setError(err?.response?.data?.message ?? "Failed to create"); } 
    finally { setCreating(false); }
  }

  async function saveEdit(id: string) {
    if (!editName.trim()) return;
    setSavingEdit(true);
    try {
      const res = await api.put<CategoryResponse>(`/admin/categories/${id}`, { name: editName.trim(), color: editColor });
      setCategories(prev => prev.map(c => c.id === id ? { ...c, ...res.data.category } : c).sort((a,b) => a.name.localeCompare(b.name)));
      setEditingId(null); setSuccess("Updated"); setTimeout(() => setSuccess(null), 2500);
    } catch (err: any) { setError(err?.response?.data?.message ?? "Failed to update"); } 
    finally { setSavingEdit(false); }
  }

  async function confirmDelete() {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/categories/${deletingId}`);
      setCategories(prev => prev.filter(c => c.id !== deletingId));
      setDeletingId(null); setSuccess("Deleted. Expenses moved to Uncategorized."); setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) { setError(err?.response?.data?.message ?? "Failed to delete"); } 
    finally { setDeleting(false); }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
        <p className="text-sm text-slate-500 mt-1">Manage the categories users can pick from.</p>
      </div>

      {error && <div className="mb-6 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{error}</div>}
      {success && <div className="mb-6 rounded-md bg-[#ecfdf5] border border-[#d1fae5] text-[#047857] text-sm px-4 py-3">{success}</div>}

      {/* Create Form */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">New category name</label>
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Groceries" className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#047857]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
            <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="h-[42px] w-12 rounded-md border border-slate-300 cursor-pointer" />
          </div>
          <button type="submit" disabled={creating} className="rounded-md bg-[#047857] text-white px-6 py-2.5 text-sm font-semibold hover:bg-[#065f46]">Add</button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-4 px-6 text-sm font-semibold text-slate-600">Category</th>
              <th className="py-4 px-6 text-sm font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? <tr><td colSpan={2} className="p-8 text-center">Loading…</td></tr> : 
             categories.map(c => {
              const isEditing = editingId === c.id;
              return (
                <tr key={c.id} className={isEditing ? "bg-slate-50" : "hover:bg-slate-50"}>
                  <td className="py-4 px-6">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="border px-2 py-1 rounded text-sm w-full max-w-xs" />
                        <input type="color" value={editColor} onChange={e => setEditColor(e.target.value)} className="h-8 w-8 rounded cursor-pointer" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color || "#cbd5e1" }} />
                        <span className="text-sm font-medium text-slate-900">{c.name}</span>
                        {c.isDefault && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] uppercase font-bold">Default</span>}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {isEditing ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => saveEdit(c.id)} disabled={savingEdit} className="text-xs font-medium text-[#047857] hover:underline">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-xs font-medium text-slate-500 hover:underline">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditingId(c.id); setEditName(c.name); setEditColor(c.color || "#047857"); }} className="text-xs font-medium text-slate-600 hover:text-slate-900 border px-3 py-1 rounded">Edit</button>
                        <button onClick={() => setDeletingId(c.id)} disabled={c.isDefault} className="text-xs font-medium text-red-600 border border-red-200 px-3 py-1 rounded disabled:opacity-50">Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Delete this category?</h2>
            <p className="text-sm text-slate-600 mb-6">Any expenses using it will move to Uncategorized.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeletingId(null)} className="px-4 py-2 text-sm border rounded-md hover:bg-slate-50">Cancel</button>
              <button onClick={confirmDelete} disabled={deleting} className="px-4 py-2 text-sm bg-red-600 text-white font-medium rounded-md hover:bg-red-700">{deleting ? "Deleting…" : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}