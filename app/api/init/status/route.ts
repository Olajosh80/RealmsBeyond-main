import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get the app URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const createAdminUrl = `${appUrl}/api/init/create-admin`;
    const signInUrl = `${appUrl}/signin`;
    const adminUrl = `${appUrl}/admin`;

    return NextResponse.json({
      status: 'ready',
      message: 'Beyond Realms Application is Running',
      environment: process.env.NODE_ENV || 'development',
      appUrl,
      endpoints: {
        createAdmin: createAdminUrl,
        signIn: signInUrl,
        adminDashboard: adminUrl,
      },
      instructions: {
        step1: 'Visit the create-admin endpoint to initialize super admin',
        step2: 'Copy the provided credentials (email and password)',
        step3: 'Visit signin and log in with those credentials',
        step4: 'You will be redirected to the admin dashboard',
      },
      links: {
        'Click here to create admin': createAdminUrl,
        'Then sign in here': signInUrl,
        'Admin dashboard': adminUrl,
      },
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
    }, { status: 500 });
  }
}
