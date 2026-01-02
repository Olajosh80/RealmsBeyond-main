import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      // Redirect to sign in if not authenticated
      const redirectUrl = new URL('/signin', request.url);
      redirectUrl.searchParams.set('returnTo', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Check user role from user_profiles
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    // Log for debugging
    console.log('[Middleware] User ID:', user.id);
    console.log('[Middleware] Profile data:', profile);
    console.log('[Middleware] Profile error:', profileError);

    if (profileError) {
      console.error('[Middleware] Error fetching profile:', profileError);
    }

    // Only allow admin role
    if (!profile || profile.role !== 'admin') {
      console.log('[Middleware] Access denied - User:', user.email, 'Role:', profile?.role || 'null');
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    console.log('[Middleware] Access granted to admin:', user.email);
  }

  return response;
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
  ],
};
