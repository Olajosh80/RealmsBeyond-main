import { NextRequest, NextResponse } from 'next/server';
import BlogPost from '@/lib/models/BlogPost';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const slug = searchParams.get('slug');
    const isAdminView = searchParams.get('admin') === 'true';

    if (slug) {
      const post = await BlogPost.findOne({ slug });
      if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      return NextResponse.json(post);
    }

    const filter: any = {};

    // For non-admin view, only show published posts
    if (!isAdminView) {
      const user = await getAuthUser();
      if (!user || user.role !== 'admin') {
        filter.published = true;
      }
    }

    if (category) filter.category = category;
    if (featured === 'true') filter.featured = true;

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const total = await BlogPost.countDocuments(filter);
    const pages = Math.ceil(total / limit);

    const posts = await BlogPost.find(filter)
      .sort({ published_at: -1, created_at: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      posts,
      pagination: {
        total,
        pages,
        current_page: page,
        limit
      }
    });
  } catch (error: any) {
    console.error('[Blog API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Helper to ensure unique slug
// Helper to ensure unique slug
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

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.slug && body.title) {
      body.slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    if (body.slug) {
      body.slug = await ensureUniqueSlug(body.slug, BlogPost);
    }

    const post = await BlogPost.create(body);
    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Duplicate key error.' }, { status: 409 });
    }
    console.error('[Blog API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
