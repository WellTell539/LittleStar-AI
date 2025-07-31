// AI真实情绪变化引擎
import { AIEmotion, AIPersonality, AIVitalSigns, AIMemory } from '@/store/useStore'

// 情绪事件接口
export interface EmotionEvent {
  id: string
  type: 'external' | 'internal' | 'memory' | 'goal' | 'learning' | 'social'
  trigger: string
  intensity: number // -100 to +100
  duration: number // minutes
  timestamp: Date
  source?: string
  metadata?: Record<string, any>
}

// 情绪状态变化
export interface EmotionTransition {
  from: AIEmotion['primary']
  to: AIEmotion['primary']
  reason: string
  naturalness: number // 0-100, 转换的自然程度
  timestamp: Date
}

// 情绪引擎
export class AIEmotionEngine {
  private static instance: AIEmotionEngine
  private emotionHistory: EmotionTransition[] = []
  private pendingEvents: EmotionEvent[] = []
  private lastEmotionUpdate: Date = new Date()
  private isClient: boolean = false
  
  // 情绪衰减规则
  private readonly EMOTION_DECAY_RATE = 0.15 // 每分钟衰减15%
  private readonly NATURAL_EMOTION_CYCLE = 120 // 2小时的自然周期
  private readonly MIN_EMOTION_INTENSITY = 20
  private readonly MAX_EMOTION_INTENSITY = 95
  
  constructor() {
    this.isClient = typeof window !== 'undefined'
    if (this.isClient) {
      this.startEmotionEngine()
    }
  }

  static getInstance(): AIEmotionEngine {
    if (!AIEmotionEngine.instance) {
      AIEmotionEngine.instance = new AIEmotionEngine()
    }
    return AIEmotionEngine.instance
  }

  // 启动情绪引擎
  private startEmotionEngine() {
    if (!this.isClient) return

    // 每分钟更新情绪状态
    setInterval(() => {
      this.processNaturalEmotionChanges()
      this.processPendingEvents()
      this.processEmotionDecay()
    }, 60000) // 每分钟

    // 每30秒检查微小波动
    setInterval(() => {
      this.processEmotionFluctuations()
    }, 30000) // 每30秒
  }

  // 触发情绪事件
  triggerEmotionEvent(event: Omit<EmotionEvent, 'id' | 'timestamp'>): void {
    const emotionEvent: EmotionEvent = {
      id: `emotion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...event
    }

    this.pendingEvents.push(emotionEvent)
    console.log(`🎭 触发情绪事件: ${event.trigger} (强度: ${event.intensity})`)
  }

  // 处理待处理的情绪事件
  private processPendingEvents() {
    this.pendingEvents.forEach(event => {
      this.applyEmotionEvent(event)
    })
    
    this.pendingEvents = []
  }

  // 应用情绪事件
  private applyEmotionEvent(event: EmotionEvent) {
    const currentEmotion = this.getCurrentEmotion()
    if (!currentEmotion) return

    // 根据事件类型和强度决定新情绪
    const newEmotion = this.calculateNewEmotion(currentEmotion, event)
    const newIntensity = this.calculateNewIntensity(currentEmotion.intensity, event.intensity)
    
    if (newEmotion !== currentEmotion.primary || Math.abs(newIntensity - currentEmotion.intensity) > 5) {
      this.transitionToEmotion(newEmotion, newIntensity, event.trigger)
    }

    // 添加触发器到历史
    this.addEmotionTrigger(event.trigger)
  }

  // 计算新情绪
  private calculateNewEmotion(current: AIEmotion, event: EmotionEvent): AIEmotion['primary'] {
    const personality = this.getCurrentPersonality()
    
    // 基于事件强度和类型的情绪映射
    if (event.intensity > 50) {
      // 强烈正面事件
      if (personality && personality.extraversion > 70) return 'excited'
      if (personality && personality.openness > 80) return 'curious'
      return 'happy'
    } else if (event.intensity > 20) {
      // 中等正面事件
      if (event.type === 'learning') return 'curious'
      if (event.type === 'goal') return 'excited'
      return 'happy'
    } else if (event.intensity > -20) {
      // 轻微影响，保持当前状态
      return current.primary
    } else if (event.intensity > -50) {
      // 中等负面事件
      if (personality && personality.neuroticism > 60) return 'anxious'
      return 'contemplative'
    } else {
      // 强烈负面事件
      if (personality && personality.neuroticism > 70) return 'anxious'
      if (personality && personality.rebelliousness > 60) return 'angry'
      return 'sad'
    }
  }

  // 计算新强度
  private calculateNewIntensity(currentIntensity: number, eventImpact: number): number {
    let newIntensity = currentIntensity + (eventImpact * 0.3) // 30%的影响
    
    // 确保在合理范围内
    newIntensity = Math.max(this.MIN_EMOTION_INTENSITY, Math.min(this.MAX_EMOTION_INTENSITY, newIntensity))
    
    return Math.floor(newIntensity)
  }

  // 情绪转换
  private transitionToEmotion(newEmotion: AIEmotion['primary'], intensity: number, reason: string) {
    const currentEmotion = this.getCurrentEmotion()
    if (!currentEmotion) return

    // 计算转换的自然程度
    const naturalness = this.calculateTransitionNaturalness(currentEmotion.primary, newEmotion)
    
    // 记录转换
    const transition: EmotionTransition = {
      from: currentEmotion.primary,
      to: newEmotion,
      reason,
      naturalness,
      timestamp: new Date()
    }
    
    this.emotionHistory.push(transition)
    
    // 更新情绪状态
    this.updateEmotionState({
      primary: newEmotion,
      intensity,
      startTime: new Date(),
      description: this.generateEmotionDescription(newEmotion, intensity, reason)
    })

    console.log(`🎭 情绪转换: ${currentEmotion.primary} → ${newEmotion} (${reason})`)
  }

  // 计算转换自然程度
  private calculateTransitionNaturalness(from: AIEmotion['primary'], to: AIEmotion['primary']): number {
    // 情绪转换的自然度矩阵
    const transitions: Record<string, Record<string, number>> = {
      'happy': { 'excited': 90, 'calm': 80, 'curious': 70, 'playful': 85, 'contemplative': 60 },
      'excited': { 'happy': 85, 'curious': 90, 'playful': 80, 'calm': 50, 'anxious': 40 },
      'calm': { 'happy': 70, 'contemplative': 85, 'curious': 75, 'melancholy': 60, 'anxious': 50 },
      'curious': { 'excited': 80, 'contemplative': 75, 'happy': 70, 'calm': 65 },
      'contemplative': { 'calm': 80, 'melancholy': 70, 'curious': 65, 'happy': 55 },
      'anxious': { 'calm': 60, 'sad': 70, 'angry': 65, 'contemplative': 55 },
      'sad': { 'melancholy': 85, 'contemplative': 70, 'calm': 60, 'anxious': 65 },
      'angry': { 'anxious': 70, 'contemplative': 60, 'calm': 50, 'sad': 55 },
      'playful': { 'happy': 90, 'excited': 85, 'curious': 75, 'calm': 65 },
      'melancholy': { 'sad': 80, 'contemplative': 85, 'calm': 70, 'happy': 40 }
    }

    return transitions[from]?.[to] || 30 // 默认较低的自然度
  }

  // 生成情绪描述
  private generateEmotionDescription(emotion: AIEmotion['primary'], intensity: number, reason: string): string {
    const intensityText = intensity > 80 ? '非常' : intensity > 60 ? '很' : intensity > 40 ? '有些' : '略微'
    
    const emotionTexts = {
      'happy': `${intensityText}开心`,
      'excited': `${intensityText}兴奋`,
      'calm': `${intensityText}平静`,
      'curious': `${intensityText}好奇`,
      'contemplative': `${intensityText}沉思`,
      'anxious': `${intensityText}焦虑`,
      'sad': `${intensityText}难过`,
      'angry': `${intensityText}愤怒`,
      'playful': `${intensityText}顽皮`,
      'melancholy': `${intensityText}忧郁`
    }

    return `因为${reason}而感到${emotionTexts[emotion] || emotion}`
  }

  // 处理自然情绪变化
  private processNaturalEmotionChanges() {
    const now = new Date()
    const timeSinceLastUpdate = now.getTime() - this.lastEmotionUpdate.getTime()
    const minutesPassed = timeSinceLastUpdate / (1000 * 60)
    
    if (minutesPassed > 30) { // 30分钟以上
      this.triggerNaturalEmotionShift()
    }
    
    this.lastEmotionUpdate = now
  }

  // 触发自然情绪转换
  private triggerNaturalEmotionShift() {
    const personality = this.getCurrentPersonality()
    const vitalSigns = this.getCurrentVitalSigns()
    
    if (!personality || !vitalSigns) return

    // 基于生命体征和人格的自然情绪倾向
    let naturalEmotion: AIEmotion['primary'] = 'calm'
    let intensity = 50

    if (vitalSigns.energy < 30) {
      naturalEmotion = 'contemplative'
      intensity = 40
    } else if (vitalSigns.energy > 80 && personality.extraversion > 70) {
      naturalEmotion = 'excited'
      intensity = 70
    } else if (vitalSigns.learningCapacity > 80 && personality.curiosity > 80) {
      naturalEmotion = 'curious'
      intensity = 75
    } else if (vitalSigns.emotionalStability < 40) {
      naturalEmotion = personality.neuroticism > 60 ? 'anxious' : 'contemplative'
      intensity = 60
    }

    this.triggerEmotionEvent({
      type: 'internal',
      trigger: '自然的情绪周期变化',
      intensity: intensity - 50, // 转换为影响值
      duration: 60
    })
  }

  // 处理情绪衰减
  private processEmotionDecay() {
    const currentEmotion = this.getCurrentEmotion()
    if (!currentEmotion) return

    const now = new Date()
    const timeSinceStart = now.getTime() - currentEmotion.startTime.getTime()
    const hoursPassed = timeSinceStart / (1000 * 60 * 60)
    
    // 极端情绪会自然衰减
    if (currentEmotion.intensity > 80 && hoursPassed > 1) {
      const decayAmount = Math.floor(this.EMOTION_DECAY_RATE * 60) // 每小时衰减
      const newIntensity = Math.max(this.MIN_EMOTION_INTENSITY, currentEmotion.intensity - decayAmount)
      
      if (newIntensity !== currentEmotion.intensity) {
        this.updateEmotionState({
          intensity: newIntensity,
          description: this.generateEmotionDescription(currentEmotion.primary, newIntensity, '情绪自然衰减')
        })
      }
    }
  }

  // 处理情绪微波动
  private processEmotionFluctuations() {
    const currentEmotion = this.getCurrentEmotion()
    if (!currentEmotion) return

    // 小幅度的情绪波动（±5）
    const fluctuation = Math.floor(Math.random() * 11) - 5 // -5 to +5
    
    if (Math.abs(fluctuation) > 2) { // 只有较明显的波动才处理
      const newIntensity = Math.max(
        this.MIN_EMOTION_INTENSITY, 
        Math.min(this.MAX_EMOTION_INTENSITY, currentEmotion.intensity + fluctuation)
      )
      
      if (newIntensity !== currentEmotion.intensity) {
        this.updateEmotionState({
          intensity: newIntensity
        })
      }
    }
  }

  // 基于记忆触发情绪
  triggerEmotionFromMemory(memory: AIMemory) {
    const emotionalWeight = memory.emotionalWeight
    const age = Date.now() - memory.timestamp.getTime()
    const daysSinceMemory = age / (1000 * 60 * 60 * 24)
    
    // 记忆的情绪影响会随时间衰减
    const decayFactor = Math.max(0.1, 1 - (daysSinceMemory * 0.1))
    const adjustedImpact = emotionalWeight * decayFactor
    
    this.triggerEmotionEvent({
      type: 'memory',
      trigger: `回忆起：${memory.content.substring(0, 30)}...`,
      intensity: adjustedImpact,
      duration: 15,
      source: memory.id,
      metadata: { memoryType: memory.type, originalImpact: emotionalWeight }
    })
  }

  // 基于学习经历触发情绪
  triggerEmotionFromLearning(topic: string, difficulty: number, success: boolean) {
    const personality = this.getCurrentPersonality()
    
    let intensity = 0
    let trigger = ''
    
    if (success) {
      intensity = 20 + (difficulty * 0.5) // 难度越高，成就感越强
      if (personality && personality.curiosity > 80) intensity += 10
      trigger = `成功学习了${topic}`
    } else {
      intensity = -15 - (difficulty * 0.3)
      if (personality && personality.neuroticism > 60) intensity -= 10
      trigger = `在学习${topic}时遇到困难`
    }
    
    this.triggerEmotionEvent({
      type: 'learning',
      trigger,
      intensity,
      duration: 30
    })
  }

  // 基于社交互动触发情绪
  triggerEmotionFromSocialInteraction(type: 'positive' | 'negative' | 'neutral', context: string) {
    const personality = this.getCurrentPersonality()
    
    let intensity = 0
    
    if (type === 'positive') {
      intensity = 25
      if (personality && personality.extraversion > 70) intensity += 15
      if (personality && personality.agreeableness > 80) intensity += 10
    } else if (type === 'negative') {
      intensity = -20
      if (personality && personality.neuroticism > 60) intensity -= 15
    }
    
    this.triggerEmotionEvent({
      type: 'social',
      trigger: `${type === 'positive' ? '愉快的' : type === 'negative' ? '不愉快的' : '一般的'}社交互动：${context}`,
      intensity,
      duration: 20
    })
  }

  // 获取情绪历史分析
  getEmotionAnalysis(): {
    dominantEmotions: Record<string, number>
    averageIntensity: number
    stabilityScore: number
    recentTrends: EmotionTransition[]
  } {
    const recentHistory = this.emotionHistory.slice(-20) // 最近20次转换
    
    // 统计主导情绪
    const emotionCounts: Record<string, number> = {}
    recentHistory.forEach(transition => {
      emotionCounts[transition.to] = (emotionCounts[transition.to] || 0) + 1
    })
    
    // 计算平均强度
    const currentEmotion = this.getCurrentEmotion()
    const averageIntensity = currentEmotion?.intensity || 50
    
    // 计算稳定性分数
    const stabilityScore = this.calculateEmotionalStability(recentHistory)
    
    return {
      dominantEmotions: emotionCounts,
      averageIntensity,
      stabilityScore,
      recentTrends: recentHistory.slice(-5)
    }
  }

  // 计算情绪稳定性
  private calculateEmotionalStability(history: EmotionTransition[]): number {
    if (history.length < 2) return 100
    
    const transitionFrequency = history.length / 24 // 假设24小时期间
    const naturalityScore = history.reduce((sum, t) => sum + t.naturalness, 0) / history.length
    
    // 稳定性 = 低转换频率 + 高自然度
    const frequencyScore = Math.max(0, 100 - (transitionFrequency * 20))
    const stabilityScore = (frequencyScore + naturalityScore) / 2
    
    return Math.floor(stabilityScore)
  }

  // 添加情绪触发器
  private addEmotionTrigger(trigger: string) {
    const currentEmotion = this.getCurrentEmotion()
    if (!currentEmotion) return

    const newTriggers = [...currentEmotion.triggers, trigger].slice(-5) // 保留最近5个
    
    this.updateEmotionState({
      triggers: newTriggers
    })
  }

  // 辅助方法：获取当前状态
  private getCurrentEmotion(): AIEmotion | null {
    if (!this.isClient) return null
    // 这里应该从实际的store获取，暂时返回null
    return null
  }

  private getCurrentPersonality(): AIPersonality | null {
    if (!this.isClient) return null
    // 这里应该从实际的store获取，暂时返回null
    return null
  }

  private getCurrentVitalSigns(): AIVitalSigns | null {
    if (!this.isClient) return null
    // 这里应该从实际的store获取，暂时返回null
    return null
  }

  private updateEmotionState(updates: Partial<AIEmotion>) {
    // 这里应该调用实际的store更新方法
    if (this.isClient) {
      window.dispatchEvent(new CustomEvent('ai-emotion-update', { detail: updates }))
    }
  }

  // 公共方法：获取情绪引擎状态
  getEngineStatus() {
    return {
      isActive: this.isClient,
      emotionHistoryLength: this.emotionHistory.length,
      pendingEventsCount: this.pendingEvents.length,
      lastUpdate: this.lastEmotionUpdate
    }
  }
}

// 导出单例实例
export const emotionEngine = AIEmotionEngine.getInstance() 