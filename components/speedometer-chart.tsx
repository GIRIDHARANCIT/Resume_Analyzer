"use client"

import { useMemo } from "react"

interface SpeedometerChartProps {
  score: number
  size?: number
  className?: string
}

export function SpeedometerChart({ score, size = 200, className = "" }: SpeedometerChartProps) {
  const normalizedScore = Math.max(0, Math.min(100, score))

  const { strokeColor, bgColor, textColor } = useMemo(() => {
    if (normalizedScore >= 80) return { strokeColor: "#22c55e", bgColor: "#dcfce7", textColor: "#16a34a" }
    if (normalizedScore >= 60) return { strokeColor: "#f59e0b", bgColor: "#fef3c7", textColor: "#d97706" }
    return { strokeColor: "#ef4444", bgColor: "#fee2e2", textColor: "#dc2626" }
  }, [normalizedScore])

  const radius = (size - 40) / 2
  const circumference = Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
        {/* Background arc */}
        <svg width={size} height={size / 2 + 20} className="transform -rotate-90" style={{ overflow: "visible" }}>
          <path
            d={`M 20 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 20} ${size / 2}`}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d={`M 20 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 20} ${size / 2}`}
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Score display */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-4" style={{ top: size / 4 }}>
          <div className={`text-4xl font-bold`} style={{ color: textColor }}>
            {Math.round(normalizedScore)}
          </div>
          <div className="text-sm font-medium text-muted-foreground">ATS Score</div>
        </div>

        {/* Score indicators */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground px-2">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      {/* Score interpretation */}
      <div
        className={`mt-2 px-3 py-1 rounded-full text-xs font-medium`}
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        {normalizedScore >= 80 ? "Excellent" : normalizedScore >= 60 ? "Good" : "Needs Improvement"}
      </div>
    </div>
  )
}
