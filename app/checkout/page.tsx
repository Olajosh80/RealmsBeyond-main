'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { MdShoppingCart, MdCreditCard, MdLocationOn, MdPerson, MdMail, MdPhone, MdLock, MdErrorOutline } from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/lib/supabase';

export default function CheckoutPage() {
  const router = useRouter();
  const { items: cartItems, clearCart, getTotalPrice, getTotalItems } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && step === 1) {
      router.push('/products');
    }
  }, [cartItems, router, step]);

  // Require authentication before allowing checkout
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!data?.user) {
          router.push(`/signin?returnTo=${encodeURIComponent('/checkout')}`);
        }
      } catch (err) {
        console.error('Auth check failed', err);
        router.push(`/signin?returnTo=${encodeURIComponent('/checkout')}`);
      }
    })();
  }, [router]);

  // Form data
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    saveCard: false,
  });

  const subtotal = getTotalPrice();
  const shipping = subtotal > 0 ? 15.00 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Ensure user session and token
      const sessionRes = await supabase.auth.getSession();
      const accessToken = sessionRes.data?.session?.access_token;
      if (!accessToken) {
        setError('You must be signed in to complete the purchase.');
        setLoading(false);
        router.push(`/signin?returnTo=${encodeURIComponent('/checkout')}`);
        return;
      }

      const payload = {
        items: cartItems,
        shipping: shippingInfo,
        total,
        payment: { masked: `**** **** **** ${paymentInfo.cardNumber.slice(-4)}` },
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Failed to create order');
        setLoading(false);
        return;
      }

      // Success: clear cart and go to success page
      clearCart();
      setLoading(false);
      router.push('/checkout/success');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gradient-to-br from-rare-accent/5 to-white py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Breadcrumb */}
          <div className="mb-8 flex items-center gap-2 text-sm text-rare-text-light">
            <a href="/" className="hover:text-rare-primary">Home</a>
            <span>/</span>
            <a href="/products" className="hover:text-rare-primary">Products</a>
            <span>/</span>
            <span className="text-rare-primary">Checkout</span>
          </div>

          {/* Page Title */}
          <h1 className="font-heading text-4xl font-normal text-rare-primary mb-8">Checkout</h1>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
              <MdErrorOutline className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Empty Cart Warning */}
          {cartItems.length === 0 && (
            <div className="mb-6 p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-center">
              <p className="text-yellow-700 dark:text-yellow-400">Your cart is empty. <a href="/products" className="underline font-semibold">Continue shopping</a></p>
            </div>
          )}

          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-center gap-4">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-rare-primary' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-rare-primary text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span className="font-medium hidden md:block">Shipping</span>
              </div>
              <div className={`h-1 w-16 ${step >= 2 ? 'bg-rare-primary' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center gap-2 ${step >= 2 ? 'text-rare-primary' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-rare-primary text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span className="font-medium hidden md:block">Payment</span>
              </div>
              <div className={`h-1 w-16 ${step >= 3 ? 'bg-rare-primary' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center gap-2 ${step >= 3 ? 'text-rare-primary' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-rare-primary text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <span className="font-medium hidden md:block">Confirmation</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Shipping Information */}
              {step === 1 && (
                <Card>
                  <div className="flex items-center gap-3 mb-6">
                    <MdLocationOn className="w-6 h-6 text-rare-primary" />
                    <h2 className="font-heading text-2xl font-normal text-rare-primary">Shipping Information</h2>
                  </div>

                  <form onSubmit={handleShippingSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-rare-text mb-2">
                          <MdPerson className="inline w-4 h-4 mr-1" />
                          Full Name *
                        </label>
                        <Input
                          type="text"
                          placeholder="John Doe"
                          value={shippingInfo.fullName}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                          required
                          fullWidth
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-rare-text mb-2">
                          <MdMail className="inline w-4 h-4 mr-1" />
                          Email *
                        </label>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          value={shippingInfo.email}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                          required
                          fullWidth
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-rare-text mb-2">
                        <MdPhone className="inline w-4 h-4 mr-1" />
                        Phone Number *
                      </label>
                      <Input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={shippingInfo.phone}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                        required
                        fullWidth
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-rare-text mb-2">
                        Street Address *
                      </label>
                      <Input
                        type="text"
                        placeholder="123 Main Street, Apt 4B"
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                        required
                        fullWidth
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-rare-text mb-2">City *</label>
                        <Input
                          type="text"
                          placeholder="New York"
                          value={shippingInfo.city}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                          required
                          fullWidth
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-rare-text mb-2">State *</label>
                        <Input
                          type="text"
                          placeholder="NY"
                          value={shippingInfo.state}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                          required
                          fullWidth
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-rare-text mb-2">ZIP Code *</label>
                        <Input
                          type="text"
                          placeholder="10001"
                          value={shippingInfo.zipCode}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
                          required
                          fullWidth
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-rare-text mb-2">Country *</label>
                      <select
                        className="w-full px-4 py-3 border border-rare-border rounded-lg font-body text-rare-text focus:outline-none focus:ring-2 focus:ring-rare-primary"
                        value={shippingInfo.country}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                        required
                      >
                        <option>United States</option>
                        <option>Canada</option>
                        <option>United Kingdom</option>
                        <option>Australia</option>
                      </select>
                    </div>

                    <div className="pt-4">
                      <Button type="submit" variant="primary" size="lg" fullWidth>
                        Continue to Payment
                      </Button>
                    </div>
                  </form>
                </Card>
              )}

              {/* Step 2: Payment Information */}
              {step === 2 && (
                <Card>
                  <div className="flex items-center gap-3 mb-6">
                    <MdCreditCard className="w-6 h-6 text-rare-primary" />
                    <h2 className="font-heading text-2xl font-normal text-rare-primary">Payment Information</h2>
                  </div>

                  <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-rare-text mb-2">
                        Card Number *
                      </label>
                      <Input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={paymentInfo.cardNumber}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                        required
                        fullWidth
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-rare-text mb-2">
                        Cardholder Name *
                      </label>
                      <Input
                        type="text"
                        placeholder="John Doe"
                        value={paymentInfo.cardName}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, cardName: e.target.value })}
                        required
                        fullWidth
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-rare-text mb-2">
                          Expiry Date *
                        </label>
                        <Input
                          type="text"
                          placeholder="MM/YY"
                          value={paymentInfo.expiryDate}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, expiryDate: e.target.value })}
                          required
                          fullWidth
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-rare-text mb-2">
                          <MdLock className="inline w-4 h-4 mr-1" />
                          CVV *
                        </label>
                        <Input
                          type="text"
                          placeholder="123"
                          value={paymentInfo.cvv}
                          onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                          required
                          fullWidth
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="saveCard"
                        checked={paymentInfo.saveCard}
                        onChange={(e) => setPaymentInfo({ ...paymentInfo, saveCard: e.target.checked })}
                        className="w-4 h-4 text-rare-primary border-gray-300 rounded"
                      />
                      <label htmlFor="saveCard" className="text-sm text-rare-text">
                        Save card for future purchases
                      </label>
                    </div>

                    <div className="bg-rare-accent/10 border border-rare-accent/20 rounded-lg p-4 mt-6">
                      <p className="text-sm text-rare-text flex items-center gap-2">
                        <MdLock className="w-4 h-4" />
                        Your payment information is encrypted and secure
                      </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button type="button" variant="outline" size="lg" fullWidth onClick={() => setStep(1)}>
                        Back
                      </Button>
                      <Button type="submit" variant="primary" size="lg" fullWidth disabled={loading || cartItems.length === 0}>
                        {loading ? (
                          <>
                            <AiOutlineLoading3Quarters className="h-4 w-4 animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          'Complete Purchase'
                        )}
                      </Button>
                    </div>
                  </form>
                </Card>
              )}
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <div className="flex items-center gap-3 mb-6">
                  <MdShoppingCart className="w-6 h-6 text-rare-primary" />
                  <h2 className="font-heading text-2xl font-normal text-rare-primary">Order Summary</h2>
                </div>

                {/* Cart Items */}
                <div className="space-y-4 mb-6 pb-6 border-b border-rare-border">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-rare-text">{item.name}</h3>
                        <p className="text-sm text-rare-text-light">Qty: {item.quantity}</p>
                        <p className="font-semibold text-rare-primary">${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-rare-text">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-rare-text">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-rare-text">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-rare-border pt-3 flex justify-between font-bold text-lg text-rare-primary">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="bg-rare-accent/10 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-rare-text">
                    <span className="text-green-600">✓</span>
                    Free returns within 30 days
                  </div>
                  <div className="flex items-center gap-2 text-sm text-rare-text">
                    <span className="text-green-600">✓</span>
                    Secure checkout
                  </div>
                  <div className="flex items-center gap-2 text-sm text-rare-text">
                    <span className="text-green-600">✓</span>
                    1-year warranty included
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
