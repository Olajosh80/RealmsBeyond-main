'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MdCheckCircle, MdLocalShipping, MdMail, MdDownload, MdArrowForward } from 'react-icons/md';

export default function CheckoutSuccessPage() {
  const [orderNumber] = useState(`ORD-${Date.now().toString().slice(-8)}`);

  useEffect(() => {
    // Confetti effect (optional)
    const timer = setTimeout(() => {
      console.log('Order confirmed!');
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-white py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 animate-bounce">
              <MdCheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-normal text-rare-primary mb-4">
              Order Confirmed!
            </h1>
            <p className="font-body text-lg text-rare-text-light">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
          </div>

          {/* Order Details Card */}
          <Card className="mb-8">
            <div className="border-b border-rare-border pb-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-2xl font-normal text-rare-primary">Order Details</h2>
                <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                  Confirmed
                </span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-rare-text-light mb-1">Order Number</p>
                  <p className="font-mono font-bold text-rare-primary">{orderNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-rare-text-light mb-1">Order Date</p>
                  <p className="font-medium text-rare-text">{new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
                <div>
                  <p className="text-sm text-rare-text-light mb-1">Total Amount</p>
                  <p className="font-bold text-2xl text-rare-primary">$339.91</p>
                </div>
                <div>
                  <p className="text-sm text-rare-text-light mb-1">Payment Method</p>
                  <p className="font-medium text-rare-text">Card ending in 3456</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mb-6">
              <h3 className="font-heading text-xl mb-3 text-rare-primary">Shipping Address</h3>
              <div className="bg-rare-accent/5 rounded-lg p-4">
                <p className="font-medium text-rare-text">John Doe</p>
                <p className="text-rare-text-light">123 Main Street, Apt 4B</p>
                <p className="text-rare-text-light">New York, NY 10001</p>
                <p className="text-rare-text-light">United States</p>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-heading text-xl mb-3 text-rare-primary">Items Ordered</h3>
              <div className="space-y-3">
                <div className="flex gap-4 bg-rare-accent/5 rounded-lg p-4">
                  <img
                    src="/ProductsImg/fash1.jpg"
                    alt="Designer Leather Bag"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-rare-text">Designer Leather Bag</h4>
                    <p className="text-sm text-rare-text-light">Quantity: 1</p>
                    <p className="font-semibold text-rare-primary mt-1">$299.99</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Next Steps */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="text-center">
              <Mail className="w-12 h-12 text-rare-primary mx-auto mb-4" />
                            <MdMail className="w-12 h-12 text-rare-primary mx-auto mb-4" />
              <h3 className="font-heading text-lg mb-2">Check Your Email</h3>
              <p className="text-sm text-rare-text-light">
                Order confirmation sent to your email address
              </p>
            </Card>
            
            <Card className="text-center">
              <Package className="w-12 h-12 text-rare-primary mx-auto mb-4" />
                            <MdLocalShipping className="w-12 h-12 text-rare-primary mx-auto mb-4" />
              <h3 className="font-heading text-lg mb-2">Track Your Order</h3>
              <p className="text-sm text-rare-text-light">
                Shipping updates will be sent via email
              </p>
            </Card>
            
            <Card className="text-center">
              <Download className="w-12 h-12 text-rare-primary mx-auto mb-4" />
                            <MdDownload className="w-12 h-12 text-rare-primary mx-auto mb-4" />
              <h3 className="font-heading text-lg mb-2">Download Invoice</h3>
              <p className="text-sm text-rare-text-light">
                Access your receipt anytime from your account
              </p>
            </Card>
          </div>

          {/* Timeline */}
          <Card className="mb-8">
            <h3 className="font-heading text-xl mb-6 text-rare-primary">What Happens Next?</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-rare-text mb-1">Order Confirmed</h4>
                  <p className="text-sm text-rare-text-light">Your order has been received and confirmed</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-rare-text mb-1">Processing (1-2 days)</h4>
                  <p className="text-sm text-rare-text-light">Your order is being prepared for shipment</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <ArrowRight className="w-6 h-6 text-purple-600" />
                                  <MdArrowForward className="w-6 h-6 text-purple-600" />
                                  <MdLocalShipping className="w-6 h-6 text-blue-600" />
                                  <MdCheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-rare-text mb-1">Shipped (3-5 days)</h4>
                  <p className="text-sm text-rare-text-light">Your order is on its way to you</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-medium text-rare-text mb-1">Delivered</h4>
                  <p className="text-sm text-rare-text-light">Your order arrives at your doorstep</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button variant="primary" size="lg" href="/products">
              Continue Shopping
            </Button>
            <Button variant="outline" size="lg" onClick={() => window.print()}>
              Print Receipt
            </Button>
            <Button variant="outline" size="lg" href={`/orders/${orderNumber}`}>
              Track Order
            </Button>
          </div>

          {/* Support Info */}
          <Card className="mt-8 bg-rare-accent/10 border-rare-accent/20">
            <div className="text-center">
              <h3 className="font-heading text-xl mb-2 text-rare-primary">Need Help?</h3>
              <p className="text-rare-text-light mb-4">
                Our customer support team is here to assist you
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                <a href="mailto:support@beyondrealms.com" className="text-rare-primary hover:underline">
                  support@beyondrealms.com
                </a>
                <span className="hidden md:block text-rare-text-light">|</span>
                <a href="tel:+1234567890" className="text-rare-primary hover:underline">
                  +1 (234) 567-890
                </a>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </>
  );
}
