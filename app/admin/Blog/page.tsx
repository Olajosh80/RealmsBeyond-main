'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import { MdErrorOutline, MdCheckCircle } from 'react-icons/md';

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      // Use admin=true to authenticate/authorize properly if the API checks it
      // The API currently checks auth in GET depending on logic, but let's just GET /api/blog
      // We might need to handle pagination, but for now fetch all (or limit to say 50)
      const response = await fetch('/api/blog?admin=true&limit=100');
      if (!response.ok) throw new Error('Failed to fetch blogs');

      const data = await response.json();
      setBlogs(data.posts || data || []); // Handle { posts: [], pagination: ... } or just []
    } catch (err: any) {
      console.error('Error fetching blogs:', err);
      setError(err.message || 'Failed to load blogs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDeleteBlog = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete blog post');
      }

      await fetchBlogs();
      setSuccess('Blog post deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Error deleting blog:', error);
      setError('Failed to delete blog post: ' + error.message);
    }
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <main className="flex-grow p-6 lg:p-10">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-white">Blog Posts</h1>
              <p className="text-slate-400 mt-1">Manage your insightful articles.</p>
            </div>
            <Link
              href="/admin/blog/create"
              className="flex items-center gap-2 px-6 py-2.5 bg-rare-primary hover:bg-rare-primary/90 text-white rounded-xl transition-all shadow-lg shadow-rare-primary/20 hover:scale-105 active:scale-95 font-bold"
            >
              <FiPlus className="w-5 h-5" />
              Create New
            </Link>
          </div>

          {/* Messages */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-900/20 text-red-300 rounded-xl border border-red-800">
              <MdErrorOutline className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-4 bg-green-900/20 text-green-300 rounded-xl border border-green-800">
              <MdCheckCircle className="h-5 w-5" />
              <p>{success}</p>
            </div>
          )}

          {/* Filters */}
          <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-sm flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title or author..."
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-rare-primary/50 focus:border-rare-primary outline-none transition-all text-white placeholder-slate-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-xl shadow-xl overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-400">Loading blog posts...</div>
            ) : filteredBlogs.length === 0 ? (
              <div className="p-12 text-center text-slate-400">No blog posts found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-900/50 border-b border-slate-700">
                    <tr>
                      <th className="p-5 font-heading font-medium text-slate-400 text-sm tracking-wider uppercase">Image</th>
                      <th className="p-5 font-heading font-medium text-slate-400 text-sm tracking-wider uppercase">Title</th>
                      <th className="p-5 font-heading font-medium text-slate-400 text-sm tracking-wider uppercase">Category</th>
                      <th className="p-5 font-heading font-medium text-slate-400 text-sm tracking-wider uppercase">Author</th>
                      <th className="p-5 font-heading font-medium text-slate-400 text-sm tracking-wider uppercase">Status</th>
                      <th className="p-5 font-heading font-medium text-slate-400 text-sm tracking-wider uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {filteredBlogs.map((blog) => (
                      <tr key={blog._id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="p-5">
                          <div className="w-16 h-10 rounded-lg overflow-hidden bg-slate-900 relative border border-slate-700">
                            {(blog.featured_image || blog.image) ? (
                              <img
                                src={blog.featured_image || blog.image}
                                alt={blog.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-slate-600">No Img</div>
                            )}
                          </div>
                        </td>
                        <td className="p-5 font-bold text-white max-w-xs truncate">{blog.title}</td>
                        <td className="p-5">
                          <span className="px-2.5 py-1 bg-slate-700 text-slate-300 rounded-md text-xs font-medium border border-slate-600">
                            {blog.category || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="p-5 text-slate-400 text-sm">{blog.author}</td>
                        <td className="p-5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${blog.published
                            ? 'bg-green-900/30 text-green-400 border-green-900/50'
                            : 'bg-amber-900/30 text-amber-400 border-amber-900/50'
                            }`}>
                            {blog.published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/blog/${blog._id}`}
                              className="p-2 text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteBlog(blog._id)}
                              className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
