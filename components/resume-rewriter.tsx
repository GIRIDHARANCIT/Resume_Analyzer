"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wand2, Copy, CheckCircle, Sparkles, TrendingUp } from "lucide-react"
import type { ATSAnalysisResult } from "@/lib/ats-analyzer"

interface ResumeRewriterProps {
  analysis: ATSAnalysisResult
}

interface RewriteSuggestion {
  section: string
  original: string
  improved: string
  impact: "high" | "medium" | "low"
  keywords: string[]
}

export function ResumeRewriter({ analysis }: ResumeRewriterProps) {
  const [selectedSection, setSelectedSection] = useState<string>("experience")
  const [isGenerating, setIsGenerating] = useState(false)
  const [suggestions, setSuggestions] = useState<RewriteSuggestion[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const generateSuggestions = async (section: string) => {
    setIsGenerating(true)

    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock suggestions based on section and missing keywords
    const mockSuggestions: RewriteSuggestion[] = [
      {
        section: "Experience",
        original: "Worked on web development projects using various technologies.",
        improved:
          "Developed and maintained 5+ responsive web applications using React, Node.js, and PostgreSQL, serving 10,000+ daily active users and improving page load times by 40%.",
        impact: "high",
        keywords: ["React", "Node.js", "PostgreSQL"],
      },
      {
        section: "Experience",
        original: "Managed team projects and coordinated with stakeholders.",
        improved:
          "Led cross-functional team of 8 developers in Agile environment, coordinating with product stakeholders to deliver 3 major features ahead of schedule, resulting in 25% increase in user engagement.",
        impact: "high",
        keywords: ["Agile", "stakeholder management", "team leadership"],
      },
      {
        section: "Skills",
        original: "Proficient in programming languages and frameworks.",
        improved:
          "Expert-level proficiency in JavaScript, TypeScript, Python, and Java with 5+ years experience building scalable applications using React, Vue.js, Django, and Spring Boot frameworks.",
        impact: "medium",
        keywords: ["JavaScript", "TypeScript", "Python", "React", "Vue.js"],
      },
    ]

    setSuggestions(mockSuggestions)
    setIsGenerating(false)
  }

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "text-green-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-blue-600"
      default:
        return "text-muted-foreground"
    }
  }

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case "high":
        return "default"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Resume Rewriter
          </CardTitle>
          <CardDescription>
            Improve your resume content with AI-powered suggestions that incorporate missing keywords and enhance
            impact.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Section to Improve</label>
              <Tabs value={selectedSection} onValueChange={setSelectedSection}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex justify-center">
              <Button onClick={() => generateSuggestions(selectedSection)} disabled={isGenerating} className="px-8">
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Generating Suggestions...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate AI Suggestions
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">AI-Generated Improvements</h3>
          {suggestions.map((suggestion, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{suggestion.section} Section</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={getImpactBadge(suggestion.impact)}>{suggestion.impact} impact</Badge>
                    <TrendingUp className={`h-4 w-4 ${getImpactColor(suggestion.impact)}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Original:</h4>
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm">{suggestion.original}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">AI-Improved:</h4>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm">{suggestion.improved}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex flex-wrap gap-1">
                        {suggestion.keywords.map((keyword) => (
                          <Badge key={keyword} variant="outline" className="text-xs bg-green-100 border-green-300">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(suggestion.improved, index)}>
                        {copiedIndex === index ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {suggestions.length > 0 && (
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            These AI-generated suggestions incorporate {analysis.keywordAnalysis.missing.slice(0, 5).join(", ")} and
            other missing keywords to improve your ATS score.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
