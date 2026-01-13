import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { verifyRefreshToken, generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refresh-token')?.value;

        if (!refreshToken) {
            return NextResponse.json({ error: 'Refresh token not found' }, { status: 401 });
        }

        // Verify token structure
        const payload = await verifyRefreshToken(refreshToken);
        if (!payload) {
            return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
        }

        await dbConnect();

        // Find user by id AND refresh token (security check)
        const user = await User.findOne({ _id: payload.userId, refresh_token: refreshToken });

        if (!user) {
            // Possible token reuse or revocation
            return NextResponse.json({ error: 'Invalid refresh token or user not found' }, { status: 401 });
        }

        // Generate new access token
        const newAccessToken = await generateToken({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });

        // Set new access token cookie
        await setAuthCookie(newAccessToken);

        return NextResponse.json({ message: 'Token refreshed successfully' });
    } catch (error: any) {
        console.error('[Refresh API] Exception:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
