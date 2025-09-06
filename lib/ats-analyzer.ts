// ATS Analysis Engine - Core logic for resume scoring and analysis

export interface ATSScore {
  overall: number
  keywordMatch: number
  formatting: number
  sectionCompleteness: number
  readability: number
}

export interface KeywordAnalysis {
  matched: string[]
  missing: string[]
  density: number
  relevanceScore: number
}

export interface SectionAnalysis {
  summary: boolean
  skills: boolean
  experience: boolean
  education: boolean
  projects: boolean
  certifications: boolean
  completenessScore: number
}

export interface Recommendation {
  type: "critical" | "important" | "suggestion"
  category: "keywords" | "formatting" | "sections" | "content"
  title: string
  description: string
  impact: "high" | "medium" | "low"
}

export interface ATSAnalysisResult {
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

// Mock job description templates with keywords
const JOB_TEMPLATES = {
  "software-engineer": {
    keywords: [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "Python",
      "Java",
      "Git",
      "AWS",
      "Docker",
      "API",
      "REST",
      "GraphQL",
      "MongoDB",
      "PostgreSQL",
      "Agile",
      "Scrum",
      "CI/CD",
      "Testing",
    ],
    requiredSections: ["summary", "skills", "experience", "education"],
  },
  "data-analyst": {
    keywords: [
      "SQL",
      "Python",
      "R",
      "Excel",
      "Tableau",
      "Power BI",
      "Statistics",
      "Machine Learning",
      "Data Visualization",
      "ETL",
      "Analytics",
      "Pandas",
      "NumPy",
      "Jupyter",
      "A/B Testing",
    ],
    requiredSections: ["summary", "skills", "experience", "education", "projects"],
  },
  "marketing-manager": {
    keywords: [
      "Digital Marketing",
      "SEO",
      "SEM",
      "Google Analytics",
      "Social Media",
      "Content Marketing",
      "Campaign Management",
      "Lead Generation",
      "CRM",
      "Email Marketing",
      "Brand Management",
    ],
    requiredSections: ["summary", "skills", "experience", "education"],
  },
  "product-manager": {
    keywords: [
      "Product Strategy",
      "Roadmap",
      "Stakeholder Management",
      "User Research",
      "Analytics",
      "Agile",
      "Scrum",
      "A/B Testing",
      "KPIs",
      "Market Research",
      "Product Launch",
      "UX/UI",
    ],
    requiredSections: ["summary", "skills", "experience", "education", "projects"],
  },
  "sales-representative": {
    keywords: [
      "Sales",
      "Lead Generation",
      "CRM",
      "Salesforce",
      "Cold Calling",
      "Negotiation",
      "Client Relationships",
      "Pipeline Management",
      "Quota Achievement",
      "B2B",
      "B2C",
    ],
    requiredSections: ["summary", "skills", "experience", "education"],
  },
  student: {
    keywords: [
      "Education",
      "GPA",
      "Projects",
      "Internship",
      "Leadership",
      "Teamwork",
      "Communication",
      "Problem Solving",
      "Research",
      "Volunteer",
      "Extracurricular",
      "Coursework",
    ],
    requiredSections: ["education", "skills", "projects"],
  },
}

export function analyzeResume(
  resumeText: string,
  candidateName: string,
  candidateRole: string,
  jobTemplate: string,
  customJobDescription?: string,
  aiRecommendations?: any[],
): ATSAnalysisResult {
  const template = JOB_TEMPLATES[jobTemplate as keyof typeof JOB_TEMPLATES]
  const keywords = customJobDescription ? extractKeywordsFromJD(customJobDescription) : template?.keywords || []

  // Analyze keywords with improved algorithm
  const keywordAnalysis = analyzeKeywords(resumeText, keywords)

  // Analyze sections with better detection
  const sectionAnalysis = analyzeSections(resumeText, template?.requiredSections || [])

  // Analyze formatting with enhanced checks
  const formattingScore = analyzeFormatting(resumeText)

  // Analyze readability with improved metrics
  const readabilityScore = analyzeReadability(resumeText)

  // Calculate overall ATS score with weighted algorithm
  const atsScore: ATSScore = {
    keywordMatch: keywordAnalysis.relevanceScore,
    sectionCompleteness: sectionAnalysis.completenessScore,
    formatting: formattingScore,
    readability: readabilityScore,
    overall: Math.round(
      keywordAnalysis.relevanceScore * 0.35 +
        sectionAnalysis.completenessScore * 0.25 +
        formattingScore * 0.25 +
        readabilityScore * 0.15,
    ),
  }

  // Generate base recommendations
  const baseRecommendations = generateRecommendations(keywordAnalysis, sectionAnalysis, formattingScore, readabilityScore)
  
  // Combine with AI recommendations if available
  const recommendations = aiRecommendations && aiRecommendations.length > 0 
    ? [...baseRecommendations, ...aiRecommendations]
    : baseRecommendations

  return {
    candidateId: Math.random().toString(36).substr(2, 9),
    candidateName,
    candidateRole,
    atsScore,
    keywordAnalysis,
    sectionAnalysis,
    recommendations,
    analysisDate: new Date(),
    version: 2, // Updated version
    improvementHistory: [],
  }
}

function extractKeywordsFromJD(jobDescription: string): string[] {
  // Simple keyword extraction - in real implementation, use NLP
  const commonWords = new Set(["the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "a", "an"])
  const words = jobDescription
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !commonWords.has(word))

  // Get most frequent words as keywords
  const wordCount = words.reduce(
    (acc, word) => {
      acc[word] = (acc[word] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([word]) => word)
}

function analyzeKeywords(resumeText: string, keywords: string[]): KeywordAnalysis {
  const resumeLower = resumeText.toLowerCase()
  const matched: string[] = []
  const missing: string[] = []
  const keywordCounts: { [key: string]: number } = {}

  // Count keyword occurrences and variations
  keywords.forEach((keyword) => {
    const keywordLower = keyword.toLowerCase()
    const variations = [
      keywordLower,
      keywordLower.replace(/\s+/g, ''), // Remove spaces
      keywordLower.replace(/\s+/g, '-'), // Replace spaces with hyphens
      keywordLower.replace(/\s+/g, '_'), // Replace spaces with underscores
    ]

    let found = false
    let count = 0

    variations.forEach((variation) => {
      const regex = new RegExp(`\\b${variation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
      const matches = resumeLower.match(regex)
      if (matches) {
        found = true
        count += matches.length
      }
    })

    if (found) {
      matched.push(keyword)
      keywordCounts[keyword] = count
    } else {
      missing.push(keyword)
    }
  })

  // Calculate density with weighted scoring
  const totalKeywords = keywords.length
  const matchedCount = matched.length
  
  // Base density score
  let density = matchedCount / totalKeywords
  
  // Bonus for keyword frequency (up to 20% bonus)
  const totalOccurrences = Object.values(keywordCounts).reduce((sum, count) => sum + count, 0)
  const frequencyBonus = Math.min(totalOccurrences / totalKeywords * 0.2, 0.2)
  
  // Final relevance score
  const relevanceScore = Math.round((density + frequencyBonus) * 100)

  return {
    matched,
    missing,
    density: density + frequencyBonus,
    relevanceScore: Math.min(relevanceScore, 100),
  }
}

function analyzeSections(resumeText: string, requiredSections: string[]): SectionAnalysis {
  const text = resumeText.toLowerCase()
  const lines = text.split('\n')

  // Enhanced section detection with multiple patterns
  const sectionPatterns = {
    summary: [
      /summary/i, /objective/i, /profile/i, /overview/i, /introduction/i,
      /executive summary/i, /professional summary/i
    ],
    skills: [
      /skills/i, /technical skills/i, /competencies/i, /expertise/i,
      /technologies/i, /tools/i, /languages/i
    ],
    experience: [
      /experience/i, /employment/i, /work history/i, /professional experience/i,
      /career history/i, /employment history/i
    ],
    education: [
      /education/i, /academic/i, /degree/i, /university/i, /college/i,
      /qualifications/i, /certifications/i
    ],
    projects: [
      /projects/i, /portfolio/i, /achievements/i, /key projects/i,
      /notable projects/i, /work samples/i
    ],
    certifications: [
      /certifications/i, /certificates/i, /licenses/i, /accreditations/i,
      /professional certifications/i
    ],
  }

  const sections: any = {}
  let sectionScores: { [key: string]: number } = {}

  // Check each section with multiple patterns
  Object.entries(sectionPatterns).forEach(([sectionName, patterns]) => {
    let found = false
    let score = 0

    // Check for section headers
    patterns.forEach(pattern => {
      if (pattern.test(text)) {
        found = true
        score += 50 // Base score for finding section
      }
    })

    // Check for content indicators
    const contentIndicators = {
      summary: ['overview', 'background', 'professional', 'career'],
      skills: ['proficient', 'experienced', 'knowledge', 'familiar'],
      experience: ['responsibilities', 'achieved', 'managed', 'led'],
      education: ['bachelor', 'master', 'phd', 'gpa', 'graduated'],
      projects: ['developed', 'created', 'built', 'implemented'],
      certifications: ['certified', 'licensed', 'accredited', 'authorized']
    }

    const indicators = contentIndicators[sectionName as keyof typeof contentIndicators] || []
    indicators.forEach(indicator => {
      if (text.includes(indicator)) {
        score += 10
      }
    })

    sections[sectionName] = found
    sectionScores[sectionName] = Math.min(score, 100)
  })

  // Calculate completeness score with weighted importance
  const sectionWeights = {
    summary: 0.15,
    skills: 0.20,
    experience: 0.25,
    education: 0.15,
    projects: 0.15,
    certifications: 0.10
  }

  let weightedScore = 0
  Object.entries(sectionScores).forEach(([section, score]) => {
    const weight = sectionWeights[section as keyof typeof sectionWeights] || 0
    weightedScore += score * weight
  })

  const completenessScore = Math.round(weightedScore)

  return {
    ...sections,
    completenessScore,
  }
}

function analyzeFormatting(resumeText: string): number {
  let score = 100

  // Check for common formatting issues
  if (resumeText.length < 500) score -= 20 // Too short
  if (resumeText.length > 5000) score -= 10 // Too long
  if (!/[A-Z]/.test(resumeText)) score -= 15 // No capital letters
  if (!/\d/.test(resumeText)) score -= 10 // No numbers (dates, etc.)

  // Check for structure indicators
  if (!resumeText.includes("\n")) score -= 20 // No line breaks
  if (resumeText.split("\n").length < 10) score -= 15 // Too few sections

  return Math.max(0, score)
}

function analyzeReadability(resumeText: string): number {
  const sentences = resumeText.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  const words = resumeText.split(/\s+/).filter((w) => w.length > 0)
  const avgWordsPerSentence = words.length / sentences.length

  let score = 100

  // Penalize very long or very short sentences
  if (avgWordsPerSentence > 25) score -= 20
  if (avgWordsPerSentence < 8) score -= 15

  // Check for bullet points (good for readability)
  const bulletPoints = (resumeText.match(/[•\-*]/g) || []).length
  if (bulletPoints > 5) score += 10

  return Math.min(100, Math.max(0, score))
}

function generateRecommendations(
  keywordAnalysis: KeywordAnalysis,
  sectionAnalysis: SectionAnalysis,
  formattingScore: number,
  readabilityScore: number,
): Recommendation[] {
  const recommendations: Recommendation[] = []

  // Keyword recommendations
  if (keywordAnalysis.relevanceScore < 60) {
    recommendations.push({
      type: "critical",
      category: "keywords",
      title: "Add Missing Keywords",
      description: `Include ${keywordAnalysis.missing.slice(0, 5).join(", ")} to improve keyword matching`,
      impact: "high",
    })
  }

  if (keywordAnalysis.relevanceScore < 80) {
    recommendations.push({
      type: "important",
      category: "keywords",
      title: "Optimize Keyword Density",
      description: "Naturally incorporate more relevant keywords throughout your resume",
      impact: "medium",
    })
  }

  // Section recommendations
  if (!sectionAnalysis.summary) {
    recommendations.push({
      type: "critical",
      category: "sections",
      title: "Add Professional Summary",
      description: "Include a compelling summary section at the top of your resume",
      impact: "high",
    })
  }

  if (!sectionAnalysis.skills) {
    recommendations.push({
      type: "important",
      category: "sections",
      title: "Add Skills Section",
      description: "Create a dedicated skills section highlighting your technical and soft skills",
      impact: "high",
    })
  }

  if (!sectionAnalysis.projects) {
    recommendations.push({
      type: "suggestion",
      category: "sections",
      title: "Include Projects",
      description: "Add a projects section to showcase your practical experience",
      impact: "medium",
    })
  }

  // Formatting recommendations
  if (formattingScore < 70) {
    recommendations.push({
      type: "important",
      category: "formatting",
      title: "Improve Formatting",
      description: "Use consistent formatting, bullet points, and clear section headers",
      impact: "medium",
    })
  }

  // Readability recommendations
  if (readabilityScore < 70) {
    recommendations.push({
      type: "suggestion",
      category: "content",
      title: "Enhance Readability",
      description: "Use shorter sentences and bullet points for better readability",
      impact: "low",
    })
  }

  return recommendations
}

export function rankResumes(analyses: ATSAnalysisResult[]): ATSAnalysisResult[] {
  return analyses
    .sort((a, b) => b.atsScore.overall - a.atsScore.overall)
    .map((analysis, index) => ({
      ...analysis,
      rank: index + 1,
    }))
}
