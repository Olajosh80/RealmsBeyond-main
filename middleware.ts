import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/token';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const user = token ? await verifyToken(token) : null;

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    console.log('[Middleware] Checking admin access for:', request.nextUrl.pathname);

    if (!user) {
      console.log('[Middleware] No valid user found, redirecting to signin');
      const redirectUrl = new URL('/signin', request.url);
      redirectUrl.searchParams.set('returnTo', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Only allow admin role
    if (user.role !== 'admin') {
      console.log('[Middleware] Access denied - User:', user.email, 'Role:', user.role);
      return NextResponse.redirect(new URL('/', request.url));
    }

    console.log('[Middleware] Access granted to admin:', user.email);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
  ],
};
