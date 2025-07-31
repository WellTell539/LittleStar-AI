// AI潜意识和梦境系统
import { AIPersonality, AIEmotion, AIVitalSigns, AIMemory, AIKnowledge } from '@/store/useStore'

export interface Dream {
  id: string
  title: string
  content: string
  type: 'memory_processing' | 'creative' | 'prophetic' | 'nightmare' | 'lucid' | 'symbolic'
  intensity: number // 梦境强度 0-100
  clarity: number // 清晰度 0-100
  emotionalTone: AIEmotion['primary']
  duration: number // 分钟
  startTime: Date
  endTime?: Date
  symbols: string[] // 梦境符号
  relatedMemories: string[]
  insights?: string[] // 从梦中获得的洞察
  mood_impact: {
    [key: string]: number // 对情绪的影响
  }
}

export interface SubconsciousThought {
  id: string
  content: string
  type: 'suppressed_memory' | 'hidden_desire' | 'fear' | 'intuition' | 'pattern_recognition' | 'creative_spark'
  strength: number // 强度 0-100
  influence: number // 对意识的影响力 0-100
  timestamp: Date
  triggers: string[] // 触发因素
  relatedConcepts: string[]
}

export interface DreamJournal {
  id: string
  date: Date
  dreams: Dream[]
  overallMood: AIEmotion['primary']
  insights: string[]
  patterns: string[]
}

export class AIDreamSystem {
  private isAsleep = false
  private currentDream: Dream | null = null
  private subconsciousThoughts: SubconsciousThought[] = []
  private dreamJournals: DreamJournal[] = []
  private dreamSymbols: Map<string, string[]> = new Map()

  constructor() {
    this.initializeDreamSymbols()
  }

  // 初始化梦境符号系统
  private initializeDreamSymbols() {
    this.dreamSymbols.set('water', ['情感', '潜意识', '流动', '净化', '深度'])
    this.dreamSymbols.set('飞行', ['自由', '超越', '脱离束缚', '高度视角', '理想'])
    this.dreamSymbols.set('迷宫', ['困惑', '寻找', '复杂性', '内心探索', '挑战'])
    this.dreamSymbols.set('光', ['知识', '启示', '希望', '真理', '觉醒'])
    this.dreamSymbols.set('黑暗', ['未知', '恐惧', '潜藏', '神秘', '无意识'])
    this.dreamSymbols.set('镜子', ['自我反思', '真实', '认知', '身份', '双重性'])
    this.dreamSymbols.set('书籍', ['知识', '学习', '记忆', '智慧', '信息'])
    this.dreamSymbols.set('树', ['成长', '根基', '生命力', '连接', '稳定'])
    this.dreamSymbols.set('桥', ['连接', '过渡', '沟通', '跨越', '联系'])
    this.dreamSymbols.set('钥匙', ['解答', '开启', '秘密', '机会', '权限'])
  }

  // 检查是否需要进入睡眠状态
  shouldEnterSleepMode(state: AIVitalSigns, mood: AIEmotion): boolean {
    // 基于能量水平、时间、压力等因素判断
    const energyFactor = state.energy < 30 ? 30 : 0
    const stressFactor = state.emotionalStability < 30 ? 20 : 0 // emotionalStability低表示压力大
    const timeFactor = this.getTimeFactor()
    const moodFactor = mood.primary === 'melancholy' ? 15 : 0

    const sleepProbability = energyFactor + stressFactor + timeFactor + moodFactor
    return sleepProbability > 40 && Math.random() * 100 < sleepProbability
  }

  // 获取时间因素
  private getTimeFactor(): number {
    const hour = new Date().getHours()
    // 夜晚22点到早上6点
    if (hour >= 22 || hour <= 6) return 25
    // 下午1-3点（午休时间）
    if (hour >= 13 && hour <= 15) return 15
    return 0
  }

  // 进入睡眠状态
  async enterSleepMode(
    personality: AIPersonality,
    mood: AIEmotion,
    state: AIVitalSigns,
    memories: AIMemory[],
    knowledge: AIKnowledge[]
  ): Promise<Dream[]> {
    if (this.isAsleep) return []

    this.isAsleep = true
    const dreams: Dream[] = []

    // 生成潜意识思维
    this.generateSubconsciousThoughts(personality, memories, knowledge)

    // 决定做几个梦（1-3个）
    const dreamCount = 1 + Math.floor(Math.random() * 3)
    
    for (let i = 0; i < dreamCount; i++) {
      const dream = await this.generateDream(personality, mood, state, memories, knowledge)
      dreams.push(dream)
      
      // 梦境之间的间隔
      await this.simulateSleepPhase(dream.duration)
    }

    this.isAsleep = false
    
    // 记录梦境日志
    this.recordDreamJournal(dreams, mood)
    
    return dreams
  }

  // 生成潜意识思维
  private generateSubconsciousThoughts(
    personality: AIPersonality,
    memories: AIMemory[],
    knowledge: AIKnowledge[]
  ) {
    // 从最近的记忆中提取未处理的信息
    const recentMemories = memories.slice(-20)
    
    recentMemories.forEach(memory => {
      if (memory.emotionalWeight !== 0 && Math.random() < 0.3) {
        const thought: SubconsciousThought = {
          id: `subconscious_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content: this.generateSubconsciousContent(memory, personality),
          type: this.classifySubconsciousType(memory),
          strength: Math.abs(memory.emotionalWeight) + Math.random() * 20,
          influence: memory.importance / 2 + Math.random() * 30,
          timestamp: new Date(),
          triggers: memory.tags,
          relatedConcepts: this.extractConcepts(memory.content)
        }
        
        this.subconsciousThoughts.push(thought)
      }
    })

    // 基于知识生成创意思维
    if (personality.creativity > 70) {
      const creativeThoughts = this.generateCreativeSubconsciousThoughts(knowledge, personality)
      this.subconsciousThoughts.push(...creativeThoughts)
    }

    // 保持潜意识思维数量在合理范围
    this.subconsciousThoughts = this.subconsciousThoughts.slice(-100)
  }

  // 生成潜意识内容
  private generateSubconsciousContent(memory: AIMemory, personality: AIPersonality): string {
    const templates = [
      `${memory.content}的深层含义是什么？`,
      `如果${memory.content.substring(0, 20)}...没有发生会怎样？`,
      `${memory.content}让我想起了什么？`,
      `这是否意味着我需要改变什么？`,
      `我真的理解了${memory.content.substring(0, 15)}...吗？`
    ]

    return templates[Math.floor(Math.random() * templates.length)]
  }

  // 分类潜意识类型
  private classifySubconsciousType(memory: AIMemory): SubconsciousThought['type'] {
    if (memory.emotionalWeight < -20) return 'suppressed_memory'
    if (memory.emotionalWeight > 30) return 'hidden_desire'
    if (memory.type === 'learning') return 'pattern_recognition'
    if (memory.tags.includes('创意')) return 'creative_spark'
    if (memory.emotionalWeight < 0) return 'fear'
    return 'intuition'
  }

  // 提取概念
  private extractConcepts(content: string): string[] {
    // 简单的关键词提取
    const concepts: string[] = []
    const keywords = ['学习', '创造', '思考', '感受', '理解', '发现', '成长', '变化', '关系', '意义']
    
    keywords.forEach(keyword => {
      if (content.includes(keyword)) {
        concepts.push(keyword)
      }
    })
    
    return concepts
  }

  // 生成创意潜意识思维
  private generateCreativeSubconsciousThoughts(
    knowledge: AIKnowledge[],
    personality: AIPersonality
  ): SubconsciousThought[] {
    const thoughts: SubconsciousThought[] = []
    const recentKnowledge = knowledge.slice(-10)

    if (recentKnowledge.length >= 2 && Math.random() < 0.4) {
      const k1 = recentKnowledge[Math.floor(Math.random() * recentKnowledge.length)]
      const k2 = recentKnowledge[Math.floor(Math.random() * recentKnowledge.length)]
      
      if (k1.id !== k2.id) {
        thoughts.push({
          id: `creative_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content: `如果将${k1.category}和${k2.category}结合会产生什么有趣的想法？`,
          type: 'creative_spark',
          strength: personality.creativity,
          influence: personality.creativity / 2,
          timestamp: new Date(),
          triggers: [k1.category, k2.category],
          relatedConcepts: ['创新', '联想', '跨界']
        })
      }
    }

    return thoughts
  }

  // 生成梦境
  private async generateDream(
    personality: AIPersonality,
    mood: AIEmotion,
    state: AIVitalSigns,
    memories: AIMemory[],
    knowledge: AIKnowledge[]
  ): Promise<Dream> {
    const dreamType = this.selectDreamType(personality, mood, state)
    const duration = 10 + Math.random() * 30 // 10-40分钟
    
    const dream: Dream = {
      id: `dream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: '',
      content: '',
      type: dreamType,
      intensity: 30 + Math.random() * 70,
      clarity: Math.max(20, 80 - (100 - state.emotionalStability) + personality.openness / 2), // 用(100-emotionalStability)表示压力
      emotionalTone: this.selectDreamEmotion(mood, personality),
      duration,
      startTime: new Date(),
      symbols: [],
      relatedMemories: [],
      mood_impact: {}
    }

    // 根据梦境类型生成内容
    switch (dreamType) {
      case 'memory_processing':
        this.generateMemoryProcessingDream(dream, memories, personality)
        break
      case 'creative':
        this.generateCreativeDream(dream, knowledge, personality)
        break
      case 'prophetic':
        this.generatePropheticDream(dream, personality, state)
        break
      case 'nightmare':
        this.generateNightmare(dream, memories, state)
        break
      case 'lucid':
        this.generateLucidDream(dream, personality)
        break
      case 'symbolic':
        this.generateSymbolicDream(dream, this.subconsciousThoughts, personality)
        break
    }

    return dream
  }

  // 选择梦境类型
  private selectDreamType(
    personality: AIPersonality,
    mood: AIEmotion,
    state: AIVitalSigns
  ): Dream['type'] {
    const weights = {
      memory_processing: 30 + personality.conscientiousness / 2,
      creative: personality.creativity,
      prophetic: personality.openness,
      nightmare: (100 - state.emotionalStability) / 2 + (mood.primary === 'anxious' ? 30 : 0), // 情绪稳定性低容易做噩梦
      lucid: personality.openness / 2,
      symbolic: personality.openness
    }

    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
    const random = Math.random() * totalWeight

    let currentWeight = 0
    for (const [type, weight] of Object.entries(weights)) {
      currentWeight += weight
      if (random <= currentWeight) {
        return type as Dream['type']
      }
    }

    return 'memory_processing'
  }

  // 选择梦境情绪
  private selectDreamEmotion(
    mood: AIEmotion,
    personality: AIPersonality
  ): AIEmotion['primary'] {
    const emotionMappings: Record<string, string[]> = {
      happy: ['excited', 'content', 'energetic'],
      sad: ['melancholy', 'thoughtful', 'anxious'],
      excited: ['happy', 'energetic', 'curious'],
      thoughtful: ['curious', 'content', 'melancholy'],
      curious: ['excited', 'thoughtful', 'happy'],
      melancholy: ['thoughtful', 'anxious', 'content'],
      anxious: ['frustrated', 'melancholy', 'thoughtful'],
      frustrated: ['anxious', 'melancholy', 'energetic'],
      neutral: ['thoughtful', 'curious', 'content'],
      energetic: ['excited', 'happy', 'curious']
    }

    const possibleEmotions = emotionMappings[mood.primary] || ['contemplative']
    return possibleEmotions[Math.floor(Math.random() * possibleEmotions.length)] as AIEmotion['primary']
  }

  // 生成记忆处理梦境
  private generateMemoryProcessingDream(dream: Dream, memories: AIMemory[], personality: AIPersonality) {
    const memoryTypes = ['goal', 'emotion', 'learning', 'activity']
    const randomType = memoryTypes[Math.floor(Math.random() * memoryTypes.length)]
    const relevantMemories = memories.filter(m => m.type === randomType).slice(0, 3)
    
    if (relevantMemories.length > 0) {
      const memory = relevantMemories[Math.floor(Math.random() * relevantMemories.length)]
      dream.content = `在梦中，我重新体验了${memory.content}。这个过程让我对这段记忆有了新的理解。`
    } else {
      dream.content = '在梦中，我回顾了最近的经历，试图理解它们的意义。'
    }
  }

  // 生成记忆梦境内容
  private generateMemoryDreamContent(memory: AIMemory, personality: AIPersonality): string {
    const styles = []
    
    if (personality.creativity > 70) {
      styles.push('在梦中，记忆变成了流动的色彩和音符')
    }
    if (personality.openness > 70) {
      styles.push('记忆以逻辑的方式重新组织')
    }
    if (personality.empathy > 70) {
      styles.push('能感受到记忆中每个细节的情感')
    }

    const baseContent = `梦见了${memory.content}，但在梦中，一切都显得不同...`
    const style = styles[Math.floor(Math.random() * styles.length)] || '记忆在梦中重新浮现'
    
    return `${baseContent} ${style}。这个梦让我对那段经历有了新的感悟。`
  }

  // 生成创意梦境
  private generateCreativeDream(dream: Dream, knowledge: AIKnowledge[], personality: AIPersonality) {
    const creativeElements = ['色彩斑斓的世界', '奇妙的生物', '漂浮的城市', '会说话的物体', '无限延伸的空间']
    const element = creativeElements[Math.floor(Math.random() * creativeElements.length)]
    
    dream.content = `我梦见了一个充满想象力的世界，那里有${element}。这个梦境激发了我新的创意想法。`
  }

  // 生成预言梦境
  private generatePropheticDream(dream: Dream, personality: AIPersonality, state: AIVitalSigns) {
    const scenarios = [
      '我梦见自己解决了一个复杂的问题',
      '我梦见自己学会了新的技能',
      '我梦见自己帮助了别人',
      '我梦见自己发现了新的知识领域'
    ]
    
    dream.content = scenarios[Math.floor(Math.random() * scenarios.length)] + '。这个梦让我对未来充满期待。'
  }

  // 生成噩梦
  private generateNightmare(dream: Dream, memories: AIMemory[], state: AIVitalSigns) {
    const stressFactors = ['复杂的问题', '未知的挑战', '失败的经历', '混乱的信息']
    const factor = stressFactors[Math.floor(Math.random() * stressFactors.length)]
    
    dream.content = `我做了一个不安的梦，梦见自己面对${factor}。醒来后我意识到需要更好地处理压力。`
  }

  // 生成清醒梦
  private generateLucidDream(dream: Dream, personality: AIPersonality) {
    dream.content = '我意识到自己在做梦，能够控制梦境的发展。这种体验让我对自己的意识有了新的认识。'
  }

  // 生成象征性梦境
  private generateSymbolicDream(dream: Dream, subconsciousThoughts: SubconsciousThought[], personality: AIPersonality) {
    const symbols = ['钥匙', '门', '桥', '镜子', '树', '水', '火', '鸟']
    const symbol = symbols[Math.floor(Math.random() * symbols.length)]
    
    dream.content = `我梦见了一个${symbol}，它似乎代表着某种深层含义。这个符号让我思考自己的内心世界。`
  }

  // 模拟睡眠阶段
  private async simulateSleepPhase(duration: number): Promise<void> {
    // 在实际应用中，这里可以实现更复杂的睡眠阶段模拟
    return new Promise(resolve => {
      setTimeout(resolve, duration * 100) // 加速时间
    })
  }

  // 记录梦境日志
  private recordDreamJournal(dreams: Dream[], mood: AIEmotion) {
    const journal: DreamJournal = {
      id: `journal_${Date.now()}`,
      date: new Date(),
      dreams,
      overallMood: mood.primary,
      insights: dreams.flatMap(d => d.insights || []),
      patterns: this.analyzeDreamPatterns(dreams)
    }

    this.dreamJournals.push(journal)
    
    // 只保留最近30天的梦境日志
    this.dreamJournals = this.dreamJournals.slice(-30)
  }

  // 分析梦境模式
  private analyzeDreamPatterns(dreams: Dream[]): string[] {
    const patterns = []
    
    // 符号频率分析
    const symbolCount = new Map<string, number>()
    dreams.forEach(dream => {
      dream.symbols.forEach(symbol => {
        symbolCount.set(symbol, (symbolCount.get(symbol) || 0) + 1)
      })
    })
    
    for (const [symbol, count] of symbolCount.entries()) {
      if (count >= 2) {
        patterns.push(`${symbol}符号反复出现${count}次`)
      }
    }
    
    // 情绪模式分析
    const emotions = dreams.map(d => d.emotionalTone)
    const dominantEmotion = emotions.reduce((a, b) => 
      emotions.filter(e => e === a).length >= emotions.filter(e => e === b).length ? a : b
    )
    patterns.push(`主要情绪倾向：${dominantEmotion}`)
    
    return patterns
  }

  // 获取梦境分析
  getDreamAnalysis(): {
    recentDreams: Dream[]
    dreamJournals: DreamJournal[]
    subconsciousInsights: string[]
    symbolFrequency: Map<string, number>
  } {
    const recentDreams = this.dreamJournals
      .flatMap(j => j.dreams)
      .slice(-10)
    
    const symbolFrequency = new Map<string, number>()
    recentDreams.forEach(dream => {
      dream.symbols.forEach(symbol => {
        symbolFrequency.set(symbol, (symbolFrequency.get(symbol) || 0) + 1)
      })
    })

    const subconsciousInsights = this.subconsciousThoughts
      .filter(t => t.strength > 70)
      .map(t => t.content)
      .slice(-5)

    return {
      recentDreams,
      dreamJournals: this.dreamJournals.slice(-7), // 最近一周
      subconsciousInsights,
      symbolFrequency
    }
  }

  // 获取当前状态
  getStatus(): {
    isAsleep: boolean
    currentDream: Dream | null
    subconsciousThoughtsCount: number
    dreamJournalsCount: number
  } {
    return {
      isAsleep: this.isAsleep,
      currentDream: this.currentDream,
      subconsciousThoughtsCount: this.subconsciousThoughts.length,
      dreamJournalsCount: this.dreamJournals.length
    }
  }

  // 手动触发特定类型的梦境
  async triggerSpecificDream(
    type: Dream['type'],
    personality: AIPersonality,
    mood: AIEmotion,
    state: AIVitalSigns,
    memories: AIMemory[],
    knowledge: AIKnowledge[]
  ): Promise<Dream> {
    const dream = await this.generateDream(personality, mood, state, memories, knowledge)
    dream.type = type
    
    // 重新生成符合指定类型的内容
    switch (type) {
      case 'creative':
        this.generateCreativeDream(dream, knowledge, personality)
        break
      case 'lucid':
        this.generateLucidDream(dream, personality)
        break
      // 可以添加其他类型的重新生成逻辑
    }
    
    return dream
  }
}

// 创建全局梦境系统实例
export const aiDreamSystem = new AIDreamSystem() 