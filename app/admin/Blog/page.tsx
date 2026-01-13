"use client";
import React, { useState, useEffect } from "react";
import { uploadImage } from "@/lib/storage";
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdErrorOutline, MdCheckCircle } from 'react-icons/md';

export default function BlogAdminPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "",
    excerpt: "",
    content: "",
    author: "",
    image: "",
    status: "draft",
  });
  const [preview, setPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  // Fetch blog posts from API
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/blog');
      if (!response.ok) throw new Error('Failed to fetch blogs');
      
      const data = await response.json();
      setBlogs(data || []);
    } catch (err: any) {
      console.error('Error fetching blogs:', err);
      setError(err.message || 'Failed to load blogs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setForm({ ...form, image: reader.result as string }); // store Base64 for now
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const blogData = {
        title: form.title,
        slug: form.title.toLowerCase().replace(/\s+/g, '-'),
        excerpt: form.excerpt || form.content.substring(0, 150),
        content: form.content,
        author: form.author || 'Admin',
        featured_image: form.image,
        category: form.category,
        tags: [],
        published: form.status === 'published',
        published_at: form.status === 'published' ? new Date().toISOString() : null,
      };

      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blogData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add blog post');
      }

      await fetchBlogs();
      setForm({ title: "", category: "", excerpt: "", content: "", author: "", image: "", status: "draft" });
      setPreview("");
      setSuccess('Blog post added successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error: any) {
      console.error('Error adding blog:', error);
      setError('Failed to add blog post: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-heading font-normal text-rare-primary mb-2">Blog Posts</h2>
          <p className="text-rare-text-light font-body">Manage your site articles and news.</p>
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

      {/* Add Blog Form */}
      <div className="p-6 bg-white/40 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl dark:bg-gray-900/40">
        <h3 className="text-xl font-heading font-normal text-rare-primary mb-6">Add New Blog Post</h3>
        <form onSubmit={handleAddBlog} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-body text-rare-text-light ml-1">Title</label>
              <input
                type="text"
                name="title"
                placeholder="Blog Title"
                value={form.title}
                onChange={handleChange}
                className="w-full p-2 bg-white/50 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-body text-rare-text-light ml-1">Category</label>
              <input
                type="text"
                name="category"
                placeholder="Category"
                value={form.category}
                onChange={handleChange}
                className="w-full p-2 bg-white/50 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-body text-rare-text-light ml-1">Author</label>
              <input
                type="text"
                name="author"
                placeholder="Author Name"
                value={form.author}
                onChange={handleChange}
                className="w-full p-2 bg-white/50 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-body text-rare-text-light ml-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full p-2 bg-white/50 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-body text-rare-text-light ml-1">Excerpt</label>
            <textarea
              name="excerpt"
              placeholder="Brief excerpt (optional)..."
              value={form.excerpt}
              onChange={handleChange}
              className="w-full p-2 bg-white/50 border border-white/30 rounded-lg h-20 focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-body text-rare-text-light ml-1">Content</label>
            <textarea
              name="content"
              placeholder="Write your content here..."
              value={form.content}
              onChange={handleChange}
              className="w-full p-2 bg-white/50 border border-white/30 rounded-lg h-40 focus:ring-2 focus:ring-blue-500 outline-none transition"
              required
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-1">
            <label className="text-xs font-body text-rare-text-light ml-1">Featured Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading || submitting}
              className="w-full p-2 bg-white/50 border border-white/30 rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition"
            />
            {uploading && (
              <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                <AiOutlineLoading3Quarters className="h-4 w-4 animate-spin" />
                <span>Uploading image...</span>
              </div>
            )}
            {preview && (
              <div className="mt-3 relative h-48 w-full rounded-xl overflow-hidden border border-white/20 shadow-lg">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-8 py-2.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-xl transition-all shadow-lg font-body"
            >
              Add Blog Post
            </button>
          </div>
        </form>
      </div>

      {/* Blog Table */}
      <div className="bg-white/40 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/20 backdrop-blur-sm border-b border-white/10">
            <tr>
              <th className="p-4 font-heading font-normal text-rare-primary">Image</th>
              <th className="p-4 font-heading font-normal text-rare-primary">Title</th>
              <th className="p-4 font-heading font-normal text-rare-primary">Author</th>
              <th className="p-4 font-heading font-normal text-rare-primary">Category</th>
              <th className="p-4 font-heading font-normal text-rare-primary">Status</th>
              <th className="p-4 font-heading font-normal text-rare-primary text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {blogs.length ? (
              blogs.map((blog) => (
                <tr
                  key={blog._id}
                  className="hover:bg-white/10 transition-colors"
                >
                  <td className="p-4">
                    {blog.featured_image || blog.image ? (
                      <img
                        src={blog.featured_image || blog.image}
                        alt={blog.title}
                        className="w-16 h-16 object-cover rounded-lg shadow-sm border border-white/20"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center text-[10px] text-rare-text-light italic">No image</div>
                    )}
                  </td>
                  <td className="p-4 font-medium text-rare-primary">{blog.title}</td>
                  <td className="p-4 text-rare-text-light">{blog.author}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-white/20 rounded-md text-xs">
                      {blog.category}
                    </span>
                  </td>
                  <td className="p-4 capitalize">
                    <span className={`px-3 py-1 text-xs rounded-full font-medium shadow-sm ${
                      blog.published
                        ? "bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/20"
                        : "bg-gray-500/20 text-gray-700 dark:text-gray-400 border border-gray-500/20"
                    }`}>
                      {blog.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteBlog(blog._id)}
                      className="px-4 py-2 text-sm text-white bg-red-500/80 hover:bg-red-600 rounded-lg shadow-sm transition-all font-body"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No blog posts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}
