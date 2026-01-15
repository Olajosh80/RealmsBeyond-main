"use client";

import React, { useEffect, useState } from "react";
import { MdEdit, MdDelete, MdAdd } from "react-icons/md";
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

type Division = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string | null;
  image_url?: string | null;
  order?: number;
};

export default function AdminDivisions() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<Division>>({ name: "", slug: "", description: "", order: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDivisions();
  }, []);

  async function fetchDivisions() {
    setLoading(true);
    try {
      const res = await fetch('/api/divisions');
      const data = await res.json();
      setDivisions(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm({ name: "", slug: "", description: "", order: 0 });
    setEditingId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        await fetch(`/api/divisions/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        await fetch('/api/divisions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      await fetchDivisions();
      resetForm();
    } catch (err) {
      console.error(err);
    }
  }

  function startEdit(d: Division) {
    setEditingId(d.id);
    setForm({ name: d.name, slug: d.slug, description: d.description, order: d.order });
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this division?')) return;
    try {
      await fetch(`/api/divisions/${id}`, { method: 'DELETE' });
      await fetchDivisions();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6 lg:p-10">
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-2">Manage Categories</h2>
            <p className="text-gray-500 font-body">Organize your business divisions and sectors.</p>
          </div>
          <button onClick={resetForm} className="flex items-center gap-2 bg-rare-primary hover:bg-rare-primary/90 text-white px-4 py-2 rounded-xl transition-all shadow-lg font-body font-bold">
            <MdAdd className="text-xl" /> New Division
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Division Name</label>
              <input type="text" placeholder="e.g. Luxury Fragrance" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-rare-primary/50 outline-none transition text-gray-900 placeholder-gray-400" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Slug (URL friendly)</label>
              <input type="text" placeholder="e.g. luxury-fragrance" value={form.slug || ''} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-rare-primary/50 outline-none transition text-gray-900 placeholder-gray-400" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase ml-1">Display Order</label>
              <input type="number" placeholder="Order" value={form.order ?? 0} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg focus:ring-2 focus:ring-rare-primary/50 outline-none transition text-gray-900 placeholder-gray-400" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Description</label>
            <textarea placeholder="Tell us more about this division..." value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-gray-50 border border-gray-200 p-2 rounded-lg h-24 focus:ring-2 focus:ring-rare-primary/50 outline-none transition text-gray-900 placeholder-gray-400" />
          </div>
          <div className="flex justify-end">
            <button className="bg-rare-primary hover:bg-rare-primary/90 text-white rounded-xl px-8 py-2 transition-all shadow-md font-body font-bold">{editingId ? 'Update Division' : 'Create Division'}</button>
          </div>
        </form>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 font-heading font-bold text-gray-900 uppercase text-xs tracking-wider">Name</th>
                <th className="p-4 font-heading font-bold text-gray-900 uppercase text-xs tracking-wider">Slug</th>
                <th className="p-4 font-heading font-bold text-gray-900 uppercase text-xs tracking-wider text-center">Order</th>
                <th className="p-4 font-heading font-bold text-gray-900 uppercase text-xs tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td className="p-8 text-center" colSpan={4}><AiOutlineLoading3Quarters className="animate-spin inline-block mr-2 text-rare-primary" /> Loading categories...</td></tr>
              ) : divisions.length === 0 ? (
                <tr><td className="p-8 text-center text-gray-500" colSpan={4}>No categories found</td></tr>
              ) : (
                divisions.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 align-middle font-bold text-gray-900">{d.name}</td>
                    <td className="p-4 align-middle text-gray-500 font-mono text-sm">{d.slug}</td>
                    <td className="p-4 align-middle text-center text-gray-600 font-medium">{d.order ?? 0}</td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => startEdit(d)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <MdEdit className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(d.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all">
                          <MdDelete className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
