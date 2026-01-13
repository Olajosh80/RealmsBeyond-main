import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const user = await getAuthUser();

        // Check if user is admin - optional but good for security
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '5');

        // Fetch products where in_stock is false
        const products = await Product.find({ in_stock: false })
            .select('name in_stock') // Select relevant fields
            .limit(limit)
            .lean();

        return NextResponse.json(products);
    } catch (error: any) {
        console.error('[Out of Stock API] GET Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
