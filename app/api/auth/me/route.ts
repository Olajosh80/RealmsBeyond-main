import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import User from '@/lib/models/User';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await User.findById(authUser.userId).select('-password').lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Map to a consistent profile structure
    const profile = {
      id: user._id.toString(),
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      phone: user.phone,
      address: user.address,
      avatar_url: user.avatar_url,
      is_verified: user.is_verified,
    };

    return NextResponse.json({ user: authUser, profile });
  } catch (error: any) {
    console.error('[Auth Me API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
