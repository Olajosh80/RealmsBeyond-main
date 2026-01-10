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
      // include auth token for protected endpoints
      const session = await (await import('@/lib/supabase')).supabase.auth.getSession();
      const token = session.data?.session?.access_token;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/divisions', { headers });
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
      const session = await (await import('@/lib/supabase')).supabase.auth.getSession();
      const token = session.data?.session?.access_token;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      if (editingId) {
        await fetch(`/api/divisions/${editingId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(form),
        });
      } else {
        await fetch('/api/divisions', {
          method: 'POST',
          headers,
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
      const session = await (await import('@/lib/supabase')).supabase.auth.getSession();
      const token = session.data?.session?.access_token;
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch(`/api/divisions/${id}`, { method: 'DELETE', headers });
      await fetchDivisions();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-heading font-normal text-rare-primary mb-2">Manage Categories</h2>
          <p className="text-rare-text-light font-body">Organize your business divisions and sectors.</p>
        </div>
        <button onClick={resetForm} className="flex items-center gap-2 bg-blue-600/80 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-all shadow-lg font-body">
          <MdAdd className="text-xl" /> New Division
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-body text-rare-text-light ml-1">Division Name</label>
            <input type="text" placeholder="e.g. Luxury Fragrance" value={form.name || ''} onChange={(e)=>setForm({...form, name:e.target.value})} className="w-full bg-white/50 border border-white/30 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-body text-rare-text-light ml-1">Slug (URL friendly)</label>
            <input type="text" placeholder="e.g. luxury-fragrance" value={form.slug || ''} onChange={(e)=>setForm({...form, slug:e.target.value})} className="w-full bg-white/50 border border-white/30 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-body text-rare-text-light ml-1">Display Order</label>
            <input type="number" placeholder="Order" value={form.order ?? 0} onChange={(e)=>setForm({...form, order: Number(e.target.value)})} className="w-full bg-white/50 border border-white/30 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-body text-rare-text-light ml-1">Description</label>
          <textarea placeholder="Tell us more about this division..." value={form.description || ''} onChange={(e)=>setForm({...form, description:e.target.value})} className="w-full bg-white/50 border border-white/30 p-2 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none transition" />
        </div>
        <div className="flex justify-end">
          <button className="bg-green-600/80 hover:bg-green-600 text-white rounded-xl px-8 py-2 transition-all shadow-md font-body">{editingId? 'Update Division' : 'Create Division'}</button>
        </div>
      </form>

      <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/20 backdrop-blur-sm border-b border-white/10">
            <tr>
              <th className="p-4 font-heading font-normal text-rare-primary">Name</th>
              <th className="p-4 font-heading font-normal text-rare-primary">Slug</th>
              <th className="p-4 font-heading font-normal text-rare-primary text-center">Order</th>
              <th className="p-4 font-heading font-normal text-rare-primary text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td className="p-8 text-center" colSpan={4}><AiOutlineLoading3Quarters className="animate-spin inline-block mr-2" /> Loading categories...</td></tr>
            ) : divisions.length === 0 ? (
              <tr><td className="p-8 text-center text-rare-text-light" colSpan={4}>No categories found</td></tr>
            ) : (
              divisions.map((d) => (
                <tr key={d.id} className="hover:bg-white/10 transition-colors">
                  <td className="p-4 align-middle font-medium text-rare-primary">{d.name}</td>
                  <td className="p-4 align-middle text-rare-text-light font-mono text-sm">{d.slug}</td>
                  <td className="p-4 align-middle text-center text-rare-text-light">{d.order ?? 0}</td>
                  <td className="p-4 align-middle text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={()=>startEdit(d)} className="p-2 bg-yellow-500/80 hover:bg-yellow-500 text-white rounded-lg transition-all shadow-sm">
                        <MdEdit />
                      </button>
                      <button onClick={()=>handleDelete(d.id)} className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-lg transition-all shadow-sm">
                        <MdDelete />
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
  );
}
