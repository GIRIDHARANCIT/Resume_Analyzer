import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const rankingRequestSchema = z.object({
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
  })),
  jobTemplate: z.string().optional(),
  customJobDescription: z.string().optional(),
})

interface RankedAnalysis {
  candidateId: string
  candidateName: string
  candidateRole: string
  atsScore: {
    overall: number
    keywordMatch: number
    formatting: number
    sectionCompleteness: number
    readability: number
  }
  keywordAnalysis: {
    matched: string[]
    missing: string[]
    density: number
    relevanceScore: number
  }
  sectionAnalysis: {
    summary: boolean
    skills: boolean
    experience: boolean
    education: boolean
    projects: boolean
    certifications: boolean
    completenessScore: number
  }
  recommendations: Array<{
    type: "critical" | "important" | "suggestion"
    category: "keywords" | "formatting" | "sections" | "content"
    title: string
    description: string
    impact: "high" | "medium" | "low"
  }>
  rank: number
  analysisDate?: Date
  version?: number
  improvementHistory?: Array<{
    overall: number
    keywordMatch: number
    formatting: number
    sectionCompleteness: number
    readability: number
  }>
}

function calculateRankingScore(analysis: any, jobTemplate?: string): number {
  const { atsScore, keywordAnalysis, sectionAnalysis } = analysis
  
  // Base score from ATS analysis
  let score = atsScore.overall
  
  // Bonus for high keyword density
  if (keywordAnalysis.density > 0.7) {
    score += 10
  } else if (keywordAnalysis.density > 0.5) {
    score += 5
  }
  
  // Bonus for complete sections
  if (sectionAnalysis.completenessScore > 90) {
    score += 8
  } else if (sectionAnalysis.completenessScore > 80) {
    score += 4
  }
  
  // Bonus for having all critical sections
  const criticalSections = ['summary', 'skills', 'experience', 'education']
  const hasCriticalSections = criticalSections.every(section => 
    sectionAnalysis[section as keyof typeof sectionAnalysis]
  )
  if (hasCriticalSections) {
    score += 5
  }
  
  // Penalty for critical recommendations
  const criticalRecommendations = analysis.recommendations.filter(
    (rec: any) => rec.type === 'critical'
  ).length
  score -= criticalRecommendations * 3
  
  // Bonus for role alignment (if job template is specified)
  if (jobTemplate) {
    const roleKeywords = {
      'software-engineer': ['developer', 'engineer', 'programming', 'coding'],
      'data-analyst': ['analyst', 'data', 'analysis', 'sql'],
      'marketing-manager': ['marketing', 'campaign', 'digital', 'seo'],
      'product-manager': ['product', 'strategy', 'roadmap', 'stakeholder'],
      'sales-representative': ['sales', 'client', 'relationship', 'crm'],
      'student': ['student', 'graduate', 'internship', 'project'],
    }
    
    const templateKeywords = roleKeywords[jobTemplate as keyof typeof roleKeywords] || []
    const candidateText = `${analysis.candidateRole} ${analysis.candidateName}`.toLowerCase()
    const roleAlignment = templateKeywords.some(keyword => 
      candidateText.includes(keyword)
    )
    
    if (roleAlignment) {
      score += 3
    }
  }
  
  // Ensure score is within bounds
  return Math.max(0, Math.min(100, score))
}

function rankResumes(analyses: any[], jobTemplate?: string): RankedAnalysis[] {
  // Calculate ranking scores
  const analysesWithScores = analyses.map(analysis => ({
    ...analysis,
    rankingScore: calculateRankingScore(analysis, jobTemplate)
  }))
  
  // Sort by ranking score (descending)
  const sortedAnalyses = analysesWithScores.sort((a, b) => b.rankingScore - a.rankingScore)
  
  // Add ranks
  const rankedAnalyses: RankedAnalysis[] = sortedAnalyses.map((analysis, index) => ({
    ...analysis,
    rank: index + 1,
    analysisDate: new Date(),
    version: 1,
  }))
  
  return rankedAnalyses
}

function generateRankingInsights(rankedAnalyses: RankedAnalysis[]): {
  topPerformers: string[]
  commonIssues: string[]
  improvementAreas: string[]
  averageScore: number
  scoreDistribution: { excellent: number; good: number; fair: number; poor: number }
} {
  const topPerformers = rankedAnalyses
    .filter(analysis => analysis.atsScore.overall >= 85)
    .map(analysis => analysis.candidateName)
    .slice(0, 3)
  
  const commonIssues: string[] = []
  const improvementAreas: string[] = []
  
  // Analyze common issues across all resumes
  const allRecommendations = rankedAnalyses.flatMap(analysis => analysis.recommendations)
  const recommendationCounts = new Map<string, number>()
  
  allRecommendations.forEach(rec => {
    const key = `${rec.category}:${rec.title}`
    recommendationCounts.set(key, (recommendationCounts.get(key) || 0) + 1)
  })
  
  // Find most common issues
  const sortedIssues = Array.from(recommendationCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  
  sortedIssues.forEach(([issue, count]) => {
    if (count > rankedAnalyses.length * 0.3) { // Issue appears in >30% of resumes
      commonIssues.push(issue.split(':')[1])
    }
  })
  
  // Calculate average score
  const averageScore = Math.round(
    rankedAnalyses.reduce((sum, analysis) => sum + analysis.atsScore.overall, 0) / rankedAnalyses.length
  )
  
  // Calculate score distribution
  const scoreDistribution = {
    excellent: rankedAnalyses.filter(a => a.atsScore.overall >= 85).length,
    good: rankedAnalyses.filter(a => a.atsScore.overall >= 70 && a.atsScore.overall < 85).length,
    fair: rankedAnalyses.filter(a => a.atsScore.overall >= 50 && a.atsScore.overall < 70).length,
    poor: rankedAnalyses.filter(a => a.atsScore.overall < 50).length,
  }
  
  // Identify improvement areas
  if (scoreDistribution.poor > 0) {
    improvementAreas.push('Focus on improving keyword matching and section completeness')
  }
  if (scoreDistribution.fair > rankedAnalyses.length * 0.5) {
    improvementAreas.push('Consider adding more industry-specific keywords')
  }
  if (commonIssues.some(issue => issue.includes('formatting'))) {
    improvementAreas.push('Improve resume formatting and structure')
  }
  
  return {
    topPerformers,
    commonIssues,
    improvementAreas,
    averageScore,
    scoreDistribution,
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { analyses, jobTemplate, customJobDescription } = rankingRequestSchema.parse(body)
    
    if (analyses.length === 0) {
      return NextResponse.json({ error: 'No analyses provided' }, { status: 400 })
    }
    
    // Rank the resumes
    const rankedAnalyses = rankResumes(analyses, jobTemplate)
    
    // Generate insights
    const insights = generateRankingInsights(rankedAnalyses)
    
    return NextResponse.json({
      success: true,
      rankedAnalyses,
      insights,
      totalResumes: analyses.length,
      rankingDate: new Date(),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }
    console.error('Ranking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
