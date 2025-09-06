export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { 
  createUser, 
  getUserByEmail, 
  createPendingSignup, 
  getPendingSignup, 
  deletePendingSignup,
  createSession 
} from '@/lib/db'
import { saveOTP, verifyOTP as verifyOtpStore } from '@/lib/otp'
import { sendOTPEmail } from '@/lib/mailer'

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, otp } = body

    if (otp) {
      // OTP verification for signup
      const otpData = otpSchema.parse({ email, otp })

      const pendingUser = getPendingSignup(otpData.email)
      if (!pendingUser) {
        return NextResponse.json({ error: 'No pending signup found' }, { status: 400 })
      }

      const isValid = verifyOtpStore(otpData.email, otpData.otp, 'signup')
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
      }

      // Create user
      const newUser = createUser({
        name: pendingUser.name,
        email: pendingUser.email,
        password: pendingUser.password,
      })

      deletePendingSignup(otpData.email)

      // Generate session token
      const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      createSession(newUser.id, sessionToken)

      return NextResponse.json({
        success: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
        sessionToken,
      })
    } else {
      // Initial signup
      const signupData = signupSchema.parse({ name, email, password })

      // Check if user already exists
      const existingUser = getUserByEmail(signupData.email)
      if (existingUser) {
        return NextResponse.json({ error: 'User already exists' }, { status: 409 })
      }

      // Store pending signup
      createPendingSignup({
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        createdAt: new Date(),
      })

      // Generate and send OTP
      const code = saveOTP(signupData.email, 'signup')
      try {
        await sendOTPEmail(signupData.email, code)
      } catch (mailErr) {
        console.error('OTP email error:', mailErr)
        return NextResponse.json({ error: 'Failed to send OTP email' }, { status: 502 })
      }

      return NextResponse.json({
        success: true,
        message: 'OTP sent to your email',
        requiresOTP: true,
      })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
