import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/lib/models/Product';
import Division from '@/lib/models/Division';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');

    // Check auth for admin privileges
    const user = await getAuthUser();
    const isAdmin = user && user.role === 'admin';

    // Fetch by ID
    if (id) {
      const product = await Product.findById(id).populate('division_id').lean();
      if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      return NextResponse.json(product);
    }

    // Fetch by Slug
    if (slug) {
      // If admin, we might want to see draft products via slug too? 
      // For now keep public behavior or minimal change.
      // Ideally checking if (isAdmin) remove in_stock constraint.
      const query = isAdmin ? { slug } : { slug, in_stock: true };
      const product = await Product.findOne(query).populate('division_id').lean();
      if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      return NextResponse.json(product);
    }

    const featured = searchParams.get('featured');
    const divisionId = searchParams.get('division_id');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // Filter logic
    const filter: any = {};

    // Only enforce in_stock if NOT admin
    if (!isAdmin) {
      filter.in_stock = true;
    }

    if (featured === 'true') filter.featured = true;
    if (divisionId) filter.division_id = divisionId;
    if (category) filter.category = category;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    const products = await Product.find(filter)
      .populate('division_id')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      products,
      pagination: {
        total,
        pages,
        current_page: page,
        limit
      }
    });
  } catch (error: any) {
    console.error('[Products API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { getAuthUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();

    // Ensure slug is properly generated and unique
    if (!body.slug && body.name) {
      body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    if (body.slug) {
      if (body.slug) {
        body.slug = await ensureUniqueSlug(body.slug, Product);
      }
    }

    const product = await Product.create(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    // Handle duplicate key error explicitly if it still slips through
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Duplicate key error. Access key already exists.' }, { status: 409 });
    }
    console.error('[Products API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Ensure unique slug if slug is being updated
    if (updateData.slug) {
      updateData.slug = await ensureUniqueSlug(updateData.slug, Product, _id);
    }

    const product = await Product.findByIdAndUpdate(_id, updateData, { new: true });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Duplicate key error.' }, { status: 409 });
    }
    console.error('[Products API] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


async function ensureUniqueSlug(slug: string, model: any, currentId?: string) {
  let uniqueSlug = slug;
  let counter = 1;

  while (true) {
    const query: any = { slug: uniqueSlug };
    if (currentId) {
      query._id = { $ne: currentId };
    }

    const exists = await model.findOne(query);
    if (!exists) break;

    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await dbConnect();
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('[Products API] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
