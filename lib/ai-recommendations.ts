// Lazy initialization of OpenAI client
let openai: any = null

function getOpenAIClient() {
  if (!openai && process.env.OPENAI_API_KEY) {
    const OpenAI = require('openai').default
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openai
}

// Helper functions to extract job information
function extractJobRole(jobDescription: string): string {
  const rolePatterns = [
    /(senior|junior|lead|principal|staff)\s+(software\s+)?(engineer|developer|programmer)/i,
    /(data\s+(scientist|analyst|engineer))/i,
    /(product|project|program)\s+manager/i,
    /(marketing|sales|business)\s+(manager|director|specialist)/i,
    /(ui|ux|frontend|backend|fullstack|devops)\s+(developer|engineer)/i,
    /(cloud|aws|azure|gcp)\s+(architect|engineer|specialist)/i,
    /(machine\s+learning|ai|artificial\s+intelligence)\s+(engineer|scientist)/i,
    /(cybersecurity|security)\s+(analyst|engineer|specialist)/i,
    /(qa|quality\s+assurance|test)\s+(engineer|analyst)/i,
    /(system|network|infrastructure)\s+(administrator|engineer)/i,
    /(consultant|advisor|specialist|coordinator)/i,
    /(director|vp|head\s+of|chief)/i
  ]

  for (const pattern of rolePatterns) {
    const match = jobDescription.match(pattern)
    if (match) {
      return match[0]
    }
  }

  // Fallback: look for common role keywords
  const roleKeywords = [
    'engineer', 'developer', 'manager', 'analyst', 'scientist', 'architect',
    'specialist', 'coordinator', 'consultant', 'director', 'lead'
  ]

  for (const keyword of roleKeywords) {
    if (jobDescription.toLowerCase().includes(keyword)) {
      return keyword.charAt(0).toUpperCase() + keyword.slice(1)
    }
  }

  return 'Professional'
}

function extractJobRequirements(jobDescription: string): string[] {
  const requirements: string[] = []
  
  // Extract technical skills
  const techSkills = [
    'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js', 'Python', 'Java', 'C#', 'C++',
    'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
    'Git', 'Jenkins', 'CI/CD', 'Agile', 'Scrum', 'JIRA', 'Confluence', 'Tableau', 'Power BI',
    'Machine Learning', 'AI', 'Data Science', 'Statistics', 'R', 'TensorFlow', 'PyTorch',
    'HTML', 'CSS', 'SASS', 'LESS', 'Webpack', 'Babel', 'ESLint', 'Jest', 'Cypress'
  ]

  techSkills.forEach(skill => {
    if (jobDescription.includes(skill)) {
      requirements.push(skill)
    }
  })

  // Extract soft skills
  const softSkills = [
    'leadership', 'communication', 'teamwork', 'problem solving', 'analytical thinking',
    'project management', 'time management', 'collaboration', 'mentoring', 'presentation'
  ]

  softSkills.forEach(skill => {
    if (jobDescription.toLowerCase().includes(skill)) {
      requirements.push(skill)
    }
  })

  // Extract experience requirements
  const experiencePatterns = [
    /(\d+)\+?\s+years?\s+of\s+experience/i,
    /(\d+)\+?\s+years?\s+in\s+(\w+)/i,
    /experience\s+with\s+(\w+)/i,
    /proficient\s+in\s+(\w+)/i,
    /expertise\s+in\s+(\w+)/i
  ]

  experiencePatterns.forEach(pattern => {
    const match = jobDescription.match(pattern)
    if (match) {
      requirements.push(match[0])
    }
  })

  return requirements.slice(0, 10) // Limit to top 10 requirements
}

function extractIndustry(jobDescription: string): string {
  const industryPatterns = [
    { pattern: /(fintech|financial|banking|insurance)/i, industry: 'Finance' },
    { pattern: /(healthcare|medical|pharmaceutical|biotech)/i, industry: 'Healthcare' },
    { pattern: /(e-commerce|retail|shopping|marketplace)/i, industry: 'E-commerce' },
    { pattern: /(education|edtech|learning|academic)/i, industry: 'Education' },
    { pattern: /(automotive|transportation|logistics)/i, industry: 'Transportation' },
    { pattern: /(real\s+estate|property|construction)/i, industry: 'Real Estate' },
    { pattern: /(entertainment|media|gaming|streaming)/i, industry: 'Entertainment' },
    { pattern: /(government|public\s+sector|civic)/i, industry: 'Government' },
    { pattern: /(non-profit|charity|social\s+impact)/i, industry: 'Non-profit' },
    { pattern: /(consulting|advisory|professional\s+services)/i, industry: 'Consulting' }
  ]

  for (const { pattern, industry } of industryPatterns) {
    if (pattern.test(jobDescription)) {
      return industry
    }
  }

  return 'Technology' // Default to technology
}

export interface AIRecommendation {
  type: 'critical' | 'important' | 'suggestion'
  category: 'keywords' | 'formatting' | 'sections' | 'content' | 'ai_enhanced'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  aiGenerated: boolean
  confidence: number
}

export interface AIAnalysisResult {
  recommendations: AIRecommendation[]
  overallScore: number
  improvementAreas: string[]
  strengths: string[]
  aiInsights: string
}

export async function generateAIRecommendations(
  resumeText: string,
  jobDescription: string,
  candidateName: string,
  currentScore: number
): Promise<AIAnalysisResult> {
  try {
    // Extract job role and requirements from job description
    const jobRole = extractJobRole(jobDescription)
    const jobRequirements = extractJobRequirements(jobDescription)
    const industry = extractIndustry(jobDescription)
    
    const prompt = `
You are an expert resume analyzer and career coach specializing in ${industry || 'technology'} roles. Analyze the following resume for a ${jobRole || 'professional'} position and provide specific, actionable recommendations tailored to this role.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

CANDIDATE: ${candidateName}
TARGET ROLE: ${jobRole}
INDUSTRY: ${industry}
CURRENT ATS SCORE: ${currentScore}/100

JOB REQUIREMENTS IDENTIFIED:
${jobRequirements.join(', ')}

Please provide role-specific recommendations that will help this candidate stand out for this particular position. Consider:

1. Role-specific keywords and terminology
2. Industry best practices for ${industry || 'this field'}
3. Specific skills and experiences valued in ${jobRole || 'this role'}
4. Formatting standards for ${industry || 'this industry'}
5. Career progression opportunities

Provide:
1. 6-10 specific, actionable recommendations tailored to this role
2. Overall improvement score (0-100)
3. Key areas that need improvement for this specific position
4. Strengths to highlight for this role
5. AI-powered insights for career growth in this field

Format your response as JSON:
{
  "recommendations": [
    {
      "type": "critical|important|suggestion",
      "category": "keywords|formatting|sections|content|ai_enhanced|role_specific",
      "title": "Role-specific title",
      "description": "Detailed description with specific actions for this role",
      "impact": "high|medium|low",
      "confidence": 0.95
    }
  ],
  "overallScore": 85,
  "improvementAreas": ["role-specific area1", "role-specific area2"],
  "strengths": ["strength1", "strength2"],
  "aiInsights": "AI-generated career advice specific to ${jobRole} in ${industry}"
}
`

    const client = getOpenAIClient()
    if (!client) {
      throw new Error('OpenAI client not available')
    }
    
    // Create role-specific system message
    const systemMessage = `You are an expert resume analyzer and career coach specializing in ${industry || 'technology'} roles. 
    
Your expertise includes:
- ${jobRole || 'Professional'} role requirements and expectations
- ${industry || 'Technology'} industry best practices
- ATS optimization strategies
- Career development in ${industry || 'technology'} field

Provide specific, actionable recommendations tailored to the candidate's target role and industry. Focus on practical improvements that will help them stand out for this specific position.`
    
    const completion = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4, // Slightly higher for more creative, role-specific suggestions
      max_tokens: 2500,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from AI')
    }

    // Parse JSON response
    const aiResult = JSON.parse(response)
    
    // Add AI-generated flag to recommendations
    const recommendations = aiResult.recommendations.map((rec: any) => ({
      ...rec,
      aiGenerated: true
    }))

    return {
      recommendations,
      overallScore: aiResult.overallScore,
      improvementAreas: aiResult.improvementAreas,
      strengths: aiResult.strengths,
      aiInsights: aiResult.aiInsights
    }
  } catch (error) {
    console.error('AI recommendation error:', error)
    
    // Fallback recommendations
    return {
      recommendations: [
        {
          type: 'suggestion',
          category: 'ai_enhanced',
          title: 'AI Analysis Unavailable',
          description: 'Unable to generate AI recommendations at this time. Please try again later.',
          impact: 'low',
          aiGenerated: true,
          confidence: 0.5
        }
      ],
      overallScore: currentScore,
      improvementAreas: ['General optimization needed'],
      strengths: ['Resume structure present'],
      aiInsights: 'AI analysis temporarily unavailable. Consider reviewing keyword optimization and formatting.'
    }
  }
}

export async function enhanceResumeWithAI(
  resumeText: string,
  jobDescription: string,
  focusAreas: string[] = []
): Promise<{
  enhancedText: string
  changes: Array<{
    section: string
    original: string
    improved: string
    reason: string
  }>
}> {
  try {
    const focusPrompt = focusAreas.length > 0 
      ? `Focus on improving: ${focusAreas.join(', ')}`
      : ''

    const prompt = `
You are an expert resume writer. Enhance the following resume to better match the job description while maintaining authenticity and improving ATS compatibility.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

${focusPrompt}

Please provide:
1. Enhanced resume text with improvements
2. List of specific changes made with reasons

Format as JSON:
{
  "enhancedText": "improved resume content",
  "changes": [
    {
      "section": "summary|experience|skills",
      "original": "original text",
      "improved": "improved text", 
      "reason": "why this change helps"
    }
  ]
}
`

    const client = getOpenAIClient()
    if (!client) {
      throw new Error('OpenAI client not available')
    }
    
    const completion = await client.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert resume writer. Enhance resumes while maintaining authenticity."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 3000,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from AI')
    }

    return JSON.parse(response)
  } catch (error) {
    console.error('AI enhancement error:', error)
    return {
      enhancedText: resumeText,
      changes: [{
        section: 'general',
        original: 'Original content',
        improved: 'No changes made - AI enhancement unavailable',
        reason: 'AI service temporarily unavailable'
      }]
    }
  }
}
