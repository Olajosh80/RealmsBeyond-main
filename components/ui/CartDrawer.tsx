'use client';

import React from 'react';
import Link from 'next/link';
import { FiX, FiShoppingCart, FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { Button } from './Button';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCart();

  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-rare-background shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-rare-border bg-gradient-blue">
            <div className="flex items-center gap-3">
              <FiShoppingCart className="h-6 w-6 text-white" />
              <h2 className="font-heading text-2xl font-normal text-white">
                Shopping Cart
              </h2>
              {getTotalItems() > 0 && (
                <span className="bg-rare-accent text-rare-primary text-xs font-bold px-2 py-1 rounded-full">
                  {getTotalItems()}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              aria-label="Close cart"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <FiShoppingCart className="h-16 w-16 text-rare-text-light/30 mb-4" />
                <p className="font-body text-lg text-rare-text-light mb-2">Your cart is empty</p>
                <p className="font-body text-sm text-rare-text-light mb-6">
                  Start shopping to add items to your cart
                </p>
                <Button href="/products" variant="primary" onClick={onClose}>
                  Browse Products
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-white rounded-lg border border-rare-border"
                  >
                    {/* Product Image */}
                    <Link
                      href={item.slug ? `/products/${item.slug}` : '#'}
                      onClick={onClose}
                      className="flex-shrink-0"
                    >
                      <img
                        src={item.image || '/placeholder-product.jpg'}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={item.slug ? `/products/${item.slug}` : '#'}
                        onClick={onClose}
                        className="block"
                      >
                        <h3 className="font-heading text-base font-normal text-rare-primary mb-1 hover:text-rare-secondary transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      <p className="font-body text-sm font-semibold text-rare-primary mb-3">
                        ${item.price.toFixed(2)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 border border-rare-border rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-rare-primary-light transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <FiMinus className="h-4 w-4 text-rare-primary" />
                          </button>
                          <span className="font-body text-sm text-rare-text w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-rare-primary-light transition-colors"
                            aria-label="Increase quantity"
                          >
                            <FiPlus className="h-4 w-4 text-rare-primary" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-rare-text-light hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label="Remove item"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer with Total and Checkout */}
          {items.length > 0 && (
            <div className="border-t border-rare-border bg-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-heading text-lg font-normal text-rare-text">Total:</span>
                <span className="font-heading text-2xl font-normal text-rare-primary">
                  ${getTotalPrice().toFixed(2)}
                </span>
              </div>
              <Button
                href="/checkout"
                variant="primary"
                size="lg"
                fullWidth
                onClick={onClose}
              >
                Proceed to Checkout
              </Button>
              <Link
                href="/products"
                onClick={onClose}
                className="block text-center font-body text-sm text-rare-primary hover:text-rare-secondary transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

