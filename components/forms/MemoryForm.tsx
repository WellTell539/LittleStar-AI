'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Brain, Heart, Lightbulb, PlusCircle, LucideIcon } from 'lucide-react'

type MemoryType = 'goal' | 'emotion' | 'learning'

const memoryTypes: { value: MemoryType; label: string; icon: LucideIcon }[] = [
  { value: 'goal', label: '目标', icon: Brain },
  { value: 'emotion', label: '情感', icon: Heart },
  { value: 'learning', label: '学习', icon: Lightbulb }
]

export function MemoryForm() {
  const addMemory = (memory: { content: string; type: MemoryType; category: string | undefined; emotionLevel: number; impact: number }) => {
    // Mock implementation
    console.log('Adding memory:', memory)
  }
  
  const [content, setContent] = useState('')
  const [type, setType] = useState<MemoryType>('learning')
  const [category, setCategory] = useState('')
  const [emotionLevel, setEmotionLevel] = useState([7])
  const [impact, setImpact] = useState([5])
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) return
    
    addMemory({
      content: content.trim(),
      type,
      category: category.trim() || undefined,
      emotionLevel: emotionLevel[0],
      impact: impact[0]
    })
    
    // Reset form
    setContent('')
    setType('learning')
    setCategory('')
    setEmotionLevel([7])
    setImpact([5])
    setIsOpen(false)
  }

  const handleCancel = () => {
    setContent('')
    setType('learning')
    setCategory('')
    setEmotionLevel([7])
    setImpact([5])
    setIsOpen(false)
  }

  const getEmotionLabel = (level: number) => {
    if (level <= 3) return '低落'
    if (level <= 5) return '平静'
    if (level <= 7) return '愉快'
    return '兴奋'
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full"
        size="lg"
      >
        <PlusCircle className="mr-2 h-5 w-5" />
        添加新记忆
      </Button>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">记录新记忆</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="type">记忆类型</Label>
          <Select value={type} onValueChange={(value: MemoryType) => setType(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {memoryTypes.map((memType) => {
                const Icon = memType.icon
                return (
                  <SelectItem key={memType.value} value={memType.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{memType.label}</span>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="content">记忆内容</Label>
          <Textarea
            id="content"
            placeholder="记录你的想法、感受或学到的东西..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">分类标签（可选）</Label>
          <Input
            id="category"
            placeholder="例如：编程、生活、创意"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        
        {/* Emotion Level */}
        <div className="space-y-2">
          <Label>情绪水平</Label>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">😢</span>
            <Slider
              value={emotionLevel}
              onValueChange={setEmotionLevel}
              min={1}
              max={10}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground">😊</span>
            <span className="text-sm font-medium w-16">
              {getEmotionLabel(emotionLevel[0])}
            </span>
          </div>
        </div>
        
        {/* Impact Level */}
        <div className="space-y-2">
          <Label>影响程度</Label>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">低</span>
            <Slider
              value={impact}
              onValueChange={setImpact}
              min={1}
              max={10}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground">高</span>
            <span className="text-sm font-medium w-8">{impact[0]}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            这个记忆对 LITTLE STAR AI 的影响有多大？
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button type="submit" className="flex-1">
            保存记忆
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            取消
          </Button>
        </div>
      </form>
    </Card>
  )
} 