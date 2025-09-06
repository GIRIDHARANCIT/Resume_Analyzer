# Resume Analyzer - Complete Backend API

A comprehensive backend API for the Resume Analyzer application that provides all the features needed for the frontend, including authentication, resume analysis, ranking, reporting, and more.

## 🚀 Features

### ✅ Authentication & User Management
- **Login/Signup with OTP verification**
- **User profile management**
- **Session management**
- **User preferences and settings**

### ✅ Resume Processing
- **File upload (PDF, DOC, DOCX)**
- **Text extraction from documents**
- **Candidate information extraction**
- **File validation and processing**

### ✅ ATS Analysis Engine
- **Comprehensive ATS scoring**
- **Keyword matching and analysis**
- **Section completeness analysis**
- **Formatting and readability scoring**
- **Smart recommendations generation**

### ✅ Resume Ranking & Comparison
- **Multi-resume ranking system**
- **Comparative analysis**
- **Insights and trends identification**
- **Performance metrics**

### ✅ AI-Powered Resume Rewriting
- **Intelligent content improvement**
- **Keyword optimization**
- **Formatting suggestions**
- **Tone and style adjustments**

### ✅ Career Insights & Analytics
- **Industry trends analysis**
- **Salary insights by location**
- **Skill demand analysis**
- **Career advice and recommendations**

### ✅ Reporting & Export
- **Multiple export formats (PDF, CSV, JSON)**
- **Detailed and summary reports**
- **Customizable report types**
- **Automated file downloads**

## 📁 API Structure

```
app/api/
├── auth/
│   ├── login/route.ts          # Login with OTP verification
│   └── signup/route.ts         # Signup with OTP verification
├── resume/
│   ├── upload/route.ts         # File upload and text extraction
│   ├── analyze/route.ts        # ATS analysis and scoring
│   ├── rank/route.ts           # Resume ranking and comparison
│   └── rewrite/route.ts        # AI-powered resume rewriting
├── user/
│   └── profile/route.ts        # User profile and preferences
├── reports/
│   └── export/route.ts         # Report generation and export
└── insights/
    └── career/route.ts         # Career insights and analytics
```

## 🔧 API Endpoints

### Authentication

#### POST `/api/auth/login`
Login with email and password, returns OTP requirement.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "requiresOTP": true
}
```

#### POST `/api/auth/login` (OTP Verification)
Verify OTP and complete login.

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "1",
    "email": "user@example.com",
    "name": "Test User"
  },
  "sessionToken": "session_1234567890_abc123"
}
```

#### POST `/api/auth/signup`
Register new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Resume Upload

#### POST `/api/resume/upload`
Upload and process resume files.

**Request:** FormData with files

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "id": "file_1234567890_abc123",
      "name": "resume.pdf",
      "size": 1024000,
      "type": "application/pdf",
      "extractedText": "John Doe\nSoftware Engineer...",
      "candidateName": "John Doe",
      "candidateRole": "Software Engineer",
      "uploadedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Resume Analysis

#### POST `/api/resume/analyze`
Perform comprehensive ATS analysis.

**Request:**
```json
{
  "resumeText": "John Doe\nSoftware Engineer...",
  "candidateName": "John Doe",
  "candidateRole": "Software Engineer",
  "jobTemplate": "software-engineer",
  "customJobDescription": "Optional custom job description"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "candidateId": "candidate_1234567890",
    "candidateName": "John Doe",
    "candidateRole": "Software Engineer",
    "atsScore": {
      "overall": 85,
      "keywordMatch": 90,
      "formatting": 80,
      "sectionCompleteness": 85,
      "readability": 88
    },
    "keywordAnalysis": {
      "matched": ["JavaScript", "React", "Node.js"],
      "missing": ["TypeScript", "AWS"],
      "density": 0.75,
      "relevanceScore": 90
    },
    "sectionAnalysis": {
      "summary": true,
      "skills": true,
      "experience": true,
      "education": true,
      "projects": false,
      "certifications": false,
      "completenessScore": 85
    },
    "recommendations": [
      {
        "type": "important",
        "category": "keywords",
        "title": "Add Missing Keywords",
        "description": "Include these keywords: TypeScript, AWS",
        "impact": "medium"
      }
    ],
    "analysisDate": "2024-01-15T10:30:00Z",
    "version": 1
  }
}
```

### Resume Ranking

#### POST `/api/resume/rank`
Rank multiple resumes and provide insights.

**Request:**
```json
{
  "analyses": [
    // Array of analysis results from /api/resume/analyze
  ],
  "jobTemplate": "software-engineer"
}
```

**Response:**
```json
{
  "success": true,
  "rankedAnalyses": [
    // Ranked analysis results with rank property
  ],
  "insights": {
    "topPerformers": ["John Doe", "Jane Smith"],
    "commonIssues": ["Missing keywords", "Poor formatting"],
    "improvementAreas": ["Focus on keyword matching"],
    "averageScore": 78,
    "scoreDistribution": {
      "excellent": 2,
      "good": 3,
      "fair": 1,
      "poor": 0
    }
  },
  "totalResumes": 6,
  "rankingDate": "2024-01-15T10:30:00Z"
}
```

### Resume Rewriting

#### POST `/api/resume/rewrite`
AI-powered resume improvement.

**Request:**
```json
{
  "resumeText": "Original resume text...",
  "candidateName": "John Doe",
  "candidateRole": "Software Engineer",
  "jobTemplate": "software-engineer",
  "focusAreas": ["keywords", "formatting"],
  "tone": "professional"
}
```

**Response:**
```json
{
  "success": true,
  "rewrite": {
    "originalText": "Original text...",
    "improvedText": "Improved text...",
    "suggestions": [
      {
        "type": "summary",
        "original": "Original summary",
        "improved": "Improved summary",
        "reason": "More compelling summary",
        "impact": "high"
      }
    ],
    "keywordImprovements": ["Add TypeScript", "Include AWS"],
    "formattingImprovements": ["Use bullet points"],
    "contentImprovements": ["Add quantifiable achievements"],
    "overallScore": 88,
    "improvementPercentage": 15
  }
}
```

### User Profile

#### GET `/api/user/profile?email=user@example.com`
Get user profile and preferences.

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "1",
    "email": "user@example.com",
    "name": "Test User",
    "phone": "+1 (555) 123-4567",
    "company": "Tech Corp",
    "role": "Software Engineer",
    "createdAt": "2024-01-01T00:00:00Z",
    "preferences": {
      "autoAnalysis": true,
      "keywordSuggestions": true,
      "formattingTips": true,
      "industryInsights": false,
      "emailNotifications": {
        "analysisCompletion": true,
        "weeklyTips": true,
        "productUpdates": false
      },
      "defaultAnalysisMode": "Comprehensive Analysis"
    },
    "statistics": {
      "resumesAnalyzed": 12,
      "averageATSScore": 78,
      "lastAnalysisDate": "2024-01-15T10:30:00Z",
      "totalAnalysisTime": 45,
      "improvementRate": 15
    }
  }
}
```

#### PUT `/api/user/profile`
Update user profile and preferences.

**Request:**
```json
{
  "email": "user@example.com",
  "name": "Updated Name",
  "preferences": {
    "autoAnalysis": false
  }
}
```

### Report Export

#### POST `/api/reports/export`
Generate and download reports.

**Request:**
```json
{
  "analyses": [
    // Array of analysis results
  ],
  "format": "pdf",
  "reportType": "detailed",
  "includeRecommendations": true,
  "includeCharts": true
}
```

**Response:** File download with appropriate headers.

### Career Insights

#### GET `/api/insights/career?role=software-engineer&location=San Francisco`
Get career insights and trends.

**Response:**
```json
{
  "success": true,
  "insights": {
    "trends": [
      {
        "trend": "AI/ML Integration",
        "description": "Growing demand for engineers with AI/ML skills",
        "growth": 45,
        "demand": "high",
        "timeframe": "2024-2025"
      }
    ],
    "skills": [
      {
        "skill": "TypeScript",
        "demand": "high",
        "growth": 40,
        "salaryImpact": 15,
        "description": "Strongly typed JavaScript is becoming industry standard"
      }
    ],
    "salary": {
      "role": "Software Engineer",
      "location": "San Francisco",
      "minSalary": 120000,
      "maxSalary": 200000,
      "medianSalary": 160000,
      "currency": "USD",
      "source": "Industry Data 2024"
    },
    "advice": [
      {
        "type": "advice",
        "title": "Focus on Full-Stack Development",
        "description": "Developers with both frontend and backend skills are in high demand",
        "impact": "high",
        "source": "Industry Trends 2024"
      }
    ],
    "role": "software-engineer",
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

## 🛠️ Usage Examples

### Using the API Client

```typescript
import { authAPI, uploadAPI, analysisAPI } from '@/lib/api-client'

// Login
const loginResult = await authAPI.login({
  email: 'user@example.com',
  password: 'password123'
})

// Upload files
const uploadResult = await uploadAPI.uploadFiles([file1, file2])

// Analyze resume
const analysisResult = await analysisAPI.analyzeResume({
  resumeText: 'Resume content...',
  candidateName: 'John Doe',
  candidateRole: 'Software Engineer',
  jobTemplate: 'software-engineer'
})
```

### Error Handling

```typescript
import { apiUtils } from '@/lib/api-client'

try {
  const result = await analysisAPI.analyzeResume(request)
} catch (error) {
  const errorMessage = apiUtils.handleError(error)
  console.error('Analysis failed:', errorMessage)
}
```

## 🔧 Job Templates

The system supports multiple job templates with predefined keywords:

- **software-engineer**: JavaScript, TypeScript, React, Node.js, Python, Java, Git, AWS, Docker, etc.
- **data-analyst**: SQL, Python, R, Excel, Tableau, Power BI, Statistics, Machine Learning, etc.
- **marketing-manager**: Digital Marketing, SEO, SEM, Google Analytics, Social Media, etc.
- **product-manager**: Product Strategy, Roadmap, Stakeholder Management, User Research, etc.
- **sales-representative**: Lead Generation, CRM, Client Relationships, Sales Pipeline, etc.
- **student**: Education, Projects, Internships, Skills, Leadership, Teamwork, etc.

## 📊 ATS Scoring System

The ATS analysis provides comprehensive scoring across multiple dimensions:

- **Overall Score**: Weighted combination of all factors
- **Keyword Match**: Percentage of relevant keywords found
- **Formatting**: Document structure and readability
- **Section Completeness**: Presence of required sections
- **Readability**: Text clarity and organization

## 🎯 Recommendations System

The system generates intelligent recommendations categorized by:

- **Critical**: Must-fix issues that significantly impact ATS scores
- **Important**: Issues that improve resume effectiveness
- **Suggestion**: Optional improvements for optimization

Categories include:
- **Keywords**: Missing or low-density keywords
- **Formatting**: Document structure and presentation
- **Sections**: Missing or incomplete resume sections
- **Content**: Writing quality and impact

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Test the API endpoints:**
   - Use the provided API client in `lib/api-client.ts`
   - Test with tools like Postman or curl
   - Check the browser's Network tab for API calls

## 🔒 Security Features

- **Input validation** with Zod schemas
- **File type validation** for uploads
- **File size limits** (10MB per file)
- **Error handling** with proper HTTP status codes
- **Session management** (mock implementation)

## 📈 Performance Features

- **Efficient text processing** algorithms
- **Optimized keyword matching**
- **Caching-ready architecture**
- **Batch processing** for multiple files
- **Retry mechanisms** for reliability

## 🔮 Future Enhancements

- **Real database integration** (PostgreSQL, MongoDB)
- **AI/ML integration** for better analysis
- **Real-time processing** with WebSockets
- **Advanced text extraction** with OCR
- **Multi-language support**
- **Advanced analytics dashboard**
- **Integration with job boards**
- **Email notifications system**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Note:** This is a comprehensive backend implementation with mock data. For production use, replace mock implementations with real database connections, proper authentication, and enhanced security measures.
