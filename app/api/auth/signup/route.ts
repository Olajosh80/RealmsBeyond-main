import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateSignupData } from '@/lib/validation';
import { createErrorResponse, createSuccessResponse } from '@/lib/authUtils';

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name } = await request.json();

    // Validate input
    const validation = validateSignupData({ email, password, full_name });
    if (!validation.valid) {
      return createErrorResponse(validation.errors.join('; '), 400);
    }

    // Create a Supabase admin client using the service role key
    // This allows us to auto-confirm the user
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

    // Sign up the user using the admin API to bypass email confirmation
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // AUTO-CONFIRM user
      user_metadata: {
        full_name: full_name?.trim() || '',
      },
    });

    if (authError) {
      // If user already exists, it might be unconfirmed. 
      // We can try to update it to confirm it, but only if we want to allow "claiming" accounts.
      // For now, just return the error but with more detail if possible.
      console.error('[Signup API] Auth Error:', authError);
      return createErrorResponse(authError.message, 400);
    }

    // Explicitly update the user to set confirmed_at just in case email_confirm: true is being ignored
    if (authData.user) {
      await supabaseAdmin.auth.admin.updateUserById(authData.user.id, {
        email_confirm: true,
      });
    }

    // Create user profile
    if (authData.user) {
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .insert([
          {
            id: authData.user.id,
            full_name: full_name?.trim() || '',
            role: 'user',
          },
        ]);

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }
    }

    return createSuccessResponse(
      { user: authData.user },
      201
    );
  } catch (error: any) {
    return createErrorResponse(error.message, 500);
  }
}
