export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getUserByEmail, updateUser, createSession } from '@/lib/db'
import { saveOTP, verifyOTP } from '@/lib/otp'
import { sendOTPEmail } from '@/lib/mailer'

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, otp } = body;

    // OTP verification
    if (otp) {
      const otpData = otpSchema.parse({ email, otp });
      const isValid = verifyOTP(otpData.email, otpData.otp, 'login');

      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid or expired OTP' },
          { status: 400 }
        );
      }

      const user = getUserByEmail(otpData.email);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const sessionToken = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 10)}`;
      createSession(user.id, sessionToken);
      
      // Update last login time
      updateUser(user.email, { lastLoginAt: new Date() });

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        sessionToken,
      });
    }

    // Login with email/password
    const loginData = loginSchema.parse({ email, password });
    const user = getUserByEmail(loginData.email);

    if (!user || user.password !== loginData.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Generate OTP
    const code = saveOTP(loginData.email, 'login');

    // Send email
    try {
      await sendOTPEmail(loginData.email, code);
    } catch (mailErr) {
      console.error('OTP email error:', mailErr);
      return NextResponse.json({ error: 'Failed to send OTP email' }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email',
      requiresOTP: true,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
