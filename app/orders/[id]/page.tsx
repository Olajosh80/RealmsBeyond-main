'use client';

import { useParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MdLocalShipping, MdLocalShipping as MdPackage, MdCheckCircle, MdLocationOn, MdEvent, MdPhone, MdMail } from 'react-icons/md';

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.id;

  // Dummy order data
  const order = {
    id: orderId,
    status: 'shipped',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    trackingNumber: 'TRK' + Date.now().toString().slice(-10),
    carrier: 'FedEx',
    total: 339.91,
    items: [
      {
        id: 1,
        name: 'Designer Leather Bag',
        price: 299.99,
        quantity: 1,
        image: '/ProductsImg/fash1.jpg',
      },
    ],
    shippingAddress: {
      name: 'John Doe',
      street: '123 Main Street, Apt 4B',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States',
    },
    timeline: [
      { status: 'confirmed', date: new Date(), completed: true, label: 'Order Confirmed' },
      { status: 'processing', date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), completed: true, label: 'Processing' },
      { status: 'shipped', date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), completed: true, label: 'Shipped' },
      { status: 'in-transit', date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), completed: false, label: 'In Transit' },
      { status: 'delivered', date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), completed: false, label: 'Delivered' },
    ],
  };

  const getStatusIcon = (status: string, completed: boolean) => {
    const iconClass = completed ? 'text-green-600' : 'text-gray-400';
    const bgClass = completed ? 'bg-green-100' : 'bg-gray-100';

    switch (status) {
      case 'confirmed':
        return <CheckCircle className={`w-6 h-6 ${iconClass}`} />;
      case 'processing':
        return <Package className={`w-6 h-6 ${iconClass}`} />;
      case 'shipped':
      case 'in-transit':
        return <Truck className={`w-6 h-6 ${iconClass}`} />;
      case 'delivered':
        return <MapPin className={`w-6 h-6 ${iconClass}`} />;
      default:
        return <Package className={`w-6 h-6 ${iconClass}`} />;
    }
  };

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gradient-to-br from-rare-accent/5 to-white py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-heading text-4xl font-normal text-rare-primary mb-2">
              Track Your Order
            </h1>
            <p className="text-rare-text-light">
              Order #{orderId}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Status */}
              <Card className="bg-gradient-to-br from-rare-primary to-rare-secondary text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 mb-2">Current Status</p>
                    <h2 className="font-heading text-3xl font-normal">
                      {order.timeline.find(t => t.completed && !order.timeline[order.timeline.indexOf(t) + 1]?.completed)?.label || 'Shipped'}
                    </h2>
                    <p className="text-white/80 mt-2">
                      Estimated delivery: {order.estimatedDelivery}
                    </p>
                  </div>
                  <Truck className="w-16 h-16 text-white/50" />
                </div>
              </Card>

              {/* Tracking Timeline */}
              <Card>
                <h3 className="font-heading text-2xl mb-6 text-rare-primary">Order Timeline</h3>
                <div className="space-y-6">
                  {order.timeline.map((step, index) => (
                    <div key={step.status} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          step.completed ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          {getStatusIcon(step.status, step.completed)}
                        </div>
                        {index < order.timeline.length - 1 && (
                          <div className={`w-0.5 h-16 ${step.completed ? 'bg-green-300' : 'bg-gray-200'}`} />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <h4 className={`font-medium mb-1 ${step.completed ? 'text-rare-text' : 'text-gray-400'}`}>
                          {step.label}
                        </h4>
                        <p className="text-sm text-rare-text-light flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {step.date.toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {step.status === 'shipped' && step.completed && (
                          <p className="text-sm text-rare-primary mt-2">
                            Tracking Number: {order.trackingNumber}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Shipping Details */}
              <Card>
                <h3 className="font-heading text-2xl mb-4 text-rare-primary">Shipping Details</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-rare-text-light mb-2">Tracking Number</p>
                    <p className="font-mono font-medium text-rare-primary">{order.trackingNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-rare-text-light mb-2">Carrier</p>
                    <p className="font-medium text-rare-text">{order.carrier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-rare-text-light mb-2">Shipping Address</p>
                    <div className="text-rare-text">
                      <p className="font-medium">{order.shippingAddress.name}</p>
                      <p className="text-sm">{order.shippingAddress.street}</p>
                      <p className="text-sm">
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                      </p>
                      <p className="text-sm">{order.shippingAddress.country}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-rare-text-light mb-2">Estimated Delivery</p>
                    <p className="font-medium text-rare-text">{order.estimatedDelivery}</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-rare-border">
                  <Button variant="primary" fullWidth onClick={() => window.open(`https://www.fedex.com/fedextrack/?tracknumbers=${order.trackingNumber}`, '_blank')}>
                    Track with {order.carrier}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <h3 className="font-heading text-xl mb-4 text-rare-primary">Order Summary</h3>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-rare-text text-sm">{item.name}</h4>
                        <p className="text-xs text-rare-text-light">Qty: {item.quantity}</p>
                        <p className="font-semibold text-rare-primary">${item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-rare-border">
                  <div className="flex justify-between font-bold text-rare-primary">
                    <span>Total</span>
                    <span>${order.total}</span>
                  </div>
                </div>
              </Card>

              {/* Need Help */}
              <Card className="bg-rare-accent/10 border-rare-accent/20">
                <h3 className="font-heading text-lg mb-3 text-rare-primary">Need Help?</h3>
                <p className="text-sm text-rare-text-light mb-4">
                  Contact our support team if you have any questions about your order.
                </p>
                <div className="space-y-2">
                  <a href="mailto:support@beyondrealms.com" className="flex items-center gap-2 text-sm text-rare-primary hover:underline">
                    <Mail className="w-4 h-4" />
                    support@beyondrealms.com
                  </a>
                  <a href="tel:+1234567890" className="flex items-center gap-2 text-sm text-rare-primary hover:underline">
                    <Phone className="w-4 h-4" />
                    +1 (234) 567-890
                  </a>
                </div>
              </Card>

              {/* Actions */}
              <div className="space-y-3">
                <Button variant="outline" fullWidth onClick={() => window.print()}>
                  Print Receipt
                </Button>
                <Button variant="outline" fullWidth href="/products">
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
