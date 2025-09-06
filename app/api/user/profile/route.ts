export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getUserByEmail, updateUser, getSessionByToken } from '@/lib/db'

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  preferences: z.object({
    language: z.string().optional(),
    region: z.string().optional(),
    autoAnalysis: z.boolean().optional(),
    keywordSuggestions: z.boolean().optional(),
    formattingTips: z.boolean().optional(),
    industryInsights: z.boolean().optional(),
    emailNotifications: z.object({
      analysisCompletion: z.boolean().optional(),
      weeklyTips: z.boolean().optional(),
      productUpdates: z.boolean().optional(),
    }).optional(),
    defaultAnalysisMode: z.string().optional(),
  }).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!email && !token) {
      return NextResponse.json({ error: 'Email or token required' }, { status: 400 })
    }

    let userEmail = email

    if (token) {
      const session = getSessionByToken(token)
      if (!session) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
      }
      // Get user email from session if not provided
      if (!userEmail) {
        // This would require a getUserById function, but for now we'll require email
        return NextResponse.json({ error: 'Email required' }, { status: 400 })
      }
    }

    const user = getUserByEmail(userEmail!)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return user data without password
    const { password, ...userData } = user

    return NextResponse.json({
      success: true,
      user: {
        ...userData,
        statistics: {
          resumesAnalyzed: 0, // TODO: Implement from database
          averageATSScore: 0,
          lastAnalysisDate: null,
          totalAnalysisTime: 0,
          improvementRate: 0,
        }
      }
    })
  } catch (error) {
    console.error('Profile get error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, ...updateData } = body

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    // Validate update data
    const validatedData = updateProfileSchema.parse(updateData)

    // Check if user exists
    const existingUser = getUserByEmail(email)
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update user
    const updatedUser = updateUser(email, validatedData)
    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }

    // Return updated user data without password
    const { password, ...userData } = updatedUser

    return NextResponse.json({
      success: true,
      user: userData
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
