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
    if (normalizedScore >= 80) return { 
      strokeColor: "#22c55e", 
      bgColor: "#dcfce7", 
      textColor: "#16a34a"
    }
    if (normalizedScore >= 60) return { 
      strokeColor: "#f59e0b", 
      bgColor: "#fef3c7", 
      textColor: "#d97706"
    }
    return { 
      strokeColor: "#ef4444", 
      bgColor: "#fee2e2", 
      textColor: "#dc2626"
    }
  }, [normalizedScore])

  const radius = (size - 40) / 2
  const circumference = Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative flex flex-col items-center" style={{ width: size, height: size / 2 + 40 }}>
        {/* Center dot */}
        <div 
          className="absolute w-3 h-3 bg-white border-2 border-gray-300 rounded-full z-10"
          style={{ 
            top: `${size / 2 - 6}px`,
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        />
        {/* Background arc */}
        <svg 
          width={size} 
          height={size / 2 + 20} 
          className="transform -rotate-90" 
          style={{ overflow: "visible" }}
          viewBox={`0 0 ${size} ${size / 2 + 20}`}
        >
          {/* Background arc */}
          <path
            d={`M 20 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 20} ${size / 2}`}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="10"
            strokeLinecap="round"
          />
          
          {/* Progress arc */}
          <path
            d={`M 20 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 20} ${size / 2}`}
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Score display */}
        <div 
          className="absolute flex flex-col items-center justify-center"
          style={{ 
            top: `${size / 4}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%'
          }}
        >
          <div 
            className="text-4xl font-bold mb-1 drop-shadow-sm" 
            style={{ color: textColor }}
          >
            {Math.round(normalizedScore)}
          </div>
          <div className="text-sm font-medium text-muted-foreground">ATS Score</div>
        </div>

        {/* Needle indicator */}
        <div 
          className="absolute w-1 bg-gray-800 rounded-full origin-bottom"
          style={{ 
            height: `${radius * 0.8}px`,
            top: `${size / 2}px`,
            left: '50%',
            transform: `translateX(-50%) rotate(${normalizedScore * 1.8 - 90}deg)`,
            transformOrigin: 'bottom center'
          }}
        />

        {/* Score indicators */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground px-2">
          <span className="font-medium">0</span>
          <span className="font-medium">50</span>
          <span className="font-medium">100</span>
        </div>
      </div>

      {/* Score interpretation */}
      <div
        className="mt-4 px-4 py-2 rounded-full text-sm font-semibold shadow-sm"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        {normalizedScore >= 80 ? "Excellent" : normalizedScore >= 60 ? "Good" : "Needs Improvement"}
      </div>
    </div>
  )
}
