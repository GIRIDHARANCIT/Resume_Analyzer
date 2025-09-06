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



**Note:** This is a comprehensive backend implementation with mock data. For production use, replace mock implementations with real database connections, proper authentication, and enhanced security measures.
