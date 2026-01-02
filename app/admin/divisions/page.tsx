"use client";

import React, { useEffect, useState } from "react";
import { MdEdit, MdDelete, MdAdd } from "react-icons/md";

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
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Manage Categories</h2>
        <button onClick={resetForm} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded">
          <MdAdd /> New
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 bg-white shadow rounded p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input type="text" placeholder="Name" value={form.name || ''} onChange={(e)=>setForm({...form, name:e.target.value})} className="col-span-1 md:col-span-1 border p-2 rounded" required />
          <input type="text" placeholder="Slug" value={form.slug || ''} onChange={(e)=>setForm({...form, slug:e.target.value})} className="col-span-1 md:col-span-1 border p-2 rounded" required />
          <input type="number" placeholder="Order" value={form.order ?? 0} onChange={(e)=>setForm({...form, order: Number(e.target.value)})} className="col-span-1 md:col-span-1 border p-2 rounded" />
          <button className="col-span-1 md:col-span-1 bg-green-600 text-white rounded px-4">{editingId? 'Update' : 'Create'}</button>
        </div>
        <div className="mt-3">
          <textarea placeholder="Description" value={form.description || ''} onChange={(e)=>setForm({...form, description:e.target.value})} className="w-full border p-2 rounded h-24" />
        </div>
      </form>

      <div className="bg-white shadow rounded overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Order</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="p-4">Loading...</td></tr>
            ) : divisions.length === 0 ? (
              <tr><td className="p-4">No categories found</td></tr>
            ) : (
              divisions.map((d) => (
                <tr key={d.id} className="border-t">
                  <td className="p-3 align-top">{d.name}</td>
                  <td className="p-3 align-top">{d.slug}</td>
                  <td className="p-3 align-top">{d.order ?? 0}</td>
                  <td className="p-3 align-top">
                    <div className="flex gap-2">
                      <button onClick={()=>startEdit(d)} className="flex items-center gap-2 px-2 py-1 bg-yellow-500 text-white rounded">
                        <MdEdit /> Edit
                      </button>
                      <button onClick={()=>handleDelete(d.id)} className="flex items-center gap-2 px-2 py-1 bg-red-600 text-white rounded">
                        <MdDelete /> Delete
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
