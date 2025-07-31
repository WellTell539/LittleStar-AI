'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Trophy, Lightbulb, Target } from 'lucide-react'

const eventTypeConfig = {
  milestone: {
    icon: Target,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-100',
    textColor: 'text-blue-700'
  },
  insight: {
    icon: Lightbulb,
    color: 'bg-amber-500',
    lightColor: 'bg-amber-100',
    textColor: 'text-amber-700'
  },
  achievement: {
    icon: Trophy,
    color: 'bg-green-500',
    lightColor: 'bg-green-100',
    textColor: 'text-green-700'
  }
}

export function LearningTimeline() {
  const [learningEvents] = useState<Array<{
    id: string;
    title: string;
    description: string;
    type: 'milestone' | 'insight' | 'achievement';
    date: Date;
  }>>([
    { id: '1', title: '掌握React Hooks', description: '成功学习了useState和useEffect的使用方法', type: 'milestone', date: new Date() },
    { id: '2', title: 'TypeScript突破', description: '理解了泛型和接口的概念', type: 'insight', date: new Date(Date.now() - 86400000) },
    { id: '3', title: '项目完成', description: '成功完成了第一个Next.js项目', type: 'achievement', date: new Date(Date.now() - 172800000) }
  ])
  
  // Sort events by date (newest first)
  const sortedEvents = [...learningEvents].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="bg-card rounded-lg shadow-sm border p-6">
      <h2 className="text-2xl font-bold mb-6">学习时间线</h2>
      
      {sortedEvents.length === 0 ? (
        <div className="text-center py-12">
          <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">还没有学习记录</p>
          <p className="text-sm text-muted-foreground mt-2">
            开始你的学习之旅，记录重要的里程碑和成就！
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
          
          {/* Events */}
          <div className="space-y-6">
            {sortedEvents.map((event) => {
              const config = eventTypeConfig[event.type]
              const Icon = config.icon
              
              return (
                <div key={event.id} className="relative flex gap-4">
                  {/* Event icon */}
                  <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full ${config.color} shadow-md`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  
                  {/* Event content */}
                  <div className="flex-1 pb-6">
                    <div className={`rounded-lg border ${config.lightColor} p-4`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className={`font-semibold ${config.textColor}`}>
                            {event.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.description}
                          </p>
                        </div>
                        <time className="text-xs text-muted-foreground whitespace-nowrap">
                          {format(new Date(event.date), 'MM月dd日', { locale: zhCN })}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
} 