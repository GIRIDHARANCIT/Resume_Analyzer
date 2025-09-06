// Example usage of the Resume Analyzer API Client
// This file demonstrates how to use all the API endpoints

import { 
  authAPI, 
  uploadAPI, 
  analysisAPI, 
  profileAPI, 
  exportAPI, 
  rewriteAPI, 
  insightsAPI, 
  apiUtils 
} from '@/lib/api-client'

// Example: Complete authentication flow
export async function exampleAuthentication() {
  try {
    // 1. Login
    const loginResult = await authAPI.login({
      email: 'test@example.com',
      password: 'password123'
    })
    
    if (loginResult.requiresOTP) {
      // 2. Verify OTP
      const otpResult = await authAPI.verifyOTP({
        email: 'test@example.com',
        otp: '123456'
      })
      
      console.log('Login successful:', otpResult.user)
      return otpResult.sessionToken
    }
  } catch (error) {
    console.error('Authentication failed:', apiUtils.handleError(error))
  }
}

// Example: File upload and analysis
export async function exampleFileUploadAndAnalysis() {
  try {
    // 1. Upload files
    const files = [/* your File objects here */]
    const uploadResult = await uploadAPI.uploadFiles(files)
    
    // 2. Analyze each file
    const analyses = await Promise.all(
      uploadResult.files.map(async (file) => {
        return await analysisAPI.analyzeResume({
          resumeText: file.extractedText,
          candidateName: file.candidateName,
          candidateRole: file.candidateRole,
          jobTemplate: 'software-engineer'
        })
      })
    )
    
    // 3. Rank the analyses
    const rankingResult = await analysisAPI.rankResumes({
      analyses: analyses.map(a => a.analysis),
      jobTemplate: 'software-engineer'
    })
    
    console.log('Analysis complete:', rankingResult.rankedAnalyses)
    return rankingResult
  } catch (error) {
    console.error('Analysis failed:', apiUtils.handleError(error))
  }
}

// Example: Resume rewriting
export async function exampleResumeRewrite() {
  try {
    const rewriteResult = await rewriteAPI.rewriteResume({
      resumeText: 'Original resume text...',
      candidateName: 'John Doe',
      candidateRole: 'Software Engineer',
      jobTemplate: 'software-engineer',
      focusAreas: ['keywords', 'formatting'],
      tone: 'professional'
    })
    
    console.log('Rewrite complete:', rewriteResult.rewrite)
    return rewriteResult
  } catch (error) {
    console.error('Rewrite failed:', apiUtils.handleError(error))
  }
}

// Example: Career insights
export async function exampleCareerInsights() {
  try {
    const insightsResult = await insightsAPI.getCareerInsights(
      'software-engineer',
      'San Francisco',
      'mid'
    )
    
    console.log('Career insights:', insightsResult.insights)
    return insightsResult
  } catch (error) {
    console.error('Insights failed:', apiUtils.handleError(error))
  }
}

// Example: Report export
export async function exampleReportExport(analyses: any[]) {
  try {
    await exportAPI.exportReport({
      analyses,
      format: 'pdf',
      reportType: 'detailed',
      includeRecommendations: true,
      includeCharts: true
    })
    
    console.log('Report exported successfully')
  } catch (error) {
    console.error('Export failed:', apiUtils.handleError(error))
  }
}

// Example: User profile management
export async function exampleProfileManagement() {
  try {
    // Get profile
    const profileResult = await profileAPI.getProfile('test@example.com')
    console.log('User profile:', profileResult.user)
    
    // Update profile
    const updateResult = await profileAPI.updateProfile('test@example.com', {
      name: 'Updated Name',
      preferences: {
        autoAnalysis: false
      }
    })
    
    console.log('Profile updated:', updateResult.user)
    return updateResult
  } catch (error) {
    console.error('Profile management failed:', apiUtils.handleError(error))
  }
}

// Example: Error handling with retry
export async function exampleWithRetry() {
  try {
    const result = await apiUtils.retryRequest(
      () => analysisAPI.analyzeResume({
        resumeText: 'Resume content...',
        candidateName: 'John Doe',
        candidateRole: 'Software Engineer',
        jobTemplate: 'software-engineer'
      }),
      3, // max retries
      1000 // delay in ms
    )
    
    console.log('Analysis with retry successful:', result)
    return result
  } catch (error) {
    console.error('All retries failed:', apiUtils.handleError(error))
  }
}

// Example: Complete workflow
export async function completeWorkflow() {
  try {
    // 1. Authenticate
    const sessionToken = await exampleAuthentication()
    if (!sessionToken) return
    
    // 2. Upload and analyze
    const rankingResult = await exampleFileUploadAndAnalysis()
    if (!rankingResult) return
    
    // 3. Get career insights
    await exampleCareerInsights()
    
    // 4. Export report
    await exampleReportExport(rankingResult.rankedAnalyses)
    
    console.log('Complete workflow finished successfully!')
  } catch (error) {
    console.error('Workflow failed:', apiUtils.handleError(error))
  }
}
