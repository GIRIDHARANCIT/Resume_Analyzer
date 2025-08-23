"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Target, Zap, Award, TrendingUp, CheckCircle } from "lucide-react"
import type { ATSAnalysisResult } from "@/lib/ats-analyzer"

interface GamificationProps {
  analyses: ATSAnalysisResult[]
  currentAnalysis: ATSAnalysisResult
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  unlocked: boolean
  progress: number
  maxProgress: number
  rarity: "common" | "rare" | "epic" | "legendary"
  points: number
}

interface UserStats {
  level: number
  totalPoints: number
  pointsToNextLevel: number
  resumesAnalyzed: number
  averageScore: number
  improvementStreak: number
}

export function Gamification({ analyses, currentAnalysis }: GamificationProps) {
  const [userStats, setUserStats] = useState<UserStats>({
    level: 1,
    totalPoints: 0,
    pointsToNextLevel: 100,
    resumesAnalyzed: analyses.length,
    averageScore: Math.round(analyses.reduce((sum, a) => sum + a.atsScore.overall, 0) / analyses.length),
    improvementStreak: 3,
  })

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: "first_analysis",
      title: "First Steps",
      description: "Complete your first resume analysis",
      icon: <Target className="h-6 w-6" />,
      unlocked: true,
      progress: 1,
      maxProgress: 1,
      rarity: "common",
      points: 10,
    },
    {
      id: "keyword_master",
      title: "Keyword Master",
      description: "Achieve 80%+ keyword match score",
      icon: <Zap className="h-6 w-6" />,
      unlocked: currentAnalysis.atsScore.keywordMatch >= 80,
      progress: Math.min(currentAnalysis.atsScore.keywordMatch, 80),
      maxProgress: 80,
      rarity: "rare",
      points: 25,
    },
    {
      id: "formatting_pro",
      title: "Formatting Pro",
      description: "Achieve perfect formatting score (100%)",
      icon: <Star className="h-6 w-6" />,
      unlocked: currentAnalysis.atsScore.formatting >= 100,
      progress: currentAnalysis.atsScore.formatting,
      maxProgress: 100,
      rarity: "epic",
      points: 50,
    },
    {
      id: "ats_champion",
      title: "ATS Champion",
      description: "Achieve 90%+ overall ATS score",
      icon: <Trophy className="h-6 w-6" />,
      unlocked: currentAnalysis.atsScore.overall >= 90,
      progress: Math.min(currentAnalysis.atsScore.overall, 90),
      maxProgress: 90,
      rarity: "legendary",
      points: 100,
    },
    {
      id: "improvement_streak",
      title: "On Fire!",
      description: "Improve your score 3 times in a row",
      icon: <TrendingUp className="h-6 w-6" />,
      unlocked: userStats.improvementStreak >= 3,
      progress: userStats.improvementStreak,
      maxProgress: 3,
      rarity: "rare",
      points: 30,
    },
    {
      id: "bulk_analyzer",
      title: "Bulk Analyzer",
      description: "Analyze 5+ resumes in one session",
      icon: <Award className="h-6 w-6" />,
      unlocked: analyses.length >= 5,
      progress: Math.min(analyses.length, 5),
      maxProgress: 5,
      rarity: "epic",
      points: 40,
    },
  ])

  useEffect(() => {
    // Calculate total points and level
    const totalPoints = achievements.filter((a) => a.unlocked).reduce((sum, a) => sum + a.points, 0)
    const level = Math.floor(totalPoints / 100) + 1
    const pointsToNextLevel = level * 100 - totalPoints

    setUserStats((prev) => ({
      ...prev,
      totalPoints,
      level,
      pointsToNextLevel: Math.max(0, pointsToNextLevel),
    }))
  }, [achievements])

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "text-gray-600 border-gray-300"
      case "rare":
        return "text-blue-600 border-blue-300"
      case "epic":
        return "text-purple-600 border-purple-300"
      case "legendary":
        return "text-yellow-600 border-yellow-300"
      default:
        return "text-gray-600 border-gray-300"
    }
  }

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "secondary"
      case "rare":
        return "default"
      case "epic":
        return "secondary"
      case "legendary":
        return "default"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      {/* User Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Your Progress
          </CardTitle>
          <CardDescription>Track your resume optimization journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary mb-1">Level {userStats.level}</div>
              <p className="text-sm text-muted-foreground">Current Level</p>
              <div className="mt-2">
                <Progress
                  value={((userStats.level * 100 - userStats.pointsToNextLevel) / (userStats.level * 100)) * 100}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">{userStats.pointsToNextLevel} points to next level</p>
              </div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-secondary mb-1">{userStats.totalPoints}</div>
              <p className="text-sm text-muted-foreground">Total Points</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-accent mb-1">{userStats.averageScore}%</div>
              <p className="text-sm text-muted-foreground">Average Score</p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">{userStats.improvementStreak}</div>
              <p className="text-sm text-muted-foreground">Improvement Streak</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievements
          </CardTitle>
          <CardDescription>Unlock badges by improving your resume and reaching milestones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 border rounded-lg transition-all ${
                  achievement.unlocked
                    ? `${getRarityColor(achievement.rarity)} bg-gradient-to-r from-transparent to-primary/5`
                    : "border-gray-200 opacity-60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      achievement.unlocked ? "bg-primary text-primary-foreground" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {achievement.unlocked ? <CheckCircle className="h-6 w-6" /> : achievement.icon}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{achievement.title}</h3>
                      <Badge variant={getRarityBadge(achievement.rarity)} className="text-xs capitalize">
                        {achievement.rarity}
                      </Badge>
                      {achievement.unlocked && (
                        <Badge variant="outline" className="text-xs">
                          +{achievement.points} pts
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>

                    {!achievement.unlocked && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>
                            {achievement.progress}/{achievement.maxProgress}
                          </span>
                        </div>
                        <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-1" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {achievements.some((a) => a.unlocked) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              Recent Achievements
            </CardTitle>
            <CardDescription>Your latest accomplishments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {achievements
                .filter((a) => a.unlocked)
                .slice(-3)
                .map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-green-800">{achievement.title}</h4>
                      <p className="text-sm text-green-600">{achievement.description}</p>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                      +{achievement.points} pts
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Next Goals
          </CardTitle>
          <CardDescription>Keep improving to unlock these achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {achievements
              .filter((a) => !a.unlocked)
              .slice(0, 3)
              .map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="p-2 bg-gray-100 rounded-lg">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground">
                        {achievement.progress}/{achievement.maxProgress}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {achievement.points} pts
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
