"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileText, Table, BarChart3, Mail, Share2, CheckCircle } from "lucide-react"
import type { ATSAnalysisResult } from "@/lib/ats-analyzer"

interface ExportReportsProps {
  analyses: ATSAnalysisResult[]
}

interface ExportOptions {
  format: "pdf" | "csv" | "excel" | "json"
  includeScores: boolean
  includeKeywords: boolean
  includeRecommendations: boolean
  includeComparison: boolean
  selectedCandidates: string[]
}

export function ExportReports({ analyses }: ExportReportsProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "pdf",
    includeScores: true,
    includeKeywords: true,
    includeRecommendations: true,
    includeComparison: analyses.length > 1,
    selectedCandidates: analyses.map((a) => a.candidateId),
  })
  const [isExporting, setIsExporting] = useState(false)
  const [exportComplete, setExportComplete] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    message: ''
  })
  const [shareData, setShareData] = useState({
    expiresIn: 7,
    password: ''
  })
  const [shareLink, setShareLink] = useState('')

  const handleExport = async () => {
    setIsExporting(true)

    try {
      const selectedAnalyses = analyses.filter(a => 
        exportOptions.selectedCandidates.includes(a.candidateId)
      )

      const response = await fetch('/api/reports/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analyses: selectedAnalyses,
          reportType: 'detailed',
          format: exportOptions.format,
          options: exportOptions
        }),
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Handle different response types
      if (exportOptions.format === 'pdf') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `resume-analysis-${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `resume-analysis-${new Date().toISOString().split('T')[0]}.${exportOptions.format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }

      setExportComplete(true)
      setTimeout(() => setExportComplete(false), 3000)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleCandidateSelection = (candidateId: string, checked: boolean) => {
    setExportOptions((prev) => ({
      ...prev,
      selectedCandidates: checked
        ? [...prev.selectedCandidates, candidateId]
        : prev.selectedCandidates.filter((id) => id !== candidateId),
    }))
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "pdf":
        return <FileText className="h-4 w-4" />
      case "csv":
      case "excel":
        return <Table className="h-4 w-4" />
      case "json":
        return <BarChart3 className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getFormatDescription = (format: string) => {
    switch (format) {
      case "pdf":
        return "Professional report with charts and formatting"
      case "csv":
        return "Spreadsheet format for data analysis"
      case "excel":
        return "Excel workbook with multiple sheets"
      case "json":
        return "Raw data format for developers"
      default:
        return ""
    }
  }

  const handleEmailReport = async () => {
    try {
      const selectedAnalyses = analyses.filter(a => 
        exportOptions.selectedCandidates.includes(a.candidateId)
      )

      const response = await fetch('/api/reports/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailData.to,
          subject: emailData.subject || `Resume Analysis Report - ${new Date().toLocaleDateString()}`,
          reportData: {
            analyses: selectedAnalyses,
            reportType: 'detailed',
            format: exportOptions.format
          },
          userEmail: 'user@example.com' // This should come from user session
        }),
      })

      if (!response.ok) {
        throw new Error('Email failed')
      }

      const result = await response.json()
      if (result.success) {
        alert('Report sent successfully!')
        setShowEmailDialog(false)
        setEmailData({ to: '', subject: '', message: '' })
      } else {
        throw new Error(result.error || 'Email failed')
      }
    } catch (error) {
      console.error('Email failed:', error)
      alert('Failed to send email. Please try again.')
    }
  }

  const handleShareReport = async () => {
    try {
      const selectedAnalyses = analyses.filter(a => 
        exportOptions.selectedCandidates.includes(a.candidateId)
      )

      const response = await fetch('/api/reports/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analyses: selectedAnalyses,
          reportType: 'detailed',
          format: exportOptions.format,
          userEmail: 'user@example.com', // This should come from user session
          expiresIn: shareData.expiresIn
        }),
      })

      if (!response.ok) {
        throw new Error('Share failed')
      }

      const result = await response.json()
      if (result.success) {
        setShareLink(result.shareUrl)
        setShowShareDialog(false)
      } else {
        throw new Error(result.error || 'Share failed')
      }
    } catch (error) {
      console.error('Share failed:', error)
      alert('Failed to create share link. Please try again.')
    }
  }

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Reports
            </CardTitle>
            <CardDescription>
              Generate and download detailed analysis reports in multiple formats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="options" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="options">Options</TabsTrigger>
                <TabsTrigger value="candidates">Candidates</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="options" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Export Format</h3>
                    <div className="space-y-3">
                      {["pdf", "csv", "excel", "json"].map((format) => (
                        <div
                          key={format}
                          className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                            exportOptions.format === format
                              ? "border-primary bg-primary/5"
                              : "hover:bg-muted/50"
                          }`}
                          onClick={() =>
                            setExportOptions((prev) => ({ ...prev, format: format as any }))
                          }
                        >
                          {getFormatIcon(format)}
                          <div className="flex-1">
                            <div className="font-medium capitalize">{format.toUpperCase()}</div>
                            <div className="text-xs text-muted-foreground">
                              {getFormatDescription(format)}
                            </div>
                          </div>
                          <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/20" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Include Sections</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="include-scores"
                          checked={exportOptions.includeScores}
                          onCheckedChange={(checked) =>
                            setExportOptions((prev) => ({ ...prev, includeScores: !!checked }))
                          }
                        />
                        <label htmlFor="include-scores" className="text-sm font-medium">
                          ATS Scores
                        </label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="include-keywords"
                          checked={exportOptions.includeKeywords}
                          onCheckedChange={(checked) =>
                            setExportOptions((prev) => ({ ...prev, includeKeywords: !!checked }))
                          }
                        />
                        <label htmlFor="include-keywords" className="text-sm font-medium">
                          Keyword Analysis
                        </label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="include-recommendations"
                          checked={exportOptions.includeRecommendations}
                          onCheckedChange={(checked) =>
                            setExportOptions((prev) => ({ ...prev, includeRecommendations: !!checked }))
                          }
                        />
                        <label htmlFor="include-recommendations" className="text-sm font-medium">
                          Recommendations
                        </label>
                      </div>
                      {analyses.length > 1 && (
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="include-comparison"
                            checked={exportOptions.includeComparison}
                            onCheckedChange={(checked) =>
                              setExportOptions((prev) => ({ ...prev, includeComparison: !!checked }))
                            }
                          />
                          <label htmlFor="include-comparison" className="text-sm font-medium">
                            Comparison Chart
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="candidates" className="space-y-4">
                <div>
                  <h3 className="font-medium mb-3">Select Candidates to Include</h3>
                  <div className="space-y-2">
                    {analyses.map((analysis) => (
                      <div key={analysis.candidateId} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={analysis.candidateId}
                          checked={exportOptions.selectedCandidates.includes(analysis.candidateId)}
                          onCheckedChange={(checked) => handleCandidateSelection(analysis.candidateId, !!checked)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{analysis.candidateName}</span>
                            <Badge variant="outline">Rank #{analysis.rank}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{analysis.candidateRole}</span>
                            <span>ATS Score: {analysis.atsScore.overall}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Export Preview</CardTitle>
                    <CardDescription>Review your export settings before generating the report</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Format</h4>
                        <div className="flex items-center gap-2 p-2 border rounded">
                          {getFormatIcon(exportOptions.format)}
                          <div>
                            <div className="font-medium capitalize">{exportOptions.format.toUpperCase()}</div>
                            <div className="text-xs text-muted-foreground">
                              {getFormatDescription(exportOptions.format)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Candidates</h4>
                        <div className="p-2 border rounded">
                          <div className="font-medium">{exportOptions.selectedCandidates.length} selected</div>
                          <div className="text-xs text-muted-foreground">
                            {exportOptions.selectedCandidates.length === analyses.length
                              ? "All candidates"
                              : "Partial selection"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Included Sections</h4>
                      <div className="flex flex-wrap gap-2">
                        {exportOptions.includeScores && <Badge variant="outline">ATS Scores</Badge>}
                        {exportOptions.includeKeywords && <Badge variant="outline">Keywords</Badge>}
                        {exportOptions.includeRecommendations && <Badge variant="outline">Recommendations</Badge>}
                        {exportOptions.includeComparison && <Badge variant="outline">Comparison</Badge>}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button
                        onClick={handleExport}
                        disabled={isExporting || exportOptions.selectedCandidates.length === 0}
                        className="w-full"
                        size="lg"
                      >
                        {isExporting ? (
                          <>
                            <Download className="h-4 w-4 mr-2 animate-pulse" />
                            Generating Report...
                          </>
                        ) : exportComplete ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                            Report Downloaded!
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Generate & Download Report
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-8 w-8 text-blue-600" />
                        <div>
                          <h3 className="font-medium">Email Report</h3>
                          <p className="text-sm text-muted-foreground">Send report to stakeholders</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full mt-3 bg-transparent" 
                        onClick={() => setShowEmailDialog(true)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Email Report
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Share2 className="h-8 w-8 text-green-600" />
                        <div>
                          <h3 className="font-medium">Share Link</h3>
                          <p className="text-sm text-muted-foreground">Generate shareable link</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full mt-3 bg-transparent" 
                        onClick={() => setShowShareDialog(true)}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Create Share Link
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Email Dialog */}
      {showEmailDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Email Report</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">To:</label>
                <input
                  type="email"
                  value={emailData.to}
                  onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  placeholder="recipient@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subject:</label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  placeholder="Resume Analysis Report"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message:</label>
                <textarea
                  value={emailData.message}
                  onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full p-2 border rounded-md h-20"
                  placeholder="Optional message..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleEmailReport} className="flex-1">Send Email</Button>
                <Button variant="outline" onClick={() => setShowEmailDialog(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Dialog */}
      {showShareDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Share Report</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Expires in (days):</label>
                <select
                  value={shareData.expiresIn}
                  onChange={(e) => setShareData(prev => ({ ...prev, expiresIn: parseInt(e.target.value) }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value={1}>1 day</option>
                  <option value={7}>7 days</option>
                  <option value={30}>30 days</option>
                  <option value={90}>90 days</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleShareReport} className="flex-1">Create Share Link</Button>
                <Button variant="outline" onClick={() => setShowShareDialog(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Link Display */}
      {shareLink && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Share Link Created</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Share Link:</label>
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="w-full p-2 border rounded-md bg-gray-50"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink)
                    alert('Link copied to clipboard!')
                  }}
                  className="flex-1"
                >
                  Copy Link
                </Button>
                <Button variant="outline" onClick={() => setShareLink('')}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
