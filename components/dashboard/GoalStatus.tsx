'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Trash2 } from 'lucide-react'

export function GoalStatus() {
  const [goals, setGoals] = useState([
    { id: '1', title: '学习React Hooks', description: '掌握React Hooks的使用', progress: 75, completed: false, priority: 'high', category: 'learning', createdAt: new Date() },
    { id: '2', title: '完成项目文档', description: '编写完整的项目文档', progress: 30, completed: false, priority: 'medium', category: 'work', createdAt: new Date() },
    { id: '3', title: '健身计划', description: '制定并执行健身计划', progress: 100, completed: true, priority: 'low', category: 'personal', createdAt: new Date(), completedAt: new Date() }
  ])
  
  const updateGoalProgress = (goalId: string, progress: number) => {
    setGoals(goals.map(g => g.id === goalId ? { ...g, progress } : g))
  }
  
  const completeGoal = (goalId: string) => {
    setGoals(goals.map(g => g.id === goalId ? { ...g, completed: true, progress: 100, completedAt: new Date() } : g))
  }
  
  const deleteGoal = (goalId: string) => {
    setGoals(goals.filter(g => g.id !== goalId))
  }
  
  const activeGoals = goals.filter(goal => !goal.completed)
  const completedGoals = goals.filter(goal => goal.completed)

  return (
    <div className="bg-card rounded-lg shadow-sm border p-6">
      <h2 className="text-2xl font-bold mb-4">目标状态</h2>
      
      {/* Active Goals */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-muted-foreground">进行中的目标</h3>
        {activeGoals.length === 0 ? (
          <p className="text-muted-foreground">暂无进行中的目标</p>
        ) : (
          <div className="space-y-3">
            {activeGoals.map((goal) => (
              <div key={goal.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{goal.title}</h4>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => completeGoal(goal.id)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteGoal(goal.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>进度</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateGoalProgress(goal.id, Math.min(100, goal.progress + 10))}
                    >
                      +10%
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateGoalProgress(goal.id, Math.max(0, goal.progress - 10))}
                    >
                      -10%
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Goals */}
      <div>
        <h3 className="text-lg font-semibold mb-3 text-muted-foreground">已完成的目标</h3>
        {completedGoals.length === 0 ? (
          <p className="text-muted-foreground">暂无已完成的目标</p>
        ) : (
          <div className="space-y-2">
            {completedGoals.map((goal) => (
              <div key={goal.id} className="flex items-center justify-between border rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="font-medium line-through">{goal.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      完成于 {new Date(goal.completedAt!).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => deleteGoal(goal.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 