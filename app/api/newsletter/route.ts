import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        {
          email: normalizedEmail,
          subscribed: true,
        },
        { onConflict: 'email' },
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // NOTE: Hook your email provider here to send confirmation emails.

    return NextResponse.json({ success: true, subscriber: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Unexpected error' }, { status: 500 });
  }
}

