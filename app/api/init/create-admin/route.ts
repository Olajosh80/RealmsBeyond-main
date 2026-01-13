import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/lib/models/User';

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name, secret_key } = await request.json();

    // Basic security for this initialization route
    if (secret_key !== process.env.ADMIN_INIT_SECRET) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const existingAdmin = await User.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      existingAdmin.role = 'admin';
      existingAdmin.is_verified = true;
      await existingAdmin.save();
      return NextResponse.json({ message: 'User promoted to admin' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      full_name,
      role: 'admin',
      is_verified: true,
    });

    return NextResponse.json({ message: 'Admin user created successfully', adminId: admin._id });
  } catch (error: any) {
    console.error('[Init Admin API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
