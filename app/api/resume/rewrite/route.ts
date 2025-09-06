import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const rewriteRequestSchema = z.object({
  resumeText: z.string(),
  candidateName: z.string(),
  candidateRole: z.string(),
  jobTemplate: z.string().optional(),
  customJobDescription: z.string().optional(),
  focusAreas: z.array(z.enum(['keywords', 'formatting', 'content', 'sections'])).optional(),
  tone: z.enum(['professional', 'confident', 'achievement-focused']).default('professional'),
})

interface RewriteSuggestion {
  type: 'section' | 'bullet' | 'summary' | 'skill'
  original: string
  improved: string
  reason: string
  impact: 'high' | 'medium' | 'low'
}

interface ResumeRewrite {
  originalText: string
  improvedText: string
  suggestions: RewriteSuggestion[]
  keywordImprovements: string[]
  formattingImprovements: string[]
  contentImprovements: string[]
  overallScore: number
  improvementPercentage: number
}

function generateKeywordSuggestions(resumeText: string, jobKeywords: string[]): string[] {
  const text = resumeText.toLowerCase()
  const missingKeywords = jobKeywords.filter(keyword => !text.includes(keyword.toLowerCase()))
  
  return missingKeywords.slice(0, 10).map(keyword => 
    `Add "${keyword}" to your resume to improve keyword matching`
  )
}

function generateFormattingSuggestions(resumeText: string): string[] {
  const suggestions: string[] = []
  const lines = resumeText.split('\n')
  
  // Check for bullet points
  const bulletPoints = lines.filter(line => line.trim().startsWith('•') || line.trim().startsWith('-'))
  if (bulletPoints.length < lines.length * 0.3) {
    suggestions.push('Use more bullet points to improve readability and ATS parsing')
  }
  
  // Check for consistent spacing
  const emptyLines = lines.filter(line => line.trim() === '').length
  if (emptyLines < lines.length * 0.1) {
    suggestions.push('Add consistent spacing between sections for better visual hierarchy')
  }
  
  // Check for section headers
  const hasHeaders = /^(SUMMARY|EXPERIENCE|EDUCATION|SKILLS|PROJECTS)/im.test(resumeText)
  if (!hasHeaders) {
    suggestions.push('Use clear section headers (SUMMARY, EXPERIENCE, EDUCATION, etc.)')
  }
  
  return suggestions
}

function generateContentSuggestions(resumeText: string): string[] {
  const suggestions: string[] = []
  
  // Check for action verbs
  const actionVerbs = ['developed', 'implemented', 'managed', 'led', 'created', 'designed', 'optimized']
  const hasActionVerbs = actionVerbs.some(verb => resumeText.toLowerCase().includes(verb))
  if (!hasActionVerbs) {
    suggestions.push('Use strong action verbs to start bullet points (developed, implemented, led, etc.)')
  }
  
  // Check for quantifiable achievements
  const hasNumbers = /\d+%|\d+ users|\d+ people|\$\d+/.test(resumeText)
  if (!hasNumbers) {
    suggestions.push('Include quantifiable achievements with numbers and percentages')
  }
  
  // Check for technical skills
  const hasTechnicalSkills = /(JavaScript|Python|React|SQL|AWS|Docker)/i.test(resumeText)
  if (!hasTechnicalSkills) {
    suggestions.push('Highlight specific technical skills and technologies')
  }
  
  return suggestions
}

function generateRewriteSuggestions(resumeText: string, jobKeywords: string[]): RewriteSuggestion[] {
  const suggestions: RewriteSuggestion[] = []
  const lines = resumeText.split('\n')
  
  // Improve summary section
  const summaryLine = lines.find(line => 
    line.toLowerCase().includes('summary') || line.toLowerCase().includes('objective')
  )
  if (summaryLine) {
    suggestions.push({
      type: 'summary',
      original: summaryLine,
      improved: 'Experienced professional with proven track record of delivering results and driving innovation.',
      reason: 'More compelling and achievement-focused summary',
      impact: 'high'
    })
  }
  
  // Improve bullet points
  const bulletLines = lines.filter(line => 
    line.trim().startsWith('•') || line.trim().startsWith('-')
  )
  
  bulletLines.slice(0, 3).forEach(line => {
    if (line.toLowerCase().includes('responsible for') || line.toLowerCase().includes('duties include')) {
      suggestions.push({
        type: 'bullet',
        original: line,
        improved: line.replace(/responsible for|duties include/i, 'Successfully'),
        reason: 'Replace passive language with achievement-focused language',
        impact: 'medium'
      })
    }
  })
  
  // Add missing keywords to skills section
  const skillsLine = lines.find(line => 
    line.toLowerCase().includes('skills') || line.toLowerCase().includes('technologies')
  )
  if (skillsLine && jobKeywords.length > 0) {
    const missingKeywords = jobKeywords.slice(0, 3)
    suggestions.push({
      type: 'skill',
      original: skillsLine,
      improved: `${skillsLine}, ${missingKeywords.join(', ')}`,
      reason: 'Add relevant keywords to improve ATS matching',
      impact: 'high'
    })
  }
  
  return suggestions
}

function improveResumeText(resumeText: string, suggestions: RewriteSuggestion[]): string {
  let improvedText = resumeText
  
  suggestions.forEach(suggestion => {
    switch (suggestion.type) {
      case 'summary':
        improvedText = improvedText.replace(suggestion.original, suggestion.improved)
        break
      case 'bullet':
        improvedText = improvedText.replace(suggestion.original, suggestion.improved)
        break
      case 'skill':
        improvedText = improvedText.replace(suggestion.original, suggestion.improved)
        break
    }
  })
  
  return improvedText
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { resumeText, candidateName, candidateRole, jobTemplate, customJobDescription, focusAreas, tone } = rewriteRequestSchema.parse(body)
    
    // Determine job keywords
    let jobKeywords: string[] = []
    
    if (customJobDescription) {
      const commonKeywords = [
        "JavaScript", "Python", "React", "SQL", "AWS", "Docker", "Agile", "Scrum",
        "Marketing", "Sales", "Analysis", "Management", "Leadership", "Communication"
      ]
      jobKeywords = commonKeywords.filter(keyword => 
        customJobDescription.toLowerCase().includes(keyword.toLowerCase())
      )
    } else if (jobTemplate) {
      const templates = {
        "software-engineer": ["JavaScript", "TypeScript", "React", "Node.js", "Python", "Java", "Git", "AWS", "Docker"],
        "data-analyst": ["SQL", "Python", "R", "Excel", "Tableau", "Power BI", "Statistics", "Machine Learning"],
        "marketing-manager": ["Digital Marketing", "SEO", "SEM", "Google Analytics", "Social Media", "Content Marketing"],
        "product-manager": ["Product Strategy", "Roadmap", "Stakeholder Management", "User Research", "Agile"],
        "sales-representative": ["Lead Generation", "CRM", "Client Relationships", "Sales Pipeline", "Prospecting"],
        "student": ["Education", "Projects", "Internships", "Skills", "Leadership", "Teamwork"]
      }
      jobKeywords = templates[jobTemplate as keyof typeof templates] || []
    } else {
      jobKeywords = ["JavaScript", "Python", "React", "SQL", "AWS", "Docker", "Agile", "Scrum"]
    }
    
    // Generate suggestions
    const suggestions = generateRewriteSuggestions(resumeText, jobKeywords)
    const keywordImprovements = generateKeywordSuggestions(resumeText, jobKeywords)
    const formattingImprovements = generateFormattingSuggestions(resumeText)
    const contentImprovements = generateContentSuggestions(resumeText)
    
    // Improve resume text
    const improvedText = improveResumeText(resumeText, suggestions)
    
    // Calculate improvement score
    const originalKeywordMatch = jobKeywords.filter(keyword => 
      resumeText.toLowerCase().includes(keyword.toLowerCase())
    ).length / jobKeywords.length
    
    const improvedKeywordMatch = jobKeywords.filter(keyword => 
      improvedText.toLowerCase().includes(keyword.toLowerCase())
    ).length / jobKeywords.length
    
    const improvementPercentage = Math.round((improvedKeywordMatch - originalKeywordMatch) * 100)
    const overallScore = Math.min(100, 70 + improvementPercentage + suggestions.length * 2)
    
    const rewriteResult: ResumeRewrite = {
      originalText: resumeText,
      improvedText,
      suggestions,
      keywordImprovements,
      formattingImprovements,
      contentImprovements,
      overallScore,
      improvementPercentage: Math.max(0, improvementPercentage),
    }
    
    return NextResponse.json({
      success: true,
      rewrite: rewriteResult,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }
    console.error('Rewrite error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
