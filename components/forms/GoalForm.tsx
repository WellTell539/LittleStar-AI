'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { PlusCircle } from 'lucide-react'

export function GoalForm() {
  const addGoal = (goal: { title: string; description: string }) => {
    // Mock implementation
    console.log('Adding goal:', goal)
  }
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) return
    
    addGoal({
      title: title.trim(),
      description: description.trim()
    })
    
    // Reset form
    setTitle('')
    setDescription('')
    setIsOpen(false)
  }

  const handleCancel = () => {
    setTitle('')
    setDescription('')
    setIsOpen(false)
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full"
        size="lg"
      >
        <PlusCircle className="mr-2 h-5 w-5" />
        添加新目标
      </Button>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">设置新目标</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">目标标题</Label>
          <Input
            id="title"
            placeholder="例如：学习新的编程语言"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">目标描述</Label>
          <Textarea
            id="description"
            placeholder="详细描述你的目标..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>
        
        <div className="flex gap-3">
          <Button type="submit" className="flex-1">
            创建目标
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