'use client'

import { Progress } from '@/components/ui/progress'
import { Brain, Heart, Lightbulb, BarChart3, Sparkles } from 'lucide-react'

const statConfig = {
  curiosity: {
    label: '好奇心',
    icon: Sparkles,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  creativity: {
    label: '创造力',
    icon: Lightbulb,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
  empathy: {
    label: '同理心',
    icon: Heart,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50'
  },
  analyticalThinking: {
    label: '分析思维',
    icon: BarChart3,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  emotionalIntelligence: {
    label: '情商',
    icon: Brain,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  }
}

export function PersonalityStats() {
  const personalityStats = {
    curiosity: 75,
    creativity: 68,
    empathy: 82,
    analyticalThinking: 71,
    emotionalIntelligence: 76
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border p-6">
      <h2 className="text-2xl font-bold mb-4">个性统计</h2>
      
      <div className="space-y-4">
        {Object.entries(personalityStats).map(([key, value]) => {
          const config = statConfig[key as keyof typeof statConfig]
          const Icon = config.icon
          
          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${config.bgColor}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <span className="font-medium">{config.label}</span>
                </div>
                <span className="text-sm font-semibold">{value}%</span>
              </div>
              <Progress value={value} className="h-2" />
            </div>
          )
        })}
      </div>
      
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">总体评估</h3>
        <p className="text-sm text-muted-foreground">
          LITTLE STAR AI 展现出均衡的发展，在同理心方面表现尤为突出。
          持续的学习和体验将帮助进一步提升各项能力。
        </p>
      </div>
    </div>
  )
} 