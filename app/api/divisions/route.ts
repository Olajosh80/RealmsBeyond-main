import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Division from '@/lib/models/Division';
import { getAuthUser } from '@/lib/auth';
import { validateDivision } from '@/lib/validation';

export async function GET() {
  try {
    await dbConnect();
    const divisions = await Division.find().sort({ order: 1 }).lean();
    return NextResponse.json(divisions);
  } catch (error: any) {
    console.error('[Divisions API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validation = validateDivision(body);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors.join('; ') }, { status: 400 });
    }

    const division = await Division.create({
      name: body.name.trim(),
      slug: body.slug.trim().toLowerCase(),
      description: body.description?.trim() || undefined,
      order: body.order || 0,
    });

    return NextResponse.json(division, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Division with this slug already exists' }, { status: 409 });
    }
    console.error('[Divisions API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
