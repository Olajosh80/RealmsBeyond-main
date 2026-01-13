"use client";
import React, { useState, useEffect } from "react";
import AddGoodsForm from "@/components/admin/AddGoodsForm";
import GoodsTable from "@/components/admin/GoodsTable";
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdErrorOutline, MdCheckCircle } from 'react-icons/md';

export default function GoodsPage() {
  const [goods, setGoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/products');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch products');
      }
      const data = await response.json();
      setGoods(data || []);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Add new product
  const handleAddGood = async (newGood: any) => {
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);

      // Validation
      if (!newGood.name || !newGood.price) {
        throw new Error('Product name and price are required');
      }

      const price = parseFloat(newGood.price);
      if (isNaN(price) || price <= 0) {
        throw new Error('Price must be a valid positive number');
      }

      // Generate slug from name
      const slug = newGood.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const productData = {
        name: newGood.name.trim(),
        slug: slug,
        description: (newGood.description || '').trim(),
        price: price,
        compare_at_price: newGood.discount && parseFloat(newGood.discount) > 0
          ? price * (1 + parseFloat(newGood.discount) / 100)
          : null,
        images: newGood.image ? [newGood.image] : [],
        category: newGood.category || '',
        division_id: null,
        in_stock: newGood.status === 'Active',
        featured: false,
        tags: Array.isArray(newGood.tags) ? newGood.tags : [],
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add product');
      }

      setSuccess('Product added successfully!');
      await fetchProducts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('[Goods] Catch block error:', err);
      setError(err.message || 'Failed to add product. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete a product
  const handleDeleteGood = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete product');
      }

      setSuccess('Product deleted successfully!');
      await fetchProducts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setError(err.message || 'Failed to delete product. Please try again.');
      setTimeout(() => setError(null), 5000);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
        <h1 className="text-4xl font-heading font-normal text-rare-primary mb-2">Manage Products</h1>
        <p className="text-rare-text-light font-body">Catalog and inventory management system.</p>
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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <AiOutlineLoading3Quarters className="h-8 w-8 animate-spin text-blue-600 mb-2" />
          <p className="text-gray-600 dark:text-gray-400">Loading products...</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          <AddGoodsForm onAddGood={handleAddGood} isSubmitting={actionLoading} />
          <GoodsTable goods={goods} onDelete={handleDeleteGood} isDeleting={actionLoading} />
        </div>
      )}
    </div>
  );
}
