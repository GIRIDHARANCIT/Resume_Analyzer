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
import { SpeedometerChart } from "@/components/speedometer-chart"
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  return (
    <div className="space-y-6">
      {selectedAnalysis && (
        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">ATS Analysis Results</CardTitle>
            <CardDescription className="text-lg">
              {selectedAnalysis.candidateName} - {selectedAnalysis.candidateRole}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
              {/* Speedometer Chart */}
              <div className="flex-shrink-0">
                <SpeedometerChart score={selectedAnalysis.atsScore.overall} size={240} />
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-6 lg:gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {selectedAnalysis.keywordAnalysis.matched.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Keywords Matched</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {selectedAnalysis.keywordAnalysis.missing.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Keywords Missing</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {selectedAnalysis.sectionAnalysis.completenessScore}%
                  </div>
                  <div className="text-sm text-muted-foreground">Section Complete</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">#{selectedAnalysis.rank}</div>
                  <div className="text-sm text-muted-foreground">Overall Rank</div>
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
              getScoreColor={getScoreColor}
              getScoreBadgeVariant={getScoreBadgeVariant}
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
              getScoreColor={getScoreColor}
              getScoreBadgeVariant={getScoreBadgeVariant}
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

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button onClick={onReanalyze} variant="outline">
          Analyze New Resumes
        </Button>
      </div>
    </div>
  )
}

function IndividualAnalysis({
  analyses,
  selectedAnalysis,
  setSelectedAnalysis,
  getScoreColor,
  getScoreBadgeVariant,
}: {
  analyses: ATSAnalysisResult[]
  selectedAnalysis: ATSAnalysisResult | null
  setSelectedAnalysis: (analysis: ATSAnalysisResult | null) => void
  getScoreColor: (score: number) => string
  getScoreBadgeVariant: (score: number) => "default" | "secondary" | "destructive"
}) {
  return (
    <>
      {/* Overview Cards */}
      {analyses.length > 1 && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Resumes Analyzed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analyses.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Highest Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${getScoreColor(Math.max(...analyses.map((a) => a.atsScore.overall)))}`}
              >
                {Math.max(...analyses.map((a) => a.atsScore.overall))}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${getScoreColor(Math.round(analyses.reduce((sum, a) => sum + a.atsScore.overall, 0) / analyses.length))}`}
              >
                {Math.round(analyses.reduce((sum, a) => sum + a.atsScore.overall, 0) / analyses.length)}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resume Selection */}
      {analyses.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Resume Rankings
            </CardTitle>
            <CardDescription>Click on a resume to view detailed analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyses.map((analysis) => (
                <div
                  key={analysis.candidateId}
                  onClick={() => setSelectedAnalysis(analysis)}
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedAnalysis?.candidateId === analysis.candidateId
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      #{analysis.rank}
                    </div>
                    <div>
                      <p className="font-medium">{analysis.candidateName}</p>
                      <p className="text-sm text-muted-foreground">{analysis.candidateRole}</p>
                    </div>
                  </div>
                  <Badge variant={getScoreBadgeVariant(analysis.atsScore.overall)}>
                    {analysis.atsScore.overall}% ATS Score
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analysis */}
      {selectedAnalysis && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  ATS Score Breakdown - {selectedAnalysis.candidateName}
                </CardTitle>
                <CardDescription>Detailed scoring across all evaluation criteria</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall Score */}
                <div className="text-center">
                  <div className={`text-4xl font-bold mb-2 ${getScoreColor(selectedAnalysis.atsScore.overall)}`}>
                    {selectedAnalysis.atsScore.overall}%
                  </div>
                  <p className="text-muted-foreground">Overall ATS Score</p>
                </div>

                {/* Score Breakdown */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Keyword Match</span>
                      <span className={getScoreColor(selectedAnalysis.atsScore.keywordMatch)}>
                        {selectedAnalysis.atsScore.keywordMatch}%
                      </span>
                    </div>
                    <Progress value={selectedAnalysis.atsScore.keywordMatch} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Section Completeness</span>
                      <span className={getScoreColor(selectedAnalysis.atsScore.sectionCompleteness)}>
                        {selectedAnalysis.atsScore.sectionCompleteness}%
                      </span>
                    </div>
                    <Progress value={selectedAnalysis.atsScore.sectionCompleteness} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Formatting Quality</span>
                      <span className={getScoreColor(selectedAnalysis.atsScore.formatting)}>
                        {selectedAnalysis.atsScore.formatting}%
                      </span>
                    </div>
                    <Progress value={selectedAnalysis.atsScore.formatting} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Readability</span>
                      <span className={getScoreColor(selectedAnalysis.atsScore.readability)}>
                        {selectedAnalysis.atsScore.readability}%
                      </span>
                    </div>
                    <Progress value={selectedAnalysis.atsScore.readability} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keywords" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    Matched Keywords ({selectedAnalysis.keywordAnalysis.matched.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedAnalysis.keywordAnalysis.matched.map((keyword) => (
                      <Badge key={keyword} variant="default" className="bg-green-100 text-green-800">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-5 w-5" />
                    Missing Keywords ({selectedAnalysis.keywordAnalysis.missing.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedAnalysis.keywordAnalysis.missing.slice(0, 10).map((keyword) => (
                      <Badge key={keyword} variant="outline" className="border-red-200 text-red-600">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                  {selectedAnalysis.keywordAnalysis.missing.length > 10 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      +{selectedAnalysis.keywordAnalysis.missing.length - 10} more keywords
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Keyword Analysis Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Keyword Density</p>
                    <p className="text-2xl font-bold">{Math.round(selectedAnalysis.keywordAnalysis.density * 100)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Relevance Score</p>
                    <p
                      className={`text-2xl font-bold ${getScoreColor(selectedAnalysis.keywordAnalysis.relevanceScore)}`}
                    >
                      {selectedAnalysis.keywordAnalysis.relevanceScore}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Resume Sections Analysis
                </CardTitle>
                <CardDescription>
                  Completeness score: {selectedAnalysis.sectionAnalysis.completenessScore}%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(selectedAnalysis.sectionAnalysis).map(([section, present]) => {
                    if (section === "completenessScore") return null
                    return (
                      <div key={section} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          {present ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="capitalize font-medium">{section}</span>
                        </div>
                        <Badge variant={present ? "default" : "outline"}>{present ? "Present" : "Missing"}</Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Personalized Recommendations
                </CardTitle>
                <CardDescription>
                  {selectedAnalysis.recommendations.length} recommendations to improve your ATS score
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedAnalysis.recommendations.map((rec, index) => (
                  <Alert
                    key={index}
                    className={
                      rec.type === "critical"
                        ? "border-red-200 bg-red-50"
                        : rec.type === "important"
                          ? "border-yellow-200 bg-yellow-50"
                          : "border-blue-200 bg-blue-50"
                    }
                  >
                    <div className="flex items-start gap-3">
                      {rec.type === "critical" ? (
                        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      ) : rec.type === "important" ? (
                        <TrendingUp className="h-5 w-5 text-yellow-600 mt-0.5" />
                      ) : (
                        <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{rec.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {rec.impact} impact
                          </Badge>
                        </div>
                        <AlertDescription>{rec.description}</AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </>
  )
}
