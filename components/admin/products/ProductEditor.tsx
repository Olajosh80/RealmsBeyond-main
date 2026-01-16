'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiSave, FiImage, FiX, FiPlus, FiSettings, FiBox, FiTruck, FiTag, FiArrowLeft, FiLoader } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

interface Product {
    _id?: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    compare_at_price?: number; // Regular price if on sale
    category: string;
    tags: string[];
    features: string[];
    in_stock: boolean;
    featured: boolean;
    images: string[];
    sku?: string;
    weight?: string;
    dimensions?: string;
}

interface Category {
    _id: string;
    name: string;
    slug: string;
}

export function ProductEditor({ productId }: { productId: string | null }) {
    const router = useRouter();
    // Removed useSearchParams to avoid re-renders
    const { user, openLoginModal } = useAuth();

    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [initialLoad, setInitialLoad] = useState(true);
    const [savingDraft, setSavingDraft] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // File Input Refs
    const featuredImageInputRef = useRef<HTMLInputElement>(null);
    const galleryImageInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [product, setProduct] = useState<Product>({
        name: '',
        slug: '',
        description: '',
        price: 0,
        category: '',
        tags: [],
        features: [],
        in_stock: true,
        featured: false,
        images: [],
    });

    const [tagInput, setTagInput] = useState('');
    const [featureInput, setFeatureInput] = useState('');
    const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

    const [draftLoaded, setDraftLoaded] = useState(false);

    // Fetch initial data & Restore Draft
    useEffect(() => {
        const loadInitData = async () => {
            try {
                // Fetch categories
                const catRes = await fetch('/api/products/categories');
                if (catRes.ok) {
                    const catData = await catRes.json();
                    setCategories(catData.categories || []);
                }

                // Restore draft or fetch
                let dbProduct = null;
                const draftId = productId || 'new';

                if (productId) {
                    setLoading(true);
                    const prodRes = await fetch(`/api/products?id=${productId}`);
                    if (prodRes.ok) {
                        const data = await prodRes.json();
                        if (data.products && Array.isArray(data.products)) {
                            dbProduct = data.products.find((p: Product) => p._id === productId);
                        } else if (data._id) {
                            dbProduct = data;
                        }
                    }
                }

                // Check for server-side draft
                try {
                    const draftRes = await fetch(`/api/admin/drafts?type=product&id=${draftId}`);
                    if (draftRes.ok) {
                        const { draft } = await draftRes.json();
                        if (draft && draft.data) {
                            // Merge draft with DB product if editing, or just use draft if new
                            if (dbProduct) {
                                dbProduct = { ...dbProduct, ...draft.data, _id: productId };
                            } else {
                                dbProduct = draft.data;
                            }
                            setDraftLoaded(true);
                        }
                    }
                } catch (e) {
                    console.error('Failed to load draft', e);
                }

                if (dbProduct) {
                    // Ensure arrays are initialized
                    setProduct({
                        ...dbProduct,
                        features: dbProduct.features || [],
                        tags: dbProduct.tags || [],
                        images: dbProduct.images || []
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
                setInitialLoad(false);
            }
        };

        loadInitData();
    }, [productId]); // Only run when ID changes

    const discardDraft = async () => {
        try {
            const draftId = productId || 'new';
            await fetch(`/api/admin/drafts?type=product&id=${draftId}`, { method: 'DELETE' });
            setDraftLoaded(false);
            if (!productId) {
                setProduct({
                    name: '',
                    slug: '',
                    description: '',
                    price: 0,
                    category: '',
                    tags: [],
                    features: [],
                    in_stock: true,
                    featured: false,
                    images: [],
                });
            } else {
                window.location.reload();
            }
        } catch (e) {
            console.error('Failed to discard draft', e);
        }
    };

    // Auto-save draft
    useEffect(() => {
        // Don't save if we are loading initial data or uploading
        if (loading || initialLoad || uploading) return;

        const saveDraft = setTimeout(async () => {
            if (!product.name && !product.description && !product.price) return; // Don't save empty

            try {
                setSavingDraft(true);
                const draftId = productId || 'new';
                await fetch('/api/admin/drafts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        resourceType: 'product',
                        resourceId: draftId,
                        data: product
                    })
                });
                setLastSaved(new Date());
            } catch (e) {
                console.error('Failed to auto-save draft', e);
            } finally {
                setSavingDraft(false);
            }
        }, 1000); // 1s debounce

        return () => clearTimeout(saveDraft);
    }, [product, productId, loading, initialLoad, uploading]);

    // Handle slug auto-generation
    const handleNameChange = (val: string) => {
        const updates: Partial<Product> = { name: val };
        if (!isSlugManuallyEdited && !productId) {
            updates.slug = val.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
        }
        setProduct(prev => ({ ...prev, ...updates }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (name === 'name') {
            handleNameChange(value);
        } else if (name === 'slug') {
            setIsSlugManuallyEdited(true);
            setProduct(prev => ({ ...prev, [name]: value }));
        } else if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setProduct(prev => ({ ...prev, [name]: checked }));
        } else {
            setProduct(prev => ({ ...prev, [name]: value }));
        }
    };

    // Image Upload
    const uploadFile = async (file: File): Promise<string | null> => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            return data.url;
        } catch (err) {
            console.error(err);
            showMessage('Upload Error', 'Failed to upload image', 'error');
            return null;
        }
    };

    const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploading(true);
            const url = await uploadFile(file);
            setUploading(false);

            if (url) {
                setProduct(prev => {
                    const newImages = [...prev.images];
                    if (newImages.length > 0) newImages[0] = url;
                    else newImages.push(url);
                    return { ...prev, images: newImages };
                });
            }
        }
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setUploading(true);
            const urls: string[] = [];
            for (let i = 0; i < files.length; i++) {
                const url = await uploadFile(files[i]);
                if (url) urls.push(url);
            }
            setUploading(false);

            if (urls.length > 0) {
                setProduct(prev => ({ ...prev, images: [...prev.images, ...urls] }));
            }
        }
    };

    // Tag Handlers
    const handleAddTag = () => {
        if (!tagInput.trim()) return;
        const newTags = tagInput.split(',').map(t => t.trim()).filter(t => t);
        setProduct(prev => ({
            ...prev,
            tags: [...new Set([...prev.tags, ...newTags])]
        }));
        setTagInput('');
    };

    // Feature Handlers
    const handleAddFeature = () => {
        if (!featureInput.trim()) return;
        setProduct(prev => ({
            ...prev,
            features: [...(prev.features || []), featureInput.trim()]
        }));
        setFeatureInput('');
    };

    const handleRemoveFeature = (index: number) => {
        setProduct(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    // Category Modal State
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    // Message Modal State
    const [messageState, setMessageState] = useState<{
        isOpen: boolean;
        type: 'success' | 'error';
        title: string;
        message: string;
        action?: () => void;
    }>({
        isOpen: false,
        type: 'success',
        title: '',
        message: '',
    });

    const showMessage = (title: string, message: string, type: 'success' | 'error' = 'success', action?: () => void) => {
        setMessageState({ isOpen: true, type, title, message, action });
    };

    const closeMessage = () => {
        if (messageState.action) messageState.action();
        setMessageState(prev => ({ ...prev, isOpen: false, action: undefined }));
    };

    // Handle saving the new category from the modal
    const handleSaveCategory = async () => {
        if (!newCategoryName.trim()) return;

        try {
            const res = await fetch('/api/products/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategoryName })
            });
            if (res.ok) {
                const data = await res.json();
                setCategories(prev => [...prev, data.category]);
                setProduct(prev => ({ ...prev, category: data.category.name })); // Auto select
                setIsCategoryModalOpen(false);
                setNewCategoryName('');
            } else {
                showMessage('Error', 'Failed to create category', 'error');
            }
        } catch (err) {
            console.error(err);
            showMessage('Error', 'An unexpected error occurred', 'error');
        }
    };

    // Save Product
    const handleSave = async () => {
        if (!product.name || !product.price || !product.weight) {
            const missing = [];
            if (!product.name) missing.push('Name');
            if (!product.price) missing.push('Price');
            if (!product.weight) missing.push('Weight');
            showMessage('Validation Error', `${missing.join(', ')} ${missing.length > 1 ? 'are' : 'is'} required.`, 'error');
            return;
        }

        setLoading(true);
        try {
            const method = productId ? 'PUT' : 'POST';
            const body = productId ? { ...product, _id: productId } : product;

            const res = await fetch('/api/products', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                // Remove server-side draft
                try {
                    await fetch(`/api/admin/drafts?type=product&id=${productId || 'new'}`, { method: 'DELETE' });
                } catch (e) { console.error('Failed to cleanup draft', e); }

                if (!productId) {
                    showMessage('Success', 'Product created successfully!', 'success', () => {
                        router.push('/admin/products');
                    });
                } else {
                    showMessage('Success', 'Product updated successfully!', 'success');
                }
            } else {
                if (res.status === 401) {
                    showMessage('Unauthorized', 'Your session has expired. Please sign in again to save your changes.', 'error', () => {
                        openLoginModal();
                    });
                    // Also open immediately in case they miss the toast/modal action
                    openLoginModal();
                } else {
                    const error = await res.json();
                    showMessage('Error', error.error || 'Failed to save', 'error');
                }
            }
        } catch (err) {
            console.error(err);
            showMessage('Error', 'An unexpected network error occurred', 'error');
        } finally {
            setLoading(false);
        }
    };

    // This handles the flickering/loop if data is loading or initial auth check is happening
    if (initialLoad && productId) return <div className="p-10 flex justify-center"><div className="animate-spin h-8 w-8 border-2 border-rare-primary rounded-full border-t-transparent"></div></div>;

    return (
        <div className="flex flex-col gap-6 relative">
            {/* Toolbar */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200 -mx-6 px-6 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900">
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="font-heading font-bold text-gray-900 text-lg">
                            {productId ? 'Edit Product' : 'New Product'}
                        </h2>
                        {/* Draft Status */}
                        <div className="text-xs flex items-center gap-2 h-4">
                            {savingDraft ? (
                                <span className="text-gray-400 animate-pulse">Saving draft...</span>
                            ) : lastSaved ? (
                                <span className="text-gray-400">
                                    Draft saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            ) : null}
                            {(draftLoaded || lastSaved) && !savingDraft && (
                                <button onClick={discardDraft} className="text-red-500 hover:text-red-600 hover:underline">
                                    Discard draft
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => router.push('/admin/products')} className="px-4 py-2 text-sm text-gray-500 font-medium hover:text-gray-900">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || uploading}
                        className="flex items-center gap-2 px-6 py-2 bg-rare-primary text-grey rounded-lg font-bold shadow-lg shadow-rare-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >  
                        {loading ? <FiLoader className="animate-spin" /> : <FiSave />}
                        {productId ? 'Update' : 'Publish'}
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 mt-4">
                {/* Main Content Column */}
                <div className="flex-1 space-y-6">
                    {/* Title & Slug */}
                    <div className="space-y-3">
                        <input
                            type="text"
                            name="name"
                            placeholder="Product Name"
                            value={product.name}
                            onChange={handleInputChange}
                            className="w-full text-3xl font-heading font-bold p-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rare-primary/50 text-gray-900 placeholder-gray-400 shadow-sm"
                        />
                        <div className="flex items-center gap-2 text-sm text-gray-500 px-2">
                            <span>Permalink:</span>
                            <span className="text-gray-400">/products/</span>
                            <input
                                type="text"
                                name="slug"
                                value={product.slug}
                                onChange={handleInputChange}
                                className="bg-transparent border-b border-dashed border-gray-300 hover:border-rare-primary focus:border-rare-primary focus:outline-none text-gray-600 font-mono text-xs py-0.5 min-w-[200px]"
                            />
                        </div>
                    </div>

                    {/* Description - Simplified wysiwyg placeholder */}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm min-h-[300px] flex flex-col">
                        <div className="bg-gray-50 border-b border-gray-200 p-2 flex gap-2">
                            <button className="p-1.5 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-900 font-bold text-xs border border-transparent hover:border-gray-300">Bold</button>
                            <button className="p-1.5 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-900 italic text-xs border border-transparent hover:border-gray-300">Italic</button>
                        </div>
                        <textarea
                            name="description"
                            placeholder="Product Description..."
                            value={product.description}
                            onChange={handleInputChange}
                            className="flex-1 w-full p-4 bg-transparent border-none focus:ring-0 resize-none outline-none font-body text-gray-700 placeholder-gray-400 leading-relaxed"
                        />
                    </div>

                    {/* Product Data Meta Box */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm run-in">
                        <div className="border-b border-gray-200 p-4 bg-gray-50 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">Product Data</h3>
                        </div>

                        <div className="flex flex-col md:flex-row min-h-[250px]">
                            {/* Tabs */}
                            <div className="w-full md:w-48 bg-gray-50 border-r border-gray-200 p-2 space-y-1">
                                {[
                                    { id: 'general', icon: FiSettings, label: 'General' },
                                    { id: 'inventory', icon: FiBox, label: 'Inventory' },
                                    { id: 'shipping', icon: FiTruck, label: 'Shipping' },
                                    { id: 'features', icon: FiTag, label: 'Features' },
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-3 rounded-lg transition-all ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                                    >
                                        <tab.icon size={16} className={activeTab === tab.id ? 'text-rare-primary' : 'text-gray-400'} />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-6">
                                {activeTab === 'general' && (
                                    <div className="space-y-4 max-w-sm">
                                        <label className="block">
                                            <span className="text-sm font-medium text-gray-700">Regular Price (₦)</span>
                                            <input
                                                type="number"
                                                name="compare_at_price" // Mapped to regular price if sale used
                                                value={product.compare_at_price || ''}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-rare-primary focus:ring focus:ring-rare-primary/20 sm:text-sm p-2 border"
                                                placeholder="0.00"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-sm font-medium text-gray-700">Sale Price (₦)</span>
                                            <input
                                                type="number"
                                                name="price" // Mapped to current price
                                                value={product.price || ''}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-rare-primary focus:ring focus:ring-rare-primary/20 sm:text-sm p-2 border"
                                                placeholder="0.00"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">This is the price customers will pay.</p>
                                        </label>
                                    </div>
                                )}

                                {activeTab === 'inventory' && (
                                    <div className="space-y-4 max-w-sm">
                                        <label className="block">
                                            <span className="text-sm font-medium text-gray-700">SKU</span>
                                            <input
                                                type="text"
                                                name="sku"
                                                value={product.sku || ''}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-rare-primary focus:ring focus:ring-rare-primary/20 sm:text-sm p-2 border"
                                            />
                                        </label>
                                        <div className="flex items-center gap-2 pt-2">
                                            <input
                                                type="checkbox"
                                                id="in_stock"
                                                name="in_stock"
                                                checked={product.in_stock}
                                                onChange={handleInputChange}
                                                className="rounded border-gray-300 text-rare-primary focus:ring-rare-primary bg-white"
                                            />
                                            <label htmlFor="in_stock" className="text-sm text-gray-700 font-medium">In Stock</label>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'shipping' && (
                                    <div className="space-y-4 max-w-sm">
                                        <label className="block">
                                            <span className="text-sm font-medium text-gray-700">Weight (kg) <span className="text-red-500">*</span></span>
                                            <input
                                                type="text"
                                                name="weight"
                                                value={product.weight || ''}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-rare-primary focus:ring focus:ring-rare-primary/20 sm:text-sm p-2 border"
                                                placeholder="e.g. 0.5"
                                                required
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-sm font-medium text-gray-700">Dimensions (LxWxH cm)</span>
                                            <input
                                                type="text"
                                                name="dimensions"
                                                value={product.dimensions || ''}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 text-gray-900 shadow-sm focus:border-rare-primary focus:ring focus:ring-rare-primary/20 sm:text-sm p-2 border"
                                            />
                                        </label>
                                    </div>
                                )}

                                {activeTab === 'features' && (
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={featureInput}
                                                onChange={(e) => setFeatureInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddFeature()}
                                                placeholder="Add a key feature (e.g., Premium quality materials)"
                                                className="flex-1 text-sm border border-gray-300 bg-gray-50 text-gray-900 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-rare-primary"
                                            />
                                            <button
                                                onClick={handleAddFeature}
                                                className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                                            >
                                                Add
                                            </button>
                                        </div>

                                        {product.features && product.features.length > 0 ? (
                                            <ul className="space-y-2 border border-gray-200 rounded-lg p-2 bg-gray-50">
                                                {product.features.map((feature, index) => (
                                                    <li key={index} className="flex items-center justify-between gap-3 bg-white p-2 rounded shadow-sm border border-gray-200">
                                                        <span className="text-sm text-gray-700">{feature}</span>
                                                        <button
                                                            onClick={() => handleRemoveFeature(index)}
                                                            className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                                                        >
                                                            <FiX size={14} />
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="text-sm text-gray-400 italic text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                                No features added yet. Add key selling points here.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="w-full lg:w-80 space-y-6">

                    {/* Product Image */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                        <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-3 mb-3 text-sm uppercase tracking-wide">Featured Image</h3>
                        <input
                            type="file"
                            ref={featuredImageInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFeaturedImageUpload}
                        />
                        {product.images.length > 0 ? (
                            <div className="group relative rounded-lg overflow-hidden border border-gray-200">
                                <img
                                    src={product.images[0]}
                                    alt="Product"
                                    className="w-full aspect-square object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                    <button
                                        onClick={() => featuredImageInputRef.current?.click()}
                                        className="bg-white text-gray-900 px-3 py-1 rounded-full text-xs font-bold hover:bg-gray-100 shadow-lg"
                                    >
                                        Replace
                                    </button>
                                    <button
                                        onClick={() => setProduct(p => ({ ...p, images: p.images.filter((_, i) => i !== 0) }))}
                                        className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-red-600 shadow-lg"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => featuredImageInputRef.current?.click()}
                                className="w-full aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-rare-primary hover:border-rare-primary hover:bg-rare-primary/5 transition-all gap-2"
                            >
                                <FiImage size={32} />
                                <span className="text-sm font-medium">Set product image</span>
                            </button>
                        )}
                        {uploading && <div className="mt-2 text-xs text-rare-primary text-center">Uploading...</div>}
                    </div>

                    {/* Categories */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                        <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-3 mb-3 text-sm uppercase tracking-wide">Categories</h3>
                        <div className="max-h-60 overflow-y-auto space-y-1 my-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300">
                            {categories.map(cat => (
                                <label key={cat._id} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors select-none">
                                    <input
                                        type="radio"
                                        name="category"
                                        checked={product.category === cat.name}
                                        onChange={() => setProduct(p => ({ ...p, category: cat.name }))}
                                        className="text-rare-primary focus:ring-rare-primary border-gray-300 bg-white w-4 h-4"
                                    />
                                    {cat.name}
                                </label>
                            ))}
                            {categories.length === 0 && <div className="text-sm text-gray-400 italic p-2">No categories found.</div>}
                        </div>
                        <button onClick={() => setIsCategoryModalOpen(true)} className="text-rare-primary text-sm font-medium hover:underline flex items-center gap-1 mt-2">
                            <FiPlus size={14} /> Add new category
                        </button>

                        {/* Category Modal */}
                        {isCategoryModalOpen && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                                <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-2xl max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-200">
                                    <h3 className="text-lg font-heading font-bold text-gray-900">New Category</h3>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Category Name</label>
                                        <input
                                            type="text"
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            placeholder="e.g., Potions"
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rare-primary/50 transition-all font-medium text-gray-900 placeholder-gray-400"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveCategory();
                                                if (e.key === 'Escape') setIsCategoryModalOpen(false);
                                            }}
                                        />
                                    </div>

                                    <div className="flex justify-end gap-2 pt-2">
                                        <button
                                            onClick={() => setIsCategoryModalOpen(false)}
                                            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveCategory}
                                            className="px-4 py-2 text-sm font-bold text-white bg-rare-primary hover:bg-rare-primary/90 shadow-lg shadow-rare-primary/20 rounded-lg transition-all active:scale-95"
                                        >
                                            Create Category
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                        <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-3 mb-3 text-sm uppercase tracking-wide">Tags</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                placeholder="Separate with commas"
                                className="flex-1 text-sm border border-gray-300 bg-gray-50 text-gray-900 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-rare-primary"
                            />
                            <button
                                onClick={handleAddTag}
                                className="px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                            >
                                Add
                            </button>
                        </div>
                        {product.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {product.tags.map(tag => (
                                    <span key={tag} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md flex items-center gap-1 border border-gray-200">
                                        <FiTag size={10} className="text-gray-400" />
                                        {tag}
                                        <button onClick={() => setProduct(p => ({ ...p, tags: p.tags.filter(t => t !== tag) }))} className="hover:text-red-500 ml-1">
                                            <FiX size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Gallery */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                        <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-3 mb-3 text-sm uppercase tracking-wide">Gallery</h3>
                        <input
                            type="file"
                            ref={galleryImageInputRef}
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={handleGalleryUpload}
                        />
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            {product.images.slice(1).map((img, i) => (
                                <div key={i} className="aspect-square rounded border border-gray-200 overflow-hidden relative group">
                                    <img src={img} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={() => setProduct(p => ({ ...p, images: p.images.filter((_, idx) => idx !== i + 1) }))}
                                            className="text-white hover:text-red-200"
                                        >
                                            <FiX size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={() => galleryImageInputRef.current?.click()}
                                className="aspect-square bg-gray-50 border border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 hover:text-rare-primary hover:border-rare-primary hover:bg-rare-primary/5 transition-all"
                            >
                                <FiPlus size={24} />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
            {/* Message Modal */}
            {messageState.isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-2xl max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-200">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${messageState.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {messageState.type === 'success' ? <FiBox size={24} /> : <FiX size={24} />}
                        </div>

                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-heading font-bold text-gray-900">{messageState.title}</h3>
                            <p className="text-sm text-gray-600">{messageState.message}</p>
                        </div>

                        <div className="flex justify-center pt-2">
                            <button
                                onClick={closeMessage}
                                className="w-full px-4 py-2 text-sm font-bold text-grey bg-rare-primary hover:bg-rare-primary/90 shadow-lg shadow-rare-primary/20 rounded-lg transition-all active:scale-95"
                            >
                                Okay
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Dummy export to prevent error if someone imports defaults
export default ProductEditor;
