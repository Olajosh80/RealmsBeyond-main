"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/lib/supabase";
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdErrorOutline, MdCheckCircle } from 'react-icons/md';

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Fetch users from Supabase
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
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

      const { error: deleteError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
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

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', id);

      if (updateError) throw updateError;
      
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
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-3xl font-bold">Users</h2>
        <input
          type="text"
          placeholder="Search users by name, email, or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-64 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600"
        />
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

      <div className="overflow-x-auto bg-white dark:bg-gray-900 border rounded-2xl shadow-sm dark:border-gray-700">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b dark:border-gray-700">
              <th className="p-2">Name</th>
              <th className="p-2">Role</th>
              <th className="p-2">Phone</th>
              <th className="p-2">Created</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/30 dark:border-gray-700">
                <td className="p-2 font-medium text-gray-800 dark:text-gray-100">
                  {user.full_name || 'N/A'}
                </td>
                <td className="p-2">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="px-2 py-1 text-xs rounded-lg border dark:bg-gray-800 dark:border-gray-600"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="p-2 text-gray-600 dark:text-gray-400">{user.phone || 'N/A'}</td>
                <td className="p-2 text-gray-600 dark:text-gray-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="p-2 text-right space-x-2">
                  <button
                    className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    onClick={() => handleDelete(user.id)}
                    disabled={actionLoading === user.id}
                  >
                    {actionLoading === user.id ? (
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
