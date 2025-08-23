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

  const handleExport = async () => {
    setIsExporting(true)

    // Simulate export process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // In a real implementation, this would generate and download the actual file
    const filename = `resume-analysis-report-${new Date().toISOString().split("T")[0]}.${exportOptions.format}`

    // Create a mock download
    const element = document.createElement("a")
    element.href = "data:text/plain;charset=utf-8," + encodeURIComponent("Mock export data")
    element.download = filename
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    setIsExporting(false)
    setExportComplete(true)
    setTimeout(() => setExportComplete(false), 3000)
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Analysis Reports
          </CardTitle>
          <CardDescription>Generate comprehensive reports of your resume analysis results</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="options" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="options">Export Options</TabsTrigger>
              <TabsTrigger value="candidates">Select Candidates</TabsTrigger>
              <TabsTrigger value="preview">Preview & Export</TabsTrigger>
            </TabsList>

            <TabsContent value="options" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Export Format</label>
                  <Select
                    value={exportOptions.format}
                    onValueChange={(value: any) => setExportOptions((prev) => ({ ...prev, format: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <div>
                            <div>PDF Report</div>
                            <div className="text-xs text-muted-foreground">Professional formatted report</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="csv">
                        <div className="flex items-center gap-2">
                          <Table className="h-4 w-4" />
                          <div>
                            <div>CSV Spreadsheet</div>
                            <div className="text-xs text-muted-foreground">Data for analysis</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="excel">
                        <div className="flex items-center gap-2">
                          <Table className="h-4 w-4" />
                          <div>
                            <div>Excel Workbook</div>
                            <div className="text-xs text-muted-foreground">Multiple sheets with charts</div>
                          </div>
                        </div>
                      </SelectItem>
                      <SelectItem value="json">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          <div>
                            <div>JSON Data</div>
                            <div className="text-xs text-muted-foreground">Raw data format</div>
                          </div>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Include in Report</label>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="scores"
                        checked={exportOptions.includeScores}
                        onCheckedChange={(checked) =>
                          setExportOptions((prev) => ({ ...prev, includeScores: !!checked }))
                        }
                      />
                      <label htmlFor="scores" className="text-sm">
                        ATS Scores & Breakdown
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="keywords"
                        checked={exportOptions.includeKeywords}
                        onCheckedChange={(checked) =>
                          setExportOptions((prev) => ({ ...prev, includeKeywords: !!checked }))
                        }
                      />
                      <label htmlFor="keywords" className="text-sm">
                        Keyword Analysis
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="recommendations"
                        checked={exportOptions.includeRecommendations}
                        onCheckedChange={(checked) =>
                          setExportOptions((prev) => ({ ...prev, includeRecommendations: !!checked }))
                        }
                      />
                      <label htmlFor="recommendations" className="text-sm">
                        Improvement Recommendations
                      </label>
                    </div>

                    {analyses.length > 1 && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="comparison"
                          checked={exportOptions.includeComparison}
                          onCheckedChange={(checked) =>
                            setExportOptions((prev) => ({ ...prev, includeComparison: !!checked }))
                          }
                        />
                        <label htmlFor="comparison" className="text-sm">
                          Candidate Comparison
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
                    <Button variant="outline" className="w-full mt-3 bg-transparent" disabled>
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
                    <Button variant="outline" className="w-full mt-3 bg-transparent" disabled>
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
  )
}
