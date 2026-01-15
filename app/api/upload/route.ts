import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Upload to Cloudinary
        const result = await uploadToCloudinary(file, 'realms_beyond/uploads');

        return NextResponse.json({ url: result.url }, { status: 201 });
    } catch (error: any) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }
}
