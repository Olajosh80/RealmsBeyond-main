import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Review from '@/lib/models/Review';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');

        // Populate user details for reviews
        const reviews = await Review.find()
            .populate('user_id', 'full_name') // Assuming User model has full_name
            .populate('product_id', 'name')     // Assuming Product model has name
            .sort({ created_at: -1 })
            .limit(limit)
            .lean();

        return NextResponse.json(reviews);
    } catch (error: any) {
        console.error('[Reviews API] GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();
        const { product_id, rating, comment } = body;

        if (!product_id || !rating || !comment) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const review = await Review.create({
            user_id: user.userId,
            product_id,
            rating,
            comment
        });

        return NextResponse.json(review, { status: 201 });
    } catch (error: any) {
        console.error('[Reviews API] POST Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
