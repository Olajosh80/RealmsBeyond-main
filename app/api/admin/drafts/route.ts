import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Draft from '@/lib/models/Draft';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await req.json();
        const { resourceType, resourceId, data } = body;

        if (!resourceType || !data) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const draft = await Draft.findOneAndUpdate(
            { userId: user.email, resourceType, resourceId: resourceId || 'new' }, // Use email as stable ID for now
            { data },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json({ success: true, draft });
    } catch (error) {
        console.error('Draft save error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const resourceType = searchParams.get('type');
        const resourceId = searchParams.get('id');

        if (!resourceType) {
            return NextResponse.json({ error: 'Resource type required' }, { status: 400 });
        }

        await dbConnect();

        if (resourceId) {
            const draft = await Draft.findOne({
                userId: user.email,
                resourceType,
                resourceId,
            }).lean();
            return NextResponse.json({ draft });
        } else {
            const drafts = await Draft.find({
                userId: user.email,
                resourceType,
            }).sort({ updatedAt: -1 }).lean();
            return NextResponse.json({ drafts });
        }
    } catch (error) {
        console.error('Draft fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const user = await getAuthUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const resourceType = searchParams.get('type');
        const resourceId = searchParams.get('id') || 'new';

        await dbConnect();
        await Draft.deleteOne({
            userId: user.email,
            resourceType,
            resourceId,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Draft delete error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
