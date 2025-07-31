'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Brain, Heart, Lightbulb, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

const memoryTypeConfig = {
  goal: {
    label: '目标',
    icon: Brain,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  emotion: {
    label: '情感',
    icon: Heart,
    color: 'bg-rose-500',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700'
  },
  learning: {
    label: '学习',
    icon: Lightbulb,
    color: 'bg-amber-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700'
  }
}

export function MemoryHistory() {
  const [memories, setMemories] = useState<Array<{
    id: string;
    content: string;
    type: 'goal' | 'emotion' | 'learning';
    timestamp: Date;
    emotionalWeight: number;
    clarity: number;
    importance: number;
    tags: string[];
    relatedMemories: string[];
    category?: string;
  }>>([
    { id: '1', content: '学习了React Hooks的使用方法', type: 'learning', timestamp: new Date(), emotionalWeight: 5, clarity: 80, importance: 70, tags: ['react', 'hooks'], relatedMemories: [], category: '技术学习' },
    { id: '2', content: '完成了项目文档的编写', type: 'goal', timestamp: new Date(Date.now() - 86400000), emotionalWeight: 3, clarity: 75, importance: 65, tags: ['文档'], relatedMemories: [], category: '工作' },
    { id: '3', content: '感到很开心，因为解决了技术难题', type: 'emotion', timestamp: new Date(Date.now() - 172800000), emotionalWeight: 8, clarity: 90, importance: 80, tags: ['开心'], relatedMemories: [], category: '情感' }
  ])
  
  const deleteMemory = (id: string) => {
    setMemories(memories.filter(m => m.id !== id))
  }
  
  // Sort memories by timestamp (newest first)
  const sortedMemories = [...memories].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <div className="bg-card rounded-lg shadow-sm border p-6">
      <h2 className="text-2xl font-bold mb-4">记忆历史</h2>
      
      {sortedMemories.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">暂无记忆记录</p>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {sortedMemories.map((memory) => {
            const config = memoryTypeConfig[memory.type]
            const Icon = config.icon
            
            return (
              <div
                key={memory.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${config.bgColor}`}>
                      <Icon className={`h-5 w-5 ${config.textColor}`} />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={`${config.bgColor} ${config.textColor} border-0`}>
                          {config.label}
                        </Badge>
                        {memory.category && (
                          <Badge variant="outline">{memory.category}</Badge>
                        )}
                      </div>
                      <p className="text-sm">{memory.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(memory.timestamp), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteMemory(memory.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
} 