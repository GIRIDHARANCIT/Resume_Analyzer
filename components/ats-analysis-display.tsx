"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BarChart3,
  Target,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Award,
  FileText,
  Lightbulb,
} from "lucide-react"
import { ComparisonDashboard } from "@/components/comparison-dashboard"
import { ResumeRewriter } from "@/components/resume-rewriter"
import { CareerInsights } from "@/components/career-insights"
import { Gamification } from "@/components/gamification"
import { ExportReports } from "@/components/export-reports"
import type { ATSAnalysisResult } from "@/lib/ats-analyzer"

interface ATSAnalysisDisplayProps {
  analyses: ATSAnalysisResult[]
  onReanalyze?: () => void
}

export function ATSAnalysisDisplay({ analyses, onReanalyze }: ATSAnalysisDisplayProps) {
  const [selectedAnalysis, setSelectedAnalysis] = useState<ATSAnalysisResult | null>(
    analyses.length > 0 ? analyses[0] : null,
  )

  if (analyses.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No analysis results available</p>
        </CardContent>
      </Card>
    )
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  return (
    <div className="space-y-6">
      {selectedAnalysis && (
        <Card className="border bg-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">ATS Analysis Results</CardTitle>
            <CardDescription className="text-lg">
              {selectedAnalysis.candidateName} - {selectedAnalysis.candidateRole}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 items-center gap-6">
              <div className="flex flex-col items-center">
                <div className="text-5xl font-extrabold">{selectedAnalysis.atsScore.overall}</div>
                <Badge className="mt-2" variant={getScoreBadgeVariant(selectedAnalysis.atsScore.overall)}>
                  Overall Score
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 lg:col-span-3">
                <div className="p-4 rounded-md border text-center">
                  <div className="text-sm text-muted-foreground">Keyword Match</div>
                  <div className="text-2xl font-semibold">{selectedAnalysis.atsScore.keywordMatch}%</div>
                </div>
                <div className="p-4 rounded-md border text-center">
                  <div className="text-sm text-muted-foreground">Formatting</div>
                  <div className="text-2xl font-semibold">{selectedAnalysis.atsScore.formatting}%</div>
                </div>
                <div className="p-4 rounded-md border text-center">
                  <div className="text-sm text-muted-foreground">Section Completeness</div>
                  <div className="text-2xl font-semibold">{selectedAnalysis.atsScore.sectionCompleteness}%</div>
                </div>
                <div className="p-4 rounded-md border text-center">
                  <div className="text-sm text-muted-foreground">Readability</div>
                  <div className="text-2xl font-semibold">{selectedAnalysis.atsScore.readability}%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Analysis Tabs */}
      {analyses.length > 1 ? (
        <Tabs defaultValue="comparison" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="individual">Individual</TabsTrigger>
            <TabsTrigger value="rewriter">AI Rewriter</TabsTrigger>
            <TabsTrigger value="insights">Career Insights</TabsTrigger>
            <TabsTrigger value="gamification">Progress</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="comparison">
            <ComparisonDashboard analyses={analyses} />
          </TabsContent>

          <TabsContent value="individual">
            <IndividualAnalysis
              analyses={analyses}
              selectedAnalysis={selectedAnalysis}
              setSelectedAnalysis={setSelectedAnalysis}
            />
          </TabsContent>

          <TabsContent value="rewriter">
            {selectedAnalysis && <ResumeRewriter analysis={selectedAnalysis} />}
          </TabsContent>

          <TabsContent value="insights">
            {selectedAnalysis && <CareerInsights analysis={selectedAnalysis} />}
          </TabsContent>

          <TabsContent value="gamification">
            {selectedAnalysis && <Gamification analyses={analyses} currentAnalysis={selectedAnalysis} />}
          </TabsContent>

          <TabsContent value="export">
            <ExportReports analyses={analyses} />
          </TabsContent>
        </Tabs>
      ) : (
        <Tabs defaultValue="individual" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="individual">Analysis</TabsTrigger>
            <TabsTrigger value="rewriter">AI Rewriter</TabsTrigger>
            <TabsTrigger value="insights">Career Insights</TabsTrigger>
            <TabsTrigger value="gamification">Progress</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="individual">
            <IndividualAnalysis
              analyses={analyses}
              selectedAnalysis={selectedAnalysis}
              setSelectedAnalysis={setSelectedAnalysis}
            />
          </TabsContent>

          <TabsContent value="rewriter">
            {selectedAnalysis && <ResumeRewriter analysis={selectedAnalysis} />}
          </TabsContent>

          <TabsContent value="insights">
            {selectedAnalysis && <CareerInsights analysis={selectedAnalysis} />}
          </TabsContent>

          <TabsContent value="gamification">
            {selectedAnalysis && <Gamification analyses={analyses} currentAnalysis={selectedAnalysis} />}
          </TabsContent>

          <TabsContent value="export">
            <ExportReports analyses={analyses} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

function IndividualAnalysis({
  analyses,
  selectedAnalysis,
  setSelectedAnalysis,
}: {
  analyses: ATSAnalysisResult[]
  selectedAnalysis: ATSAnalysisResult | null
  setSelectedAnalysis: (a: ATSAnalysisResult) => void
}) {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-3">
        {analyses.map((a) => (
          <button
            key={a.candidateId}
            onClick={() => setSelectedAnalysis(a)}
            className={`w-full text-left p-3 rounded-md border hover:bg-muted ${
              selectedAnalysis?.candidateId === a.candidateId ? 'bg-muted' : ''
            }`}
          >
            <div className="font-medium">{a.candidateName}</div>
            <div className="text-sm text-muted-foreground">{a.candidateRole}</div>
          </button>
        ))}
      </div>

      <div className="lg:col-span-2 space-y-4">
        {selectedAnalysis && (
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>{selectedAnalysis.candidateName}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-md border text-center">
                  <div className="text-xs text-muted-foreground">Overall</div>
                  <div className="text-xl font-semibold">{selectedAnalysis.atsScore.overall}</div>
                </div>
                <div className="p-3 rounded-md border text-center">
                  <div className="text-xs text-muted-foreground">Keywords</div>
                  <div className="text-xl font-semibold">{selectedAnalysis.atsScore.keywordMatch}</div>
                </div>
                <div className="p-3 rounded-md border text-center">
                  <div className="text-xs text-muted-foreground">Formatting</div>
                  <div className="text-xl font-semibold">{selectedAnalysis.atsScore.formatting}</div>
                </div>
                <div className="p-3 rounded-md border text-center">
                  <div className="text-xs text-muted-foreground">Sections</div>
                  <div className="text-xl font-semibold">{selectedAnalysis.atsScore.sectionCompleteness}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
