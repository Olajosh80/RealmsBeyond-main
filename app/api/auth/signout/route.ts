import { NextResponse } from 'next/server';
import { removeAuthCookie, getAuthUser } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';

export async function POST() {
  try {
    await dbConnect();
    const authUser = await getAuthUser();

    if (authUser) {
      // Execute DB update and cookie removal in parallel for speed
      await Promise.all([
        User.findOneAndUpdate(
          { email: authUser.email },
          { $unset: { refresh_token: 1 } }
        ),
        removeAuthCookie()
      ]);
    } else {
      await removeAuthCookie();
    }
    return NextResponse.json({ message: 'Signed out successfully' });
  } catch (error: any) {
    console.error('[Signout API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
