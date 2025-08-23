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
): ATSAnalysisResult {
  const template = JOB_TEMPLATES[jobTemplate as keyof typeof JOB_TEMPLATES]
  const keywords = customJobDescription ? extractKeywordsFromJD(customJobDescription) : template?.keywords || []

  // Analyze keywords
  const keywordAnalysis = analyzeKeywords(resumeText, keywords)

  // Analyze sections
  const sectionAnalysis = analyzeSections(resumeText, template?.requiredSections || [])

  // Analyze formatting
  const formattingScore = analyzeFormatting(resumeText)

  // Analyze readability
  const readabilityScore = analyzeReadability(resumeText)

  // Calculate overall ATS score
  const atsScore: ATSScore = {
    keywordMatch: keywordAnalysis.relevanceScore,
    sectionCompleteness: sectionAnalysis.completenessScore,
    formatting: formattingScore,
    readability: readabilityScore,
    overall: Math.round(
      keywordAnalysis.relevanceScore * 0.4 +
        sectionAnalysis.completenessScore * 0.3 +
        formattingScore * 0.2 +
        readabilityScore * 0.1,
    ),
  }

  // Generate recommendations
  const recommendations = generateRecommendations(keywordAnalysis, sectionAnalysis, formattingScore, readabilityScore)

  return {
    candidateId: Math.random().toString(36).substr(2, 9),
    candidateName,
    candidateRole,
    atsScore,
    keywordAnalysis,
    sectionAnalysis,
    recommendations,
    analysisDate: new Date(),
    version: 1,
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

  keywords.forEach((keyword) => {
    if (resumeLower.includes(keyword.toLowerCase())) {
      matched.push(keyword)
    } else {
      missing.push(keyword)
    }
  })

  const density = matched.length / keywords.length
  const relevanceScore = Math.round(density * 100)

  return {
    matched,
    missing,
    density,
    relevanceScore,
  }
}

function analyzeSections(resumeText: string, requiredSections: string[]): SectionAnalysis {
  const text = resumeText.toLowerCase()

  const sections = {
    summary: text.includes("summary") || text.includes("objective") || text.includes("profile"),
    skills: text.includes("skills") || text.includes("technical") || text.includes("competencies"),
    experience: text.includes("experience") || text.includes("employment") || text.includes("work"),
    education: text.includes("education") || text.includes("degree") || text.includes("university"),
    projects: text.includes("projects") || text.includes("portfolio"),
    certifications: text.includes("certification") || text.includes("certificate") || text.includes("license"),
  }

  const presentSections = Object.values(sections).filter(Boolean).length
  const totalSections = Object.keys(sections).length
  const completenessScore = Math.round((presentSections / totalSections) * 100)

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
