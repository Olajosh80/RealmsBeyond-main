"use client";
import React, { useState, useEffect } from "react";
import AddGoodsForm from "@/components/admin/AddGoodsForm";
import GoodsTable from "@/components/admin/GoodsTable";
import { supabase } from "@/lib/supabase";
import { Product } from "@/lib/supabase";
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdErrorOutline, MdCheckCircle } from 'react-icons/md';

export default function GoodsPage() {
  const [goods, setGoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Fetch products from Supabase
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*, division:divisions(*)')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
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

      console.log('[Goods] Adding product with data:', productData);

      const { data, error: insertError } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (insertError) {
        console.error('[Goods] Insert error detail:', insertError);
        throw insertError;
      }

      setSuccess('Product added successfully!');
      await fetchProducts();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('[Goods] Catch block error:', err);
      // Try to extract a useful message
      const errorMessage = typeof err === 'object' ? (err.message || err.details || JSON.stringify(err)) : String(err);
      setError(errorMessage || 'Failed to add product. Please try again.');
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

      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

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
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Manage Products</h1>

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
