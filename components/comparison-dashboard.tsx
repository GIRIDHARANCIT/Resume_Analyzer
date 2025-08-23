"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
} from "recharts"
import { TrendingUp, BarChart3, Users, Target, Award, ArrowUpDown, Download } from "lucide-react"
import type { ATSAnalysisResult } from "@/lib/ats-analyzer"

interface ComparisonDashboardProps {
  analyses: ATSAnalysisResult[]
  onExport?: () => void
}

type SortField = "rank" | "overall" | "keywords" | "sections" | "formatting" | "readability"
type SortOrder = "asc" | "desc"

export function ComparisonDashboard({ analyses, onExport }: ComparisonDashboardProps) {
  const [sortField, setSortField] = useState<SortField>("rank")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [selectedMetric, setSelectedMetric] = useState<
    "overall" | "keywords" | "sections" | "formatting" | "readability"
  >("overall")

  if (analyses.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No analysis data available for comparison</p>
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

  const sortedAnalyses = [...analyses].sort((a, b) => {
    let aValue: number, bValue: number

    switch (sortField) {
      case "rank":
        aValue = a.rank || 0
        bValue = b.rank || 0
        break
      case "overall":
        aValue = a.atsScore.overall
        bValue = b.atsScore.overall
        break
      case "keywords":
        aValue = a.atsScore.keywordMatch
        bValue = b.atsScore.keywordMatch
        break
      case "sections":
        aValue = a.atsScore.sectionCompleteness
        bValue = b.atsScore.sectionCompleteness
        break
      case "formatting":
        aValue = a.atsScore.formatting
        bValue = b.atsScore.formatting
        break
      case "readability":
        aValue = a.atsScore.readability
        bValue = b.atsScore.readability
        break
      default:
        aValue = a.rank || 0
        bValue = b.rank || 0
    }

    return sortOrder === "asc" ? aValue - bValue : bValue - aValue
  })

  // Prepare chart data
  const chartData = analyses.map((analysis) => ({
    name: analysis.candidateName.split(" ")[0], // First name only for chart
    overall: analysis.atsScore.overall,
    keywords: analysis.atsScore.keywordMatch,
    sections: analysis.atsScore.sectionCompleteness,
    formatting: analysis.atsScore.formatting,
    readability: analysis.atsScore.readability,
    rank: analysis.rank,
  }))

  // Radar chart data for top 3 candidates
  const radarData = [
    {
      metric: "Keywords",
      ...analyses
        .slice(0, 3)
        .reduce((acc, analysis, index) => ({ ...acc, [`candidate${index + 1}`]: analysis.atsScore.keywordMatch }), {}),
    },
    {
      metric: "Sections",
      ...analyses
        .slice(0, 3)
        .reduce(
          (acc, analysis, index) => ({ ...acc, [`candidate${index + 1}`]: analysis.atsScore.sectionCompleteness }),
          {},
        ),
    },
    {
      metric: "Formatting",
      ...analyses
        .slice(0, 3)
        .reduce((acc, analysis, index) => ({ ...acc, [`candidate${index + 1}`]: analysis.atsScore.formatting }), {}),
    },
    {
      metric: "Readability",
      ...analyses
        .slice(0, 3)
        .reduce((acc, analysis, index) => ({ ...acc, [`candidate${index + 1}`]: analysis.atsScore.readability }), {}),
    },
  ]

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 opacity-50" />
    return <ArrowUpDown className={`h-4 w-4 ${sortOrder === "asc" ? "rotate-180" : ""}`} />
  }

  // Calculate statistics
  const avgScore = Math.round(analyses.reduce((sum, a) => sum + a.atsScore.overall, 0) / analyses.length)
  const highestScore = Math.max(...analyses.map((a) => a.atsScore.overall))
  const lowestScore = Math.min(...analyses.map((a) => a.atsScore.overall))
  const topPerformer = analyses.find((a) => a.atsScore.overall === highestScore)

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Candidates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyses.length}</div>
            <p className="text-xs text-muted-foreground">Analyzed resumes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(avgScore)}`}>{avgScore}%</div>
            <p className="text-xs text-muted-foreground">Across all resumes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              Top Performer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(highestScore)}`}>{highestScore}%</div>
            <p className="text-xs text-muted-foreground">{topPerformer?.candidateName}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Score Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highestScore - lowestScore}%</div>
            <p className="text-xs text-muted-foreground">
              {lowestScore}% - {highestScore}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="comparison" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="comparison">Comparison Table</TabsTrigger>
          <TabsTrigger value="charts">Score Charts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Resume Comparison Table
                  </CardTitle>
                  <CardDescription>
                    Compare ATS scores across all candidates. Click column headers to sort.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={onExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("rank")}>
                        <div className="flex items-center gap-2">Rank {getSortIcon("rank")}</div>
                      </TableHead>
                      <TableHead>Candidate</TableHead>
                      <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("overall")}>
                        <div className="flex items-center gap-2">Overall Score {getSortIcon("overall")}</div>
                      </TableHead>
                      <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("keywords")}>
                        <div className="flex items-center gap-2">Keywords {getSortIcon("keywords")}</div>
                      </TableHead>
                      <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("sections")}>
                        <div className="flex items-center gap-2">Sections {getSortIcon("sections")}</div>
                      </TableHead>
                      <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("formatting")}>
                        <div className="flex items-center gap-2">Formatting {getSortIcon("formatting")}</div>
                      </TableHead>
                      <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort("readability")}>
                        <div className="flex items-center gap-2">Readability {getSortIcon("readability")}</div>
                      </TableHead>
                      <TableHead>Keywords Match</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedAnalyses.map((analysis) => (
                      <TableRow key={analysis.candidateId}>
                        <TableCell>
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                            #{analysis.rank}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{analysis.candidateName}</p>
                            <p className="text-sm text-muted-foreground">{analysis.candidateRole}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getScoreBadgeVariant(analysis.atsScore.overall)}>
                            {analysis.atsScore.overall}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={analysis.atsScore.keywordMatch} className="w-16 h-2" />
                            <span className={`text-sm ${getScoreColor(analysis.atsScore.keywordMatch)}`}>
                              {analysis.atsScore.keywordMatch}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={analysis.atsScore.sectionCompleteness} className="w-16 h-2" />
                            <span className={`text-sm ${getScoreColor(analysis.atsScore.sectionCompleteness)}`}>
                              {analysis.atsScore.sectionCompleteness}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={analysis.atsScore.formatting} className="w-16 h-2" />
                            <span className={`text-sm ${getScoreColor(analysis.atsScore.formatting)}`}>
                              {analysis.atsScore.formatting}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={analysis.atsScore.readability} className="w-16 h-2" />
                            <span className={`text-sm ${getScoreColor(analysis.atsScore.readability)}`}>
                              {analysis.atsScore.readability}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <span className="text-green-600">{analysis.keywordAnalysis.matched.length}</span>
                            <span className="text-muted-foreground"> / </span>
                            <span className="text-red-600">{analysis.keywordAnalysis.missing.length}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Score Comparison</CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-2">
                    <span>Metric:</span>
                    <Select value={selectedMetric} onValueChange={(value: any) => setSelectedMetric(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="overall">Overall</SelectItem>
                        <SelectItem value="keywords">Keywords</SelectItem>
                        <SelectItem value="sections">Sections</SelectItem>
                        <SelectItem value="formatting">Formatting</SelectItem>
                        <SelectItem value="readability">Readability</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey={selectedMetric} fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top 3 Candidates Radar</CardTitle>
                <CardDescription>Multi-dimensional comparison of top performers</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar
                      name="1st Place"
                      dataKey="candidate1"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.1}
                    />
                    <Radar
                      name="2nd Place"
                      dataKey="candidate2"
                      stroke="hsl(var(--secondary))"
                      fill="hsl(var(--secondary))"
                      fillOpacity={0.1}
                    />
                    <Radar
                      name="3rd Place"
                      dataKey="candidate3"
                      stroke="hsl(var(--accent))"
                      fill="hsl(var(--accent))"
                      fillOpacity={0.1}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Score Distribution</CardTitle>
              <CardDescription>Overall ATS score distribution across all candidates</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData.sort((a, b) => a.rank - b.rank)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="overall" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Score Distribution</CardTitle>
                <CardDescription>How candidates perform across different score ranges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      range: "80-100%",
                      label: "Excellent",
                      count: analyses.filter((a) => a.atsScore.overall >= 80).length,
                      color: "bg-green-500",
                    },
                    {
                      range: "60-79%",
                      label: "Good",
                      count: analyses.filter((a) => a.atsScore.overall >= 60 && a.atsScore.overall < 80).length,
                      color: "bg-yellow-500",
                    },
                    {
                      range: "40-59%",
                      label: "Fair",
                      count: analyses.filter((a) => a.atsScore.overall >= 40 && a.atsScore.overall < 60).length,
                      color: "bg-orange-500",
                    },
                    {
                      range: "0-39%",
                      label: "Poor",
                      count: analyses.filter((a) => a.atsScore.overall < 40).length,
                      color: "bg-red-500",
                    },
                  ].map((item) => (
                    <div key={item.range} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="font-medium">{item.label}</span>
                        <span className="text-sm text-muted-foreground">({item.range})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{item.count}</span>
                        <span className="text-sm text-muted-foreground">
                          ({Math.round((item.count / analyses.length) * 100)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common Strengths & Weaknesses</CardTitle>
                <CardDescription>Areas where candidates excel or need improvement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">Strengths</h4>
                    <div className="space-y-2">
                      {[
                        {
                          area: "Formatting Quality",
                          avg: Math.round(
                            analyses.reduce((sum, a) => sum + a.atsScore.formatting, 0) / analyses.length,
                          ),
                        },
                        {
                          area: "Section Completeness",
                          avg: Math.round(
                            analyses.reduce((sum, a) => sum + a.atsScore.sectionCompleteness, 0) / analyses.length,
                          ),
                        },
                      ]
                        .filter((item) => item.avg >= 70)
                        .map((item) => (
                          <div key={item.area} className="flex justify-between">
                            <span className="text-sm">{item.area}</span>
                            <span className="text-sm font-medium text-green-600">{item.avg}%</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-red-600 mb-2">Areas for Improvement</h4>
                    <div className="space-y-2">
                      {[
                        {
                          area: "Keyword Matching",
                          avg: Math.round(
                            analyses.reduce((sum, a) => sum + a.atsScore.keywordMatch, 0) / analyses.length,
                          ),
                        },
                        {
                          area: "Readability",
                          avg: Math.round(
                            analyses.reduce((sum, a) => sum + a.atsScore.readability, 0) / analyses.length,
                          ),
                        },
                      ]
                        .filter((item) => item.avg < 70)
                        .map((item) => (
                          <div key={item.area} className="flex justify-between">
                            <span className="text-sm">{item.area}</span>
                            <span className="text-sm font-medium text-red-600">{item.avg}%</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
                <CardDescription>Automated analysis of your candidate pool</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">📊 Score Analysis</h4>
                  <p className="text-sm text-blue-700">
                    Average ATS score is {avgScore}%.{" "}
                    {avgScore >= 70
                      ? "Strong candidate pool overall."
                      : "Consider providing resume optimization guidance."}
                  </p>
                </div>

                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">🎯 Top Performer</h4>
                  <p className="text-sm text-green-700">
                    {topPerformer?.candidateName} leads with {highestScore}% ATS score, excelling in{" "}
                    {Object.entries(topPerformer?.atsScore || {})
                      .filter(([key, value]) => key !== "overall" && value >= 80)
                      .map(([key]) => key)
                      .join(", ") || "multiple areas"}
                    .
                  </p>
                </div>

                <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                  <h4 className="font-medium text-yellow-800 mb-2">⚠️ Common Issues</h4>
                  <p className="text-sm text-yellow-700">
                    {Math.round(analyses.reduce((sum, a) => sum + a.atsScore.keywordMatch, 0) / analyses.length) < 60
                      ? "Most candidates need better keyword optimization."
                      : "Keyword matching is generally strong across candidates."}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Actions to improve your hiring process</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analyses.filter((a) => a.atsScore.overall < 60).length > analyses.length * 0.5 && (
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-medium mb-1">📝 Resume Screening</h4>
                    <p className="text-sm text-muted-foreground">
                      Consider pre-screening resumes or providing optimization resources to candidates.
                    </p>
                  </div>
                )}

                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-1">🔍 Focus Areas</h4>
                  <p className="text-sm text-muted-foreground">
                    Prioritize candidates with scores above {Math.max(60, avgScore - 10)}% for initial interviews.
                  </p>
                </div>

                <div className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-1">📈 Process Improvement</h4>
                  <p className="text-sm text-muted-foreground">
                    Use keyword analysis to refine job descriptions and attract better-matched candidates.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
