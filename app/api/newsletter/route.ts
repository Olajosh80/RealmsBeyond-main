import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import NewsletterSubscriber from '@/lib/models/NewsletterSubscriber';
import { validateEmail } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { email } = await request.json();

    if (!email || !validateEmail(email)) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    const subscriber = await NewsletterSubscriber.findOneAndUpdate(
      { email: email.toLowerCase() },
      { subscribed: true },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: 'Subscribed successfully', subscriber });
  } catch (error: any) {
    console.error('[Newsletter API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
