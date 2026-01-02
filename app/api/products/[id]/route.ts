import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET single product by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    console.log('[API] GET /api/products/[id]');
    console.log('[API] params.id:', id);
    console.log('[API] params.id type:', typeof id);
    
    if (!id || id === 'undefined') {
      console.warn('[API] Product ID is missing or undefined');
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    console.log('[API] Fetching product with ID:', id);
    
    // Try to fetch by ID first (faster)
    const query = supabase
      .from('products')
      .select('*, division:divisions(*)')
      .eq('id', id)
      .single();

    let { data, error } = await query;
    
    console.log('[API] ID query result:', { found: !!data, errorCode: error?.code });

    // If not found by ID, try slug
    if (error && error.code === 'PGRST116') {
      console.log('[API] Not found by ID, trying slug:', id);
      const slugQuery = supabase
        .from('products')
        .select('*, division:divisions(*)')
        .eq('slug', id)
        .single();

      ({ data, error } = await slugQuery);
      console.log('[API] Slug query result:', { found: !!data, errorCode: error?.code });
    }

    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('[API] Product not found with ID or slug:', id);
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      console.error('[API] Database error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[API] Product found:', data?.name);
    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API] Exception:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
