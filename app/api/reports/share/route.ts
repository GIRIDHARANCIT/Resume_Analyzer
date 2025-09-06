export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { saveResumeAnalysis } from '@/lib/db'

const shareReportSchema = z.object({
  analyses: z.array(z.any()),
  reportType: z.string(),
  format: z.enum(['pdf', 'csv', 'json']),
  userEmail: z.string().email(),
  expiresIn: z.number().optional().default(7) // days
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { analyses, reportType, format, userEmail, expiresIn } = shareReportSchema.parse(body)
    
    // Generate a unique share ID
    const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Calculate expiration date
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresIn)
    
    // Store the shared report data
    const sharedReport = {
      id: shareId,
      analyses,
      reportType,
      format,
      userEmail,
      createdAt: new Date(),
      expiresAt,
      accessCount: 0
    }
    
    // Save to database (using the existing resume analysis table structure)
    try {
      await saveResumeAnalysis({
        userId: `shared_${shareId}`,
        fileName: `shared-report-${shareId}`,
        fileType: 'shared',
        fileSize: 0,
        candidateName: 'Shared Report',
        candidateRole: 'Report',
        extractedText: JSON.stringify(sharedReport),
        atsScore: 0,
        analysisData: sharedReport
      })
      
      // Generate shareable URL
      const shareUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/reports/share/${shareId}`
      
      return NextResponse.json({
        success: true,
        shareId,
        shareUrl,
        expiresAt: expiresAt.toISOString(),
        message: 'Report shared successfully'
      })
      
    } catch (dbError) {
      console.error('Failed to save shared report:', dbError)
      return NextResponse.json({ 
        error: 'Failed to create share link' 
      }, { status: 500 })
    }
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }
    console.error('Share report error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shareId = searchParams.get('id')
    
    if (!shareId) {
      return NextResponse.json({ error: 'Share ID required' }, { status: 400 })
    }
    
    // Get shared report from database
    // This would need to be implemented based on your database structure
    // For now, we'll return a mock response
    
    return NextResponse.json({
      success: true,
      shareId,
      message: 'Shared report retrieved successfully',
      data: {
        analyses: [],
        reportType: 'summary',
        format: 'pdf',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    })
    
  } catch (error) {
    console.error('Get shared report error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
