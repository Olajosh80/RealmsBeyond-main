import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './auth';

/**
 * Extract token from request cookie or header
 */
export function extractToken(request: NextRequest): string | null {
  // Try cookie first
  const cookieToken = request.cookies.get('auth-token')?.value;
  if (cookieToken) return cookieToken;

  // Try Bearer header
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) return authHeader.substring(7);

  return null;
}

/**
 * Check if user is authenticated and get their info
 */
export async function checkAuth(request: NextRequest): Promise<{ authorized: boolean; userId?: string; email?: string; role?: string; error?: string }> {
  const token = extractToken(request);

  if (!token) {
    return { authorized: false, error: 'Unauthorized: missing token' };
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return { authorized: false, error: 'Unauthorized: invalid or expired token' };
  }

  return {
    authorized: true,
    userId: payload.userId,
    email: payload.email,
    role: payload.role
  };
}

/**
 * Check if user is an admin
 */
export async function checkAdminAuth(request: NextRequest): Promise<{ authorized: boolean; userId?: string; error?: string }> {
  const authCheck = await checkAuth(request);

  if (!authCheck.authorized || !authCheck.userId) {
    return authCheck;
  }

  if (authCheck.role !== 'admin') {
    return { authorized: false, error: 'Forbidden: admin access required' };
  }

  return { authorized: true, userId: authCheck.userId };
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
