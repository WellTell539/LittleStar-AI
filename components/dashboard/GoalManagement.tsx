'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Plus, Calendar, Clock, AlertCircle, CheckCircle, Brain, Coffee, Book, Code, Music, Target, Trophy, Trash2 } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { format, formatDistanceToNow } from 'date-fns'
import { enUS } from 'date-fns/locale'

// Time planning system - AI will autonomously execute activities according to schedule
export default function TimeScheduleManagement() {
  const { aiPersonality } = useStore()
  
  // Time schedule - users can only add custom time slot goals
  const [schedules, setSchedules] = useState([
    { 
      id: '1', 
      title: 'Deep Learning Time', 
      description: 'AI will focus on learning new skills during this period', 
      startTime: '09:00', 
      endTime: '11:00', 
      type: 'learning',
      isActive: false,
      progress: 0,
      icon: '🧠'
    },
    { 
      id: '2', 
      title: 'Creative Inspiration Time', 
      description: 'AI will have more creative thinking during this period', 
      startTime: '14:00', 
      endTime: '16:00', 
      type: 'creative',
      isActive: false,
      progress: 0,
      icon: '🎨'
    },
    { 
      id: '3', 
      title: 'Social Sharing Time', 
      description: 'AI will share thoughts and feelings more frequently', 
      startTime: '19:00', 
      endTime: '21:00', 
      type: 'social',
      isActive: false,
      progress: 0,
      icon: '💬'
    }
  ])
  
  // Check if current time is within a certain time period
  const checkActiveSchedule = () => {
    const now = new Date()
    const currentTime = format(now, 'HH:mm')
    
    setSchedules(prev => prev.map(schedule => {
      const isInTimeRange = currentTime >= schedule.startTime && currentTime <= schedule.endTime
      return { ...schedule, isActive: isInTimeRange }
    }))
  }
  
  // Simulate AI autonomous progress updates
  const updateAIProgress = () => {
    setSchedules(prev => prev.map(schedule => {
      if (schedule.isActive && schedule.progress < 100) {
        // AI automatically advances progress based on personality traits
        const progressRate = schedule.type === 'learning' ? aiPersonality.curiosity / 100 :
                            schedule.type === 'creative' ? aiPersonality.creativity / 100 :
                            aiPersonality.extraversion / 100
        
        const newProgress = Math.min(100, schedule.progress + progressRate * Math.random() * 5)
        return { ...schedule, progress: newProgress }
      }
      return schedule
    }))
  }
  
  // Add new time schedule
  const addSchedule = (newSchedule: { title: string; description: string; startTime: string; endTime: string; type: string }) => {
    // Check for time conflicts
    const hasConflict = schedules.some(s => 
      (newSchedule.startTime >= s.startTime && newSchedule.startTime < s.endTime) ||
      (newSchedule.endTime > s.startTime && newSchedule.endTime <= s.endTime)
    )
    
    if (hasConflict) {
      alert('This time slot conflicts with existing plans!')
      return false
    }
    
    const schedule = {
      id: Date.now().toString(),
      ...newSchedule,
      isActive: false,
      progress: 0,
      icon: getIconForType(newSchedule.type)
    }
    setSchedules(prev => [...prev, schedule])
    return true
  }
  
  const getIconForType = (type: string) => {
    const icons: Record<string, string> = {
      learning: '📚',
      creative: '🎨',
      social: '💬',
      work: '💼',
      rest: '😴',
      exercise: '🏃',
      hobby: '🎮'
    }
    return icons[type] || '⏰'
  }
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    type: 'learning'
  })
  
  // Automatically check time and update progress
  useEffect(() => {
    checkActiveSchedule() // Initial check
    
    const scheduleTimer = setInterval(() => {
      checkActiveSchedule()
    }, 60000) // Check time every minute
    
    const progressTimer = setInterval(() => {
      updateAIProgress()
    }, 30000) // Update progress every 30 seconds
    
    return () => {
      clearInterval(scheduleTimer)
      clearInterval(progressTimer)
    }
  }, [aiPersonality])

  // Handle adding new time schedule
  const handleAddSchedule = () => {
    if (newSchedule.title.trim() && newSchedule.startTime && newSchedule.endTime) {
      const success = addSchedule(newSchedule)
      if (success) {
        setNewSchedule({
          title: '',
          description: '',
          startTime: '',
          endTime: '',
          type: 'learning'
        })
        setShowAddForm(false)
      }
    }
  }

  // Delete time schedule
  const deleteSchedule = (scheduleId: string) => {
    setSchedules(prev => prev.filter(s => s.id !== scheduleId))
  }

  // Get type color
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      learning: 'text-blue-600 bg-blue-100',
      creative: 'text-purple-600 bg-purple-100',
      social: 'text-green-600 bg-green-100',
      work: 'text-orange-600 bg-orange-100',
      rest: 'text-gray-600 bg-gray-100',
      exercise: 'text-red-600 bg-red-100',
      hobby: 'text-pink-600 bg-pink-100'
    }
    return colors[type] || 'text-gray-600 bg-gray-100'
  }

  // Get type icon
  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      learning: Book,
      creative: Brain,
      social: Music,
      work: Code,
      rest: Coffee,
      exercise: Target,
      hobby: Trophy
    }
    return icons[type] || Clock
  }

  // Get currently active time schedules
  const activeSchedules = schedules.filter(s => s.isActive)
  const upcomingSchedules = schedules.filter(s => !s.isActive)

  return (
    <div className="content-modern">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <Clock className="w-6 h-6 text-blue-500" />
            Time Scheduling
          </h2>
          <p className="text-gray-600">AI will autonomously execute various activities according to your schedule</p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="relative overflow-hidden bg-gradient-to-r from-blue-500/90 to-purple-500/90 backdrop-blur-sm border border-blue-400/30 rounded-2xl px-6 py-3 text-white font-medium hover:from-blue-600/90 hover:to-purple-600/90 hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
                      Add Time Schedule
        </button>
      </div>

      {/* 添加时间规划表单 */}
      {showAddForm && (
        <div className="card-modern p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">创建新时间规划</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">规划标题</label>
              <input
                type="text"
                value={newSchedule.title}
                onChange={(e) => setNewSchedule({...newSchedule, title: e.target.value})}
                placeholder="输入时间规划标题..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
              <textarea
                value={newSchedule.description}
                onChange={(e) => setNewSchedule({...newSchedule, description: e.target.value})}
                placeholder="描述AI在这个时间段应该做什么..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">开始时间</label>
                <input
                  type="time"
                  value={newSchedule.startTime}
                  onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">结束时间</label>
                <input
                  type="time"
                  value={newSchedule.endTime}
                  onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">活动类型</label>
                <select
                  value={newSchedule.type}
                  onChange={(e) => setNewSchedule({...newSchedule, type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="learning">学习</option>
                  <option value="creative">创作</option>
                  <option value="social">社交</option>
                  <option value="work">工作</option>
                  <option value="rest">休息</option>
                  <option value="exercise">运动</option>
                  <option value="hobby">兴趣</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleAddSchedule}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                创建规划
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{schedules.length}</h3>
          <p className="text-gray-600">总时间规划</p>
        </div>
        
        <div className="stat-card">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-400 rounded-xl flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">{activeSchedules.length}</h3>
          <p className="text-gray-600">正在执行</p>
        </div>
        
        <div className="stat-card">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center mb-4">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">
            {activeSchedules.length > 0 ? Math.round(activeSchedules.reduce((sum, s) => sum + s.progress, 0) / activeSchedules.length) : 0}%
          </h3>
          <p className="text-gray-600">平均进度</p>
        </div>
      </div>

      {/* 当前活跃的时间规划 */}
      {activeSchedules.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            AI正在执行中
          </h3>
          <div className="space-y-4">
            {activeSchedules.map((schedule) => {
              const TypeIcon = getTypeIcon(schedule.type)
              return (
                <div key={schedule.id} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200 shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <TypeIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                          {schedule.icon} {schedule.title}
                          <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">活跃中</span>
                        </h4>
                        <p className="text-gray-600 text-sm mb-2">{schedule.description}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className={`px-2 py-1 rounded-full ${getTypeColor(schedule.type)}`}>
                            {schedule.type === 'learning' ? '学习' : 
                             schedule.type === 'creative' ? '创作' : 
                             schedule.type === 'social' ? '社交' : schedule.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {schedule.startTime} - {schedule.endTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* AI自主进度条 */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">AI自主进度</span>
                      <span className="text-sm text-gray-600">{Math.round(schedule.progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500 animate-pulse"
                        style={{ width: `${schedule.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 所有时间规划 */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">时间规划表</h3>
        {schedules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            还没有设定时间规划，点击上方按钮创建第一个时间规划吧！
          </div>
        ) : (
          <div className="space-y-4">
            {schedules.map((schedule) => {
              const TypeIcon = getTypeIcon(schedule.type)
              return (
                <div key={schedule.id} className={`rounded-2xl border shadow-sm p-6 ${schedule.isActive ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${schedule.isActive ? 'bg-blue-500' : 'bg-gray-100'}`}>
                        <TypeIcon className={`w-5 h-5 ${schedule.isActive ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                          {schedule.icon} {schedule.title}
                          {schedule.isActive && <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">活跃中</span>}
                        </h4>
                        <p className="text-gray-600 text-sm mb-2">{schedule.description}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className={`px-2 py-1 rounded-full ${getTypeColor(schedule.type)}`}>
                            {schedule.type === 'learning' ? '学习' : 
                             schedule.type === 'creative' ? '创作' : 
                             schedule.type === 'social' ? '社交' : 
                             schedule.type === 'work' ? '工作' :
                             schedule.type === 'rest' ? '休息' :
                             schedule.type === 'exercise' ? '运动' :
                             schedule.type === 'hobby' ? '兴趣' : schedule.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {schedule.startTime} - {schedule.endTime}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteSchedule(schedule.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* 进度显示 */}
                  {schedule.progress > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {schedule.isActive ? 'AI正在自主执行' : '今日完成进度'}
                        </span>
                        <span className="text-sm text-gray-600">{Math.round(schedule.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${schedule.isActive ? 'bg-gradient-to-r from-green-400 to-blue-500 animate-pulse' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}
                          style={{ width: `${schedule.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 使用提示 */}
      <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-amber-600 mt-1" />
          <div>
            <h4 className="font-semibold text-amber-800 mb-2">💡 使用说明</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• AI会根据时间规划自主执行各种活动，无需用户干预</li>
              <li>• 当前时间在规划范围内时，AI会自动激活并展现相应行为</li>
              <li>• 进度会根据AI的个性特征自动推进</li>
              <li>• 用户只能添加和删除时间规划，不能手动调整进度</li>
              <li>• 时间冲突的规划将无法创建</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 