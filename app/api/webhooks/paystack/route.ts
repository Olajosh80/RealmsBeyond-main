import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Order from '@/lib/models/Order';
import { verifyTransaction } from '@/lib/paystack';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request: NextRequest) {
  try {
    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    if (event.event === 'charge.success') {
      const { reference, metadata, amount } = event.data;
      const orderId = metadata?.order_id;

      if (!orderId) {
        return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
      }

      if (!reference) {
        return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
      }

      await dbConnect();

      // IDEMPOTENCY: Check if order already processed with this reference
      const existingOrder = await Order.findById(orderId);
      if (!existingOrder) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      // Already processed - idempotent response
      if (existingOrder.payment_status === 'paid' && existingOrder.paystack_reference === reference) {
        return NextResponse.json({ received: true, message: 'Already processed' });
      }

      // Prevent processing if order is in a terminal state
      if (['cancelled', 'refunded'].includes(existingOrder.status)) {
        return NextResponse.json({ error: 'Order is in terminal state' }, { status: 400 });
      }

      // VERIFY WITH PAYSTACK API - Don't trust webhook data alone
      let verification;
      try {
        verification = await verifyTransaction(reference);
      } catch {
        return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
      }

      if (!verification.status || verification.data.status !== 'success') {
        return NextResponse.json({ error: 'Payment not successful' }, { status: 400 });
      }

      // Verify amount matches (amount in kobo)
      const expectedAmountKobo = existingOrder.total_amount * 100;
      const paidAmountKobo = verification.data.amount;
      
      if (paidAmountKobo < expectedAmountKobo) {
        return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 });
      }

      // Verify order_id in metadata matches
      if (verification.data.metadata?.order_id !== orderId) {
        return NextResponse.json({ error: 'Order ID mismatch' }, { status: 400 });
      }

      // Update order - use findOneAndUpdate with conditions for atomicity
      const updatedOrder = await Order.findOneAndUpdate(
        { 
          _id: orderId,
          payment_status: { $ne: 'paid' } // Only update if not already paid
        },
        {
          payment_status: 'paid',
          status: 'processing',
          paystack_reference: reference,
        },
        { new: true }
      );

      if (!updatedOrder) {
        // Already updated by concurrent request - idempotent
        return NextResponse.json({ received: true, message: 'Already processed' });
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
