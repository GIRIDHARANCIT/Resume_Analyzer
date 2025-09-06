export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getUserByEmail, updateUser, getSessionByToken, deleteSession } from '@/lib/db'
import { saveOTP, verifyOTP } from '@/lib/otp'
import { sendOTPEmail } from '@/lib/mailer'

const changePasswordSchema = z.object({
  email: z.string().email(),
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
  otp: z.string().length(6).optional(),
})

const securitySettingsSchema = z.object({
  email: z.string().email(),
  twoFactorEnabled: z.boolean().optional(),
  loginAlerts: z.boolean().optional(),
  sessionTimeout: z.number().min(1).max(168).optional(), // hours
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body

    switch (action) {
      case 'changePassword':
        return await handleChangePassword(data)
      case 'enable2FA':
        return await handleEnable2FA(data)
      case 'disable2FA':
        return await handleDisable2FA(data)
      case 'updateSecuritySettings':
        return await handleUpdateSecuritySettings(data)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Security API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function handleChangePassword(data: any) {
  try {
    const { email, currentPassword, newPassword, otp } = changePasswordSchema.parse(data)

    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify current password
    if (user.password !== currentPassword) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 })
    }

    // If OTP is provided, verify it
    if (otp) {
      const isValid = verifyOTP(email, otp, 'passwordChange')
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
      }
    } else {
      // Send OTP for password change
      const code = saveOTP(email, 'passwordChange')
      try {
        await sendOTPEmail(email, code)
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

    // Update password
    await updateUser(email, { password: newPassword })

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }
    throw error
  }
}

async function handleEnable2FA(data: any) {
  try {
    const { email } = data

    const user = getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update preferences to enable 2FA
    const currentPreferences = user.preferences || {}
    updateUser(email, {
      preferences: {
        ...currentPreferences,
        twoFactorEnabled: true,
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Two-factor authentication enabled'
    })
  } catch (error) {
    throw error
  }
}

async function handleDisable2FA(data: any) {
  try {
    const { email } = data

    const user = getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update preferences to disable 2FA
    const currentPreferences = user.preferences || {}
    updateUser(email, {
      preferences: {
        ...currentPreferences,
        twoFactorEnabled: false,
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Two-factor authentication disabled'
    })
  } catch (error) {
    throw error
  }
}

async function handleUpdateSecuritySettings(data: any) {
  try {
    const validatedData = securitySettingsSchema.parse(data)
    const { email, ...settings } = validatedData

    const user = getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update security settings
    const currentPreferences = user.preferences || {}
    updateUser(email, {
      preferences: {
        ...currentPreferences,
        ...settings,
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Security settings updated successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }
    throw error
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    // Delete session (logout)
    deleteSession(token)

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
