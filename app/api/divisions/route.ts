import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

// GET all divisions
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('divisions')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new division
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Require admin
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const profileRes = await supabase.from('user_profiles').select('role').eq('id', userData.user.id).single();
    if (profileRes.error || !profileRes.data || profileRes.data.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Use service role client for writes
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Server misconfiguration: missing service role key' }, { status: 500 });
    }
    const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY);

    const { data, error } = await supabaseAdmin
      .from('divisions')
      .insert([body])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
