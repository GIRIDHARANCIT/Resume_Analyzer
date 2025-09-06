import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const insightsRequestSchema = z.object({
  role: z.string(),
  industry: z.string().optional(),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive']).optional(),
  location: z.string().optional(),
})

interface CareerInsight {
  type: 'trend' | 'skill' | 'salary' | 'opportunity' | 'advice'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  source: string
  data?: any
}

interface IndustryTrend {
  trend: string
  description: string
  growth: number // percentage
  demand: 'high' | 'medium' | 'low'
  timeframe: string
}

interface SkillInsight {
  skill: string
  demand: 'high' | 'medium' | 'low'
  growth: number
  salaryImpact: number
  description: string
}

interface SalaryInsight {
  role: string
  location: string
  minSalary: number
  maxSalary: number
  medianSalary: number
  currency: string
  source: string
}

// Mock career insights data
const CAREER_INSIGHTS = {
  'software-engineer': {
    trends: [
      {
        trend: 'AI/ML Integration',
        description: 'Growing demand for engineers with AI/ML skills',
        growth: 45,
        demand: 'high',
        timeframe: '2024-2025'
      },
      {
        trend: 'Cloud-Native Development',
        description: 'Shift towards cloud-first architecture',
        growth: 32,
        demand: 'high',
        timeframe: '2024-2025'
      },
      {
        trend: 'DevOps Practices',
        description: 'Increased focus on CI/CD and automation',
        growth: 28,
        demand: 'medium',
        timeframe: '2024-2025'
      }
    ],
    skills: [
      {
        skill: 'TypeScript',
        demand: 'high',
        growth: 40,
        salaryImpact: 15,
        description: 'Strongly typed JavaScript is becoming industry standard'
      },
      {
        skill: 'React',
        demand: 'high',
        growth: 25,
        salaryImpact: 12,
        description: 'Most popular frontend framework'
      },
      {
        skill: 'Python',
        demand: 'high',
        growth: 35,
        salaryImpact: 18,
        description: 'Essential for AI/ML and backend development'
      },
      {
        skill: 'AWS',
        demand: 'high',
        growth: 30,
        salaryImpact: 20,
        description: 'Leading cloud platform with high demand'
      }
    ],
    salary: {
      'San Francisco': { min: 120000, max: 200000, median: 160000 },
      'New York': { min: 110000, max: 180000, median: 145000 },
      'Seattle': { min: 100000, max: 170000, median: 135000 },
      'Austin': { min: 90000, max: 150000, median: 120000 },
      'Remote': { min: 80000, max: 140000, median: 110000 }
    }
  },
  'data-analyst': {
    trends: [
      {
        trend: 'Data Science Integration',
        description: 'Analysts expected to have basic ML skills',
        growth: 38,
        demand: 'high',
        timeframe: '2024-2025'
      },
      {
        trend: 'Real-time Analytics',
        description: 'Growing need for real-time data processing',
        growth: 42,
        demand: 'high',
        timeframe: '2024-2025'
      },
      {
        trend: 'Business Intelligence',
        description: 'Focus on actionable insights and storytelling',
        growth: 25,
        demand: 'medium',
        timeframe: '2024-2025'
      }
    ],
    skills: [
      {
        skill: 'SQL',
        demand: 'high',
        growth: 20,
        salaryImpact: 15,
        description: 'Fundamental skill for data analysis'
      },
      {
        skill: 'Python',
        demand: 'high',
        growth: 45,
        salaryImpact: 25,
        description: 'Essential for advanced analytics and ML'
      },
      {
        skill: 'Tableau',
        demand: 'high',
        growth: 30,
        salaryImpact: 18,
        description: 'Leading data visualization tool'
      },
      {
        skill: 'Machine Learning',
        demand: 'high',
        growth: 50,
        salaryImpact: 30,
        description: 'High-demand skill for advanced analytics'
      }
    ],
    salary: {
      'San Francisco': { min: 90000, max: 150000, median: 120000 },
      'New York': { min: 85000, max: 140000, median: 112000 },
      'Seattle': { min: 80000, max: 130000, median: 105000 },
      'Austin': { min: 70000, max: 120000, median: 95000 },
      'Remote': { min: 65000, max: 110000, median: 87500 }
    }
  },
  'marketing-manager': {
    trends: [
      {
        trend: 'Digital Marketing Dominance',
        description: 'Continued shift towards digital channels',
        growth: 35,
        demand: 'high',
        timeframe: '2024-2025'
      },
      {
        trend: 'Marketing Automation',
        description: 'Increased use of AI-powered marketing tools',
        growth: 40,
        demand: 'high',
        timeframe: '2024-2025'
      },
      {
        trend: 'Data-Driven Marketing',
        description: 'Focus on analytics and ROI measurement',
        growth: 30,
        demand: 'medium',
        timeframe: '2024-2025'
      }
    ],
    skills: [
      {
        skill: 'Google Analytics',
        demand: 'high',
        growth: 25,
        salaryImpact: 15,
        description: 'Essential for digital marketing measurement'
      },
      {
        skill: 'SEO/SEM',
        demand: 'high',
        growth: 30,
        salaryImpact: 20,
        description: 'Core digital marketing skills'
      },
      {
        skill: 'Marketing Automation',
        demand: 'high',
        growth: 45,
        salaryImpact: 25,
        description: 'High-demand skill for efficiency'
      },
      {
        skill: 'Data Analysis',
        demand: 'high',
        growth: 35,
        salaryImpact: 22,
        description: 'Critical for ROI measurement'
      }
    ],
    salary: {
      'San Francisco': { min: 100000, max: 160000, median: 130000 },
      'New York': { min: 95000, max: 150000, median: 122000 },
      'Seattle': { min: 90000, max: 140000, median: 115000 },
      'Austin': { min: 80000, max: 130000, median: 105000 },
      'Remote': { min: 75000, max: 120000, median: 97500 }
    }
  }
}

function generateCareerAdvice(role: string, experienceLevel?: string): CareerInsight[] {
  const advice: CareerInsight[] = []
  
  if (role.toLowerCase().includes('software') || role.toLowerCase().includes('engineer')) {
    advice.push(
      {
        type: 'advice',
        title: 'Focus on Full-Stack Development',
        description: 'Developers with both frontend and backend skills are in high demand',
        impact: 'high',
        source: 'Industry Trends 2024'
      },
      {
        type: 'advice',
        title: 'Build a Portfolio',
        description: 'Create open-source projects or personal applications to showcase your skills',
        impact: 'high',
        source: 'Career Development'
      },
      {
        type: 'advice',
        title: 'Learn Cloud Technologies',
        description: 'AWS, Azure, or Google Cloud skills significantly increase marketability',
        impact: 'high',
        source: 'Technology Trends'
      }
    )
  } else if (role.toLowerCase().includes('data') || role.toLowerCase().includes('analyst')) {
    advice.push(
      {
        type: 'advice',
        title: 'Develop Storytelling Skills',
        description: 'Ability to communicate insights effectively is crucial for data analysts',
        impact: 'high',
        source: 'Data Science Trends'
      },
      {
        type: 'advice',
        title: 'Learn Python and SQL',
        description: 'These are the most in-demand skills for data professionals',
        impact: 'high',
        source: 'Skills Analysis'
      },
      {
        type: 'advice',
        title: 'Build Domain Expertise',
        description: 'Combine technical skills with industry knowledge for better opportunities',
        impact: 'medium',
        source: 'Career Development'
      }
    )
  } else if (role.toLowerCase().includes('marketing')) {
    advice.push(
      {
        type: 'advice',
        title: 'Embrace Digital Transformation',
        description: 'Digital marketing skills are essential for modern marketing roles',
        impact: 'high',
        source: 'Marketing Trends'
      },
      {
        type: 'advice',
        title: 'Learn Analytics Tools',
        description: 'Google Analytics, Tableau, and similar tools are highly valued',
        impact: 'high',
        source: 'Skills Analysis'
      },
      {
        type: 'advice',
        title: 'Focus on ROI Measurement',
        description: 'Demonstrating measurable results is key to career advancement',
        impact: 'medium',
        source: 'Career Development'
      }
    )
  }
  
  return advice
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const industry = searchParams.get('industry')
    const experienceLevel = searchParams.get('experienceLevel') as any
    const location = searchParams.get('location')
    
    if (!role) {
      return NextResponse.json({ error: 'Role parameter required' }, { status: 400 })
    }
    
    // Find matching role insights
    const roleKey = Object.keys(CAREER_INSIGHTS).find(key => 
      role.toLowerCase().includes(key.replace('-', ' '))
    ) || 'software-engineer'
    
    const insights = CAREER_INSIGHTS[roleKey as keyof typeof CAREER_INSIGHTS]
    
    // Generate career advice
    const careerAdvice = generateCareerAdvice(role, experienceLevel)
    
    // Get salary data for location
    const salaryData = insights.salary[location as keyof typeof insights.salary] || 
                      insights.salary['Remote']
    
    const salaryInsight: SalaryInsight = {
      role,
      location: location || 'Remote',
      minSalary: salaryData.min,
      maxSalary: salaryData.max,
      medianSalary: salaryData.median,
      currency: 'USD',
      source: 'Industry Data 2024'
    }
    
    return NextResponse.json({
      success: true,
      insights: {
        trends: insights.trends,
        skills: insights.skills,
        salary: salaryInsight,
        advice: careerAdvice,
        role: roleKey,
        lastUpdated: new Date().toISOString(),
      }
    })
  } catch (error) {
    console.error('Insights error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
