import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';
import { validateEmail } from '@/lib/validation';

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const { email } = await request.json();

        if (!email || !validateEmail(email)) {
            return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Return success even if user not found to prevent enumeration
            return NextResponse.json({ message: 'If an account exists, a verification email has been sent.' });
        }

        if (user.is_verified) {
            return NextResponse.json({ message: 'Account is already verified.' });
        }

        // Check strict cooldown (2 minutes)
        if (user.last_verification_sent_at) {
            const cooldownMs = 2 * 60 * 1000; // 2 minutes
            const timeSinceLastSend = Date.now() - new Date(user.last_verification_sent_at).getTime();

            if (timeSinceLastSend < cooldownMs) {
                const remainingSeconds = Math.ceil((cooldownMs - timeSinceLastSend) / 1000);
                return NextResponse.json({
                    error: `Please wait ${remainingSeconds} seconds before requesting another email.`
                }, { status: 429 });
            }
        }

        // Generate new token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Update user
        user.verification_token = verificationToken;
        user.verification_token_expires = tokenExpires;
        user.last_verification_sent_at = new Date();
        await user.save();

        // Send email
        try {
            await sendVerificationEmail(user.email, verificationToken, user.full_name || user.email);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            return NextResponse.json({ error: 'Failed to send email. Please try again later.' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Verification email sent successfully.' });
    } catch (error: any) {
        console.error('[Resend Verification API] Exception:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
