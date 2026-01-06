import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateEmail } from '@/lib/validation';
import { createErrorResponse, createSuccessResponse } from '@/lib/authUtils';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !validateEmail(email)) {
      return createErrorResponse('Valid email address is required', 400);
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return createErrorResponse('Password must be at least 8 characters', 400);
    }

    // Initialize regular client for sign-in
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // If email not confirmed, use admin client to auto-confirm and try again
    if (error && (error.message.includes('Email not confirmed') || error.code === 'email_not_confirmed')) {
      console.log('[Signin API] Unconfirmed user detected, attempting auto-confirmation...');
      
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

      // Find user by email
      const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      const user = userList?.users.find(u => u.email === email);

      if (user) {
        // Auto-confirm the user
        const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
          email_confirm: true,
        });

        if (!confirmError) {
          console.log('[Signin API] User auto-confirmed successfully. Retrying sign-in...');
          // Retry sign-in
          const retry = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          data = retry.data;
          error = retry.error;
        }
      }
    }

    if (error) {
      return createErrorResponse(error.message, 401);
    }

    if (!data || !data.user || !data.session) {
      return createErrorResponse('Authentication failed: Missing session data', 500);
    }

    return createSuccessResponse({ user: data.user, session: data.session });
  } catch (error: any) {
    console.error('[Signin API] Exception:', error);
    return createErrorResponse(error.message, 500);
  }
}
