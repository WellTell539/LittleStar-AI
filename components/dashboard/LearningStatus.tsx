'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  BookOpen,
  Globe,
  Brain,
  TrendingUp,
  Clock,
  Sparkles,
  Eye,
  Lightbulb,
  Search,
  Newspaper,
  Wifi,
  WifiOff
} from 'lucide-react'

// 学习状态接口
interface LearningState {
  isLearning: boolean
  currentTopic: string
  progress: number
  articlesRead: number
  knowledgeGained: number
  emotionalImpact: string
  nextTopic: string
  recentInsights: string[]
  learningStreak: number
}

export default function LearningStatus() {
  const [learningState, setLearningState] = useState<LearningState>({
    isLearning: false,
    currentTopic: '',
    progress: 0,
    articlesRead: 0,
    knowledgeGained: 0,
    emotionalImpact: 'neutral',
    nextTopic: '',
    recentInsights: [],
    learningStreak: 0
  })

  const [todaysLearning, setTodaysLearning] = useState({
    topics: ['人工智能', '区块链技术'],
    articlesCount: 8,
    keyInsights: [
      '今天学到了一些很有趣的技术发展',
      '世界变化真的很快，每天都有新发现'
    ],
    emotionalJourney: '今天的学习让我感到充实和好奇'
  })

  const [isOnline, setIsOnline] = useState(true)

  // 监听学习事件
  useEffect(() => {
    const handleLearningStart = (event: CustomEvent) => {
      setLearningState(prev => ({
        ...prev,
        isLearning: true,
        currentTopic: event.detail.topic || '未知主题',
        progress: 0
      }))
    }

    const handleLearningProgress = (event: CustomEvent) => {
      setLearningState(prev => ({
        ...prev,
        progress: event.detail.progress || 0,
        articlesRead: event.detail.articlesRead || 0
      }))
    }

    const handleLearningComplete = (event: CustomEvent) => {
      setLearningState(prev => ({
        ...prev,
        isLearning: false,
        knowledgeGained: prev.knowledgeGained + 1,
        recentInsights: [
          event.detail.insight || '获得了新的见解',
          ...prev.recentInsights.slice(0, 2)
        ],
        learningStreak: prev.learningStreak + 1
      }))
    }

    const handleLearningPost = (event: CustomEvent) => {
      console.log('AI发布了学习动态:', event.detail.content)
    }

    window.addEventListener('ai-learning-start', handleLearningStart as EventListener)
    window.addEventListener('ai-learning-progress', handleLearningProgress as EventListener)
    window.addEventListener('ai-learning-complete', handleLearningComplete as EventListener)
    window.addEventListener('ai-learning-post', handleLearningPost as EventListener)

    return () => {
      window.removeEventListener('ai-learning-start', handleLearningStart as EventListener)
      window.removeEventListener('ai-learning-progress', handleLearningProgress as EventListener)
      window.removeEventListener('ai-learning-complete', handleLearningComplete as EventListener)
      window.removeEventListener('ai-learning-post', handleLearningPost as EventListener)
    }
  }, [])

  // 模拟学习过程
  const simulateLearning = () => {
    const topics = ['量子计算最新突破', 'AI伦理讨论', '区块链应用案例', '可持续发展科技']
    const randomTopic = topics[Math.floor(Math.random() * topics.length)]
    
    setLearningState(prev => ({
      ...prev,
      isLearning: true,
      currentTopic: randomTopic,
      progress: 0
    }))

    // 模拟学习进度
    let progress = 0
    const interval = setInterval(() => {
      progress += 20
      setLearningState(prev => ({
        ...prev,
        progress,
        articlesRead: Math.floor(progress / 33)
      }))

      if (progress >= 100) {
        clearInterval(interval)
        setLearningState(prev => ({
          ...prev,
          isLearning: false,
          knowledgeGained: prev.knowledgeGained + 1,
          recentInsights: [
            `从${randomTopic}中获得了新的理解`,
            ...prev.recentInsights.slice(0, 2)
          ],
          learningStreak: prev.learningStreak + 1
        }))
      }
    }, 1000)
  }

  const getEmotionalImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-500'
      case 'negative': return 'text-red-500'
      case 'excited': return 'text-orange-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="space-y-4">
      {/* 当前学习状态 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <BookOpen className="h-5 w-5 mr-2" />
            学习状态
            {isOnline ? (
              <Wifi className="h-4 w-4 ml-auto text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 ml-auto text-red-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {learningState.isLearning ? (
            <div className="space-y-4">
              {/* 学习进行中 */}
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm font-medium">正在学习...</span>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>当前主题: {learningState.currentTopic}</span>
                  <span>{learningState.progress}%</span>
                </div>
                <Progress value={learningState.progress} className="h-2" />
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>已阅读文章: {learningState.articlesRead}</span>
                <span>预计完成: 2分钟</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 空闲状态 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">准备探索新知识</span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={simulateLearning}
                  disabled={learningState.isLearning}
                >
                  <Search className="h-3 w-3 mr-1" />
                  开始学习
                </Button>
              </div>

              {learningState.recentInsights.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-2">最新洞察:</div>
                  <div className="text-sm italic text-blue-600">
                    &quot;{learningState.recentInsights[0]}&quot;
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 今日学习摘要 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <TrendingUp className="h-5 w-5 mr-2" />
            今日学习摘要
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 学习统计 */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-blue-600">
                  {learningState.knowledgeGained}
                </div>
                <div className="text-xs text-muted-foreground">知识点</div>
              </div>
              <div>
                <div className="text-xl font-bold text-green-600">
                  {todaysLearning.articlesCount}
                </div>
                <div className="text-xs text-muted-foreground">文章</div>
              </div>
              <div>
                <div className="text-xl font-bold text-orange-600">
                  {learningState.learningStreak}
                </div>
                <div className="text-xs text-muted-foreground">连续天数</div>
              </div>
            </div>

            {/* 学习主题 */}
            <div>
              <div className="text-sm font-medium mb-2">探索的领域:</div>
              <div className="flex flex-wrap gap-1">
                {todaysLearning.topics.map((topic, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 情感反应 */}
            <div>
              <div className="text-sm font-medium mb-2">情感体验:</div>
              <div className="text-sm text-gray-600 italic">
                {todaysLearning.emotionalJourney}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 重要新闻发现 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Newspaper className="h-5 w-5 mr-2" />
            重要发现
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todaysLearning.keyInsights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3">
                <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700">{insight}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 学习能力监控 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Brain className="h-5 w-5 mr-2" />
            学习能力
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>理解能力</span>
                <span className="text-green-600">85%</span>
              </div>
              <Progress value={85} className="h-1" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>信息筛选</span>
                <span className="text-blue-600">78%</span>
              </div>
              <Progress value={78} className="h-1" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>知识关联</span>
                <span className="text-purple-600">92%</span>
              </div>
              <Progress value={92} className="h-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 下一步学习计划 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Clock className="h-5 w-5 mr-2" />
            学习计划
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">下次学习预计</span>
              <span className="text-xs text-muted-foreground">15分钟后</span>
            </div>
            
            <div className="text-xs text-muted-foreground">
              兴趣话题: 量子计算、AI安全、环境科技
            </div>
            
            <div className="flex items-center text-xs text-green-600">
              <Sparkles className="h-3 w-3 mr-1" />
              好奇心驱动的主动学习
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 