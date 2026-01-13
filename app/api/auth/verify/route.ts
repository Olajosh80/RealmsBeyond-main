import { NextRequest, NextResponse } from 'next/server';
import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 });
    }

    const user = await User.findOne({ verification_token: token });

    if (!user) {
      return NextResponse.json({ error: 'Invalid verification token' }, { status: 400 });
    }

    if (user.verification_token_expires && user.verification_token_expires < new Date()) {
      return NextResponse.json({ error: 'Verification token has expired. Please request a new one.' }, { status: 400 });
    }

    user.is_verified = true;
    user.verification_token = undefined;
    await user.save();

    // Redirect to signin with success message
    const signinUrl = new URL('/signin', request.url);
    signinUrl.searchParams.set('verified', 'true');

    return NextResponse.redirect(signinUrl);
  } catch (error: any) {
    console.error('[Verify API] Exception:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
