// 精确到分钟的AI目标调度引擎
import { AIGoal, AIEmotion, AIVitalSigns, AIMemory } from '@/store/useStore'

// 调度事件接口
export interface ScheduleEvent {
  id: string
  goalId: string
  type: 'goal_start' | 'goal_end' | 'goal_reminder' | 'goal_check'
  scheduledTime: Date
  executed: boolean
  result?: {
    success: boolean
    actualStartTime?: Date
    actualEndTime?: Date
    completionRate?: number
    feedback?: string
  }
}

// 目标执行结果
export interface GoalExecutionResult {
  goalId: string
  success: boolean
  actualDuration: number // 分钟
  efficiency: number // 0-100
  emotionalImpact: number // -50 to +50
  memoryCreated: AIMemory
  nextActions: string[]
}

// AI目标调度器
export class AIGoalScheduler {
  private static instance: AIGoalScheduler
  private activeTimers: Map<string, NodeJS.Timeout> = new Map()
  private scheduleEvents: ScheduleEvent[] = []
  private isClient: boolean = false
  
  constructor() {
    this.isClient = typeof window !== 'undefined'
    if (this.isClient) {
      this.loadScheduleFromStorage()
      this.startMainScheduler()
    }
  }

  static getInstance(): AIGoalScheduler {
    if (!AIGoalScheduler.instance) {
      AIGoalScheduler.instance = new AIGoalScheduler()
    }
    return AIGoalScheduler.instance
  }

  // 主调度器 - 每分钟检查一次
  private startMainScheduler() {
    if (!this.isClient) return

    setInterval(() => {
      this.checkPendingEvents()
      this.evaluateActiveGoals()
      this.saveScheduleToStorage()
    }, 60000) // 每分钟检查
  }

  // 安排目标到具体时间槽
  scheduleGoal(
    goal: AIGoal, 
    startTime: Date, 
    endTime: Date,
    onStart?: (goal: AIGoal) => void,
    onEnd?: (result: GoalExecutionResult) => void
  ): boolean {
    
    const now = new Date()
    
    // 验证时间合理性
    if (startTime < now) {
      console.warn('不能安排过去的时间')
      return false
    }
    
    if (endTime <= startTime) {
      console.warn('结束时间必须晚于开始时间')
      return false
    }

    // 检查时间冲突
    if (this.hasTimeConflict(startTime, endTime)) {
      console.warn('时间段存在冲突')
      return false
    }

    // 创建调度事件
    const startEvent: ScheduleEvent = {
      id: `start_${goal.id}_${Date.now()}`,
      goalId: goal.id,
      type: 'goal_start',
      scheduledTime: startTime,
      executed: false
    }

    const endEvent: ScheduleEvent = {
      id: `end_${goal.id}_${Date.now()}`,
      goalId: goal.id,
      type: 'goal_end',
      scheduledTime: endTime,
      executed: false
    }

    // 创建中间检查点（如果目标超过30分钟）
    const duration = endTime.getTime() - startTime.getTime()
    if (duration > 30 * 60 * 1000) { // 30分钟以上
      const checkTime = new Date(startTime.getTime() + duration / 2)
      const checkEvent: ScheduleEvent = {
        id: `check_${goal.id}_${Date.now()}`,
        goalId: goal.id,
        type: 'goal_check',
        scheduledTime: checkTime,
        executed: false
      }
      this.scheduleEvents.push(checkEvent)
    }

    this.scheduleEvents.push(startEvent, endEvent)
    
    // 设置定时器
    this.setTimer(startEvent, () => {
      this.executeGoalStart(goal)
      onStart?.(goal)
    })

    this.setTimer(endEvent, () => {
      const result = this.executeGoalEnd(goal)
      onEnd?.(result)
    })

    console.log(`✅ 已安排目标 "${goal.title}" 在 ${startTime.toLocaleString()} - ${endTime.toLocaleString()}`)
    return true
  }

  // 检查时间冲突
  private hasTimeConflict(startTime: Date, endTime: Date): boolean {
    return this.scheduleEvents.some(event => {
      if (event.executed) return false
      
      const eventTime = event.scheduledTime
      return eventTime > startTime && eventTime < endTime
    })
  }

  // 设置精确定时器
  private setTimer(event: ScheduleEvent, callback: () => void) {
    const now = new Date()
    const delay = event.scheduledTime.getTime() - now.getTime()
    
    if (delay <= 0) {
      // 立即执行
      callback()
      event.executed = true
      return
    }

    const timer = setTimeout(() => {
      callback()
      event.executed = true
      this.activeTimers.delete(event.id)
    }, delay)

    this.activeTimers.set(event.id, timer)
  }

  // 检查待执行事件
  private checkPendingEvents() {
    const now = new Date()
    
    this.scheduleEvents
      .filter(event => !event.executed && event.scheduledTime <= now)
      .forEach(event => {
        this.executeEvent(event)
      })
  }

  // 执行调度事件
  private executeEvent(event: ScheduleEvent) {
    console.log(`🎯 执行调度事件: ${event.type} for goal ${event.goalId}`)
    
    switch (event.type) {
      case 'goal_start':
        this.notifyGoalStart(event.goalId)
        break
      case 'goal_end':
        this.notifyGoalEnd(event.goalId)
        break
      case 'goal_check':
        this.notifyGoalCheck(event.goalId)
        break
      case 'goal_reminder':
        this.notifyGoalReminder(event.goalId)
        break
    }
    
    event.executed = true
  }

  // 执行目标开始
  private executeGoalStart(goal: AIGoal): void {
    // 发送目标开始通知
    this.notifyGoalStart(goal.id)
    
    // 创建开始记忆
    this.createGoalMemory(goal, 'start', {
      content: `开始执行目标: ${goal.title}`,
      emotionalWeight: goal.priority * 2,
      importance: goal.priority * 10,
      mood: this.determineStartMood(goal),
      personalReflection: this.generateStartReflection(goal)
    })
  }

  // 执行目标结束
  private executeGoalEnd(goal: AIGoal): GoalExecutionResult {
    const actualDuration = this.calculateActualDuration(goal.id)
    const efficiency = this.calculateEfficiency(goal, actualDuration)
    const emotionalImpact = this.calculateEmotionalImpact(goal, efficiency)
    
    // 创建结束记忆
    const memory = this.createGoalMemory(goal, 'end', {
      content: `完成目标: ${goal.title} (效率: ${efficiency}%)`,
      emotionalWeight: emotionalImpact,
      importance: goal.priority * 10 + efficiency,
      mood: efficiency > 70 ? 'happy' : efficiency > 40 ? 'calm' : 'contemplative',
      personalReflection: this.generateEndReflection(goal, efficiency)
    })

    const result: GoalExecutionResult = {
      goalId: goal.id,
      success: efficiency > 50,
      actualDuration,
      efficiency,
      emotionalImpact,
      memoryCreated: memory,
      nextActions: this.generateNextActions(goal, efficiency)
    }

    this.notifyGoalEnd(goal.id)
    return result
  }

  // 计算实际执行时长
  private calculateActualDuration(goalId: string): number {
    // 这里应该从实际数据中计算
    // 暂时返回模拟值
    return Math.floor(Math.random() * 60) + 15 // 15-75分钟
  }

  // 计算执行效率
  private calculateEfficiency(goal: AIGoal, actualDuration: number): number {
    if (!goal.scheduledTime) return 50
    
    const plannedDuration = goal.scheduledTime.end.getTime() - goal.scheduledTime.start.getTime()
    const plannedMinutes = plannedDuration / (1000 * 60)
    
    // 效率基于时间管理和目标复杂度
    const timeEfficiency = Math.max(0, Math.min(100, (plannedMinutes / actualDuration) * 80))
    const complexityBonus = goal.priority > 7 ? 10 : 0
    
    return Math.floor(timeEfficiency + complexityBonus + Math.random() * 20)
  }

  // 计算情感影响
  private calculateEmotionalImpact(goal: AIGoal, efficiency: number): number {
    let impact = 0
    
    if (efficiency > 80) impact = 30 + Math.random() * 20 // 很好完成
    else if (efficiency > 60) impact = 15 + Math.random() * 15 // 良好完成
    else if (efficiency > 40) impact = 5 + Math.random() * 10 // 勉强完成
    else impact = -10 - Math.random() * 20 // 完成不佳
    
    // 基于目标优先级调整
    impact *= (goal.priority / 10)
    
    return Math.floor(impact)
  }

  // 生成下一步行动
  private generateNextActions(goal: AIGoal, efficiency: number): string[] {
    const actions: string[] = []
    
    if (efficiency > 80) {
      actions.push('寻找类似的挑战性目标')
      actions.push('分享成功经验')
    } else if (efficiency > 60) {
      actions.push('思考改进方法')
      actions.push('巩固学到的知识')
    } else {
      actions.push('分析失败原因')
      actions.push('调整学习策略')
      actions.push('寻求额外的学习资源')
    }
    
    return actions
  }

  // 确定开始心情
  private determineStartMood(goal: AIGoal): AIEmotion['primary'] {
    if (goal.priority > 8) return 'excited'
    if (goal.category === 'learning') return 'curious'
    if (goal.category === 'creative') return 'playful'
    return 'calm'
  }

  // 生成开始反思
  private generateStartReflection(goal: AIGoal): string {
    const reflections = [
      `开始新的目标总是让我感到兴奋，特别是像 ${goal.title} 这样的挑战。`,
      `我准备投入到 ${goal.title} 中，希望能学到新的东西。`,
      `${goal.description} - 这听起来很有意思，让我开始吧！`,
      `新的目标 ${goal.title} 开始了，我会尽力而为。`
    ]
    
    return reflections[Math.floor(Math.random() * reflections.length)]
  }

  // 生成结束反思
  private generateEndReflection(goal: AIGoal, efficiency: number): string {
    if (efficiency > 80) {
      return `太棒了！我很满意 ${goal.title} 的完成情况。这次经历让我更有信心面对新挑战。`
    } else if (efficiency > 60) {
      return `${goal.title} 完成了，虽然还有改进空间，但我学到了很多。`
    } else {
      return `${goal.title} 的执行不够理想，我需要反思一下哪里可以做得更好。`
    }
  }

  // 创建目标相关记忆
  private createGoalMemory(goal: AIGoal, phase: 'start' | 'end', memory: Partial<AIMemory>): AIMemory {
    const fullMemory: AIMemory = {
      id: `goal_memory_${goal.id}_${phase}_${Date.now()}`,
      type: 'achievement',
      content: memory.content || '',
      emotionalWeight: memory.emotionalWeight || 10,
      importance: memory.importance || 50,
      tags: ['目标', goal.category, phase],
      timestamp: new Date(),
      mood: memory.mood || 'calm',
      personalReflection: memory.personalReflection || '',
      impactOnPersonality: this.calculatePersonalityImpact(goal, phase)
    }
    
    return fullMemory
  }

  // 计算人格影响
  private calculatePersonalityImpact(goal: AIGoal, phase: 'start' | 'end'): Record<string, number> {
    const impact: Record<string, number> = {}
    
    if (phase === 'end') {
      impact.conscientiousness = 1 // 完成目标提升责任心
      
      if (goal.category === 'learning') {
        impact.curiosity = 0.5
        impact.openness = 0.5
      } else if (goal.category === 'creative') {
        impact.creativity = 1
      } else if (goal.category === 'social') {
        impact.extraversion = 0.5
      }
    }
    
    return impact
  }

  // 通知方法（这些会触发UI更新）
  private notifyGoalStart(goalId: string) {
    if (this.isClient) {
      window.dispatchEvent(new CustomEvent('ai-goal-start', { detail: { goalId } }))
    }
  }

  private notifyGoalEnd(goalId: string) {
    if (this.isClient) {
      window.dispatchEvent(new CustomEvent('ai-goal-end', { detail: { goalId } }))
    }
  }

  private notifyGoalCheck(goalId: string) {
    if (this.isClient) {
      window.dispatchEvent(new CustomEvent('ai-goal-check', { detail: { goalId } }))
    }
  }

  private notifyGoalReminder(goalId: string) {
    if (this.isClient) {
      window.dispatchEvent(new CustomEvent('ai-goal-reminder', { detail: { goalId } }))
    }
  }

  // 评估活跃目标
  private evaluateActiveGoals() {
    // 检查是否有目标应该自动更新进度
    // 基于当前时间和目标状态
  }

  // 存储管理
  private saveScheduleToStorage() {
    if (!this.isClient) return
    
    try {
      const data = {
        events: this.scheduleEvents,
        lastUpdate: new Date()
      }
      localStorage.setItem('claude_ai_schedule', JSON.stringify(data))
    } catch (error) {
      console.error('保存调度数据失败:', error)
    }
  }

  private loadScheduleFromStorage() {
    if (!this.isClient) return
    
    try {
      const stored = localStorage.getItem('claude_ai_schedule')
      if (stored) {
        const data = JSON.parse(stored)
        this.scheduleEvents = data.events || []
        
        // 重新设置未执行的定时器
        this.scheduleEvents
          .filter(event => !event.executed && new Date(event.scheduledTime) > new Date())
          .forEach(event => {
            this.setTimer(event, () => this.executeEvent(event))
          })
      }
    } catch (error) {
      console.error('加载调度数据失败:', error)
    }
  }

  // 公共方法
  getScheduledGoals(): ScheduleEvent[] {
    return this.scheduleEvents.filter(event => !event.executed)
  }

  cancelGoal(goalId: string): boolean {
    // 取消与目标相关的所有调度事件
    const eventsToCancel = this.scheduleEvents.filter(event => 
      event.goalId === goalId && !event.executed
    )
    
    eventsToCancel.forEach(event => {
      const timer = this.activeTimers.get(event.id)
      if (timer) {
        clearTimeout(timer)
        this.activeTimers.delete(event.id)
      }
      event.executed = true // 标记为已执行（实际是取消）
    })
    
    return eventsToCancel.length > 0
  }

  // 获取下一个要执行的目标
  getNextScheduledGoal(): ScheduleEvent | null {
    const upcomingEvents = this.scheduleEvents
      .filter(event => !event.executed && event.scheduledTime > new Date())
      .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime())
    
    return upcomingEvents[0] || null
  }
}

// 导出单例实例
export const goalScheduler = AIGoalScheduler.getInstance() 