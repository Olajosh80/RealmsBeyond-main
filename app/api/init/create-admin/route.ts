import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  return handleCreateAdmin(request);
}

export async function POST(request: NextRequest) {
  return handleCreateAdmin(request);
}

async function handleCreateAdmin(request: NextRequest) {
  try {
    const client = createClient(
      supabaseUrl,
      supabaseServiceKey || supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Default admin credentials
    const adminEmail = 'admin@beyondrealms.com';
    const adminPassword = 'AdminPassword123!@#';
    const adminName = 'Super Admin';

    // Create admin user
    const { data: authData, error: signupError } = await client.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: adminName,
      },
    });

    if (signupError) {
      return NextResponse.json({
        error: signupError.message,
      }, { status: 400 });
    }

    // Create admin profile
    if (authData.user) {
      const { error: profileError } = await client
        .from('user_profiles')
        .insert([
          {
            id: authData.user.id,
            full_name: adminName,
            role: 'admin',
          },
        ]);

      if (profileError) {
        return NextResponse.json({
          error: 'Failed to create admin profile',
          details: profileError,
        }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Default admin created',
        email: adminEmail,
        password: adminPassword,
        signInUrl: '/signin',
        adminUrl: '/admin',
      });
    }

    return NextResponse.json({
      error: 'Failed to create admin',
    }, { status: 500 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      error: errorMessage,
    }, { status: 500 });
  }
}

