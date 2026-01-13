import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import bcrypt from 'bcryptjs';
import User from '@/lib/models/User';
import { generateToken, generateRefreshToken, setAuthCookie, setRefreshTokenCookie } from '@/lib/auth';
import { validateEmail } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { email, password } = await request.json();

    if (!email || !validateEmail(email)) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check if verified
    if (!user.is_verified) {
      return NextResponse.json({
        error: 'Please verify your email address before logging in.',
        unverified: true
      }, { status: 403 });
    }

    // Generate tokens
    const accessToken = await generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = await generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Save refresh token to DB (hashed ideally, but direct for now as per plan/speed)
    // Security Note: In production, hash this token before saving.
    user.refresh_token = refreshToken;
    await user.save();

    // Set cookies
    await setAuthCookie(accessToken);
    await setRefreshTokenCookie(refreshToken);

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      }
    });
  } catch (error: any) {
    console.error('[Signin API] Exception:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
