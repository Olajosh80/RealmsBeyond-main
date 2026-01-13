import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import OrderItem from '@/lib/models/OrderItem';
import { getAuthUser } from '@/lib/auth';
import { validateOrderData } from '@/lib/validation';
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
    const { items, shipping, total } = body;

    // Create order within transaction
    const [order] = await Order.create([{
      user_id: user.userId,
      customer_name: shipping.fullName,
      customer_email: shipping.email,
      customer_phone: shipping.phone,
      shipping_address: `${shipping.address}, ${shipping.city}, ${shipping.state} ${shipping.zipCode}, ${shipping.country}`,
      total_amount: total,
      status: 'pending',
      payment_status: 'pending',
    }], { session });

    // Create order items within transaction
    if (items && items.length > 0) {
      const orderItems = items.map((item: any) => ({
        order_id: order._id,
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      }));
      await OrderItem.insertMany(orderItems, { session });
    }

    await session.commitTransaction();
    session.endSession();

    // Initialize Paystack payment
    try {
      const paystackResponse = await initializeTransaction(
        shipping.email,
        total,
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
