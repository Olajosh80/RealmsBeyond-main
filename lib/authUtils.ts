/**
 * Authentication & Authorization Utilities
 * Provides helper functions for auth checks in API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Extract Bearer token from request
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  return authHeader.substring(7);
}

/**
 * Check if user is authenticated and get their ID
 */
export async function checkAuth(request: NextRequest): Promise<{ authorized: boolean; userId?: string; error?: string }> {
  const token = extractToken(request);

  if (!token) {
    return { authorized: false, error: 'Unauthorized: missing token' };
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData?.user) {
      return { authorized: false, error: 'Unauthorized: invalid token' };
    }

    return { authorized: true, userId: userData.user.id };
  } catch (err: any) {
    console.error('[authUtils] Auth check error:', err);
    return { authorized: false, error: 'Unauthorized: token verification failed' };
  }
}

/**
 * Check if user is an admin
 */
export async function checkAdminAuth(request: NextRequest): Promise<{ authorized: boolean; userId?: string; error?: string }> {
  const authCheck = await checkAuth(request);

  if (!authCheck.authorized || !authCheck.userId) {
    return authCheck;
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', authCheck.userId)
      .single();

    if (profileError || !profile) {
      return { authorized: false, error: 'Forbidden: user profile not found' };
    }

    if (profile.role !== 'admin') {
      return { authorized: false, error: 'Forbidden: admin access required' };
    }

    return { authorized: true, userId: authCheck.userId };
  } catch (err: any) {
    console.error('[authUtils] Admin check error:', err);
    return { authorized: false, error: 'Forbidden: admin check failed' };
  }
}

/**
 * Create error response
 */
export function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Create success response
 */
export function createSuccessResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Verify request came from authenticated user and optionally check ownership
 */
export async function verifyOwnership(request: NextRequest, resourceUserId: string): Promise<{ verified: boolean; error?: string }> {
  const authCheck = await checkAuth(request);

  if (!authCheck.authorized || !authCheck.userId) {
    return { verified: false, error: authCheck.error };
  }

  if (authCheck.userId !== resourceUserId) {
    return { verified: false, error: 'Forbidden: you can only access your own resources' };
  }

  return { verified: true };
}

/**
 * Validate required fields in request body
 */
export async function validateRequestBody(
  request: NextRequest,
  requiredFields: string[]
): Promise<{ valid: boolean; data?: any; error?: string }> {
  try {
    const data = await request.json();

    const missingFields = requiredFields.filter((field) => !(field in data) || data[field] === undefined || data[field] === null);

    if (missingFields.length > 0) {
      return {
        valid: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
      };
    }

    return { valid: true, data };
  } catch (err: any) {
    return { valid: false, error: 'Invalid request body: must be valid JSON' };
  }
}
