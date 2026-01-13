import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/lib/models/Category';
import slugify from 'slugify';
// Force rebuild

export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const categories = await Category.find().populate('parent').sort({ name: 1 });
        return NextResponse.json({ categories }, { status: 200 });
    } catch (error: any) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const { name, parent, description } = await request.json();

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const slug = slugify(name, { lower: true, strict: true });

        // Check for duplicate slug
        const existingCategory = await Category.findOne({ slug });
        if (existingCategory) {
            return NextResponse.json({ error: 'Category with this name already exists' }, { status: 400 });
        }

        const category = await Category.create({
            name,
            slug,
            description,
            parent: parent || null,
        });

        return NextResponse.json({ category }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating category:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const deleted = await Category.findByIdAndDelete(id);
        if (!deleted) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Category deleted' });
    } catch (error: any) {
        console.error('Error deleting category:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
