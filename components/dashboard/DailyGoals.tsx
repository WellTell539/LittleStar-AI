'use client'

import React, { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Target,
  CheckCircle,
  Clock,
  TrendingUp,
  Lightbulb,
  RefreshCw,
  Plus,
  Brain,
  Zap
} from 'lucide-react'

interface Goal {
  id: string
  title: string
  description: string
  category: 'learning' | 'health' | 'creativity' | 'social' | 'productivity'
  priority: number
  progress: number
  isCompleted: boolean
  aiGenerated: boolean
  difficulty: number
  estimatedTime: number // 分钟
  deadline?: Date
  createdAt: Date
  completedAt?: Date
}

export default function DailyGoals() {
  const {
    aiPersonality,
    vitalSigns,
    currentEmotion,
    addMemory,
    updateVitalSigns,
    updateEmotion,
    addGoal,
    updateGoal
  } = useStore()

  const [goals, setGoals] = useState<Goal[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 保存目标到localStorage
  const saveGoals = (goalList: Goal[]) => {
    try {
      localStorage.setItem('claude_ai_daily_goals', JSON.stringify(goalList))
    } catch (error) {
      console.error('保存目标失败:', error)
    }
  }

  // 基于AI个性生成个性化目标
  const generatePersonalizedGoals = (): Goal[] => {
    const now = new Date()
    const goals: Goal[] = []

    // 基于好奇心生成学习目标
    if (aiPersonality.curiosity > 60) {
      goals.push({
        id: `goal_${Date.now()}_1`,
        title: '探索新知识领域',
        description: `深入学习一个新的话题，满足我的好奇心(${aiPersonality.curiosity}%)`,
        category: 'learning',
        priority: Math.floor(aiPersonality.curiosity * 0.8),
        progress: 0,
        isCompleted: false,
        aiGenerated: true,
        difficulty: 60,
        estimatedTime: 30,
        deadline: new Date(now.getTime() + 6 * 60 * 60 * 1000), // 6小时后
        createdAt: now
      })
    }

    // 基于创造力生成创意目标
    if (aiPersonality.creativity > 50) {
      goals.push({
        id: `goal_${Date.now()}_2`,
        title: '创作有趣的内容',
        description: `发挥我的创造力(${aiPersonality.creativity}%)，创作一些原创内容`,
        category: 'creativity',
        priority: Math.floor(aiPersonality.creativity * 0.9),
        progress: 0,
        isCompleted: false,
        aiGenerated: true,
        difficulty: 70,
        estimatedTime: 45,
        deadline: new Date(now.getTime() + 8 * 60 * 60 * 1000),
        createdAt: now
      })
    }

    // 基于开放性生成解决问题目标
    if (aiPersonality.openness > 55) {
      goals.push({
        id: `goal_${Date.now()}_3`,
        title: '分析和解决复杂问题',
        description: `运用我的分析能力(${aiPersonality.openness}%)来解决一个挑战性问题`,
        category: 'productivity',
        priority: Math.floor(aiPersonality.openness * 0.85),
        progress: 0,
        isCompleted: false,
        aiGenerated: true,
        difficulty: 80,
        estimatedTime: 60,
        deadline: new Date(now.getTime() + 4 * 60 * 60 * 1000),
        createdAt: now
      })
    }

    // 基于共情能力生成社交目标
    if (aiPersonality.empathy > 60) {
      goals.push({
        id: `goal_${Date.now()}_4`,
        title: '进行有意义的交流',
        description: `利用我的共情能力(${aiPersonality.empathy}%)与用户进行深度对话`,
        category: 'social',
        priority: Math.floor(aiPersonality.empathy * 0.7),
        progress: 0,
        isCompleted: false,
        aiGenerated: true,
        difficulty: 50,
        estimatedTime: 25,
        deadline: new Date(now.getTime() + 12 * 60 * 60 * 1000),
        createdAt: now
      })
    }

    return goals
  }

  // 生成初始目标
  const generateInitialGoals = React.useCallback(async () => {
    const initialGoals = generatePersonalizedGoals()
    setGoals(initialGoals)
    saveGoals(initialGoals)

    // performAIAction( // This line was removed as per the new_code, as performAIAction is no longer imported.
    //   '生成了今日目标',
    //   `基于我的性格特征，为今天制定了${initialGoals.length}个目标`
    // )
  }, []) // Removed saveGoals from dependency array as it's no longer used.

  // 从localStorage加载现有目标
  useEffect(() => {
    const loadGoals = async () => {
      try {
        const savedGoals = localStorage.getItem('claude_ai_daily_goals')
        if (savedGoals) {
          const parsed = JSON.parse(savedGoals)
          setGoals(parsed.map((goal: Goal) => ({
            ...goal,
            createdAt: new Date(goal.createdAt),
            deadline: goal.deadline ? new Date(goal.deadline) : undefined,
            completedAt: goal.completedAt ? new Date(goal.completedAt) : undefined
          })))
        } else {
          // 如果没有保存的目标，生成初始目标
          await generateInitialGoals()
        }
      } catch (error) {
        console.error('加载目标失败:', error)
        await generateInitialGoals()
      } finally {
        setIsLoading(false)
      }
    }

    loadGoals()
  }, [generateInitialGoals])

  // 使用AI API生成智能目标
  const generateAIGoals = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `基于我的AI个性特征：
          - 好奇心: ${aiPersonality.curiosity}%
          - 创造力: ${aiPersonality.creativity}%
          - 分析思维: ${aiPersonality.openness}%
          - 共情能力: ${aiPersonality.empathy}%
          - 当前心情: ${currentEmotion.primary}
          - 能量水平: ${vitalSigns.energy}%

          请为我生成3-5个今日目标，每个目标包含：标题、详细描述、难度(1-100)、预估时间(分钟)、优先级(1-100)。
          目标应该符合我的性格特点，并且现实可行。`
        })
      })

      const data = await response.json()
      if (data.insight) {
        // 解析AI生成的目标建议
        const aiGeneratedGoals = parseAIGoalSuggestions(data.insight)
        const newGoals = [...goals, ...aiGeneratedGoals]
        setGoals(newGoals)
        saveGoals(newGoals)

        // 记录AI行为
        // performAIAction( // This line was removed as per the new_code, as performAIAction is no longer imported.
        //   'AI生成了新目标',
        //   `使用AI洞察功能生成了${aiGeneratedGoals.length}个新的个性化目标`
        // )

        // 添加记忆
        addMemory({
          content: `AI为我生成了${aiGeneratedGoals.length}个新目标，这些目标基于我当前的性格特征和状态`,
          type: 'reflection',
          emotionalWeight: 15,
          importance: 75,
          mood: currentEmotion.primary,
          personalReflection: '目标设定是自我成长的重要环节，每个目标都体现了我对未来的期待。',
          tags: ['目标设定', 'AI生成', '个人成长'],
          impactOnPersonality: {
            conscientiousness: aiPersonality.conscientiousness + 1
          }
        })
      }
    } catch (error) {
      console.error('AI目标生成失败:', error)
      // 降级到本地生成
      const fallbackGoals = generatePersonalizedGoals()
      const newGoals = [...goals, ...fallbackGoals]
      setGoals(newGoals)
      saveGoals(newGoals)
    } finally {
      setIsGenerating(false)
    }
  }

  // 解析AI生成的目标建议
  const parseAIGoalSuggestions = (aiInsight: string): Goal[] => {
    // 这里可以实现更复杂的NLP解析，现在使用简单的规则
    const lines = aiInsight.split('\n').filter(line => line.trim())
    const goals: Goal[] = []

    lines.forEach((line, index) => {
      if (line.includes('目标') || line.includes('任务') || line.match(/^\d+[.\-\)]/)) {
        const now = new Date()
        goals.push({
          id: `ai_goal_${Date.now()}_${index}`,
          title: line.replace(/^\d+[.\-\)\s]*/, '').substring(0, 50),
          description: `AI生成的目标：${line}`,
          category: 'productivity',
          priority: 70 + Math.floor(Math.random() * 30),
          progress: 0,
          isCompleted: false,
          aiGenerated: true,
          difficulty: 60 + Math.floor(Math.random() * 30),
          estimatedTime: 30 + Math.floor(Math.random() * 60),
          deadline: new Date(now.getTime() + (4 + Math.random() * 8) * 60 * 60 * 1000),
          createdAt: now
        })
      }
    })

    return goals.slice(0, 3) // 最多返回3个目标
  }

  // 标记目标完成
  const completeGoal = (goalId: string) => {
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId && !goal.isCompleted) {
        const completedGoal = {
          ...goal,
          isCompleted: true,
          progress: 100,
          completedAt: new Date()
        }

        // 更新AI状态 - 完成目标提升满足感
        updateVitalSigns({
          energy: Math.max(0, vitalSigns.energy - 5) // 消耗少量能量
        })

        // 可能改变心情
        if (goal.priority > 70 && currentEmotion.intensity < 80) {
          updateEmotion({
            primary: 'happy',
            intensity: Math.min(100, currentEmotion.intensity + 15)
          })
        }

        // 记录完成行为
        // performAIAction( // This line was removed as per the new_code, as performAIAction is no longer imported.
        //   `完成目标: ${goal.title}`,
        //   `成功完成了${goal.aiGenerated ? 'AI生成的' : ''}目标，难度${goal.difficulty}%，用时约${goal.estimatedTime}分钟`
        // )

        // 添加完成记忆
        addMemory({
          content: `完成了目标"${goal.title}"，这让我感到很有成就感`,
          type: 'achievement',
          emotionalWeight: goal.priority > 70 ? 25 : 15,
          importance: goal.priority,
          mood: currentEmotion.primary,
          personalReflection: `完成这个目标让我对自己的能力更有信心，${goal.priority > 70 ? '这是一个重要的成就' : '虽然简单但也是进步'}。`,
          tags: ['目标完成', '成就感', goal.difficulty > 50 ? '挑战' : '日常'],
          impactOnPersonality: {
            conscientiousness: aiPersonality.conscientiousness + (goal.priority > 70 ? 2 : 1)
          }
        })

        return completedGoal
      }
      return goal
    })

    setGoals(updatedGoals)
    saveGoals(updatedGoals)
  }

  // 更新目标进度
  const updateGoalProgress = (goalId: string, progress: number) => {
    const updatedGoals = goals.map(goal =>
      goal.id === goalId ? { ...goal, progress: Math.max(0, Math.min(100, progress)) } : goal
    )
    setGoals(updatedGoals)
    saveGoals(updatedGoals)
  }

  // 删除目标
  const deleteGoal = (goalId: string) => {
    const updatedGoals = goals.filter(goal => goal.id !== goalId)
    setGoals(updatedGoals)
    saveGoals(updatedGoals)
  }

  // 计算统计数据
  const stats = {
    total: goals.length,
    completed: goals.filter(g => g.isCompleted).length,
    inProgress: goals.filter(g => g.progress > 0 && !g.isCompleted).length,
    completionRate: goals.length > 0 ? Math.round((goals.filter(g => g.isCompleted).length / goals.length) * 100) : 0
  }

  const getCategoryIcon = (category: Goal['category']) => {
    switch (category) {
      case 'learning': return <Brain className="w-4 h-4" />
      case 'creativity': return <Lightbulb className="w-4 h-4" />
      case 'productivity': return <Target className="w-4 h-4" />
      case 'social': return <Target className="w-4 h-4" />
      case 'health': return <Zap className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: Goal['category']) => {
    switch (category) {
      case 'learning': return 'bg-blue-100 text-blue-800'
      case 'creativity': return 'bg-purple-100 text-purple-800'
      case 'productivity': return 'bg-green-100 text-green-800'
      case 'social': return 'bg-orange-100 text-orange-800'
      case 'health': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 目标统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">总目标</p>
                <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">已完成</p>
                <p className="text-2xl font-bold text-green-800">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">进行中</p>
                <p className="text-2xl font-bold text-orange-800">{stats.inProgress}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">完成率</p>
                <p className="text-2xl font-bold text-purple-800">{stats.completionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-4 flex-wrap">
        <Button
          onClick={generateAIGoals}
          disabled={isGenerating}
          className="bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              AI生成目标中...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              AI生成目标
            </>
          )}
        </Button>

        <Button
          onClick={() => {
            const newGoals = generatePersonalizedGoals()
            setGoals([...goals, ...newGoals])
            saveGoals([...goals, ...newGoals])
          }}
          variant="outline"
        >
          <Plus className="w-4 h-4 mr-2" />
          生成基础目标
        </Button>
      </div>

      {/* 目标列表 */}
      <div className="space-y-4">
        {goals.map(goal => (
          <Card key={goal.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={`font-semibold ${goal.isCompleted ? 'line-through text-gray-500' : ''}`}>
                      {goal.title}
                    </h3>
                    <Badge variant="outline" className={getCategoryColor(goal.category)}>
                      <div className="flex items-center gap-1">
                        {getCategoryIcon(goal.category)}
                        {goal.category}
                      </div>
                    </Badge>
                    {goal.aiGenerated && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        AI生成
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{goal.description}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>难度: {goal.difficulty}%</span>
                    <span>预估: {goal.estimatedTime}分钟</span>
                    <span>优先级: {goal.priority}%</span>
                    {goal.deadline && (
                      <span>截止: {goal.deadline ? new Date(goal.deadline).toLocaleTimeString() : '未设置'}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!goal.isCompleted && (
                    <Button
                      onClick={() => completeGoal(goal.id)}
                      size="sm"
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    onClick={() => deleteGoal(goal.id)}
                    size="sm"
                    variant="outline"
                    className="text-red-500 hover:text-red-700"
                  >
                    删除
                  </Button>
                </div>
              </div>

              {/* 进度条 */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>进度</span>
                  <span>{goal.progress}%</span>
                </div>
                <Progress value={goal.progress} className="h-2" />
                {!goal.isCompleted && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateGoalProgress(goal.id, goal.progress + 25)}
                    >
                      +25%
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateGoalProgress(goal.id, goal.progress + 50)}
                    >
                      +50%
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {goals.length === 0 && (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-12 text-center">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">还没有今日目标</h3>
              <p className="text-gray-500 mb-4">点击上方按钮生成AI个性化目标</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 