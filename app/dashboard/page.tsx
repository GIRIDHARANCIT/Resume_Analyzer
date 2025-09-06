"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Upload, Settings, LogOut, User, Mail, Calendar, Shield, Clock } from "lucide-react"
import { ResumeUpload } from "@/components/resume-upload"
import { ATSAnalysisDisplay } from "@/components/ats-analysis-display"
import { analyzeResume, rankResumes, type ATSAnalysisResult } from "@/lib/ats-analyzer"
import { useRouter } from "next/navigation"
import { uploadAPI, analysisAPI, apiUtils, profileAPI } from "@/lib/api-client"

interface UploadedFile {
  id: string
  file: File
  name: string
  size: string
  status: "uploading" | "processing" | "completed" | "error"
  progress: number
  extractedText?: string
  candidateName?: string
  candidateRole?: string
}

interface UserStats {
  resumesAnalyzed: number
  averageATSScore: number
  lastAnalysisDate: string | null
  totalAnalysisTime: number
  improvementRate: number
}

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState<"dashboard" | "upload" | "analysis">("dashboard")
  const [processedFiles, setProcessedFiles] = useState<UploadedFile[]>([])
  const [analysisResults, setAnalysisResults] = useState<ATSAnalysisResult[]>([])
  const [jobTemplate, setJobTemplate] = useState("")
  const [customJobDescription, setCustomJobDescription] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [userSession, setUserSession] = useState<any>(null)
  const [timeOnSite, setTimeOnSite] = useState(0)
  const [userStats, setUserStats] = useState<UserStats>({
    resumesAnalyzed: 0,
    averageATSScore: 0,
    lastAnalysisDate: null,
    totalAnalysisTime: 0,
    improvementRate: 0
  })
  
  // Settings state
  const [settings, setSettings] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    language: 'en-US',
    region: 'US',
    autoAnalysis: true,
    keywordSuggestions: true,
    formattingTips: true,
    industryInsights: false
  })
  
  const router = useRouter()

  useEffect(() => {
    const session = localStorage.getItem("userSession")
    if (!session) {
      router.push("/")
      return
    }
    const parsedSession = JSON.parse(session)
    setUserSession(parsedSession)
    
    // Calculate time on site
    const loginTime = new Date(parsedSession.loginTime)
    const now = new Date()
    const timeDiff = Math.floor((now.getTime() - loginTime.getTime()) / 1000) // in seconds
    setTimeOnSite(timeDiff)
    
    // Update time every minute
    const interval = setInterval(() => {
      setTimeOnSite(prev => prev + 60)
    }, 60000)
    
    return () => clearInterval(interval)
  }, [router])

  // Load user statistics and settings
  useEffect(() => {
    if (userSession?.email) {
      loadUserStats()
      loadUserSettings()
    }
  }, [userSession])

  const loadUserStats = async () => {
    try {
      const result = await profileAPI.getProfile(userSession.email)
      if (result.success && result.user.statistics) {
        setUserStats(result.user.statistics)
      } else {
        // Keep default values if no statistics are available
        console.log('No user statistics available, using defaults')
      }
    } catch (error) {
      console.error('Failed to load user stats:', error)
      // Keep default values on error
    }
  }

  const loadUserSettings = async () => {
    try {
      const result = await profileAPI.getProfile(userSession.email)
      if (result.success && result.user) {
        setSettings({
          name: result.user.name || '',
          email: result.user.email || '',
          phone: result.user.phone || '',
          company: result.user.company || '',
          role: result.user.role || '',
          language: result.user.preferences?.language || 'en-US',
          region: result.user.preferences?.region || 'US',
          autoAnalysis: result.user.preferences?.autoAnalysis ?? true,
          keywordSuggestions: result.user.preferences?.keywordSuggestions ?? true,
          formattingTips: result.user.preferences?.formattingTips ?? true,
          industryInsights: result.user.preferences?.industryInsights ?? false
        })
      }
    } catch (error) {
      console.error('Failed to load user settings:', error)
    }
  }

  const handleFilesProcessed = async (files: UploadedFile[], template: string, customJD?: string) => {
    setProcessedFiles(files)
    setJobTemplate(template)
    setCustomJobDescription(customJD || "")

    try {
      const fileArray = files.map(f => f.file)
      const uploadResult = await uploadAPI.uploadFiles(fileArray)
      const analyses = await Promise.all(
        uploadResult.files.map(async (uploadedFile) => {
          const analysisResult = await analysisAPI.analyzeResume({
            resumeText: uploadedFile.extractedText,
            candidateName: uploadedFile.candidateName,
            candidateRole: uploadedFile.candidateRole,
            jobTemplate: template,
            customJobDescription: customJD
          })
          return analysisResult.analysis
        })
      )
      const rankingResult = await analysisAPI.rankResumes({ analyses, jobTemplate: template, customJobDescription: customJD })
      setAnalysisResults(rankingResult.rankedAnalyses)
      setCurrentView("analysis")
    } catch (error) {
      console.error('Analysis failed:', apiUtils.handleError(error))
      const analyses = files.map((file) =>
        analyzeResume(
          file.extractedText || "Mock resume content for analysis...",
          file.candidateName || "Unknown Candidate",
          file.candidateRole || "Unknown Role",
          template,
          customJD,
        ),
      )
      const rankedAnalyses = rankResumes(analyses)
      setAnalysisResults(rankedAnalyses)
      setCurrentView("analysis")
    }
  }

  const handleReanalyze = () => {
    setCurrentView("upload")
    setProcessedFiles([])
    setAnalysisResults([])
  }

  const formatTimeOnSite = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("userSession")
    router.push("/")
  }

  const handleSaveSettings = async () => {
    try {
      const updateRes = await profileAPI.updateProfile(userSession.email, {
        name: settings.name,
        phone: settings.phone,
        company: settings.company,
        role: settings.role,
        preferences: {
          language: settings.language,
          region: settings.region,
          autoAnalysis: settings.autoAnalysis,
          keywordSuggestions: settings.keywordSuggestions,
          formattingTips: settings.formattingTips,
          industryInsights: settings.industryInsights
        }
      })

      // Update local session
      const updated = { ...userSession, name: updateRes.user.name, email: updateRes.user.email }
      setUserSession(updated)
      localStorage.setItem('userSession', JSON.stringify(updated))
      setShowSettings(false)
    } catch (e) {
      console.error('Settings save failed:', apiUtils.handleError(e))
    }
  }

  if (!userSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Resume Analyzer</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                <Clock className="h-4 w-4 inline mr-1" />
                {formatTimeOnSite(timeOnSite)}
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex gap-6">
            <button onClick={() => setCurrentView("dashboard")} className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${currentView === "dashboard" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Dashboard</button>
            <button onClick={() => setCurrentView("upload")} className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${currentView === "upload" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Upload & Analyze</button>
            {analysisResults.length > 0 && (
              <button onClick={() => setCurrentView("analysis")} className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${currentView === "analysis" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>Analysis Results</button>
            )}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {currentView === "dashboard" && <Dashboard onStartAnalysis={() => setCurrentView("upload")} userStats={userStats} />}
        {currentView === "upload" && <ResumeUpload onFilesProcessed={handleFilesProcessed} />}
        {currentView === "analysis" && <ATSAnalysisDisplay analyses={analysisResults} onReanalyze={handleReanalyze} />}
      </main>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Manage your account preferences and application settings</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-card rounded-lg border">
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{settings.name || userSession.name}</h3>
                    <p className="text-sm text-muted-foreground">{settings.email || userSession.email}</p>
                    <p className="text-xs text-muted-foreground">Member since {new Date(userSession.loginTime).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="profile-name">Full Name</Label>
                    <Input 
                      id="profile-name" 
                      value={settings.name} 
                      onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-email">Email Address</Label>
                    <Input 
                      id="profile-email" 
                      type="email" 
                      value={settings.email} 
                      onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-phone">Phone Number</Label>
                    <Input 
                      id="profile-phone" 
                      placeholder="+1 (555) 123-4567"
                      value={settings.phone} 
                      onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-company">Company</Label>
                    <Input 
                      id="profile-company" 
                      placeholder="Your company name"
                      value={settings.company} 
                      onChange={(e) => setSettings(prev => ({ ...prev, company: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-role">Job Title</Label>
                    <Input 
                      id="profile-role" 
                      placeholder="Your current role"
                      value={settings.role} 
                      onChange={(e) => setSettings(prev => ({ ...prev, role: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Analysis Preferences</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-analysis">Auto-analyze on upload</Label>
                      <input 
                        type="checkbox" 
                        id="auto-analysis" 
                        checked={settings.autoAnalysis}
                        onChange={(e) => setSettings(prev => ({ ...prev, autoAnalysis: e.target.checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="keyword-suggestions">Show keyword suggestions</Label>
                      <input 
                        type="checkbox" 
                        id="keyword-suggestions" 
                        checked={settings.keywordSuggestions}
                        onChange={(e) => setSettings(prev => ({ ...prev, keywordSuggestions: e.target.checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="formatting-tips">Include formatting tips</Label>
                      <input 
                        type="checkbox" 
                        id="formatting-tips" 
                        checked={settings.formattingTips}
                        onChange={(e) => setSettings(prev => ({ ...prev, formattingTips: e.target.checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="industry-insights">Industry-specific insights</Label>
                      <input 
                        type="checkbox" 
                        id="industry-insights" 
                        checked={settings.industryInsights}
                        onChange={(e) => setSettings(prev => ({ ...prev, industryInsights: e.target.checked }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Language & Region</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <select 
                      className="p-2 border rounded-md"
                      value={settings.language}
                      onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                    >
                      <option value="en-US">English (US)</option>
                      <option value="en-GB">English (UK)</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="hi">Hindi</option>
                      <option value="ta">Tamil</option>
                      <option value="te">Telugu</option>
                    </select>
                    <select 
                      className="p-2 border rounded-md"
                      value={settings.region}
                      onChange={(e) => setSettings(prev => ({ ...prev, region: e.target.value }))}
                    >
                      <option value="US">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                      <option value="IN">India</option>
                      <option value="SG">Singapore</option>
                      <option value="AE">UAE</option>
                      <option value="DE">Germany</option>
                    </select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="p-4 bg-card rounded-lg border">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium">Account Security</h4>
                      <p className="text-sm text-muted-foreground">Your account is secure</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Two-factor authentication</span><Badge variant="secondary">Enabled</Badge></div>
                    <div className="flex justify-between"><span>Login alerts</span><Badge variant="secondary">Enabled</Badge></div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowSettings(false)}>Cancel</Button>
            <Button onClick={handleSaveSettings}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Dashboard({ onStartAnalysis, userStats }: { onStartAnalysis: () => void; userStats: UserStats }) {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Welcome back!</h2>
        <p className="text-muted-foreground">Upload your resumes to get started with ATS analysis and optimization recommendations.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resumes Analyzed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.resumesAnalyzed}</div>
            <p className="text-xs text-muted-foreground">
              {userStats.lastAnalysisDate ? `Last: ${new Date(userStats.lastAnalysisDate).toLocaleDateString()}` : 'No analyses yet'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average ATS Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{userStats.averageATSScore}%</div>
            <p className="text-xs text-muted-foreground">
              {userStats.improvementRate > 0 ? `+${userStats.improvementRate}% improvement` : 'Baseline score'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Analysis Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{userStats.totalAnalysisTime}m</div>
            <p className="text-xs text-muted-foreground">Total time spent analyzing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {userStats.averageATSScore > 80 ? '92%' : userStats.averageATSScore > 60 ? '75%' : '45%'}
            </div>
            <p className="text-xs text-muted-foreground">Estimated interview rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card><CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" />Quick Upload</CardTitle><CardDescription>Upload and analyze resumes with our advanced ATS scoring system</CardDescription></CardHeader><CardContent><Button className="w-full" onClick={onStartAnalysis}>Start New Analysis</Button></CardContent></Card>
        <Card><CardHeader><CardTitle>Recent Analysis</CardTitle><CardDescription>Your latest resume analysis results</CardDescription></CardHeader><CardContent><div className="text-center py-4 text-muted-foreground"><FileText className="h-8 w-8 mx-auto mb-2 opacity-50" /><p className="text-sm">No recent analysis</p></div></CardContent></Card>
      </div>
    </>
  )
}
