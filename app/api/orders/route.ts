import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import OrderItem from '@/lib/models/OrderItem';
import Product from '@/lib/models/Product';
import { getAuthUser } from '@/lib/auth';
import { validateShippingInfo } from '@/lib/validation';
import { initializeTransaction } from '@/lib/paystack';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const filter: any = {};
    // If not admin, restrict to own orders
    if (user.role !== 'admin') {
      filter.user_id = user.userId;
    }

    if (status) filter.status = status;

    const orders = await Order.find(filter).sort({ created_at: -1 }).lean();

    // Optimized: Fetch all items for these orders in one query
    const orderIds = orders.map(o => o._id);
    const allItems = await OrderItem.find({ order_id: { $in: orderIds } }).lean();

    const ordersWithItems = orders.map(order => {
      const items = allItems.filter(item => item.order_id.toString() === order._id.toString());
      return { ...order, items };
    });

    return NextResponse.json(ordersWithItems);
  } catch (error: any) {
    console.error('[Orders API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const user = await getAuthUser();
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items, shipping } = body;

    // Validate shipping info
    if (!shipping) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ error: 'Shipping information is required' }, { status: 400 });
    }

    const shippingValidation = validateShippingInfo(shipping);
    if (!shippingValidation.valid) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ error: shippingValidation.errors.join('; ') }, { status: 400 });
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ error: 'Order must have at least one item' }, { status: 400 });
    }

    if (items.length > 100) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ error: 'Too many items in order' }, { status: 400 });
    }

    // Fetch product prices from database to prevent price manipulation
    const productIds = items.map((item: any) => item.id);
    const products = await Product.find({ _id: { $in: productIds }, in_stock: true }).lean();

    if (products.length !== items.length) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ error: 'Some products are unavailable or out of stock' }, { status: 400 });
    }

    // Create a map for quick price lookup
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    // Calculate server-side total and validate quantities
    let calculatedTotal = 0;
    const validatedItems: any[] = [];

    for (const item of items) {
      const product = productMap.get(item.id);
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json({ error: `Product ${item.id} not found` }, { status: 400 });
      }

      const quantity = parseInt(item.quantity, 10);
      if (isNaN(quantity) || quantity < 1 || quantity > 100) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json({ error: 'Invalid quantity for one or more items' }, { status: 400 });
      }

      const itemSubtotal = product.price * quantity;
      calculatedTotal += itemSubtotal;

      validatedItems.push({
        order_id: null, // Will be set after order creation
        product_id: product._id,
        product_name: product.name,
        product_price: product.price,
        quantity: quantity,
        subtotal: itemSubtotal,
      });
    }

    // Add shipping cost (fixed rate)
    const shippingCost = 15000; // Naira
    calculatedTotal += shippingCost;

    // Sanity check on total
    if (calculatedTotal <= 0 || calculatedTotal > 100000000) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json({ error: 'Invalid order total' }, { status: 400 });
    }

    // Create order within transaction
    const [order] = await Order.create([{
      user_id: user.userId,
      customer_name: shipping.fullName.trim(),
      customer_email: shipping.email.toLowerCase().trim(),
      customer_phone: shipping.phone.trim(),
      shipping_address: `${shipping.address}, ${shipping.city}, ${shipping.state} ${shipping.zipCode}, ${shipping.country}`,
      total_amount: calculatedTotal,
      status: 'pending',
      payment_status: 'pending',
    }], { session });

    // Update order items with order ID and insert
    validatedItems.forEach(item => { item.order_id = order._id; });
    await OrderItem.insertMany(validatedItems, { session });

    await session.commitTransaction();
    session.endSession();

    // Initialize Paystack payment
    try {
      const paystackResponse = await initializeTransaction(
        shipping.email.toLowerCase().trim(),
        calculatedTotal,
        { order_id: order._id.toString() }
      );

      return NextResponse.json({
        order,
        payment_url: paystackResponse.data.authorization_url,
        reference: paystackResponse.data.reference
      }, { status: 201 });
    } catch (paystackError: any) {
      console.error('Paystack Initialization Error:', paystackError);
      return NextResponse.json({
        order,
        error: 'Order created but failed to initialize payment. Please try paying from your profile.'
      }, { status: 201 });
    }
  } catch (error: any) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    console.error('[Orders API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
