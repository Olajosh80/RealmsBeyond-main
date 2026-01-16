import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ContactSubmission from '@/lib/models/ContactSubmission';
import { validateEmail } from '@/lib/validation';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (name.length > 255) {
      return NextResponse.json({ error: 'Name is too long' }, { status: 400 });
    }

    if (!email || !validateEmail(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
      return NextResponse.json({ error: 'Subject is required' }, { status: 400 });
    }
    if (subject.length > 500) {
      return NextResponse.json({ error: 'Subject is too long' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    if (message.length > 5000) {
      return NextResponse.json({ error: 'Message is too long' }, { status: 400 });
    }

    // Optional phone validation
    if (phone && (typeof phone !== 'string' || phone.length > 50)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 });
    }

    const submission = await ContactSubmission.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || undefined,
      subject: subject.trim(),
      message: message.trim(),
    });

    return NextResponse.json({ message: 'Message sent successfully', id: submission._id });
  } catch (error: any) {
    console.error('[Contact API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const submissions = await ContactSubmission.find().sort({ created_at: -1 });
    return NextResponse.json(submissions);
  } catch (error: any) {
    console.error('[Contact API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
