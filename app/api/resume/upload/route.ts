export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { saveResumeAnalysis, getUserByEmail } from '@/lib/db'
import { analyzeResume } from '@/lib/ats-analyzer'
import { generateAIRecommendations } from '@/lib/ai-recommendations'

// Simple text extraction function (in production, use proper PDF/DOC parsers)
function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type === 'text/plain' || file.type === 'text/rtf') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        resolve(text || 'No text content found')
      }
      reader.onerror = reject
      reader.readAsText(file)
    } else {
      // For PDF/DOC files, we'll simulate text extraction
      // In production, use libraries like pdf-parse, mammoth, etc.
      const mockText = `
        ${file.name.replace(/\.[^/.]+$/, '')}
        
        PROFESSIONAL SUMMARY
        Experienced professional with expertise in various technologies and methodologies.
        
        SKILLS
        JavaScript, React, Node.js, Python, SQL, Git, AWS, Docker
        
        
        EDUCATION
        Bachelor of Science in Computer Science
        University, 2018
        
        PROJECTS
        Web Application Project
        - Built full-stack application using React and Node.js
        - Implemented payment processing and user authentication
      `
      resolve(mockText)
    }
  })
}

function extractCandidateName(filename: string, content: string): string {
  // Extract from filename first
  const nameFromFile = filename
    .replace(/\.(pdf|doc|docx|txt|rtf)$/i, '')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  
  if (nameFromFile && nameFromFile.length > 2 && nameFromFile.length < 50) {
    return nameFromFile
  }
  
  // Extract from content
  const lines = content.split('\n').slice(0, 10)
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.length > 3 && trimmed.length < 50) {
      const nameMatch = trimmed.match(/^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/)
      if (nameMatch) {
        return nameMatch[0]
      }
    }
  }
  
  return 'Unknown Candidate'
}

function extractCandidateRole(content: string): string {
  const lines = content.split('\n').slice(0, 20)
  const roleKeywords = [
    'software engineer', 'developer', 'programmer', 'data analyst', 'data scientist',
    'product manager', 'project manager', 'marketing manager', 'sales representative',
    'designer', 'architect', 'consultant', 'specialist', 'coordinator', 'assistant',
    'director', 'manager', 'lead', 'senior', 'junior', 'intern', 'student'
  ]
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase()
    for (const keyword of roleKeywords) {
      if (lowerLine.includes(keyword)) {
        const match = line.match(new RegExp(`.*${keyword}.*`, 'i'))
        if (match) {
          return match[0].trim()
        }
      }
    }
  }
  
  return 'Unknown Role'
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const userEmail = formData.get('userEmail') as string
    const jobTemplate = formData.get('jobTemplate') as string || 'software-engineer'
    const customJobDescription = formData.get('customJobDescription') as string

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 })
    }

    // Get user
    const user = getUserByEmail(userEmail)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const processedFiles = []

    for (const file of files) {
      try {
        // Extract text from file
        const extractedText = await extractTextFromFile(file)
        
        // Extract candidate information
        const candidateName = extractCandidateName(file.name, extractedText)
        const candidateRole = extractCandidateRole(extractedText)

        // Generate AI recommendations first if OpenAI is available
        let aiRecommendations = []
        try {
          if (process.env.OPENAI_API_KEY) {
            const aiResult = await generateAIRecommendations(
              extractedText,
              customJobDescription || `Job template: ${jobTemplate}`,
              candidateName,
              0 // We'll calculate score after analysis
            )
            aiRecommendations = aiResult.recommendations
          }
        } catch (aiError) {
          console.error('AI recommendations failed:', aiError)
        }

        // Perform ATS analysis with AI recommendations
        const analysis = analyzeResume(
          extractedText,
          candidateName,
          candidateRole,
          jobTemplate,
          customJobDescription,
          aiRecommendations
        )

        // Save to database
        const savedAnalysis = saveResumeAnalysis({
          userId: user.id,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          candidateName,
          candidateRole,
          extractedText,
          atsScore: analysis.atsScore.overall,
          analysisData: {
            ...analysis,
            aiRecommendations: aiRecommendations.length > 0
          }
        })

        processedFiles.push({
          id: savedAnalysis.id,
          name: file.name,
          size: file.size,
          type: file.type,
          extractedText,
          candidateName,
          candidateRole,
          uploadedAt: savedAnalysis.createdAt.toISOString(),
          atsScore: analysis.atsScore.overall,
          analysisId: savedAnalysis.id
        })

      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError)
        processedFiles.push({
          id: `error_${Date.now()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          extractedText: 'Error processing file',
          candidateName: 'Unknown',
          candidateRole: 'Unknown',
          uploadedAt: new Date().toISOString(),
          atsScore: 0,
          error: 'Failed to process file'
        })
      }
    }

    return NextResponse.json({
      success: true,
      files: processedFiles,
      message: `Successfully processed ${processedFiles.length} file(s)`
    })

  } catch (error) {
    console.error('Resume upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
