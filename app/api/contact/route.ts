import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ContactSubmission from '@/lib/models/ContactSubmission';

import { getAuthUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const submission = await ContactSubmission.create(body);
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
