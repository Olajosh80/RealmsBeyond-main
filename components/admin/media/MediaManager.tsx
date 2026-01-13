'use client';

import React, { useState } from 'react';
import { FiUpload, FiImage, FiCheck, FiX, FiTrash2 } from 'react-icons/fi';

interface MediaManagerProps {
    isOpen?: boolean;
    onClose?: () => void;
    onSelect?: (url: string) => void;
    allowMultiple?: boolean;
    variant?: 'modal' | 'inline';
}

// Mock mock images for now - in a real app, this would fetch from an API
const MOCK_IMAGES = [
    '/products/crystal-1.jpg',
    '/products/crystal-2.jpg',
    '/products/sage.jpg',
    '/products/tarot.jpg',
    'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=300&q=80',
];

export function MediaManager({
    isOpen = true,
    onClose,
    onSelect,
    allowMultiple = false,
    variant = 'modal'
}: MediaManagerProps) {
    const [activeTab, setActiveTab] = useState<'upload' | 'library'>('library');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [images, setImages] = useState<string[]>(MOCK_IMAGES);
    const [uploading, setUploading] = useState(false);

    if (variant === 'modal' && !isOpen) return null;

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        // Simulate upload delay
        setTimeout(() => {
            // In a real app, you'd upload to cloud storage (AWS S3/Cloudinary) and get a URL back
            const fakeUrl = URL.createObjectURL(file);
            setImages([fakeUrl, ...images]);
            setActiveTab('library');
            setUploading(false);
        }, 1500);
    };

    const handleSelect = () => {
        if (selectedImage && onSelect) {
            onSelect(selectedImage);
            if (onClose) onClose();
        }
    };

    const containerClasses = variant === 'modal'
        ? "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
        : "w-full h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-100";

    const contentClasses = variant === 'modal'
        ? "bg-white rounded-xl w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl overflow-hidden"
        : "flex flex-col h-[calc(100vh-140px)] w-full"; // Adjust height for inline

    return (
        <div className={containerClasses}>
            <div className={contentClasses}>
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">Media Library</h2>
                    {variant === 'modal' && onClose && (
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <FiX size={20} />
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 px-4">
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'upload' ? 'border-rare-primary text-rare-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Upload Files
                    </button>
                    <button
                        onClick={() => setActiveTab('library')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'library' ? 'border-rare-primary text-rare-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Media Library
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {activeTab === 'upload' ? (
                        <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-white p-12">
                            <div className="w-20 h-20 bg-rare-primary/5 rounded-full flex items-center justify-center mb-6">
                                <FiUpload className="w-8 h-8 text-rare-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Drop files to upload</h3>
                            <p className="text-gray-500 mb-8">or</p>
                            <label className="cursor-pointer">
                                <span className="bg-rare-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-rare-primary/90 transition-colors shadow-lg shadow-rare-primary/20">
                                    Select Files
                                </span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                            </label>
                            {uploading && <p className="mt-4 text-rare-primary animate-pulse font-medium">Uploading...</p>}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {images.map((img, i) => (
                                <div
                                    key={i}
                                    onClick={() => setSelectedImage(img)}
                                    className={`aspect-square relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-rare-primary ring-2 ring-rare-primary/30' : 'border-transparent hover:border-gray-300'}`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                    {selectedImage === img && (
                                        <div className="absolute inset-0 bg-rare-primary/20 flex items-center justify-center">
                                            <div className="bg-rare-primary text-white p-1 rounded-full shadow-sm">
                                                <FiCheck size={16} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-white flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        {selectedImage ? '1 item selected' : 'No items selected'}
                    </div>
                    {onSelect && (
                        <button
                            onClick={handleSelect}
                            disabled={!selectedImage}
                            className="bg-rare-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-rare-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rare-primary/20"
                        >
                            Select Image
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
