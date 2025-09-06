"use client"

import { useState } from "react"
import { SpeedometerChart } from "@/components/speedometer-chart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SpeedometerTest() {
  const [testScore, setTestScore] = useState(75)

  const testScores = [25, 45, 65, 85, 95]

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Speedometer Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main test speedometer */}
        <div className="flex justify-center">
          <SpeedometerChart score={testScore} size={300} />
        </div>

        {/* Score controls */}
        <div className="flex flex-col items-center space-y-4">
          <div className="text-lg font-medium">Current Score: {testScore}</div>
          <div className="flex gap-2 flex-wrap justify-center">
            {testScores.map((score) => (
              <Button
                key={score}
                variant={testScore === score ? "default" : "outline"}
                onClick={() => setTestScore(score)}
                className="w-16"
              >
                {score}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setTestScore(Math.max(0, testScore - 10))}
            >
              -10
            </Button>
            <Button
              variant="outline"
              onClick={() => setTestScore(Math.min(100, testScore + 10))}
            >
              +10
            </Button>
          </div>
        </div>

        {/* Multiple speedometers for comparison */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
          {testScores.map((score) => (
            <div key={score} className="flex flex-col items-center">
              <SpeedometerChart score={score} size={120} />
              <div className="text-sm font-medium mt-2">Score: {score}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

