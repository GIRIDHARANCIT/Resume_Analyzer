"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Upload, Settings, Crown, CheckCircle, LogOut, User, Mail, Calendar, Shield } from "lucide-react"
import { ResumeUpload } from "@/components/resume-upload"
import { ATSAnalysisDisplay } from "@/components/ats-analysis-display"
import { analyzeResume, rankResumes, type ATSAnalysisResult } from "@/lib/ats-analyzer"
import { useRouter } from "next/navigation"

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

export default function DashboardPage() {
  const [currentView, setCurrentView] = useState<"dashboard" | "upload" | "analysis">("dashboard")
  const [processedFiles, setProcessedFiles] = useState<UploadedFile[]>([])
  const [analysisResults, setAnalysisResults] = useState<ATSAnalysisResult[]>([])
  const [jobTemplate, setJobTemplate] = useState("")
  const [customJobDescription, setCustomJobDescription] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [showProPlan, setShowProPlan] = useState(false)
  const [userSession, setUserSession] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const session = localStorage.getItem("userSession")
    if (!session) {
      router.push("/")
      return
    }
    setUserSession(JSON.parse(session))
  }, [router])

  const handleFilesProcessed = (files: UploadedFile[], template: string, customJD?: string) => {
    setProcessedFiles(files)
    setJobTemplate(template)
    setCustomJobDescription(customJD || "")

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

  const handleReanalyze = () => {
    setCurrentView("upload")
    setProcessedFiles([])
    setAnalysisResults([])
  }

  const handleLogout = () => {
    localStorage.removeItem("userSession")
    router.push("/")
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
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Resume Analyzer</h1>
            </div>
            <div className="flex items-center gap-4">
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => setShowProPlan(true)}
              >
                <Crown className="h-3 w-3 mr-1" />
                Pro Plan
              </Badge>
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

      {/* Navigation */}
      <nav className="border-b bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex gap-6">
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                currentView === "dashboard"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView("upload")}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                currentView === "upload"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Upload & Analyze
            </button>
            {analysisResults.length > 0 && (
              <button
                onClick={() => setCurrentView("analysis")}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  currentView === "analysis"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Analysis Results
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === "dashboard" && <Dashboard onStartAnalysis={() => setCurrentView("upload")} />}
        {currentView === "upload" && <ResumeUpload onFilesProcessed={handleFilesProcessed} />}
        {currentView === "analysis" && <ATSAnalysisDisplay analyses={analysisResults} onReanalyze={handleReanalyze} />}
      </main>

      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl">
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
                    <h3 className="font-semibold">{userSession.name}</h3>
                    <p className="text-sm text-muted-foreground">{userSession.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Member since {new Date(userSession.loginTime).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="profile-name">Full Name</Label>
                    <Input id="profile-name" defaultValue={userSession.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-email">Email Address</Label>
                    <Input id="profile-email" type="email" defaultValue={userSession.email} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-phone">Phone Number</Label>
                    <Input id="profile-phone" placeholder="+1 (555) 123-4567" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-company">Company</Label>
                    <Input id="profile-company" placeholder="Your company name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-role">Job Title</Label>
                    <Input id="profile-role" placeholder="Your current role" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <div className="text-2xl font-bold text-primary">12</div>
                    <div className="text-sm text-muted-foreground">Resumes Analyzed</div>
                  </div>
                  <div className="text-center p-3 bg-secondary/5 rounded-lg">
                    <div className="text-2xl font-bold text-secondary">78%</div>
                    <div className="text-sm text-muted-foreground">Avg ATS Score</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4 mt-4">
              <div className="space-y-4">
                {/* Quick Scan Actions */}
                <div className="space-y-2">
                  <Label>Quick Scan Actions</Label>
                  <div className="grid gap-2">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <FileText className="h-4 w-4 mr-2" />
                      Quick ATS Score Check
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Keyword Density Analysis
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Upload className="h-4 w-4 mr-2" />
                      Bulk Resume Comparison
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Analysis Preferences</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-analysis">Auto-analyze on upload</Label>
                      <input type="checkbox" id="auto-analysis" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="keyword-suggestions">Show keyword suggestions</Label>
                      <input type="checkbox" id="keyword-suggestions" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="formatting-tips">Include formatting tips</Label>
                      <input type="checkbox" id="formatting-tips" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="industry-insights">Industry-specific insights</Label>
                      <input type="checkbox" id="industry-insights" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email Notifications</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="email-analysis" defaultChecked />
                      <Label htmlFor="email-analysis">Analysis completion notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="email-tips" defaultChecked />
                      <Label htmlFor="email-tips">Weekly resume tips and insights</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="email-updates" />
                      <Label htmlFor="email-updates">Product updates and new features</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Default Analysis Mode</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Comprehensive Analysis</option>
                    <option>Quick Scan</option>
                    <option>Keyword Focus</option>
                    <option>ATS Optimization</option>
                    <option>Industry Specific</option>
                  </select>
                </div>

                {/* Score Thresholds */}
                <div className="space-y-2">
                  <Label>Score Thresholds</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="min-score">Minimum ATS Score Alert</Label>
                      <Input id="min-score" type="number" defaultValue="70" className="w-20" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="keyword-threshold">Keyword Match Threshold</Label>
                      <Input id="keyword-threshold" type="number" defaultValue="60" className="w-20" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option>PDF Report</option>
                    <option>Excel Spreadsheet</option>
                    <option>JSON Data</option>
                    <option>Word Document</option>
                    <option>CSV Summary</option>
                  </select>
                </div>

                {/* Language and Region settings */}
                <div className="space-y-2">
                  <Label>Language & Region</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <select className="p-2 border rounded-md">
                      <option>English (US)</option>
                      <option>English (UK)</option>
                      <option>Spanish</option>
                      <option>French</option>
                    </select>
                    <select className="p-2 border rounded-md">
                      <option>United States</option>
                      <option>United Kingdom</option>
                      <option>Canada</option>
                      <option>Australia</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Theme Preference</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option>System Default</option>
                    <option>Light Mode</option>
                    <option>Dark Mode</option>
                  </select>
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
                    <div className="flex justify-between">
                      <span>Two-factor authentication</span>
                      <Badge variant="secondary">Enabled</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Last login</span>
                      <span className="text-muted-foreground">{new Date(userSession.loginTime).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Change Password</Label>
                  <Input type="password" placeholder="Current password" />
                  <Input type="password" placeholder="New password" />
                  <Input type="password" placeholder="Confirm new password" />
                  <Button variant="outline" className="w-full bg-transparent">
                    Update Password
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Data & Privacy</Label>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Mail className="h-4 w-4 mr-2" />
                      Download My Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Calendar className="h-4 w-4 mr-2" />
                      View Login History
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button variant="destructive" className="w-full">
                    Delete Account
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">This action cannot be undone</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowSettings(false)}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pro Plan Modal */}
      <Dialog open={showProPlan} onOpenChange={setShowProPlan}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Pro Plan Features
            </DialogTitle>
            <DialogDescription>Unlock advanced features for professional resume optimization</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Unlimited resume uploads</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Advanced ATS scoring algorithms</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>AI-powered resume rewriting</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Career insights and recommendations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Priority customer support</span>
              </div>
            </div>
            <div className="text-center py-4">
              <div className="text-2xl font-bold">$19.99/month</div>
              <div className="text-sm text-muted-foreground">Cancel anytime</div>
            </div>
            <Button onClick={() => setShowProPlan(false)} className="w-full">
              Upgrade to Pro
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Dashboard({ onStartAnalysis }: { onStartAnalysis: () => void }) {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Welcome back!</h2>
        <p className="text-muted-foreground">
          Upload your resumes to get started with ATS analysis and optimization recommendations.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resumes Analyzed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average ATS Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">78%</div>
            <p className="text-xs text-muted-foreground">+5% improvement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Keywords Optimized</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">156</div>
            <p className="text-xs text-muted-foreground">Across all resumes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">92%</div>
            <p className="text-xs text-muted-foreground">Interview callbacks</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Quick Upload
            </CardTitle>
            <CardDescription>Upload and analyze resumes with our advanced ATS scoring system</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={onStartAnalysis}>
              Start New Analysis
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Analysis</CardTitle>
            <CardDescription>Your latest resume analysis results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent analysis</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
