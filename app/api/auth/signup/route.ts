import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '@/lib/models/User';
import { validateSignupData } from '@/lib/validation';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { email, password, confirm_password, full_name } = body;

    // Validate input
    const validation = validateSignupData({ email, password, confirm_password, full_name });
    if (!validation.valid) {
      return NextResponse.json({ error: validation.errors.join('; ') }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      full_name: full_name?.trim(),
      role: 'user',
      is_verified: false,
      verification_token: verificationToken,
      verification_token_expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      last_verification_sent_at: new Date(),
    });

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationToken, user.full_name || user.email);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // We still created the user, they can try to resend or we can handle it
    }

    return NextResponse.json(
      {
        message: 'Signup successful. Please check your email to verify your account.',
        userId: user._id
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Signup API] Exception:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
