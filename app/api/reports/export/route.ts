export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const exportRequestSchema = z.object({
  analyses: z.array(z.object({
    candidateId: z.string(),
    candidateName: z.string(),
    candidateRole: z.string(),
    atsScore: z.object({
      overall: z.number(),
      keywordMatch: z.number(),
      formatting: z.number(),
      sectionCompleteness: z.number(),
      readability: z.number(),
    }),
    keywordAnalysis: z.object({
      matched: z.array(z.string()),
      missing: z.array(z.string()),
      density: z.number(),
      relevanceScore: z.number(),
    }),
    sectionAnalysis: z.object({
      summary: z.boolean(),
      skills: z.boolean(),
      experience: z.boolean(),
      education: z.boolean(),
      projects: z.boolean(),
      certifications: z.boolean(),
      completenessScore: z.number(),
    }),
    recommendations: z.array(z.object({
      type: z.enum(["critical", "important", "suggestion"]),
      category: z.enum(["keywords", "formatting", "sections", "content"]),
      title: z.string(),
      description: z.string(),
      impact: z.enum(["high", "medium", "low"]),
    })),
    rank: z.number().optional(),
  })),
  format: z.enum(['pdf', 'csv', 'json']),
  reportType: z.enum(['detailed', 'summary', 'comparison']),
  includeRecommendations: z.boolean().default(true),
  includeCharts: z.boolean().default(true),
})

function generateCSVReport(analyses: any[]): string {
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
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')
  
  return csvContent
}

function generateJSONReport(analyses: any[], reportType: string): any {
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

async function generatePDFReport(analyses: any[], reportType: string): Promise<Buffer> {
  // Dynamically import jsPDF to avoid SSR issues
  const jsPDF = (await import('jspdf')).default
  
  const doc = new jsPDF()
  
  // Title
  doc.setFontSize(20)
  doc.text('Resume Analysis Report', 20, 20)
  
  // Header info
  doc.setFontSize(12)
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 35)
  doc.text(`Report Type: ${reportType}`, 20, 45)
  doc.text(`Total Resumes: ${analyses.length}`, 20, 55)
  
  const averageScore = Math.round(analyses.reduce((sum, a) => sum + a.atsScore.overall, 0) / analyses.length)
  doc.text(`Average ATS Score: ${averageScore}`, 20, 65)
  
  let yPosition = 85
  
  // Detailed analyses
  analyses.forEach((a: any, index: number) => {
    if (yPosition > 250) {
      doc.addPage()
      yPosition = 20
    }
    
    doc.setFontSize(14)
    doc.text(`${index + 1}. ${a.candidateName} - ${a.candidateRole}`, 20, yPosition)
    yPosition += 10
    
    doc.setFontSize(12)
    doc.text(`Overall Score: ${a.atsScore.overall}/100`, 20, yPosition)
    yPosition += 8
    
    if (a.rank) {
      doc.text(`Rank: #${a.rank}`, 20, yPosition)
      yPosition += 8
    }
    
    doc.text(`Critical Issues: ${a.recommendations.filter((r: any) => r.type === 'critical').length}`, 20, yPosition)
    yPosition += 15
  })
  
  return Buffer.from(doc.output('arraybuffer'))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { analyses, format, reportType } = exportRequestSchema.parse(body)
    
    if (analyses.length === 0) {
      return NextResponse.json({ error: 'No analyses provided' }, { status: 400 })
    }
    
    switch (format) {
      case 'csv': {
        const csv = generateCSVReport(analyses)
        const filename = `resume-analysis-${new Date().toISOString().split('T')[0]}.csv`
        return new NextResponse(csv, {
          status: 200,
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        })
      }
      case 'json': {
        const json = generateJSONReport(analyses, reportType)
        const filename = `resume-analysis-${new Date().toISOString().split('T')[0]}.json`
        return new NextResponse(JSON.stringify(json, null, 2), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        })
      }
      case 'pdf': {
        const pdfBuffer = await generatePDFReport(analyses, reportType)
        const filename = `resume-analysis-${new Date().toISOString().split('T')[0]}.pdf`
        return new NextResponse(pdfBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        })
      }
      default:
        return NextResponse.json({ error: 'Unsupported format' }, { status: 400 })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
