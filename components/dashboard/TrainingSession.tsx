'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { GraduationCap, Play, Square, MessageSquare, Brain, Heart } from 'lucide-react'

export function TrainingSession() {
  const [currentTrainingSession, setCurrentTrainingSession] = useState<{
    id: string;
    startTime: Date;
    interactions: Array<{
      scenario: string;
      response: string;
      type: string;
    }>;
  } | null>(null)
  
  const [personalityStats, setPersonalityStats] = useState({
    empathy: 75,
    creativity: 68,
    analyticalThinking: 71,
    emotionalIntelligence: 76
  })
  
  const startTrainingSession = () => {
    setCurrentTrainingSession({
      id: Date.now().toString(),
      startTime: new Date(),
      interactions: []
    })
  }
  
  const endTrainingSession = () => {
    setCurrentTrainingSession(null)
  }
  
  const recordTrainingInteraction = (interaction: { scenario: string; response: string; type: string }) => {
    if (currentTrainingSession) {
      setCurrentTrainingSession({
        ...currentTrainingSession,
        interactions: [...currentTrainingSession.interactions, interaction]
      })
    }
  }
  
  const updatePersonalityStats = (changes: Partial<typeof personalityStats>) => {
    setPersonalityStats({ ...personalityStats, ...changes })
  }
  
  const addMemory = (memory: { content: string; type: string; emotionLevel: number; impact: number; category: string }) => {
    // Mock implementation
    console.log('Adding memory:', memory)
  }
  
  const addUserFeedback = (feedback: { type: string; content: string; rating: number }) => {
    // Mock implementation
    console.log('Adding feedback:', feedback)
  }
  
  const learningData = {
    totalSessions: 15,
    averageScore: 8.2,
    improvementRate: 12.5,
    totalInteractions: 45,
    learningRate: 0.85,
    adaptationScore: 78,
    averageEmotionLevel: 7.2
  }
  
  const [isTraining, setIsTraining] = useState(false)
  const [scenario, setScenario] = useState('')
  const [response, setResponse] = useState('')
  const [scenarioType, setScenarioType] = useState<'empathy' | 'creativity' | 'analytical'>('empathy')
  
  const scenarios = {
    empathy: [
      "用户说：'我今天感觉很沮丧，什么都做不好。'",
      "用户说：'我刚完成了一个大项目，感觉很有成就感！'",
      "用户说：'我不确定是否应该追求这个新机会...'"
    ],
    creativity: [
      "请想出三种创新的方式来帮助用户管理时间。",
      "如果目标可以有颜色和形状，你会如何描述它们？",
      "创造一个比喻来解释学习的过程。"
    ],
    analytical: [
      "分析：如果用户连续三天没有完成目标，可能的原因是什么？",
      "比较不同类型记忆（目标、情感、学习）的重要性。",
      "如何量化个人成长的进度？"
    ]
  }
  
  const startSession = () => {
    startTrainingSession()
    setIsTraining(true)
    generateScenario()
  }
  
  const endSession = () => {
    if (currentTrainingSession) {
      endTrainingSession()
      setIsTraining(false)
      setScenario('')
      setResponse('')
    }
  }
  
  const generateScenario = () => {
    const types = ['empathy', 'creativity', 'analytical'] as const
    const randomType = types[Math.floor(Math.random() * types.length)]
    setScenarioType(randomType)
    
    const scenarioList = scenarios[randomType]
    const randomScenario = scenarioList[Math.floor(Math.random() * scenarioList.length)]
    setScenario(randomScenario)
  }
  
  const handleResponse = () => {
    if (!response.trim()) return
    
    // Record interaction
    recordTrainingInteraction({
      scenario,
      response,
      type: scenarioType
    })
    
    // Create memory
    addMemory({
      content: `训练场景: ${scenario} | 回应: ${response}`,
      type: 'learning',
      emotionLevel: 8,
      impact: 7,
      category: '训练会话'
    })
    
    // Evolve personality based on scenario type
    const changes: Partial<typeof personalityStats> = {}
    switch (scenarioType) {
      case 'empathy':
        changes.empathy = Math.min(100, personalityStats.empathy + 2)
        changes.emotionalIntelligence = Math.min(100, personalityStats.emotionalIntelligence + 1)
        break
      case 'creativity':
        changes.creativity = Math.min(100, personalityStats.creativity + 2)
        break
      case 'analytical':
        changes.analyticalThinking = Math.min(100, personalityStats.analyticalThinking + 2)
        break
    }
    updatePersonalityStats(changes)
    
    // Add automatic positive feedback
    addUserFeedback({
      type: 'positive',
      content: `很好的${scenarioType === 'empathy' ? '同理心' : scenarioType === 'creativity' ? '创造力' : '分析能力'}展现！`,
      rating: 6
    })
    
    // Clear and generate new scenario
    setResponse('')
    generateScenario()
  }
  
  const getScenarioIcon = () => {
    switch (scenarioType) {
      case 'empathy': return <Heart className="h-5 w-5 text-rose-500" />
      case 'creativity': return <Brain className="h-5 w-5 text-purple-500" />
      case 'analytical': return <Brain className="h-5 w-5 text-blue-500" />
    }
  }
  
  const getScenarioLabel = () => {
    switch (scenarioType) {
      case 'empathy': return '同理心训练'
      case 'creativity': return '创造力训练'
      case 'analytical': return '分析能力训练'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          交互式训练
        </CardTitle>
        <CardDescription>
          通过场景练习来塑造 LITTLE STAR AI 的个性
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isTraining ? (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              开始训练会话，通过不同的场景来指导 LITTLE STAR AI 的成长方向
            </p>
            <Button onClick={startSession} size="lg">
              <Play className="mr-2 h-4 w-4" />
              开始训练
            </Button>
            
            {/* Training Stats */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="text-sm font-medium mb-2">训练统计</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>总互动次数: {learningData.totalInteractions}</div>
                <div>学习率: {learningData.learningRate.toFixed(2)}</div>
                <div>适应分数: {learningData.adaptationScore}%</div>
                <div>平均情绪水平: {learningData.averageEmotionLevel.toFixed(1)}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Session Info */}
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="flex items-center gap-1">
                {getScenarioIcon()}
                {getScenarioLabel()}
              </Badge>
              <div className="text-sm text-muted-foreground">
                互动次数: {currentTrainingSession?.interactions.length || 0}
              </div>
            </div>
            
            {/* Scenario */}
            <div className="bg-secondary/50 rounded-lg p-4">
              <Label className="text-sm font-medium mb-2 block">训练场景</Label>
              <p className="text-sm">{scenario}</p>
            </div>
            
            {/* Response Input */}
            <div className="space-y-2">
              <Label htmlFor="training-response">LITTLE STAR AI 的回应</Label>
              <Textarea
                id="training-response"
                placeholder="输入 LITTLE STAR AI 应该如何回应..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={3}
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleResponse}
                disabled={!response.trim()}
                className="flex-1"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                提交回应
              </Button>
              <Button
                onClick={endSession}
                variant="outline"
              >
                <Square className="mr-2 h-4 w-4" />
                结束训练
              </Button>
            </div>
            
            {/* Real-time Personality Changes */}
            <div className="bg-muted rounded-lg p-3 space-y-2">
              <h4 className="text-sm font-medium">实时个性变化</h4>
              <div className="space-y-1">
                {Object.entries(personalityStats).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={value} className="w-20 h-1" />
                      <span className="w-8 text-right">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 