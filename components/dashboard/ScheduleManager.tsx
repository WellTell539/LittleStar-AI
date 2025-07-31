'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle, 
  AlertCircle,
  CalendarDays,
  CalendarCheck,
  CalendarX,
  CalendarPlus
} from 'lucide-react'

export default function ScheduleManager() {
  const [schedule, setSchedule] = useState<Array<{
    id: string;
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    priority: 'low' | 'medium' | 'high';
    type: 'work' | 'learning' | 'rest' | 'social' | 'general';
    completed: boolean;
  }>>([])
  
  const addScheduleItem = (item: {
    id: string;
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    priority: 'low' | 'medium' | 'high';
    type: 'work' | 'learning' | 'rest' | 'social' | 'general';
    completed: boolean;
  }) => {
    setSchedule([...schedule, item])
  }
  
  const updateScheduleItem = (id: string, updates: Partial<{
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    priority: 'low' | 'medium' | 'high';
    type: 'work' | 'learning' | 'rest' | 'social' | 'general';
    completed: boolean;
  }>) => {
    setSchedule(schedule.map(item => item.id === id ? { ...item, ...updates } : item))
  }
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    type: 'general' as 'work' | 'learning' | 'rest' | 'social' | 'general'
  })

  const handleAddItem = () => {
    if (newItem.title && newItem.startTime && newItem.endTime) {
      const startDateTime = new Date(selectedDate)
      const [startHour, startMinute] = newItem.startTime.split(':').map(Number)
      startDateTime.setHours(startHour, startMinute, 0, 0)

      const endDateTime = new Date(selectedDate)
      const [endHour, endMinute] = newItem.endTime.split(':').map(Number)
      endDateTime.setHours(endHour, endMinute, 0, 0)

      addScheduleItem({
        id: Date.now().toString(),
        title: newItem.title,
        description: newItem.description,
        startTime: startDateTime,
        endTime: endDateTime,
        priority: newItem.priority,
        type: newItem.type,
        completed: false
      })

      setNewItem({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        priority: 'medium',
        type: 'general'
      })
      setShowAddForm(false)
    }
  }

  const handleUpdateItem = (id: string, updates: Partial<{
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    priority: 'low' | 'medium' | 'high';
    type: 'work' | 'learning' | 'rest' | 'social' | 'general';
    completed: boolean;
  }>) => {
    updateScheduleItem(id, updates)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'work': return <CalendarCheck className="w-4 h-4" />
      case 'learning': return <CalendarDays className="w-4 h-4" />
      case 'rest': return <CalendarX className="w-4 h-4" />
      case 'social': return <CalendarPlus className="w-4 h-4" />
      default: return <Calendar className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'work': return 'bg-blue-100 text-blue-800'
      case 'learning': return 'bg-green-100 text-green-800'
      case 'rest': return 'bg-purple-100 text-purple-800'
      case 'social': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getDaySchedule = (date: Date) => {
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)
    
    return schedule.filter(item => {
      const itemStart = new Date(item.startTime)
      return itemStart >= dayStart && itemStart <= dayEnd
    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  }

  const daySchedule = getDaySchedule(selectedDate)

  return (
    <div className="space-y-6">
      {/* 日期选择器 */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            日程管理
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => {
                  const prevDate = new Date(selectedDate)
                  prevDate.setDate(prevDate.getDate() - 1)
                  setSelectedDate(prevDate)
                }}
                variant="outline"
                size="sm"
              >
                前一天
              </Button>
              
              <div className="text-center">
                <p className="text-lg font-semibold">
                  {selectedDate.toLocaleDateString('zh-CN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </p>
              </div>
              
              <Button
                onClick={() => {
                  const nextDate = new Date(selectedDate)
                  nextDate.setDate(nextDate.getDate() + 1)
                  setSelectedDate(nextDate)
                }}
                variant="outline"
                size="sm"
              >
                后一天
              </Button>
            </div>
            
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加日程
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 添加日程表单 */}
      {showAddForm && (
        <Card className="card-modern">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">标题</label>
                <input
                  type="text"
                  value={newItem.title}
                  onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="输入日程标题"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">描述</label>
                <input
                  type="text"
                  value={newItem.description}
                  onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="输入日程描述"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">开始时间</label>
                <input
                  type="time"
                  value={newItem.startTime}
                  onChange={(e) => setNewItem({...newItem, startTime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">结束时间</label>
                <input
                  type="time"
                  value={newItem.endTime}
                  onChange={(e) => setNewItem({...newItem, endTime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">优先级</label>
                <select
                  value={newItem.priority}
                  onChange={(e) => setNewItem({...newItem, priority: e.target.value as 'low' | 'medium' | 'high'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">类型</label>
                <select
                  value={newItem.type}
                  onChange={(e) => setNewItem({...newItem, type: e.target.value as 'work' | 'learning' | 'rest' | 'social' | 'general'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="general">一般</option>
                  <option value="work">工作</option>
                  <option value="learning">学习</option>
                  <option value="rest">休息</option>
                  <option value="social">社交</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button onClick={handleAddItem} className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                添加日程
              </Button>
              <Button 
                onClick={() => setShowAddForm(false)} 
                variant="outline"
              >
                取消
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 日程列表 */}
      <Card className="card-modern">
        <CardContent className="p-6">
          <div className="space-y-4">
            {daySchedule.length > 0 ? (
              daySchedule.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <div className="flex-shrink-0">
                    {getTypeIcon(item.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{item.title}</h4>
                      <Badge className={getTypeColor(item.type)}>
                        {item.type}
                      </Badge>
                      <Badge className={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Badge>
                    </div>
                    
                    {item.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(item.startTime)} - {formatTime(item.endTime)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleUpdateItem(item.id, { completed: !item.completed })}
                      variant={item.completed ? "default" : "outline"}
                      size="sm"
                    >
                      {item.completed ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>这一天还没有安排日程</p>
                <p className="text-sm">点击 &quot;添加日程&quot; 按钮来安排活动</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 