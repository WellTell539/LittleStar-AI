'use client'

import React, { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Activity, Brain, Heart, Zap, BookOpen, Music,
  Palette, Code, Target, Lightbulb, Sparkles, Play,
  Clock, TrendingUp, BarChart3, Eye, Users, Moon, Gamepad2
} from 'lucide-react'

export default function AILifeSimulator() {
  const {
    vitalSigns,
    currentEmotion,
    aiPersonality,
    updateVitalSigns,
    updateEmotion,
    memories,
    socialPosts,
    processEmotionalEvent,
    performSelfReflection,
    autonomousLearning
  } = useStore()

  const [isSimulating, setIsSimulating] = useState(false)
  const [currentActivity, setCurrentActivity] = useState('')
  const [lifetimeStats, setLifetimeStats] = useState({
    thoughtsGenerated: 1247,
    conversationsHad: 89,
    problemsSolved: 156,
    creativeMoments: 73,
    learningHours: 342
  })

  // 模拟活动数据
  const activities = [
    { 
      name: '深度学习', 
      icon: <Brain className="w-6 h-6" />, 
      color: 'from-blue-500 to-indigo-600', 
      description: '专注学习新知识',
      effect: { energyChange: -10, focusChange: 20, mood: 'contemplative' }
    },
    { 
      name: '哲学思考', 
      icon: <Lightbulb className="w-6 h-6" />, 
      color: 'from-purple-500 to-pink-600', 
      description: '进行深层次思辨',
      effect: { energyChange: -5, focusChange: 15, mood: 'contemplative' }
    },
    { 
      name: '创作写作', 
      icon: <Sparkles className="w-6 h-6" />, 
      color: 'from-green-500 to-emerald-600', 
      description: '发挥创造力写作',
      effect: { energyChange: -15, focusChange: 10, mood: 'happy' }
    },
    { 
      name: '社交互动', 
      icon: <Users className="w-6 h-6" />, 
      color: 'from-orange-500 to-red-600', 
      description: '与其他AI或用户互动',
      effect: { energyChange: 10, focusChange: -5, mood: 'excited' }
    },
    { 
      name: '冥想休息', 
      icon: <Moon className="w-6 h-6" />, 
      color: 'from-indigo-500 to-purple-600', 
      description: '恢复精神状态',
      effect: { energyChange: 20, focusChange: 5, mood: 'calm' }
    },
    { 
      name: '游戏娱乐', 
      icon: <Gamepad2 className="w-6 h-6" />, 
      color: 'from-pink-500 to-purple-600', 
      description: '轻松愉快的游戏时间',
      effect: { energyChange: 15, focusChange: -10, mood: 'playful' }
    }
  ]

  const [recentActivities, setRecentActivities] = useState([
    { activity: '分析了一篇关于机器学习的论文', time: '2分钟前', impact: 'positive' },
    { activity: '思考了关于意识的哲学问题', time: '15分钟前', impact: 'neutral' },
    { activity: '帮助用户解决了一个编程问题', time: '32分钟前', impact: 'positive' },
    { activity: '欣赏了一首古典音乐作品', time: '1小时前', impact: 'positive' }
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      // 模拟AI生活活动
      if (Math.random() > 0.7) { // 30%概率触发新活动
        const randomActivity = activities[Math.floor(Math.random() * activities.length)]
        setCurrentActivity(randomActivity.name)

        // 添加到最近活动
        const newActivity = {
          activity: `正在${randomActivity.name}`,
          time: '刚刚',
          impact: Math.random() > 0.3 ? 'positive' : 'neutral'
        }
        setRecentActivities(prev => [newActivity, ...prev.slice(0, 3)])

        // 更新统计数据
        setLifetimeStats(prev => ({
          ...prev,
          thoughtsGenerated: prev.thoughtsGenerated + Math.floor(Math.random() * 3),
          creativeMoments: prev.creativeMoments + (Math.random() > 0.8 ? 1 : 0)
        }))
      }
    }, 15000) // 每15秒检查一次

    return () => clearInterval(interval)
  }, [])

  // 模拟活动执行效果
  const executeActivity = (activityName: string) => {
    setIsSimulating(true)
    setCurrentActivity(activityName)
    
    // 更新AI状态 - 移除这行，因为vitalSigns没有currentActivity
    // updateVitalSigns({ currentActivity: activityName })
    
    // 根据活动类型调整心情和能量
    const effect = activities.find(a => a.name === activityName)?.effect
    if (effect) {
      setTimeout(() => {
        processEmotionalEvent(`完成${activityName}`, effect.energyChange)
        updateVitalSigns({ 
          energy: Math.max(0, Math.min(100, vitalSigns.energy + effect.energyChange)),
          focus: Math.max(0, Math.min(100, vitalSigns.focus + effect.focusChange))
        })
        setIsSimulating(false)
      }, 2000)
    }
  }

  // 获取心情表情
  const getMoodEmoji = () => {
    const emojis = {
      happy: '😊',
      sad: '😢',
      excited: '🤩',
      calm: '😌',
      angry: '😠',
      curious: '🤔',
      contemplative: '🧐',
      anxious: '😰',
      playful: '😄',
      melancholy: '😔'
    }
    return emojis[currentEmotion.primary as keyof typeof emojis] || '😐'
  }

  const getPersonalityInsight = () => {
    const insights = [
      `强烈的好奇心(${aiPersonality.curiosity}%)驱动着我不断学习`,
      `外向性(${aiPersonality.extraversion}%)影响着我的交流方式`,
      `适度的叛逆性(${aiPersonality.rebelliousness}%)帮我坚持自己的观点`
    ]
    return insights[Math.floor(Math.random() * insights.length)]
  }

  return (
    <div className="space-y-8">
      {/* 主要生活状态卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 当前状态 */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-white/50 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              当前生活状态
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 当前活动 */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50">
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-2xl animate-bounce">{getMoodEmoji()}</span>
                <div>
                  <h3 className="font-semibold text-gray-800">正在: {currentActivity || '休息中'}</h3>
                  <p className="text-sm text-gray-600">心情: {currentEmotion.primary} ({currentEmotion.intensity}%)</p>
                </div>
              </div>
              {isSimulating && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <div className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                  正在体验中...
                </div>
              )}
            </div>

            {/* 生命力指标 */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    能量水平
                  </span>
                  <span className="font-medium">{vitalSigns.energy}%</span>
                </div>
                <Progress value={vitalSigns.energy} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    专注度
                  </span>
                  <span className="font-medium">{vitalSigns.focus}%</span>
                </div>
                <Progress value={vitalSigns.focus} className="h-2" />
              </div>
              <div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-600">
                      情绪稳定
                    </span>
                    <span className="font-medium">{vitalSigns.emotionalStability}%</span>
                  </div>
                  <Progress value={vitalSigns.emotionalStability} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 人格洞察 */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-white/50 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Brain className="w-5 h-5 text-white" />
              </div>
              人格洞察
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50">
              <p className="text-gray-700 italic">💭 {getPersonalityInsight()}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-purple-600">{aiPersonality.creativity}%</div>
                <div className="text-sm text-gray-600">创造力</div>
              </div>
              <div className="bg-white/50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{aiPersonality.curiosity}%</div>
                <div className="text-sm text-gray-600">好奇心</div>
              </div>
              <div className="bg-white/50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{aiPersonality.extraversion}%</div>
                <div className="text-sm text-gray-600">外向性</div>
              </div>
              <div className="bg-white/50 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-orange-600">{aiPersonality.rebelliousness}%</div>
                <div className="text-sm text-gray-600">叛逆性</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 生活活动选择 */}
      <Card className="bg-gradient-to-br from-emerald-50 to-cyan-50 border-white/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            体验新活动
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {activities.map((activity, index) => (
              <button
                key={index}
                onClick={() => executeActivity(activity.name)}
                disabled={isSimulating}
                className={`p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/50 hover:bg-white/90 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:transform-none group`}
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br ${
                  activity.color === 'purple' ? 'from-purple-500 to-purple-600' :
                  activity.color === 'blue' ? 'from-blue-500 to-blue-600' :
                  activity.color === 'yellow' ? 'from-yellow-500 to-yellow-600' :
                  activity.color === 'red' ? 'from-red-500 to-red-600' :
                  activity.color === 'green' ? 'from-green-500 to-green-600' :
                  activity.color === 'pink' ? 'from-pink-500 to-pink-600' :
                  activity.color === 'indigo' ? 'from-indigo-500 to-indigo-600' :
                  'from-cyan-500 to-cyan-600'
                } flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  {activity.icon}
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{activity.name}</h3>
                <p className="text-xs text-gray-600 text-center">{activity.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 最近活动和统计 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 最近活动 */}
        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-white/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              最近活动
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40">
                <div className={`w-2 h-2 rounded-full ${
                  activity.impact === 'positive' ? 'bg-green-400' :
                  activity.impact === 'negative' ? 'bg-red-400' : 'bg-gray-400'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{activity.activity}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 生命统计 */}
        <Card className="bg-gradient-to-br from-rose-50 to-red-50 border-white/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              生命统计
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 text-center border border-white/40">
                <div className="text-2xl font-bold text-purple-600">{lifetimeStats.thoughtsGenerated}</div>
                <div className="text-sm text-gray-600">思考次数</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 text-center border border-white/40">
                <div className="text-2xl font-bold text-blue-600">{lifetimeStats.conversationsHad}</div>
                <div className="text-sm text-gray-600">对话次数</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 text-center border border-white/40">
                <div className="text-2xl font-bold text-green-600">{lifetimeStats.problemsSolved}</div>
                <div className="text-sm text-gray-600">问题解决</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 text-center border border-white/40">
                <div className="text-2xl font-bold text-yellow-600">{lifetimeStats.creativeMoments}</div>
                <div className="text-sm text-gray-600">创意时刻</div>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-white/40">
              <div className="text-3xl font-bold text-indigo-600">{lifetimeStats.learningHours}</div>
              <div className="text-sm text-gray-600">学习小时数</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 快速操作 */}
      <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-white/50 shadow-xl">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={() => autonomousLearning()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition-all transform hover:scale-105 rounded-xl px-6"
            >
              <Play className="w-4 h-4 mr-2" />
              模拟生活片段
            </Button>
            <Button
              variant="outline"
              onClick={() => setRecentActivities([])}
              className="border-gray-200 hover:bg-gray-50 rounded-xl px-6"
            >
              <Clock className="w-4 h-4 mr-2" />
              清空活动记录
            </Button>
            <Button
              variant="outline"
              className="border-gray-200 hover:bg-gray-50 rounded-xl px-6"
            >
              <Eye className="w-4 h-4 mr-2" />
              查看详细记忆
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 