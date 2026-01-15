"use client";
import React, { useState, useEffect } from "react";
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdErrorOutline, MdCheckCircle } from 'react-icons/md';
import { Header } from "@/components/layout/Header";
import { useDebounce } from "@/hooks/useDebounce";
import { FiSearch, FiUser, FiCalendar, FiPhone, FiFilter, FiEye, FiX, FiCheck, FiXCircle } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { UserDetailModal } from '@/components/admin/UserDetailModal';


export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);



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

  // Filter based on debounced search
  const filteredUsers = users.filter(
    u =>
      (u.full_name?.toLowerCase().includes(debouncedSearch.toLowerCase()) || false) ||
      u.role.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (u.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) || false)
  );

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Header />
      <main className="flex-grow p-6 lg:p-10">
        <div className="mx-auto space-y-6">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="font-heading text-3xl font-bold text-white flex items-center gap-3">
                Customers
                <span className="text-sm font-normal text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                  {users.length} total
                </span>
              </h1>
              <p className="text-slate-400 mt-1">Manage user roles and access.</p>
            </div>
            {loading && <AiOutlineLoading3Quarters className="animate-spin text-rare-accent h-6 w-6" />}
          </div>

          {/* Filters & Search - Glassmorphism Toolbar */}
          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700 shadow-sm p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex gap-2 w-full md:w-auto">
              {/* Placeholders for future filters */}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative group w-full md:w-64">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-white transition-colors" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:bg-slate-900 focus:ring-2 focus:ring-rare-accent/20 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-300">
              <MdErrorOutline className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 p-4 bg-green-900/20 border border-green-800 rounded-lg text-green-300">
              <MdCheckCircle className="h-5 w-5 flex-shrink-0" />
              <p>{success}</p>
            </div>
          )}

          <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
            {loading && users.length === 0 ? (
              <div className="p-12 flex justify-center">
                <AiOutlineLoading3Quarters className="h-8 w-8 animate-spin text-rare-accent" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-slate-900/50 border-b border-slate-700">
                      <th className="p-4 font-heading font-normal text-slate-300 uppercase text-xs tracking-wider">User</th>
                      <th className="p-4 font-heading font-normal text-slate-300 uppercase text-xs tracking-wider">Role</th>
                      <th className="p-4 font-heading font-normal text-slate-300 uppercase text-xs tracking-wider">Contact</th>
                      <th className="p-4 font-heading font-normal text-slate-300 uppercase text-xs tracking-wider">Joined</th>
                      <th className="p-4 font-heading font-normal text-slate-300 uppercase text-xs tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredUsers.map(user => (
                      <tr key={user._id || user.id} className="hover:bg-slate-700/30 transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold">
                              {user.full_name ? user.full_name.charAt(0).toUpperCase() : <FiUser />}
                            </div>
                            <div>
                              <div className="font-bold text-slate-200">{user.full_name || 'N/A'}</div>
                              <div className="text-xs text-slate-400">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id || user.id, e.target.value)}
                            className="px-3 py-1 text-xs rounded-full border border-slate-600 bg-slate-800 text-slate-200 cursor-pointer focus:ring-2 focus:ring-rare-accent/20 outline-none transition hover:bg-slate-700"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="p-4 text-slate-400">
                          {user.phone ? (
                            <div className="flex items-center gap-2">
                              <FiPhone className="h-3 w-3" /> {user.phone}
                            </div>
                          ) : 'N/A'}
                        </td>
                        <td className="p-4 text-slate-400">
                          <div className="flex items-center gap-2">
                            <FiCalendar className="h-3 w-3" />
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setIsModalOpen(true);
                              }}
                              className="px-3 py-1.5 text-xs text-white bg-slate-700 hover:bg-slate-600 rounded-lg shadow-sm transition-all flex items-center gap-2"
                            >
                              <FiEye className="h-3 w-3" />
                              View
                            </button>
                            <button
                              className="px-3 py-1.5 text-xs text-white bg-red-500/10 hover:bg-red-500/80 text-red-400 hover:text-white border border-red-500/20 hover:border-red-500 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              onClick={() => handleDelete(user._id || user.id)}
                              disabled={actionLoading === (user._id || user.id)}
                            >
                              {actionLoading === (user._id || user.id) ? (
                                <AiOutlineLoading3Quarters className="h-3 w-3 animate-spin" />
                              ) : (
                                'Delete'
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-500">
                          {debouncedSearch ? 'No users match your search.' : 'No users found.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main >

      <UserDetailModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div >
  );
}
