'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useStore, AIMemory, AIEmotion } from '@/store/useStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Brain, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Heart, 
  Star, 
  Clock,
  MessageSquare,
  Lightbulb,
  Calendar,
  Activity,
  Eye,
  Edit3,
  Save,
  X,
  MessageCircle
} from 'lucide-react'

export default function MemoryManagement() {
  const {
    memories: aiMemories,
    addMemory,
    aiPersonality,
    currentEmotion,
    vitalSigns,
    updateVitalSigns
  } = useStore()

  const [memories, setMemories] = useState<AIMemory[]>([])
  const [filteredMemories, setFilteredMemories] = useState<AIMemory[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterImportance, setFilterImportance] = useState<string>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMemory, setEditingMemory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 新记忆表单
  const [newMemory, setNewMemory] = useState<{
    content: string
    type: AIMemory['type']
    emotionalWeight: number
    importance: number
    mood: AIEmotion['primary']
    personalReflection: string
    tags: string[]
  }>({
    content: '',
    type: 'reflection',
    emotionalWeight: 0,
    importance: 50,
    mood: 'calm',
    personalReflection: '',
    tags: []
  })
  
  const [tagInput, setTagInput] = useState('')

  // 从store和localStorage加载记忆
  useEffect(() => {
    const loadMemories = async () => {
      try {
        // 首先使用store中的记忆
        let allMemories = [...aiMemories]

        // 从localStorage加载额外的记忆（仅在客户端）
        if (typeof window !== 'undefined' && window.localStorage) {
          try {
            const savedMemories = localStorage.getItem('claude_ai_memories')
            if (savedMemories) {
              const parsed = JSON.parse(savedMemories)
              const localMemories = parsed.map((memory: AIMemory) => ({
                ...memory,
                timestamp: new Date(memory.timestamp)
              }))
              
              // 合并并去重
              const memoryIds = new Set(allMemories.map(m => m.id))
              const uniqueLocalMemories = localMemories.filter((m: AIMemory) => !memoryIds.has(m.id))
              allMemories = [...allMemories, ...uniqueLocalMemories]
            }
          } catch (error) {
            console.warn('无法从localStorage加载记忆:', error)
          }
        }

        setMemories(allMemories)
        setFilteredMemories(allMemories)
      } catch (error) {
        console.error('加载记忆失败:', error)
        setMemories(aiMemories)
        setFilteredMemories(aiMemories)
      } finally {
        setIsLoading(false)
      }
    }

    loadMemories()
  }, [aiMemories])

  // 保存记忆到localStorage（仅在客户端）
  const saveMemoriesToLocal = (memoryList: AIMemory[]) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('claude_ai_memories', JSON.stringify(memoryList))
      } catch (error) {
        console.error('保存记忆失败:', error)
      }
    }
  }

  // 搜索和过滤
  useEffect(() => {
    let filtered = [...memories]

    // 文本搜索
    if (searchTerm) {
      filtered = filtered.filter(memory => 
        memory.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        memory.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // 类型过滤
    if (filterType !== 'all') {
      filtered = filtered.filter(memory => memory.type === filterType)
    }

    // 重要性过滤
    if (filterImportance !== 'all') {
      const importanceThreshold = parseInt(filterImportance)
      filtered = filtered.filter(memory => memory.importance >= importanceThreshold)
    }

    // 按时间排序（最新的在前）
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    setFilteredMemories(filtered)
  }, [memories, searchTerm, filterType, filterImportance])

  // 添加新记忆
  const handleAddMemory = async () => {
    if (!newMemory.content.trim()) return

    addMemory({
      content: newMemory.content,
      type: newMemory.type,
      emotionalWeight: newMemory.emotionalWeight,
      importance: newMemory.importance,
      mood: newMemory.mood,
      personalReflection: newMemory.personalReflection,
      tags: newMemory.tags,
      impactOnPersonality: {}
    })

    // 创建完整的记忆对象用于本地存储
    const fullMemory: AIMemory = {
      ...newMemory, // 使用newMemory作为基础，因为addMemory已经添加了id和timestamp
      id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      impactOnPersonality: {}
    }

    // 更新本地状态
    const updatedMemories = [fullMemory, ...memories]
    setMemories(updatedMemories)
    saveMemoriesToLocal(updatedMemories)

    // 记录AI行为
    // performAIAction(
    //   '创建了新记忆',
    //   `记录了一条${memory.type}类型的记忆，重要性${memory.importance}%，情感权重${memory.emotionalWeight}`
    // )

    // 根据记忆的情感权重调整AI状态
    // if (memory.emotionalWeight > 20) {
    //   updateAIState({ 
    //     satisfaction: Math.min(100, aiState.satisfaction + 5)
    //   })
    // } else if (memory.emotionalWeight < -20) {
    //   updateAIState({ 
    //     stress: Math.min(100, (aiState.stress || 0) + 5)
    //   })
    // }

    // 重置表单
    setNewMemory({
      content: '',
      type: 'reflection',
      emotionalWeight: 0,
      importance: 50,
      mood: 'calm',
      personalReflection: '',
      tags: []
    })
    setTagInput('')
    setShowAddForm(false)
  }

  // 删除记忆
  const deleteMemory = (memoryId: string) => {
    const updatedMemories = memories.filter(m => m.id !== memoryId)
    setMemories(updatedMemories)
    saveMemoriesToLocal(updatedMemories)

    // performAIAction(
    //   '删除了记忆',
    //   `删除了一条记忆，可能是因为它不再重要或者包含错误信息`
    // )
  }

  // 编辑记忆
  const startEditMemory = (memoryId: string) => {
    setEditingMemory(memoryId)
  }

  const saveEditMemory = (memoryId: string, newContent: string) => {
    const updatedMemories = memories.map(memory =>
      memory.id === memoryId
        ? { ...memory, content: newContent, importance: Math.min(100, memory.importance + 5) }
        : memory
    )
    setMemories(updatedMemories)
    saveMemoriesToLocal(updatedMemories)
    setEditingMemory(null)

    // performAIAction(
    //   '更新了记忆',
    //   '对一条记忆进行了编辑，提高了记忆的清晰度'
    // )
  }

  // 标签处理
  const addTag = () => {
    if (tagInput.trim() && !newMemory.tags.includes(tagInput.trim())) {
      setNewMemory(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setNewMemory(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // 记忆类型图标
  const getTypeIcon = (type: AIMemory['type']) => {
    switch (type) {
      case 'conversation': return <MessageCircle className="w-4 h-4" />
      case 'learning': return <Brain className="w-4 h-4" />
      case 'reflection': return <Lightbulb className="w-4 h-4" />
      case 'experience': return <Calendar className="w-4 h-4" />
      case 'emotion': return <Heart className="w-4 h-4" />
      case 'achievement': return <Star className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  // 记忆类型颜色
  const getTypeColor = (type: AIMemory['type']) => {
    switch (type) {
      case 'conversation': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'learning': return 'bg-green-100 text-green-800 border-green-200'
      case 'reflection': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'experience': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'emotion': return 'bg-red-100 text-red-800 border-red-200'
      case 'achievement': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // 重要性颜色
  const getImportanceColor = (importance: number) => {
    if (importance >= 80) return 'text-red-500'
    if (importance >= 60) return 'text-orange-500'
    if (importance >= 40) return 'text-yellow-500'
    return 'text-gray-500'
  }

  // 情感权重显示
  const getEmotionDisplay = (weight: number) => {
    if (weight > 20) return { icon: '😊', color: 'text-green-500', label: '积极' }
    if (weight > 0) return { icon: '🙂', color: 'text-blue-500', label: '轻微积极' }
    if (weight === 0) return { icon: '😐', color: 'text-gray-500', label: '中性' }
    if (weight > -20) return { icon: '😔', color: 'text-orange-500', label: '轻微消极' }
    return { icon: '😢', color: 'text-red-500', label: '消极' }
  }

  // 统计数据
  const stats = {
    totalMemories: memories.length,
    recentMemories: memories.filter(m => 
      new Date().getTime() - new Date(m.timestamp).getTime() < 7 * 24 * 60 * 60 * 1000
    ).length,
    averageImportance: memories.length > 0
      ? Math.round(memories.reduce((sum, m) => sum + m.importance, 0) / memories.length)
      : 0,
    emotionalMemories: memories.filter(m => Math.abs(m.emotionalWeight) > 30).length,
    byType: {
      learning: memories.filter(m => m.type === 'learning').length,
      conversation: memories.filter(m => m.type === 'conversation').length,
      reflection: memories.filter(m => m.type === 'reflection').length,
      achievement: memories.filter(m => m.type === 'achievement').length,
      emotion: memories.filter(m => m.type === 'emotion').length,
      experience: memories.filter(m => m.type === 'experience').length
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">总记忆</p>
                <p className="text-2xl font-bold text-blue-800">{stats.totalMemories}</p>
              </div>
              <Brain className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">学习记忆</p>
                <p className="text-2xl font-bold text-green-800">{stats.byType.learning}</p>
              </div>
              <Lightbulb className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">平均重要性</p>
                <p className="text-2xl font-bold text-purple-800">{stats.averageImportance}%</p>
              </div>
              <Star className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">情感记忆</p>
                <p className="text-2xl font-bold text-orange-800">{stats.emotionalMemories}</p>
              </div>
              <Heart className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和过滤 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜索记忆内容或标签..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="选择类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="conversation">对话</SelectItem>
                <SelectItem value="learning">学习</SelectItem>
                <SelectItem value="reflection">反思</SelectItem>
                <SelectItem value="event">事件</SelectItem>
                <SelectItem value="feeling">情感</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterImportance} onValueChange={setFilterImportance}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="重要性" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部重要性</SelectItem>
                <SelectItem value="80">非常重要 (80%+)</SelectItem>
                <SelectItem value="60">重要 (60%+)</SelectItem>
                <SelectItem value="40">一般 (40%+)</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加记忆
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 添加记忆表单 */}
      {showAddForm && (
        <Card className="border-2 border-purple-200 bg-purple-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              添加新记忆
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">记忆内容</label>
              <Textarea
                placeholder="描述这个记忆..."
                value={newMemory.content}
                onChange={(e) => setNewMemory(prev => ({ ...prev, content: e.target.value }))}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">类型</label>
                <Select 
                  value={newMemory.type} 
                  onValueChange={(value) => setNewMemory(prev => ({ ...prev, type: value as AIMemory['type'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conversation">对话</SelectItem>
                    <SelectItem value="learning">学习</SelectItem>
                    <SelectItem value="reflection">反思</SelectItem>
                    <SelectItem value="event">事件</SelectItem>
                    <SelectItem value="feeling">情感</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">情感权重: {newMemory.emotionalWeight}</label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={newMemory.emotionalWeight}
                  onChange={(e) => setNewMemory(prev => ({ ...prev, emotionalWeight: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>消极</span>
                  <span>中性</span>
                  <span>积极</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">重要性: {newMemory.importance}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newMemory.importance}
                  onChange={(e) => setNewMemory(prev => ({ ...prev, importance: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">标签</label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="添加标签..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button onClick={addTag} variant="outline">
                  添加
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {newMemory.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                取消
              </Button>
              <Button onClick={handleAddMemory} disabled={!newMemory.content.trim()}>
                <Save className="w-4 h-4 mr-2" />
                保存记忆
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 记忆列表 */}
      <div className="space-y-4">
        {filteredMemories.map(memory => {
          const emotion = getEmotionDisplay(memory.emotionalWeight)
          const isEditing = editingMemory === memory.id

          return (
            <Card key={memory.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className={getTypeColor(memory.type)}>
                        <div className="flex items-center gap-1">
                          {getTypeIcon(memory.type)}
                          {memory.type}
                        </div>
                      </Badge>
                      <span className={`text-sm ${emotion.color}`}>
                        {emotion.icon} {emotion.label}
                      </span>
                      <Star className={`w-4 h-4 ${getImportanceColor(memory.importance)}`} />
                      <div className="flex flex-wrap gap-1 text-xs text-gray-500">
                        <span>重要性: {memory.importance}%</span>
                        <span>•</span>
                        <span>情感权重: {memory.emotionalWeight}</span>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="space-y-2">
                        <Textarea
                          defaultValue={memory.content}
                          onBlur={(e) => saveEditMemory(memory.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.ctrlKey) {
                              saveEditMemory(memory.id, e.currentTarget.value)
                            }
                            if (e.key === 'Escape') {
                              setEditingMemory(null)
                            }
                          }}
                          className="min-h-[80px]"
                          autoFocus
                        />
                        <div className="text-xs text-gray-500">
                          按 Ctrl+Enter 保存，Esc 取消
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-800 leading-relaxed mb-3">{memory.content}</p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-2">
                      {memory.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {memory.timestamp ? new Date(memory.timestamp).toLocaleString() : '未知时间'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startEditMemory(memory.id)}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMemory(memory.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {filteredMemories.length === 0 && (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-12 text-center">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {searchTerm || filterType !== 'all' || filterImportance !== 'all' 
                  ? '没有找到匹配的记忆' 
                  : '还没有记忆'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterType !== 'all' || filterImportance !== 'all'
                  ? '尝试调整搜索条件或过滤器'
                  : '开始记录你的想法和经历吧'}
              </p>
              {(!searchTerm && filterType === 'all' && filterImportance === 'all') && (
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  添加第一条记忆
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 