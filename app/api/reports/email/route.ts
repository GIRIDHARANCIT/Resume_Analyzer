export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendOTPEmail } from '@/lib/mailer'

const emailReportSchema = z.object({
  to: z.string().email(),
  subject: z.string().optional(),
  reportData: z.object({
    analyses: z.array(z.any()),
    reportType: z.string(),
    format: z.enum(['pdf', 'csv', 'json'])
  }),
  userEmail: z.string().email()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, reportData, userEmail } = emailReportSchema.parse(body)
    
    // Generate report content based on format
    let reportContent = ''
    let reportFilename = ''
    
    switch (reportData.format) {
      case 'csv':
        reportContent = generateCSVContent(reportData.analyses)
        reportFilename = `resume-analysis-${new Date().toISOString().split('T')[0]}.csv`
        break
      case 'json':
        reportContent = JSON.stringify(generateJSONContent(reportData.analyses, reportData.reportType), null, 2)
        reportFilename = `resume-analysis-${new Date().toISOString().split('T')[0]}.json`
        break
      case 'pdf':
        // For PDF, we'll send a link to download
        reportContent = 'PDF report is attached to this email.'
        reportFilename = `resume-analysis-${new Date().toISOString().split('T')[0]}.pdf`
        break
    }
    
    // Email content
    const emailSubject = subject || `Resume Analysis Report - ${reportData.reportType}`
    const emailBody = `
      Hello,
      
      Please find your resume analysis report attached.
      
      Report Details:
      - Type: ${reportData.reportType}
      - Format: ${reportData.format.toUpperCase()}
      - Total Resumes: ${reportData.analyses.length}
      - Generated: ${new Date().toLocaleString()}
      
      Best regards,
      Resume Analyzer Team
    `
    
    // Send email (using the existing mailer)
    try {
      await sendOTPEmail(to, emailBody)
      
      return NextResponse.json({
        success: true,
        message: 'Report sent successfully',
        filename: reportFilename
      })
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      return NextResponse.json({ 
        error: 'Failed to send email. Please check your email configuration.' 
      }, { status: 500 })
    }
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }
    console.error('Email report error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateCSVContent(analyses: any[]): string {
  const headers = [
    'Rank',
    'Candidate Name',
    'Role',
    'Overall Score',
    'Keyword Match',
    'Formatting',
    'Section Completeness',
    'Readability',
    'Matched Keywords',
    'Missing Keywords',
    'Critical Issues',
    'Recommendations'
  ]
  
  const rows = analyses.map(analysis => [
    analysis.rank || 'N/A',
    analysis.candidateName,
    analysis.candidateRole,
    analysis.atsScore.overall,
    analysis.atsScore.keywordMatch,
    analysis.atsScore.formatting,
    analysis.atsScore.sectionCompleteness,
    analysis.atsScore.readability,
    analysis.keywordAnalysis.matched.join('; '),
    analysis.keywordAnalysis.missing.slice(0, 5).join('; '),
    analysis.recommendations.filter((r: any) => r.type === 'critical').length,
    analysis.recommendations.length
  ])
  
  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')
}

function generateJSONContent(analyses: any[], reportType: string): any {
  const baseReport = {
    reportType,
    generatedAt: new Date().toISOString(),
    totalResumes: analyses.length,
    summary: {
      averageScore: Math.round(analyses.reduce((sum, a) => sum + a.atsScore.overall, 0) / analyses.length),
      topPerformer: analyses.reduce((top, current) => 
        current.atsScore.overall > top.atsScore.overall ? current : top
      ),
      scoreDistribution: {
        excellent: analyses.filter(a => a.atsScore.overall >= 85).length,
        good: analyses.filter(a => a.atsScore.overall >= 70 && a.atsScore.overall < 85).length,
        fair: analyses.filter(a => a.atsScore.overall >= 50 && a.atsScore.overall < 70).length,
        poor: analyses.filter(a => a.atsScore.overall < 50).length,
      }
    }
  }
  
  if (reportType === 'summary') {
    return {
      ...baseReport,
      analyses: analyses.map((analysis: any) => ({
        candidateName: analysis.candidateName,
        candidateRole: analysis.candidateRole,
        atsScore: analysis.atsScore,
        rank: analysis.rank,
        criticalIssues: analysis.recommendations.filter((r: any) => r.type === 'critical').length,
      }))
    }
  }
  
  return {
    ...baseReport,
    analyses: analyses.map((analysis: any) => ({
      ...analysis,
      recommendations: analysis.recommendations.map((r: any) => ({
        type: r.type,
        title: r.title,
        description: r.description,
        impact: r.impact,
      }))
    }))
  }
}
