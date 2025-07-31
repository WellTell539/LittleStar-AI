'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Clock, Calendar, Target, Plus, X } from 'lucide-react'

interface TimeSchedule {
  id: string
  timeSlot: string
  content: string
  startTime: string
  endTime: string
  isActive: boolean
  progress: number
  createdAt: Date
}

export default function CuteTimeManagement() {
  const { aiPersonality } = useStore() // Remove non-existent updateProgress
  const [schedules, setSchedules] = useState<TimeSchedule[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSchedule, setNewSchedule] = useState({
    timeSlot: '',
    content: '',
    startTime: '',
    endTime: ''
  })

  // Check time conflicts
  const checkTimeConflict = (start: string, end: string, excludeId?: string) => {
    return schedules.some(schedule => {
      if (excludeId && schedule.id === excludeId) return false
      
      const scheduleStart = schedule.startTime
      const scheduleEnd = schedule.endTime
      
      return (
        (start >= scheduleStart && start < scheduleEnd) ||
        (end > scheduleStart && end <= scheduleEnd) ||
        (start <= scheduleStart && end >= scheduleEnd)
      )
    })
  }

  // Check current active time slots
  const checkActiveSchedule = () => {
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5)
    
    setSchedules(prev => prev.map(schedule => {
      const isCurrentlyActive = currentTime >= schedule.startTime && currentTime <= schedule.endTime
      return { ...schedule, isActive: isCurrentlyActive }
    }))
  }

  // AI automatically updates progress
  const updateAIProgress = () => {
    setSchedules(prev => prev.map(schedule => {
      if (schedule.isActive && schedule.progress < 100) {
        // Adjust progress speed based on AI personality traits
        const efficiencyBoost = (aiPersonality?.conscientiousness || 50) / 100
        const creativityBoost = (aiPersonality?.openness || 50) / 100
        const baseIncrement = 2 + (efficiencyBoost * 3) + (creativityBoost * 2)
        
        return {
          ...schedule,
          progress: Math.min(100, schedule.progress + baseIncrement)
        }
      }
      return schedule
    }))
  }

  // Add new time schedule
  const addSchedule = () => {
    if (!newSchedule.timeSlot || !newSchedule.content || !newSchedule.startTime || !newSchedule.endTime) {
      alert('Please fill in all required fields')
      return
    }

    if (newSchedule.startTime >= newSchedule.endTime) {
      alert('End time must be later than start time')
      return
    }

    if (checkTimeConflict(newSchedule.startTime, newSchedule.endTime)) {
      alert('This time slot conflicts with existing plans')
      return
    }

    const schedule: TimeSchedule = {
      id: Date.now().toString(),
      timeSlot: newSchedule.timeSlot,
      content: newSchedule.content,
      startTime: newSchedule.startTime,
      endTime: newSchedule.endTime,
      isActive: false,
      progress: 0,
      createdAt: new Date()
    }

    setSchedules(prev => [...prev, schedule].sort((a, b) => a.startTime.localeCompare(b.startTime)))
    setNewSchedule({ timeSlot: '', content: '', startTime: '', endTime: '' })
    setShowAddForm(false)
  }

  // 删除时间规划
  const removeSchedule = (id: string) => {
    setSchedules(prev => prev.filter(schedule => schedule.id !== id))
  }

  useEffect(() => {
    // 每分钟检查活跃时间段
    const scheduleChecker = setInterval(checkActiveSchedule, 60000)
    // 每30秒更新AI进度
    const progressUpdater = setInterval(updateAIProgress, 30000)

    // 初始检查
    checkActiveSchedule()

    return () => {
      clearInterval(scheduleChecker)
      clearInterval(progressUpdater)
    }
  }, [schedules, aiPersonality])

  const getTimeIcon = (timeSlot: string) => {
    const hour = parseInt(timeSlot.split(':')[0])
    if (hour >= 6 && hour < 12) return '🌅'
    if (hour >= 12 && hour < 18) return '☀️'
    if (hour >= 18 && hour < 22) return '🌆'
    return '🌙'
  }

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-400'
    if (progress < 70) return 'bg-yellow-400'
    return 'bg-green-400'
  }

  return (
    <div className="card-cute p-6">
      {/* 标题区域 */}
      <motion.div 
        className="text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-5xl mb-3">⏰</div>
        <h2 className="text-2xl font-bold text-gradient mb-2">时间规划表</h2>
        <p className="text-gray-600 text-sm">AI会根据时间表自主执行和进步哦～</p>
      </motion.div>

      {/* 添加按钮 */}
      <motion.div 
        className="mb-6 text-center"
        whileHover={{ scale: 1.02 }}
      >
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-cute btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          添加时间规划
        </Button>
      </motion.div>

      {/* 添加表单 */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            className="card-cute p-4 mb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">时间段名称</label>
                <input
                  type="text"
                  placeholder="例如：上午学习时光"
                  value={newSchedule.timeSlot}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, timeSlot: e.target.value }))}
                  className="w-full p-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">具体内容</label>
                <input
                  type="text"
                  placeholder="例如：学习新的编程技术"
                  value={newSchedule.content}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full p-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">开始时间</label>
                <input
                  type="time"
                  value={newSchedule.startTime}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full p-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">结束时间</label>
                <input
                  type="time"
                  value={newSchedule.endTime}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full p-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <Button 
                onClick={() => setShowAddForm(false)}
                variant="outline"
                className="btn-cute btn-secondary"
              >
                取消
              </Button>
              <Button 
                onClick={addSchedule}
                className="btn-cute btn-primary"
              >
                添加规划
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 时间规划列表 */}
      <div className="space-y-4">
        <AnimatePresence>
          {schedules.map((schedule, index) => (
            <motion.div
              key={schedule.id}
              className={`
                card-cute p-4 relative overflow-hidden
                ${schedule.isActive ? 'ring-2 ring-purple-300 animate-glow' : ''}
              `}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
            >
              {/* 删除按钮 */}
              <button
                onClick={() => removeSchedule(schedule.id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4 mb-3">
                <div className="text-3xl">{getTimeIcon(schedule.startTime)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-800">{schedule.timeSlot}</h3>
                    {schedule.isActive && (
                      <Badge className="bg-green-100 text-green-600 animate-pulse">
                        AI正在执行中
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">{schedule.content}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    {schedule.startTime} - {schedule.endTime}
                  </div>
                </div>
              </div>

              {/* 进度条 */}
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-500">AI执行进度</span>
                  <span className="text-xs font-medium text-gray-700">{schedule.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full ${getProgressColor(schedule.progress)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${schedule.progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* 背景动画 */}
              {schedule.isActive && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 opacity-30 -z-10"
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {schedules.length === 0 && (
          <motion.div
            className="text-center py-12 text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-4">📅</div>
            <p className="text-lg mb-2">还没有时间规划</p>
            <p className="text-sm">添加一些时间规划，让AI更有条理地成长吧～</p>
          </motion.div>
        )}
      </div>

      {/* 使用说明 */}
      <motion.div 
        className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
          <span>💡</span>
          使用说明
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• AI会根据时间表自主执行任务，无需人工干预</li>
          <li>• 进度会根据AI的性格特征自动调整</li>
          <li>• 时间冲突会被自动检测和阻止</li>
          <li>• 用户只能设定时间段和内容，进度由AI自主管理</li>
        </ul>
      </motion.div>
    </div>
  )
}