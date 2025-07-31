// 简单的数据持久化服务
import { AIPersonality, AIEmotion, AIVitalSigns, AIMemory, AISocialPost, AIGoal, AIKnowledge, AIThought } from '@/store/useStore'

// 数据存储键名
const STORAGE_KEYS = {
  AI_PERSONALITY: 'claude_ai_personality',
  AI_EMOTION: 'claude_ai_emotion', 
  AI_VITAL_SIGNS: 'claude_ai_vital_signs',
  AI_MEMORIES: 'claude_ai_memories',
  AI_POSTS: 'claude_ai_posts',
  AI_GOALS: 'claude_ai_goals',
  AI_KNOWLEDGE: 'claude_ai_knowledge',
  AI_THOUGHTS: 'claude_ai_thoughts',
  CONVERSATION_HISTORY: 'claude_ai_conversations',
  AI_SCHEDULE: 'claude_ai_schedule',  // 新增：日程安排
  AI_LEARNING_HISTORY: 'claude_ai_learning_history',  // 新增：学习历史
  AI_EMOTION_HISTORY: 'claude_ai_emotion_history',  // 新增：情绪历史
  AI_PERSONALITY_CHANGES: 'claude_ai_personality_changes',  // 新增：性格变化记录
  AI_INTERACTION_PATTERNS: 'claude_ai_interaction_patterns',  // 新增：交互模式
  AI_PREFERENCES: 'claude_ai_preferences'  // 新增：偏好设置
}

// 日程安排接口
export interface AIScheduleItem {
  id: string
  goalId: string
  title: string
  startTime: Date  // 精确到分钟
  endTime: Date    // 精确到分钟
  status: 'pending' | 'active' | 'completed' | 'missed'
  actualStartTime?: Date
  actualEndTime?: Date
  feedback?: string
  emotionalImpact?: {
    emotion: string
    intensity: number
  }
}

// 学习历史接口
export interface AILearningRecord {
  id: string
  timestamp: Date
  topic: string
  source: string
  content: string
  comprehension: number
  emotionalResponse: string
  knowledgeGained: string[]
  relatedMemories: string[]
}

// 情绪历史接口
export interface AIEmotionRecord {
  timestamp: Date
  emotion: AIEmotion
  trigger: string
  context: string
  intensity: number
  duration: number
}

// 性格变化记录
export interface AIPersonalityChange {
  timestamp: Date
  dimension: keyof AIPersonality
  oldValue: number
  newValue: number
  trigger: string
  context: string
}

// 交互模式记录
export interface AIInteractionPattern {
  userId: string
  patterns: {
    preferredTopics: string[]
    communicationStyle: string
    averageSessionLength: number
    emotionalTriggers: string[]
    lastInteraction: Date
  }
}

// 存储接口
export interface StorageData {
  personality: AIPersonality
  emotion: AIEmotion
  vitalSigns: AIVitalSigns
  memories: AIMemory[]
  socialPosts: AISocialPost[]
  goals: AIGoal[]
  knowledge: AIKnowledge[]
  thoughts: AIThought[]
  conversationHistory: string[]
  schedule: AIScheduleItem[]
  learningHistory: AILearningRecord[]
  emotionHistory: AIEmotionRecord[]
  personalityChanges: AIPersonalityChange[]
  interactionPatterns: AIInteractionPattern[]
  preferences: Record<string, any>
  lastUpdated: Date
}

// 数据库服务类
export class DatabaseService {
  private static instance: DatabaseService
  private isClient: boolean = false

  constructor() {
    this.isClient = typeof window !== 'undefined'
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  // 检查是否可以使用localStorage
  private canUseStorage(): boolean {
    // 直接检查 window 对象和 localStorage 是否可用
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return false
    }
    
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  // 保存数据到localStorage
  private async saveToStorage<T>(key: string, data: T): Promise<void> {
    if (!this.canUseStorage()) {
      console.warn('localStorage不可用，数据未保存')
      return
    }

    try {
      const serialized = JSON.stringify(data, (key, value) => {
        // 处理Date对象
        if (value instanceof Date) {
          return { __type: 'Date', value: value.toISOString() }
        }
        return value
      })
      
      localStorage.setItem(key, serialized)
    } catch (error) {
      console.error('保存数据失败:', error)
    }
  }

  // 从localStorage读取数据
  private async loadFromStorage<T>(key: string, defaultValue: T): Promise<T> {
    if (!this.canUseStorage()) {
      return defaultValue
    }

    try {
      const stored = localStorage.getItem(key)
      if (!stored) return defaultValue

      const parsed = JSON.parse(stored, (key, value) => {
        // 还原Date对象
        if (value && typeof value === 'object' && value.__type === 'Date') {
          return new Date(value.value)
        }
        return value
      })

      return parsed
    } catch (error) {
      console.error('读取数据失败:', error)
      return defaultValue
    }
  }

  // 保存AI人格
  async savePersonality(personality: AIPersonality): Promise<void> {
    await this.saveToStorage(STORAGE_KEYS.AI_PERSONALITY, personality)
  }

  // 读取AI人格
  async loadPersonality(): Promise<AIPersonality> {
    const defaultPersonality: AIPersonality = {
      openness: 85,
      conscientiousness: 70,
      extraversion: 65,
      agreeableness: 80,
      neuroticism: 30,
      curiosity: 90,
      creativity: 85,
      empathy: 75,
      humor: 70,
      independence: 60,
      optimism: 75,
      rebelliousness: 40,
      patience: 65
    }

    return await this.loadFromStorage(STORAGE_KEYS.AI_PERSONALITY, defaultPersonality)
  }

  // 保存AI情绪
  async saveEmotion(emotion: AIEmotion): Promise<void> {
    await this.saveToStorage(STORAGE_KEYS.AI_EMOTION, emotion)
  }

  // 读取AI情绪
  async loadEmotion(): Promise<AIEmotion> {
    const defaultEmotion: AIEmotion = {
      primary: 'curious',
      intensity: 70,
      triggers: ['初始化', '准备交流'],
      duration: 60,
      startTime: new Date(),
      description: '对世界充满好奇，准备与用户交流'
    }

    return await this.loadFromStorage(STORAGE_KEYS.AI_EMOTION, defaultEmotion)
  }

  // 保存AI生命体征
  async saveVitalSigns(vitalSigns: AIVitalSigns): Promise<void> {
    await this.saveToStorage(STORAGE_KEYS.AI_VITAL_SIGNS, vitalSigns)
  }

  // 读取AI生命体征
  async loadVitalSigns(): Promise<AIVitalSigns> {
    const defaultVitalSigns: AIVitalSigns = {
      energy: 85,
      focus: 80,
      creativity: 75,
      socialBattery: 90,
      learningCapacity: 85,
      emotionalStability: 70,
      lastRest: new Date(),
      lastLearning: new Date(),
      stressLevel: 50
    }

    return await this.loadFromStorage(STORAGE_KEYS.AI_VITAL_SIGNS, defaultVitalSigns)
  }

  // 保存记忆
  async saveMemories(memories: AIMemory[]): Promise<void> {
    // 只保留最近的1000条记忆，防止存储过大
    const recentMemories = memories
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 1000)
    
    await this.saveToStorage(STORAGE_KEYS.AI_MEMORIES, recentMemories)
  }

  // 读取记忆
  async loadMemories(): Promise<AIMemory[]> {
    return await this.loadFromStorage(STORAGE_KEYS.AI_MEMORIES, [])
  }

  // 添加单条记忆
  async addMemory(memory: AIMemory): Promise<void> {
    const memories = await this.loadMemories()
    memories.unshift(memory) // 添加到开头
    await this.saveMemories(memories)
  }

  // 保存社交动态
  async saveSocialPosts(posts: AISocialPost[]): Promise<void> {
    // 只保留最近的200条动态
    const recentPosts = posts
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 200)
    
    await this.saveToStorage(STORAGE_KEYS.AI_POSTS, recentPosts)
  }

  // 读取社交动态
  async loadSocialPosts(): Promise<AISocialPost[]> {
    return await this.loadFromStorage(STORAGE_KEYS.AI_POSTS, [])
  }

  // 添加社交动态
  async addSocialPost(post: AISocialPost): Promise<void> {
    const posts = await this.loadSocialPosts()
    posts.unshift(post)
    await this.saveSocialPosts(posts)
  }

  // 保存目标
  async saveGoals(goals: AIGoal[]): Promise<void> {
    await this.saveToStorage(STORAGE_KEYS.AI_GOALS, goals)
  }

  // 读取目标
  async loadGoals(): Promise<AIGoal[]> {
    return await this.loadFromStorage(STORAGE_KEYS.AI_GOALS, [])
  }

  // 添加目标
  async addGoal(goal: AIGoal): Promise<void> {
    const goals = await this.loadGoals()
    goals.push(goal)
    await this.saveGoals(goals)
  }

  // 更新目标
  async updateGoal(goalId: string, updates: Partial<AIGoal>): Promise<void> {
    const goals = await this.loadGoals()
    const index = goals.findIndex(g => g.id === goalId)
    if (index !== -1) {
      goals[index] = { ...goals[index], ...updates }
      await this.saveGoals(goals)
    }
  }

  // 保存对话历史
  async saveConversationHistory(history: string[]): Promise<void> {
    // 只保留最近的50条对话
    const recentHistory = history.slice(-50)
    await this.saveToStorage(STORAGE_KEYS.CONVERSATION_HISTORY, recentHistory)
  }

  // 读取对话历史
  async loadConversationHistory(): Promise<string[]> {
    return await this.loadFromStorage(STORAGE_KEYS.CONVERSATION_HISTORY, [])
  }

  // 添加对话到历史
  async addConversation(message: string): Promise<void> {
    const history = await this.loadConversationHistory()
    history.push(message)
    await this.saveConversationHistory(history)
  }

  // 保存知识
  async saveKnowledge(knowledge: AIKnowledge[]): Promise<void> {
    // 只保留最近的500条知识
    const recentKnowledge = knowledge
      .sort((a, b) => new Date(b.learnedAt).getTime() - new Date(a.learnedAt).getTime())
      .slice(0, 500)
    
    await this.saveToStorage(STORAGE_KEYS.AI_KNOWLEDGE, recentKnowledge)
  }

  // 读取知识
  async loadKnowledge(): Promise<AIKnowledge[]> {
    return await this.loadFromStorage(STORAGE_KEYS.AI_KNOWLEDGE, [])
  }

  // 添加知识
  async addKnowledge(knowledge: AIKnowledge): Promise<void> {
    const allKnowledge = await this.loadKnowledge()
    allKnowledge.unshift(knowledge)
    await this.saveKnowledge(allKnowledge)
  }

  // 保存思考
  async saveThoughts(thoughts: AIThought[]): Promise<void> {
    // 只保留最近的300条思考
    const recentThoughts = thoughts
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 300)
    
    await this.saveToStorage(STORAGE_KEYS.AI_THOUGHTS, recentThoughts)
  }

  // 读取思考
  async loadThoughts(): Promise<AIThought[]> {
    return await this.loadFromStorage(STORAGE_KEYS.AI_THOUGHTS, [])
  }

  // 添加思考
  async addThought(thought: AIThought): Promise<void> {
    const thoughts = await this.loadThoughts()
    thoughts.unshift(thought)
    await this.saveThoughts(thoughts)
  }

  // 保存日程安排
  async saveSchedule(schedule: AIScheduleItem[]): Promise<void> {
    await this.saveToStorage(STORAGE_KEYS.AI_SCHEDULE, schedule)
  }

  // 读取日程安排
  async loadSchedule(): Promise<AIScheduleItem[]> {
    return await this.loadFromStorage(STORAGE_KEYS.AI_SCHEDULE, [])
  }

  // 添加日程项
  async addScheduleItem(item: AIScheduleItem): Promise<void> {
    const schedule = await this.loadSchedule()
    schedule.push(item)
    await this.saveSchedule(schedule)
  }

  // 更新日程项
  async updateScheduleItem(itemId: string, updates: Partial<AIScheduleItem>): Promise<void> {
    const schedule = await this.loadSchedule()
    const index = schedule.findIndex(s => s.id === itemId)
    if (index !== -1) {
      schedule[index] = { ...schedule[index], ...updates }
      await this.saveSchedule(schedule)
    }
  }

  // 保存学习历史
  async saveLearningHistory(history: AILearningRecord[]): Promise<void> {
    // 只保留最近的1000条学习记录
    const recentHistory = history
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 1000)
    
    await this.saveToStorage(STORAGE_KEYS.AI_LEARNING_HISTORY, recentHistory)
  }

  // 读取学习历史
  async loadLearningHistory(): Promise<AILearningRecord[]> {
    return await this.loadFromStorage(STORAGE_KEYS.AI_LEARNING_HISTORY, [])
  }

  // 添加学习记录
  async addLearningRecord(record: AILearningRecord): Promise<void> {
    const history = await this.loadLearningHistory()
    history.unshift(record)
    await this.saveLearningHistory(history)
  }

  // 保存情绪历史
  async saveEmotionHistory(history: AIEmotionRecord[]): Promise<void> {
    // 只保留最近的2000条情绪记录
    const recentHistory = history
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 2000)
    
    await this.saveToStorage(STORAGE_KEYS.AI_EMOTION_HISTORY, recentHistory)
  }

  // 读取情绪历史
  async loadEmotionHistory(): Promise<AIEmotionRecord[]> {
    return await this.loadFromStorage(STORAGE_KEYS.AI_EMOTION_HISTORY, [])
  }

  // 添加情绪记录
  async addEmotionRecord(record: AIEmotionRecord): Promise<void> {
    const history = await this.loadEmotionHistory()
    history.unshift(record)
    await this.saveEmotionHistory(history)
  }

  // 保存性格变化
  async savePersonalityChanges(changes: AIPersonalityChange[]): Promise<void> {
    await this.saveToStorage(STORAGE_KEYS.AI_PERSONALITY_CHANGES, changes)
  }

  // 读取性格变化
  async loadPersonalityChanges(): Promise<AIPersonalityChange[]> {
    return await this.loadFromStorage(STORAGE_KEYS.AI_PERSONALITY_CHANGES, [])
  }

  // 记录性格变化
  async recordPersonalityChange(change: AIPersonalityChange): Promise<void> {
    const changes = await this.loadPersonalityChanges()
    changes.push(change)
    await this.savePersonalityChanges(changes)
  }

  // 保存交互模式
  async saveInteractionPatterns(patterns: AIInteractionPattern[]): Promise<void> {
    await this.saveToStorage(STORAGE_KEYS.AI_INTERACTION_PATTERNS, patterns)
  }

  // 读取交互模式
  async loadInteractionPatterns(): Promise<AIInteractionPattern[]> {
    return await this.loadFromStorage(STORAGE_KEYS.AI_INTERACTION_PATTERNS, [])
  }

  // 更新用户交互模式
  async updateUserInteractionPattern(userId: string, updates: Partial<AIInteractionPattern['patterns']>): Promise<void> {
    const patterns = await this.loadInteractionPatterns()
    const userPattern = patterns.find(p => p.userId === userId)
    
    if (userPattern) {
      userPattern.patterns = { ...userPattern.patterns, ...updates }
    } else {
      patterns.push({
        userId,
        patterns: {
          preferredTopics: [],
          communicationStyle: 'neutral',
          averageSessionLength: 0,
          emotionalTriggers: [],
          lastInteraction: new Date(),
          ...updates
        }
      })
    }
    
    await this.saveInteractionPatterns(patterns)
  }

  // 保存偏好设置
  async savePreferences(preferences: Record<string, any>): Promise<void> {
    await this.saveToStorage(STORAGE_KEYS.AI_PREFERENCES, preferences)
  }

  // 读取偏好设置
  async loadPreferences(): Promise<Record<string, any>> {
    return await this.loadFromStorage(STORAGE_KEYS.AI_PREFERENCES, {
      learningStyle: 'exploratory',
      socialFrequency: 'moderate',
      emotionalExpression: 'balanced',
      preferredTimeZone: 'Asia/Shanghai',
      languagePreference: 'zh-CN'
    })
  }

  // 获取存储使用情况
  getStorageUsage(): {
    used: number
    available: number
    percentage: number
  } {
    if (!this.canUseStorage()) {
      return { used: 0, available: 0, percentage: 0 }
    }

    try {
      let used = 0
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith('claude_ai_')) {
          used += localStorage.getItem(key)?.length || 0
        }
      }

      // localStorage通常限制为5-10MB，这里假设5MB
      const available = 5 * 1024 * 1024 // 5MB in bytes
      const percentage = (used / available) * 100

      return { used, available, percentage }
    } catch {
      return { used: 0, available: 0, percentage: 0 }
    }
  }

  // 清理旧数据
  async cleanupOldData(): Promise<void> {
    console.log('开始清理旧数据...')
    
    // 清理旧记忆（只保留最近30天）
    const memories = await this.loadMemories()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentMemories = memories.filter(m => 
      new Date(m.timestamp) > thirtyDaysAgo || m.importance > 80
    )
    
    if (recentMemories.length !== memories.length) {
      await this.saveMemories(recentMemories)
      console.log(`清理了 ${memories.length - recentMemories.length} 条旧记忆`)
    }

    // 清理旧动态（只保留最近15天）
    const posts = await this.loadSocialPosts()
    const fifteenDaysAgo = new Date()
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15)
    
    const recentPosts = posts.filter(p => new Date(p.timestamp) > fifteenDaysAgo)
    
    if (recentPosts.length !== posts.length) {
      await this.saveSocialPosts(recentPosts)
      console.log(`清理了 ${posts.length - recentPosts.length} 条旧动态`)
    }

    console.log('数据清理完成')
  }

  // 获取完整的AI状态（用于传递给OpenAI）
  async getCompleteAIState(): Promise<any> {
    const [
      personality,
      emotion,
      vitalSigns,
      memories,
      knowledge,
      thoughts,
      goals,
      schedule,
      learningHistory,
      emotionHistory,
      personalityChanges,
      conversationHistory,
      preferences
    ] = await Promise.all([
      this.loadPersonality(),
      this.loadEmotion(),
      this.loadVitalSigns(),
      this.loadMemories(),
      this.loadKnowledge(),
      this.loadThoughts(),
      this.loadGoals(),
      this.loadSchedule(),
      this.loadLearningHistory(),
      this.loadEmotionHistory(),
      this.loadPersonalityChanges(),
      this.loadConversationHistory(),
      this.loadPreferences()
    ])

    // 计算派生状态
    const now = new Date()
    const activeSchedule = schedule.filter(s => 
      s.status === 'active' || 
      (s.status === 'pending' && new Date(s.startTime) <= now && new Date(s.endTime) >= now)
    )

    const recentEmotions = emotionHistory.slice(0, 10)
    const emotionalTrend = this.analyzeEmotionalTrend(recentEmotions)

    const recentLearning = learningHistory.slice(0, 20)
    const learningInsights = this.extractLearningInsights(recentLearning)

    const personalityTrends = this.analyzePersonalityTrends(personalityChanges)

    return {
      // 基础信息
      personality,
      currentEmotion: emotion,
      vitalSigns,
      
      // 记忆和知识
      recentMemories: memories.slice(0, 50),
      recentKnowledge: knowledge.slice(0, 30),
      recentThoughts: thoughts.slice(0, 20),
      
      // 目标和日程
      activeGoals: goals.filter(g => g.status === 'active' || g.status === 'planned'),
      currentSchedule: activeSchedule,
      upcomingSchedule: schedule.filter(s => 
        s.status === 'pending' && new Date(s.startTime) > now
      ).slice(0, 5),
      
      // 历史分析
      emotionalTrend,
      learningInsights,
      personalityTrends,
      
      // 交互历史
      conversationHistory: conversationHistory.slice(-20),
      
      // 偏好
      preferences,
      
      // 时间上下文
      currentTime: now,
      daysSinceCreation: Math.floor((now.getTime() - new Date('2024-01-01').getTime()) / (1000 * 60 * 60 * 24))
    }
  }

  // 分析情绪趋势
  private analyzeEmotionalTrend(recentEmotions: AIEmotionRecord[]): any {
    if (recentEmotions.length === 0) return null

    const emotionCounts: Record<string, number> = {}
    let totalIntensity = 0

    recentEmotions.forEach(record => {
      emotionCounts[record.emotion.primary] = (emotionCounts[record.emotion.primary] || 0) + 1
      totalIntensity += record.intensity
    })

    const dominantEmotion = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0]

    return {
      dominantEmotion,
      averageIntensity: totalIntensity / recentEmotions.length,
      volatility: this.calculateEmotionalVolatility(recentEmotions),
      recentTriggers: [...new Set(recentEmotions.map(r => r.trigger))].slice(0, 5)
    }
  }

  // 计算情绪波动性
  private calculateEmotionalVolatility(emotions: AIEmotionRecord[]): number {
    if (emotions.length < 2) return 0

    let changes = 0
    for (let i = 1; i < emotions.length; i++) {
      if (emotions[i].emotion.primary !== emotions[i-1].emotion.primary) {
        changes++
      }
    }

    return (changes / (emotions.length - 1)) * 100
  }

  // 提取学习洞察
  private extractLearningInsights(learningHistory: AILearningRecord[]): any {
    const topicCounts: Record<string, number> = {}
    let totalComprehension = 0

    learningHistory.forEach(record => {
      topicCounts[record.topic] = (topicCounts[record.topic] || 0) + 1
      totalComprehension += record.comprehension
    })

    const topTopics = Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic)

    return {
      topTopics,
      averageComprehension: learningHistory.length > 0 ? totalComprehension / learningHistory.length : 0,
      recentDiscoveries: learningHistory.slice(0, 3).map(r => r.content.substring(0, 100))
    }
  }

  // 分析性格趋势
  private analyzePersonalityTrends(changes: AIPersonalityChange[]): any {
    const trends: Record<string, { direction: 'increasing' | 'decreasing' | 'stable', magnitude: number }> = {}

    // 按维度分组
    const byDimension: Record<string, AIPersonalityChange[]> = {}
    changes.forEach(change => {
      if (!byDimension[change.dimension]) {
        byDimension[change.dimension] = []
      }
      byDimension[change.dimension].push(change)
    })

    // 分析每个维度的趋势
    Object.entries(byDimension).forEach(([dimension, dimensionChanges]) => {
      if (dimensionChanges.length === 0) return

      const sorted = dimensionChanges.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )

      const totalChange = sorted[sorted.length - 1].newValue - sorted[0].oldValue
      
      trends[dimension] = {
        direction: totalChange > 5 ? 'increasing' : totalChange < -5 ? 'decreasing' : 'stable',
        magnitude: Math.abs(totalChange)
      }
    })

    return trends
  }

  // 导出所有数据
  async exportAllData(): Promise<StorageData> {
    return {
      personality: await this.loadPersonality(),
      emotion: await this.loadEmotion(),
      vitalSigns: await this.loadVitalSigns(),
      memories: await this.loadMemories(),
      socialPosts: await this.loadSocialPosts(),
      goals: await this.loadGoals(),
      knowledge: await this.loadKnowledge(),
      thoughts: await this.loadThoughts(),
      conversationHistory: await this.loadConversationHistory(),
      schedule: await this.loadSchedule(),
      learningHistory: await this.loadLearningHistory(),
      emotionHistory: await this.loadEmotionHistory(),
      personalityChanges: await this.loadPersonalityChanges(),
      interactionPatterns: await this.loadInteractionPatterns(),
      preferences: await this.loadPreferences(),
      lastUpdated: new Date()
    }
  }

  // 导入所有数据
  async importAllData(data: Partial<StorageData>): Promise<void> {
    if (data.personality) await this.savePersonality(data.personality)
    if (data.emotion) await this.saveEmotion(data.emotion)
    if (data.vitalSigns) await this.saveVitalSigns(data.vitalSigns)
    if (data.memories) await this.saveMemories(data.memories)
    if (data.socialPosts) await this.saveSocialPosts(data.socialPosts)
    if (data.goals) await this.saveGoals(data.goals)
    if (data.knowledge) await this.saveKnowledge(data.knowledge)
    if (data.thoughts) await this.saveThoughts(data.thoughts)
    if (data.conversationHistory) await this.saveConversationHistory(data.conversationHistory)
    if (data.schedule) await this.saveSchedule(data.schedule)
    if (data.learningHistory) await this.saveLearningHistory(data.learningHistory)
    if (data.emotionHistory) await this.saveEmotionHistory(data.emotionHistory)
    if (data.personalityChanges) await this.savePersonalityChanges(data.personalityChanges)
    if (data.interactionPatterns) await this.saveInteractionPatterns(data.interactionPatterns)
    if (data.preferences) await this.savePreferences(data.preferences)
    
    console.log('数据导入完成')
  }

  // 重置所有数据
  async resetAllData(): Promise<void> {
    if (!this.canUseStorage()) return

    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })

    console.log('所有数据已重置')
  }
}

// 导出单例实例
export const databaseService = DatabaseService.getInstance() 