"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Award, TrendingUp, ExternalLink, Star, Target } from "lucide-react"
import type { ATSAnalysisResult } from "@/lib/ats-analyzer"

interface CareerInsightsProps {
  analysis: ATSAnalysisResult
}

interface SkillRecommendation {
  skill: string
  priority: "high" | "medium" | "low"
  marketDemand: number
  salaryImpact: string
  timeToLearn: string
}

interface CourseRecommendation {
  title: string
  provider: string
  duration: string
  rating: number
  price: string
  skills: string[]
  url: string
}

interface CertificationRecommendation {
  name: string
  provider: string
  difficulty: "beginner" | "intermediate" | "advanced"
  validityPeriod: string
  averageSalaryBoost: string
  skills: string[]
}

export function CareerInsights({ analysis }: CareerInsightsProps) {
  const [selectedTab, setSelectedTab] = useState("skills")

  // Mock data based on missing keywords and role
  const skillRecommendations: SkillRecommendation[] = [
    {
      skill: "Docker",
      priority: "high",
      marketDemand: 85,
      salaryImpact: "+$8,000",
      timeToLearn: "2-3 months",
    },
    {
      skill: "AWS",
      priority: "high",
      marketDemand: 92,
      salaryImpact: "+$12,000",
      timeToLearn: "3-4 months",
    },
    {
      skill: "GraphQL",
      priority: "medium",
      marketDemand: 78,
      salaryImpact: "+$5,000",
      timeToLearn: "1-2 months",
    },
    {
      skill: "Kubernetes",
      priority: "medium",
      marketDemand: 81,
      salaryImpact: "+$10,000",
      timeToLearn: "4-6 months",
    },
  ]

  const courseRecommendations: CourseRecommendation[] = [
    {
      title: "Complete Docker & Kubernetes Course",
      provider: "Udemy",
      duration: "12 hours",
      rating: 4.7,
      price: "$89.99",
      skills: ["Docker", "Kubernetes", "DevOps"],
      url: "#",
    },
    {
      title: "AWS Solutions Architect",
      provider: "A Cloud Guru",
      duration: "25 hours",
      rating: 4.8,
      price: "$39/month",
      skills: ["AWS", "Cloud Architecture", "EC2", "S3"],
      url: "#",
    },
    {
      title: "GraphQL with React",
      provider: "Pluralsight",
      duration: "8 hours",
      rating: 4.6,
      price: "$29/month",
      skills: ["GraphQL", "React", "Apollo"],
      url: "#",
    },
  ]

  const certificationRecommendations: CertificationRecommendation[] = [
    {
      name: "AWS Certified Solutions Architect",
      provider: "Amazon Web Services",
      difficulty: "intermediate",
      validityPeriod: "3 years",
      averageSalaryBoost: "+$15,000",
      skills: ["AWS", "Cloud Architecture", "Security"],
    },
    {
      name: "Certified Kubernetes Administrator",
      provider: "Cloud Native Computing Foundation",
      difficulty: "advanced",
      validityPeriod: "3 years",
      averageSalaryBoost: "+$12,000",
      skills: ["Kubernetes", "Container Orchestration", "DevOps"],
    },
    {
      name: "Docker Certified Associate",
      provider: "Docker Inc.",
      difficulty: "intermediate",
      validityPeriod: "2 years",
      averageSalaryBoost: "+$8,000",
      skills: ["Docker", "Containerization", "DevOps"],
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-blue-600"
      default:
        return "text-muted-foreground"
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-600"
      case "intermediate":
        return "text-yellow-600"
      case "advanced":
        return "text-red-600"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Career Growth Insights
          </CardTitle>
          <CardDescription>
            Personalized recommendations to advance your career based on market trends and your current profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Target className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Skills Gap</h3>
              <p className="text-2xl font-bold text-red-600">{analysis.keywordAnalysis.missing.length}</p>
              <p className="text-sm text-muted-foreground">Missing key skills</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-secondary" />
              <h3 className="font-semibold">Learning Path</h3>
              <p className="text-2xl font-bold text-blue-600">3-6</p>
              <p className="text-sm text-muted-foreground">Months to upskill</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Award className="h-8 w-8 mx-auto mb-2 text-accent" />
              <h3 className="font-semibold">Salary Impact</h3>
              <p className="text-2xl font-bold text-green-600">+$25K</p>
              <p className="text-sm text-muted-foreground">Potential increase</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="skills">Skills to Learn</TabsTrigger>
          <TabsTrigger value="courses">Recommended Courses</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="space-y-4">
          <div className="grid gap-4">
            {skillRecommendations.map((skill, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{skill.skill}</h3>
                      <Badge variant={getPriorityBadge(skill.priority)}>{skill.priority} priority</Badge>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{skill.salaryImpact}</p>
                      <p className="text-sm text-muted-foreground">salary impact</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Market Demand</span>
                        <span className="font-medium">{skill.marketDemand}%</span>
                      </div>
                      <Progress value={skill.marketDemand} className="h-2" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Time to Learn:</span>
                      <span className="font-medium">{skill.timeToLearn}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <div className="grid gap-4">
            {courseRecommendations.map((course, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                      <p className="text-muted-foreground">{course.provider}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{course.price}</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{course.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Duration: {course.duration}</span>
                    <div className="flex flex-wrap gap-1">
                      {course.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button variant="outline" className="w-full bg-transparent">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Course
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          <div className="grid gap-4">
            {certificationRecommendations.map((cert, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{cert.name}</h3>
                      <p className="text-muted-foreground">{cert.provider}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{cert.averageSalaryBoost}</p>
                      <p className="text-sm text-muted-foreground">avg. boost</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Difficulty:</span>
                      <span className={`font-medium capitalize ${getDifficultyColor(cert.difficulty)}`}>
                        {cert.difficulty}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Valid for:</span>
                      <span className="font-medium">{cert.validityPeriod}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {cert.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full bg-transparent">
                    <Award className="h-4 w-4 mr-2" />
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
