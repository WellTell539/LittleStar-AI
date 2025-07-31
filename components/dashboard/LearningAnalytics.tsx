'use client'

import { useState } from 'react'
import { BarChart3, BookOpen } from 'lucide-react'

export default function LearningAnalytics() {
  const [memories] = useState([
    { id: '1', content: '学习了React Hooks的使用方法', type: 'learning', timestamp: new Date(), emotionalWeight: 5, clarity: 80, importance: 70, tags: ['react', 'hooks'], relatedMemories: [] },
    { id: '2', content: '掌握了TypeScript的基础语法', type: 'learning', timestamp: new Date(Date.now() - 86400000), emotionalWeight: 3, clarity: 75, importance: 65, tags: ['typescript'], relatedMemories: [] },
    { id: '3', content: '学习了Next.js的路由系统', type: 'learning', timestamp: new Date(Date.now() - 172800000), emotionalWeight: 4, clarity: 70, importance: 60, tags: ['nextjs'], relatedMemories: [] }
  ])

  // 计算学习连续天数
  const calculateLearningStreak = (memories: { timestamp: Date }[]) => {
    if (memories.length === 0) return 0
    
    const today = new Date()
    const sortedDates = memories
      .map(m => new Date(m.timestamp).toDateString())
      .sort()
      .reverse()
    
    let streak = 0
    const currentDate = new Date(today)
    
    for (let i = 0; i < 30; i++) { // 最多检查30天
      const dateString = currentDate.toDateString()
      if (sortedDates.includes(dateString)) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }
    
    return streak
  }

  // 计算学习统计数据
  const learningMemories = memories.filter(memory => memory.type === 'learning')
  const totalLearningHours = learningMemories.length * 0.5 // 假设每个学习记忆平均0.5小时
  const learningStreak = calculateLearningStreak(learningMemories)
  
  const recentLearning = learningMemories
    .slice(0, 10)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <div className="space-y-6">
      {/* 学习统计概览 */}
      <div className="bg-white/30 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          学习分析统计
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{learningMemories.length}</p>
            <p className="text-sm text-gray-600">学习记录总数</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">{totalLearningHours.toFixed(1)}h</p>
            <p className="text-sm text-gray-600">累计学习时长</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{learningStreak}</p>
            <p className="text-sm text-gray-600">连续学习天数</p>
          </div>
        </div>
      </div>
      
      {/* 最近学习记录 */}
      <div className="bg-white/30 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">最近学习记录</h3>
        <div className="space-y-3">
          {recentLearning.map((memory, index) => (
            <div key={index} className="bg-white/50 rounded-xl p-4">
              <p className="text-sm text-gray-700">{memory.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                                    {memory.timestamp ? new Date(memory.timestamp).toLocaleDateString() : '未知日期'}
              </p>
            </div>
          ))}
          
          {recentLearning.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>还没有学习记录</p>
              <p className="text-sm">开始学习来看到这里的分析</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 