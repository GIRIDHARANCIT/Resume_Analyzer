import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const analysisRequestSchema = z.object({
  resumeText: z.string(),
  candidateName: z.string(),
  candidateRole: z.string(),
  jobTemplate: z.string().optional(),
  customJobDescription: z.string().optional(),
})

// Job description templates with keywords
const JOB_TEMPLATES = {
  "software-engineer": {
    keywords: [
      "JavaScript", "TypeScript", "React", "Node.js", "Python", "Java", "Git", "AWS", "Docker", "API",
      "REST", "GraphQL", "MongoDB", "PostgreSQL", "Agile", "Scrum", "CI/CD", "Testing", "Microservices",
      "Kubernetes", "Jenkins", "Express", "Django", "Spring", "Angular", "Vue.js", "Redux", "Webpack"
    ],
    requiredSections: ["summary", "skills", "experience", "education"],
  },
  "data-analyst": {
    keywords: [
      "SQL", "Python", "R", "Excel", "Tableau", "Power BI", "Statistics", "Machine Learning",
      "Data Visualization", "ETL", "Analytics", "Pandas", "NumPy", "Jupyter", "A/B Testing",
      "Regression", "Clustering", "Data Mining", "Business Intelligence", "Data Warehousing"
    ],
    requiredSections: ["summary", "skills", "experience", "education", "projects"],
  },
  "marketing-manager": {
    keywords: [
      "Digital Marketing", "SEO", "SEM", "Google Analytics", "Social Media", "Content Marketing",
      "Email Marketing", "Campaign Management", "ROI", "Conversion Rate", "Lead Generation",
      "Brand Management", "Market Research", "Customer Acquisition", "Marketing Automation"
    ],
    requiredSections: ["summary", "skills", "experience", "education"],
  },
  "product-manager": {
    keywords: [
      "Product Strategy", "Roadmap", "Stakeholder Management", "User Research", "Agile",
      "Scrum", "Product Development", "Market Analysis", "Competitive Analysis", "User Stories",
      "Product Requirements", "A/B Testing", "Metrics", "Customer Feedback", "Go-to-Market"
    ],
    requiredSections: ["summary", "skills", "experience", "education"],
  },
  "sales-representative": {
    keywords: [
      "Lead Generation", "CRM", "Client Relationships", "Sales Pipeline", "Prospecting",
      "Negotiation", "Closing", "Account Management", "Sales Strategy", "Customer Success",
      "Revenue Growth", "Sales Process", "Cold Calling", "Presentation Skills", "Territory Management"
    ],
    requiredSections: ["summary", "skills", "experience", "education"],
  },
  "student": {
    keywords: [
      "Education", "Projects", "Internships", "Skills", "Leadership", "Teamwork", "Communication",
      "Problem Solving", "Research", "Academic Achievement", "Extracurricular Activities",
      "Volunteer Work", "Technical Skills", "Soft Skills", "Portfolio"
    ],
    requiredSections: ["summary", "skills", "education", "projects"],
  },
}

interface ATSScore {
  overall: number
  keywordMatch: number
  formatting: number
  sectionCompleteness: number
  readability: number
}

interface KeywordAnalysis {
  matched: string[]
  missing: string[]
  density: number
  relevanceScore: number
}

interface SectionAnalysis {
  summary: boolean
  skills: boolean
  experience: boolean
  education: boolean
  projects: boolean
  certifications: boolean
  completenessScore: number
}

interface Recommendation {
  type: "critical" | "important" | "suggestion"
  category: "keywords" | "formatting" | "sections" | "content"
  title: string
  description: string
  impact: "high" | "medium" | "low"
}

interface ATSAnalysisResult {
  candidateId: string
  candidateName: string
  candidateRole: string
  atsScore: ATSScore
  keywordAnalysis: KeywordAnalysis
  sectionAnalysis: SectionAnalysis
  recommendations: Recommendation[]
  rank?: number
  analysisDate?: Date
  version?: number
  improvementHistory?: ATSScore[]
}

function analyzeKeywords(resumeText: string, jobKeywords: string[]): KeywordAnalysis {
  const text = resumeText.toLowerCase()
  const matched: string[] = []
  const missing: string[] = []
  
  for (const keyword of jobKeywords) {
    if (text.includes(keyword.toLowerCase())) {
      matched.push(keyword)
    } else {
      missing.push(keyword)
    }
  }
  
  const density = matched.length / jobKeywords.length
  const relevanceScore = Math.min(100, (matched.length / jobKeywords.length) * 100)
  
  return { matched, missing, density, relevanceScore }
}

function analyzeSections(resumeText: string, requiredSections: string[]): SectionAnalysis {
  const text = resumeText.toLowerCase()
  
  const sections = {
    summary: text.includes('summary') || text.includes('objective') || text.includes('profile'),
    skills: text.includes('skills') || text.includes('technologies') || text.includes('competencies'),
    experience: text.includes('experience') || text.includes('work history') || text.includes('employment'),
    education: text.includes('education') || text.includes('academic') || text.includes('degree'),
    projects: text.includes('projects') || text.includes('portfolio') || text.includes('achievements'),
    certifications: text.includes('certifications') || text.includes('certificates') || text.includes('licenses'),
  }
  
  const foundSections = Object.values(sections).filter(Boolean).length
  const completenessScore = (foundSections / requiredSections.length) * 100
  
  return { ...sections, completenessScore }
}

function analyzeFormatting(resumeText: string): number {
  const lines = resumeText.split('\n')
  const totalLines = lines.length
  const nonEmptyLines = lines.filter(line => line.trim().length > 0).length
  
  // Check for bullet points
  const bulletPoints = lines.filter(line => line.trim().startsWith('•') || line.trim().startsWith('-')).length
  
  // Check for consistent formatting
  const hasConsistentSpacing = nonEmptyLines / totalLines > 0.7
  
  // Check for reasonable length (not too short, not too long)
  const wordCount = resumeText.split(/\s+/).length
  const lengthScore = wordCount >= 200 && wordCount <= 800 ? 100 : Math.max(0, 100 - Math.abs(wordCount - 500) / 10)
  
  // Calculate formatting score
  const formattingScore = (
    (nonEmptyLines / totalLines) * 30 +
    (bulletPoints / nonEmptyLines) * 30 +
    (hasConsistentSpacing ? 20 : 0) +
    (lengthScore / 100) * 20
  )
  
  return Math.min(100, formattingScore)
}

function generateRecommendations(
  keywordAnalysis: KeywordAnalysis,
  sectionAnalysis: SectionAnalysis,
  formattingScore: number
): Recommendation[] {
  const recommendations: Recommendation[] = []
  
  // Keyword recommendations
  if (keywordAnalysis.missing.length > 0) {
    const missingKeywords = keywordAnalysis.missing.slice(0, 5).join(', ')
    recommendations.push({
      type: keywordAnalysis.missing.length > 5 ? "critical" : "important",
      category: "keywords",
      title: "Add Missing Keywords",
      description: `Include these keywords: ${missingKeywords}`,
      impact: keywordAnalysis.missing.length > 5 ? "high" : "medium"
    })
  }
  
  if (keywordAnalysis.density < 0.3) {
    recommendations.push({
      type: "critical",
      category: "keywords",
      title: "Low Keyword Density",
      description: "Your resume has very few relevant keywords. Consider adding more industry-specific terms.",
      impact: "high"
    })
  }
  
  // Section recommendations
  if (!sectionAnalysis.summary) {
    recommendations.push({
      type: "important",
      category: "sections",
      title: "Add Professional Summary",
      description: "Include a compelling professional summary at the top of your resume.",
      impact: "medium"
    })
  }
  
  if (!sectionAnalysis.skills) {
    recommendations.push({
      type: "critical",
      category: "sections",
      title: "Add Skills Section",
      description: "Create a dedicated skills section highlighting your technical and soft skills.",
      impact: "high"
    })
  }
  
  if (!sectionAnalysis.experience) {
    recommendations.push({
      type: "critical",
      category: "sections",
      title: "Add Work Experience",
      description: "Include your work experience with detailed responsibilities and achievements.",
      impact: "high"
    })
  }
  
  // Formatting recommendations
  if (formattingScore < 70) {
    recommendations.push({
      type: "important",
      category: "formatting",
      title: "Improve Formatting",
      description: "Use bullet points, consistent spacing, and clear section headers for better readability.",
      impact: "medium"
    })
  }
  
  return recommendations
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { resumeText, candidateName, candidateRole, jobTemplate, customJobDescription } = analysisRequestSchema.parse(body)
    
    // Determine job keywords
    let jobKeywords: string[] = []
    let requiredSections: string[] = []
    
    if (customJobDescription) {
      // Extract keywords from custom job description (simplified)
      const commonKeywords = [
        "JavaScript", "Python", "React", "SQL", "AWS", "Docker", "Agile", "Scrum",
        "Marketing", "Sales", "Analysis", "Management", "Leadership", "Communication"
      ]
      jobKeywords = commonKeywords.filter(keyword => 
        customJobDescription.toLowerCase().includes(keyword.toLowerCase())
      )
      requiredSections = ["summary", "skills", "experience", "education"]
    } else if (jobTemplate && JOB_TEMPLATES[jobTemplate as keyof typeof JOB_TEMPLATES]) {
      const template = JOB_TEMPLATES[jobTemplate as keyof typeof JOB_TEMPLATES]
      jobKeywords = template.keywords
      requiredSections = template.requiredSections
    } else {
      // Default to software engineer template
      const template = JOB_TEMPLATES["software-engineer"]
      jobKeywords = template.keywords
      requiredSections = template.requiredSections
    }
    
    // Perform analysis
    const keywordAnalysis = analyzeKeywords(resumeText, jobKeywords)
    const sectionAnalysis = analyzeSections(resumeText, requiredSections)
    const formattingScore = analyzeFormatting(resumeText)
    const recommendations = generateRecommendations(keywordAnalysis, sectionAnalysis, formattingScore)
    
    // Calculate overall ATS score
    const atsScore: ATSScore = {
      overall: Math.round(
        (keywordAnalysis.relevanceScore * 0.4) +
        (sectionAnalysis.completenessScore * 0.3) +
        (formattingScore * 0.2) +
        (Math.random() * 10) // Add some variability
      ),
      keywordMatch: Math.round(keywordAnalysis.relevanceScore),
      formatting: Math.round(formattingScore),
      sectionCompleteness: Math.round(sectionAnalysis.completenessScore),
      readability: Math.round(Math.random() * 20 + 80), // Mock readability score
    }
    
    // Ensure overall score doesn't exceed 100
    atsScore.overall = Math.min(100, atsScore.overall)
    
    const analysisResult: ATSAnalysisResult = {
      candidateId: `candidate_${Date.now()}`,
      candidateName,
      candidateRole,
      atsScore,
      keywordAnalysis,
      sectionAnalysis,
      recommendations,
      analysisDate: new Date(),
      version: 1,
    }
    
    return NextResponse.json({
      success: true,
      analysis: analysisResult,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
    }
    console.error('Analysis error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
