// API Client for Resume Analyzer Backend
// Provides easy-to-use functions for all backend endpoints

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''

interface LoginRequest {
  email: string
  password: string
}

interface SignupRequest {
  name: string
  email: string
  password: string
}

interface OTPRequest {
  email: string
  otp: string
}

interface FileUploadResponse {
  success: boolean
  files: Array<{
    id: string
    name: string
    size: number
    type: string
    extractedText: string
    candidateName: string
    candidateRole: string
    uploadedAt: string
  }>
}

interface AnalysisRequest {
  resumeText: string
  candidateName: string
  candidateRole: string
  jobTemplate?: string
  customJobDescription?: string
}

interface AnalysisResponse {
  success: boolean
  analysis: {
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
    analysisDate: string
    version: number
  }
}

interface RankingRequest {
  analyses: any[]
  jobTemplate?: string
  customJobDescription?: string
}

interface RankingResponse {
  success: boolean
  rankedAnalyses: any[]
  insights: {
    topPerformers: string[]
    commonIssues: string[]
    improvementAreas: string[]
    averageScore: number
    scoreDistribution: {
      excellent: number
      good: number
      fair: number
      poor: number
    }
  }
  totalResumes: number
  rankingDate: string
}

interface ProfileResponse {
  success: boolean
  user: {
    id: string
    email: string
    name: string
    phone: string
    company: string
    role: string
    createdAt: string
    preferences: {
      autoAnalysis: boolean
      keywordSuggestions: boolean
      formattingTips: boolean
      industryInsights: boolean
      emailNotifications: {
        analysisCompletion: boolean
        weeklyTips: boolean
        productUpdates: boolean
      }
      defaultAnalysisMode: string
    }
    statistics: {
      resumesAnalyzed: number
      averageATSScore: number
      lastAnalysisDate: string
      totalAnalysisTime: number
      improvementRate: number
    }
  }
}

interface ExportRequest {
  analyses: any[]
  format: 'pdf' | 'csv' | 'json'
  reportType: 'detailed' | 'summary' | 'comparison'
  includeRecommendations?: boolean
  includeCharts?: boolean
}

interface RewriteRequest {
  resumeText: string
  candidateName: string
  candidateRole: string
  jobTemplate?: string
  customJobDescription?: string
  focusAreas?: string[]
  tone?: 'professional' | 'confident' | 'achievement-focused'
}

interface RewriteResponse {
  success: boolean
  rewrite: {
    originalText: string
    improvedText: string
    suggestions: Array<{
      type: 'section' | 'bullet' | 'summary' | 'skill'
      original: string
      improved: string
      reason: string
      impact: 'high' | 'medium' | 'low'
    }>
    keywordImprovements: string[]
    formattingImprovements: string[]
    contentImprovements: string[]
    overallScore: number
    improvementPercentage: number
  }
}

interface CareerInsightsResponse {
  success: boolean
  insights: {
    trends: Array<{
      trend: string
      description: string
      growth: number
      demand: 'high' | 'medium' | 'low'
      timeframe: string
    }>
    skills: Array<{
      skill: string
      demand: 'high' | 'medium' | 'low'
      growth: number
      salaryImpact: number
      description: string
    }>
    salary: {
      role: string
      location: string
      minSalary: number
      maxSalary: number
      medianSalary: number
      currency: string
      source: string
    }
    advice: Array<{
      type: 'trend' | 'skill' | 'salary' | 'opportunity' | 'advice'
      title: string
      description: string
      impact: 'high' | 'medium' | 'low'
      source: string
    }>
    role: string
    lastUpdated: string
  }
}

class APIError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'APIError'
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new APIError(response.status, errorData.error || 'Request failed')
  }

  return response.json()
}

// Authentication APIs
export const authAPI = {
  async login(request: LoginRequest) {
    return apiRequest<{ success: boolean; message: string; requiresOTP: boolean }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    )
  },

  async verifyOTP(request: OTPRequest) {
    return apiRequest<{ success: boolean; user: any; sessionToken: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    )
  },

  async signup(request: SignupRequest) {
    return apiRequest<{ success: boolean; message: string; requiresOTP: boolean }>(
      '/api/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    )
  },

  async verifySignupOTP(request: OTPRequest) {
    return apiRequest<{ success: boolean; user: any; sessionToken: string }>(
      '/api/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    )
  },
}

// Resume Upload API
export const uploadAPI = {
  async uploadFiles(files: File[], userEmail: string, jobTemplate?: string, customJobDescription?: string) {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    formData.append('userEmail', userEmail)
    
    if (jobTemplate) {
      formData.append('jobTemplate', jobTemplate)
    }
    
    if (customJobDescription) {
      formData.append('customJobDescription', customJobDescription)
    }

    const response = await fetch(`${API_BASE_URL}/api/resume/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }))
      throw new APIError(response.status, errorData.error || 'Upload failed')
    }

    return response.json() as Promise<FileUploadResponse>
  },
}

// Resume Analysis API
export const analysisAPI = {
  async analyzeResume(request: AnalysisRequest) {
    return apiRequest<AnalysisResponse>('/api/resume/analyze', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  },

  async rankResumes(request: RankingRequest) {
    return apiRequest<RankingResponse>('/api/resume/rank', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  },
}

// User Profile API
export const profileAPI = {
  async getProfile(email: string) {
    return apiRequest<ProfileResponse>(`/api/user/profile?email=${encodeURIComponent(email)}`)
  },

  async updateProfile(email: string, updateData: any) {
    return apiRequest<ProfileResponse>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify({ email, ...updateData }),
    })
  },
}

// Reports Export API
export const exportAPI = {
  async exportReport(request: ExportRequest) {
    const response = await fetch(`${API_BASE_URL}/api/reports/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Export failed' }))
      throw new APIError(response.status, errorData.error || 'Export failed')
    }

    // Handle file download
    const blob = await response.blob()
    const filename = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'report'
    
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)

    return { success: true, filename }
  },
}

// Resume Rewrite API
export const rewriteAPI = {
  async rewriteResume(request: RewriteRequest) {
    return apiRequest<RewriteResponse>('/api/resume/rewrite', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  },
}

// Career Insights API
export const insightsAPI = {
  async getCareerInsights(role: string, location?: string, experienceLevel?: string) {
    const params = new URLSearchParams({ role })
    if (location) params.append('location', location)
    if (experienceLevel) params.append('experienceLevel', experienceLevel)

    return apiRequest<CareerInsightsResponse>(`/api/insights/career?${params.toString()}`)
  },
}

// Utility functions
export const apiUtils = {
  handleError(error: unknown): string {
    if (error instanceof APIError) {
      return error.message
    }
    if (error instanceof Error) {
      return error.message
    }
    return 'An unexpected error occurred'
  },

  async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await requestFn()
      } catch (error) {
        lastError = error as Error
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
        }
      }
    }

    throw lastError!
  },
}

// Export all APIs for easy access
export default {
  auth: authAPI,
  upload: uploadAPI,
  analysis: analysisAPI,
  profile: profileAPI,
  export: exportAPI,
  rewrite: rewriteAPI,
  insights: insightsAPI,
  utils: apiUtils,
}
