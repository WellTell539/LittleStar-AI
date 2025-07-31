'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Brain, BookOpen, Heart, Lightbulb, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useStore } from '@/store/useStore'

export default function AIInsights() {
  const { memories, aiPersonality, currentEmotion, vitalSigns } = useStore()
  const [insights, setInsights] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const generateInsights = useCallback(async () => {
    setIsLoading(true)
    
    try {
      // 基于当前数据生成洞察
      const newInsights = []
      
      // 学习进度洞察  
      const learningMemories = memories.filter(m => m.type === 'learning')
      if (learningMemories.length > 10) {
        newInsights.push('📚 你的学习记录很丰富，知识积累效果显著。')
      }

      // 性格特征洞察
      if (aiPersonality.curiosity > 80) {
        newInsights.push('🔍 你的好奇心很强，这是持续学习的好品质。')
      }
      
      if (aiPersonality.creativity > 80) {
        newInsights.push('🎨 创造力指数很高，可以多尝试创意性的项目。')
      }

      // 情绪状态洞察
      if (currentEmotion.primary === 'excited') {
        newInsights.push('⚡ 当前状态很兴奋，适合进行挑战性的任务。')
      } else if (currentEmotion.primary === 'contemplative') {
        newInsights.push('🤔 正处于思考状态，适合进行深度学习。')
      }

      // AI状态洞察
      if (vitalSigns.energy < 30) {
        newInsights.push('💤 能量水平较低，建议适当休息调整。')
      }
      
      if (vitalSigns.focus > 80) {
        newInsights.push('🎯 专注度很高，是完成重要任务的好时机。')
      }

      if (newInsights.length === 0) {
        newInsights.push('🌟 继续保持当前的学习和成长节奏！')
      }
      
      setInsights(newInsights)
    } catch (error) {
      console.error('生成洞察失败:', error)
      setInsights(['❌ 生成洞察时出现问题，请稍后重试。'])
    } finally {
      setIsLoading(false)
    }
  }, [memories, aiPersonality.curiosity, aiPersonality.creativity, currentEmotion.primary, vitalSigns.energy, vitalSigns.focus])

  useEffect(() => {
    generateInsights()
  }, [generateInsights])

  const getInsightIcon = (insight: string) => {
    if (insight.includes('目标')) return <CheckCircle className="w-4 h-4 text-green-500" />
    if (insight.includes('学习')) return <BookOpen className="w-4 h-4 text-blue-500" />
    if (insight.includes('创造')) return <Lightbulb className="w-4 h-4 text-yellow-500" />
    if (insight.includes('好奇')) return <Brain className="w-4 h-4 text-purple-500" />
    if (insight.includes('情绪') || insight.includes('状态')) return <Heart className="w-4 h-4 text-pink-500" />
    if (insight.includes('能量') || insight.includes('休息')) return <AlertCircle className="w-4 h-4 text-orange-500" />
    return <Clock className="w-4 h-4 text-gray-500" />
  }

  const getInsightColor = (insight: string) => {
    if (insight.includes('很高') || insight.includes('显著') || insight.includes('很强')) return 'text-green-600'
    if (insight.includes('较低') || insight.includes('问题') || insight.includes('建议')) return 'text-orange-600'
    return 'text-gray-600'
  }

  return (
    <Card className="card-modern">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI 洞察分析
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            基于你的学习数据和行为模式生成个性化洞察
          </p>
          <Button 
            onClick={generateInsights}
            disabled={isLoading}
            size="sm"
            variant="outline"
          >
            {isLoading ? '分析中...' : '刷新洞察'}
          </Button>
        </div>

        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              {getInsightIcon(insight)}
              <div className="flex-1">
                <p className={`text-sm font-medium ${getInsightColor(insight)}`}>
                  {insight}
                </p>
              </div>
            </div>
          ))}
        </div>

        {insights.length === 0 && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>暂无洞察数据</p>
            <p className="text-sm">开始学习和设定目标来获得个性化洞察</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 