"use client";
import React, { useState, useEffect } from "react";
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdErrorOutline, MdCheckCircle } from 'react-icons/md';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/users');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data || []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    try {
      setActionLoading(id);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete user');
      }
      
      setSuccess('User deleted successfully');
      await fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Failed to delete user. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      setActionLoading(id);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update role');
      }
      
      setSuccess(`User role updated to ${newRole}`);
      await fetchUsers();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error updating role:', err);
      setError(err.message || 'Failed to update role. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(
    u =>
      (u.full_name?.toLowerCase().includes(search.toLowerCase()) || false) ||
      u.role.toLowerCase().includes(search.toLowerCase()) ||
      (u.email?.toLowerCase().includes(search.toLowerCase()) || false)
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <AiOutlineLoading3Quarters className="h-8 w-8 animate-spin text-blue-600 mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-heading font-normal text-rare-primary mb-2">Users</h2>
          <p className="text-rare-text-light font-body">Manage user roles and permissions.</p>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-72 p-2.5 bg-white/50 border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition pl-10"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-rare-text-light/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          <MdErrorOutline className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400">
          <MdCheckCircle className="h-5 w-5 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}

      <div className="bg-white/40 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left bg-white/20 backdrop-blur-sm border-b border-white/10">
              <th className="p-4 font-heading font-normal text-rare-primary">Name</th>
              <th className="p-4 font-heading font-normal text-rare-primary">Role</th>
              <th className="p-4 font-heading font-normal text-rare-primary">Phone</th>
              <th className="p-4 font-heading font-normal text-rare-primary">Created</th>
              <th className="p-4 font-heading font-normal text-rare-primary text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map(user => (
              <tr key={user._id || user.id} className="hover:bg-white/10 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-rare-primary">{user.full_name || 'N/A'}</div>
                  <div className="text-xs text-rare-text-light/70">{user.email}</div>
                </td>
                <td className="p-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id || user.id, e.target.value)}
                    className="px-3 py-1 text-xs rounded-full border border-white/20 bg-white/50 backdrop-blur-md focus:ring-2 focus:ring-blue-500 outline-none transition cursor-pointer"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="p-4 text-rare-text-light">{user.phone || 'N/A'}</td>
                <td className="p-4 text-rare-text-light">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <button
                    className="ml-auto px-4 py-2 text-sm text-white bg-red-500/80 hover:bg-red-600 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    onClick={() => handleDelete(user._id || user.id)}
                    disabled={actionLoading === (user._id || user.id)}
                  >
                    {actionLoading === (user._id || user.id) ? (
                      <>
                        <AiOutlineLoading3Quarters className="h-3 w-3 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                  {search ? 'No users match your search.' : 'No users found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
