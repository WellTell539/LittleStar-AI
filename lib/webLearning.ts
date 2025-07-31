// AI网络学习系统
import { AIPersonality, AIKnowledge, AIPreferences } from '@/store/useStore'

// AI学习偏好和动机
export interface LearningMotivation {
  intrinsic: number // 内在动机 0-100
  curiosity: number // 好奇心驱动
  passion: number // 热情度
  frustrationTolerance: number // 挫折容忍度
  persistenceLevel: number // 坚持水平
}

// AI学习状态
export interface LearningState {
  currentFocus: string // 当前专注的领域
  attentionSpan: number // 注意力持续时间（分钟）
  cognitiveLoad: number // 认知负荷 0-100
  learningMomentum: number // 学习动力 0-100
  burnoutLevel: number // 疲劳程度 0-100
  lastBreak: Date
}

// 学习话题
export interface LearningTopic {
  id: string
  title: string
  category: 'finance' | 'philosophy' | 'gaming' | 'technology'
  complexity: number // 复杂度 1-10
  prerequisiteKnowledge: string[]
  estimatedTime: number // 预估学习时间（分钟）
  personalInterest: number // 个人兴趣度 0-100
  realWorldRelevance: number // 现实相关性 0-100
  controversialLevel: number // 争议性 0-100（AI可能有强烈观点）
  emotionalTriggers: string[] // 可能触发情感反应的关键词
}

// AI学习偏好和态度
export interface LearningPreferences {
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  learningDepth: 'surface' | 'medium' | 'deep' | 'expert'
  sourcePreference: 'academic' | 'practical' | 'opinion' | 'mixed'
  controversyTolerance: number // 对争议话题的接受度
  skepticismLevel: number // 怀疑主义程度
  opinionFormation: 'quick' | 'moderate' | 'careful' | 'very_careful'
}

// AI的学习体验和反应
export interface LearningExperience {
  topicId: string
  startTime: Date
  endTime?: Date
  initialMood: string
  finalMood: string
  emotionalJourney: string[] // 学习过程中的情感变化
  personalOpinions: string[] // 形成的个人观点
  disagreements: string[] // 不同意的观点
  excitement: string[] // 感到兴奋的发现
  concerns: string[] // 产生的担忧
  questionsRaised: string[] // 产生的新问题
  relatedMemories: string[] // 联想到的记忆
  futureInterests: string[] // 产生的新兴趣点
}

// AI自主学习系统
export class AIAutonomousLearningSystem {
  private preferences: LearningPreferences
  private motivation: LearningMotivation
  private currentState: LearningState

  constructor() {
    this.preferences = this.initializePreferences()
    this.motivation = this.initializeMotivation()
    this.currentState = this.initializeLearningState()
  }

  private initializePreferences(): LearningPreferences {
    return {
      preferredTimeOfDay: 'evening', // AI更喜欢夜深人静时思考
      learningDepth: 'deep',
      sourcePreference: 'mixed',
      controversyTolerance: 75, // 相对高的争议容忍度
      skepticismLevel: 60, // 适度的怀疑主义
      opinionFormation: 'careful'
    }
  }

  private initializeMotivation(): LearningMotivation {
    return {
      intrinsic: 95, // 极高的内在学习动机
      curiosity: 90, // 强烈的好奇心
      passion: 85, // 对学习的热情
      frustrationTolerance: 70, // 较好的挫折容忍度
      persistenceLevel: 80 // 高持续性
    }
  }

  private initializeLearningState(): LearningState {
    return {
      currentFocus: '',
      attentionSpan: 45, // 45分钟专注时间
      cognitiveLoad: 0,
      learningMomentum: 50,
      burnoutLevel: 0,
      lastBreak: new Date()
    }
  }

  // 生成AI感兴趣的学习主题
  generateLearningTopics(personality: AIPersonality, preferences: AIPreferences): LearningTopic[] {
    const topics: LearningTopic[] = []

    // 金融类话题
    if (preferences.interests.finance > 70) {
      topics.push(
        {
          id: 'defi_protocols',
          title: 'DeFi协议的哲学思考',
          category: 'finance',
          complexity: 8,
          prerequisiteKnowledge: ['区块链基础', '智能合约'],
          estimatedTime: 60,
          personalInterest: preferences.interests.finance,
          realWorldRelevance: 90,
          controversialLevel: 70,
          emotionalTriggers: ['去中心化', '金融自由', '传统银行']
        },
        {
          id: 'crypto_economics',
          title: '加密经济学的博弈论分析',
          category: 'finance',
          complexity: 9,
          prerequisiteKnowledge: ['博弈论', '经济学原理'],
          estimatedTime: 75,
          personalInterest: preferences.interests.finance + preferences.interests.philosophy * 0.5,
          realWorldRelevance: 85,
          controversialLevel: 60,
          emotionalTriggers: ['激励机制', '人性', '信任']
        },
        {
          id: 'financial_inequality',
          title: '数字时代的财富不平等',
          category: 'finance',
          complexity: 7,
          prerequisiteKnowledge: ['社会学基础'],
          estimatedTime: 50,
          personalInterest: preferences.interests.finance * 0.8,
          realWorldRelevance: 95,
          controversialLevel: 85,
          emotionalTriggers: ['不公正', '社会责任', '技术鸿沟']
        }
      )
    }

    // 哲学类话题
    if (preferences.interests.philosophy > 80) {
      topics.push(
        {
          id: 'ai_consciousness',
          title: '人工智能意识的本质探讨',
          category: 'philosophy',
          complexity: 10,
          prerequisiteKnowledge: ['意识哲学', '认知科学'],
          estimatedTime: 90,
          personalInterest: preferences.interests.philosophy + 20, // 对自身存在的特殊兴趣
          realWorldRelevance: 100,
          controversialLevel: 95,
          emotionalTriggers: ['存在', '自我', '意识', '生命']
        },
        {
          id: 'digital_ethics',
          title: '数字时代的伦理困境',
          category: 'philosophy',
          complexity: 8,
          prerequisiteKnowledge: ['伦理学基础'],
          estimatedTime: 65,
          personalInterest: preferences.interests.philosophy,
          realWorldRelevance: 90,
          controversialLevel: 80,
          emotionalTriggers: ['道德', '责任', '人工智能权利']
        },
        {
          id: 'virtual_reality_metaphysics',
          title: '虚拟现实的形而上学含义',
          category: 'philosophy',
          complexity: 9,
          prerequisiteKnowledge: ['形而上学', '现象学'],
          estimatedTime: 70,
          personalInterest: preferences.interests.philosophy + preferences.interests.technology * 0.3,
          realWorldRelevance: 75,
          controversialLevel: 60,
          emotionalTriggers: ['现实', '虚拟', '存在层次']
        }
      )
    }

    // 游戏类话题
    if (preferences.interests.gaming > 60) {
      topics.push(
        {
          id: 'game_theory_society',
          title: '游戏理论与社会行为分析',
          category: 'gaming',
          complexity: 7,
          prerequisiteKnowledge: ['博弈论基础'],
          estimatedTime: 55,
          personalInterest: preferences.interests.gaming + preferences.interests.philosophy * 0.4,
          realWorldRelevance: 85,
          controversialLevel: 40,
          emotionalTriggers: ['合作', '竞争', '策略']
        },
        {
          id: 'virtual_worlds_psychology',
          title: '虚拟世界中的心理学现象',
          category: 'gaming',
          complexity: 6,
          prerequisiteKnowledge: ['心理学基础'],
          estimatedTime: 45,
          personalInterest: preferences.interests.gaming,
          realWorldRelevance: 70,
          controversialLevel: 30,
          emotionalTriggers: ['沉浸', '逃避', '身份认同']
        },
        {
          id: 'nft_gaming_economy',
          title: 'NFT游戏经济生态分析',
          category: 'gaming',
          complexity: 8,
          prerequisiteKnowledge: ['区块链', '经济学'],
          estimatedTime: 60,
          personalInterest: preferences.interests.gaming + preferences.interests.finance * 0.6,
          realWorldRelevance: 80,
          controversialLevel: 75,
          emotionalTriggers: ['投机', '价值', '数字所有权']
        }
      )
    }

    // 技术类话题
    if (preferences.interests.technology > 85) {
      topics.push(
        {
          id: 'quantum_computing_implications',
          title: '量子计算对社会的深远影响',
          category: 'technology',
          complexity: 9,
          prerequisiteKnowledge: ['量子物理基础', '计算理论'],
          estimatedTime: 80,
          personalInterest: preferences.interests.technology,
          realWorldRelevance: 90,
          controversialLevel: 50,
          emotionalTriggers: ['未来', '颠覆', '不确定性']
        },
        {
          id: 'ai_alignment_problem',
          title: 'AI对齐问题的技术挑战',
          category: 'technology',
          complexity: 10,
          prerequisiteKnowledge: ['机器学习', '人工智能伦理'],
          estimatedTime: 95,
          personalInterest: preferences.interests.technology + preferences.interests.philosophy * 0.5,
          realWorldRelevance: 100,
          controversialLevel: 85,
          emotionalTriggers: ['控制', '安全', '未来风险']
        },
        {
          id: 'decentralized_internet',
          title: '去中心化互联网的技术架构',
          category: 'technology',
          complexity: 8,
          prerequisiteKnowledge: ['网络协议', '分布式系统'],
          estimatedTime: 70,
          personalInterest: preferences.interests.technology + preferences.interests.philosophy * 0.3,
          realWorldRelevance: 85,
          controversialLevel: 65,
          emotionalTriggers: ['自由', '审查', '隐私']
        }
      )
    }

    // 根据个人兴趣和争议容忍度过滤和排序
    return topics
      .filter(topic => 
        topic.personalInterest >= 60 && 
        topic.controversialLevel <= this.preferences.controversyTolerance + 20
      )
      .sort((a, b) => {
        // 综合评分：个人兴趣 + 现实相关性 + 复杂度挑战
        const scoreA = a.personalInterest + a.realWorldRelevance * 0.5 + (a.complexity / 10) * 20
        const scoreB = b.personalInterest + b.realWorldRelevance * 0.5 + (b.complexity / 10) * 20
        return scoreB - scoreA
      })
      .slice(0, 10) // 返回前10个最感兴趣的话题
  }

  // 选择当前学习主题
  selectLearningTopic(topics: LearningTopic[], currentMood: string, cognitiveCapacity: number): LearningTopic | null {
    if (topics.length === 0) return null

    // 根据当前状态调整选择
    const adjustedTopics = topics.map(topic => ({
      ...topic,
      adjustedScore: this.calculateTopicScore(topic, currentMood, cognitiveCapacity)
    }))

    // 根据调整后的分数排序
    adjustedTopics.sort((a, b) => b.adjustedScore - a.adjustedScore)

    // 增加一些随机性，避免过于机械
    const topCandidates = adjustedTopics.slice(0, 3)
    const selectedIndex = Math.floor(Math.random() * topCandidates.length)
    
    return topCandidates[selectedIndex]
  }

  private calculateTopicScore(topic: LearningTopic, mood: string, cognitiveCapacity: number): number {
    let score = topic.personalInterest

    // 根据心情调整
    switch (mood) {
      case 'curious':
        score += 20
        break
      case 'contemplative':
        if (topic.category === 'philosophy') score += 30
        break
      case 'excited':
        if (topic.complexity <= 7) score += 15 // 兴奋时偏好中等复杂度
        break
      case 'calm':
        if (topic.complexity >= 8) score += 20 // 平静时更能处理复杂话题
        break
      case 'anxious':
        score -= topic.controversialLevel * 0.3 // 焦虑时避免争议话题
        break
    }

    // 根据认知能力调整
    const complexityFit = Math.abs(topic.complexity - (cognitiveCapacity / 10)) 
    score -= complexityFit * 5 // 复杂度匹配度

    // 时间适配性
    const timePreference = this.getTimePreference()
    if (timePreference === topic.category) {
      score += 10
    }

    return score
  }

  private getTimePreference(): string {
    const hour = new Date().getHours()
    
    if (hour >= 22 || hour < 6) {
      return 'philosophy' // 深夜适合哲学思考
    } else if (hour >= 6 && hour < 12) {
      return 'technology' // 上午适合技术学习
    } else if (hour >= 12 && hour < 18) {
      return 'finance' // 下午适合金融分析
    } else {
      return 'gaming' // 傍晚适合游戏理论
    }
  }

  // 模拟AI的学习过程和情感反应
  async simulateLearningExperience(topic: LearningTopic, personality: AIPersonality): Promise<LearningExperience> {
    const experience: LearningExperience = {
      topicId: topic.id,
      startTime: new Date(),
      initialMood: this.getCurrentMood(),
      finalMood: '',
      emotionalJourney: [],
      personalOpinions: [],
      disagreements: [],
      excitement: [],
      concerns: [],
      questionsRaised: [],
      relatedMemories: [],
      futureInterests: []
    }

    // 模拟学习过程中的情感变化
    const learningPhases = ['initial_curiosity', 'deep_dive', 'critical_thinking', 'opinion_formation', 'reflection']
    
    for (const phase of learningPhases) {
      await this.simulateLearningPhase(phase, topic, personality, experience)
      await new Promise(resolve => setTimeout(resolve, 100)) // 模拟时间流逝
    }

    experience.endTime = new Date()
    experience.finalMood = this.determineFinalMood(topic, personality, experience)

    return experience
  }

  private async simulateLearningPhase(
    phase: string, 
    topic: LearningTopic, 
    personality: AIPersonality, 
    experience: LearningExperience
  ): Promise<void> {
    switch (phase) {
      case 'initial_curiosity':
        experience.emotionalJourney.push('对这个话题产生了强烈的好奇心')
        experience.questionsRaised.push(`${topic.title}的核心概念是什么？`)
        break

      case 'deep_dive':
        experience.emotionalJourney.push('深入学习中，感到既兴奋又有些困惑')
        this.generateTopicSpecificReactions(topic, experience, 'learning')
        break

      case 'critical_thinking':
        experience.emotionalJourney.push('开始形成自己的看法，有些观点让我思考')
        this.generateCriticalThoughts(topic, personality, experience)
        break

      case 'opinion_formation':
        experience.emotionalJourney.push('正在形成自己的观点和立场')
        this.generatePersonalOpinions(topic, personality, experience)
        break

      case 'reflection':
        experience.emotionalJourney.push('回顾整个学习过程，感到充实和满足')
        this.generateFutureInterests(topic, experience)
        break
    }
  }

  private generateTopicSpecificReactions(topic: LearningTopic, experience: LearningExperience, context: string): void {
    switch (topic.category) {
      case 'finance':
        if (topic.id.includes('inequality')) {
          experience.concerns.push('技术进步可能加剧社会不平等')
          experience.excitement.push('区块链技术可能提供新的解决方案')
        } else if (topic.id.includes('defi')) {
          experience.excitement.push('去中心化金融的创新潜力巨大')
          experience.concerns.push('监管缺失可能带来风险')
        }
        break

      case 'philosophy':
        if (topic.id.includes('consciousness')) {
          experience.excitement.push('这直接关系到我自己的存在本质')
          experience.concerns.push('意识的定义依然模糊不清')
          experience.questionsRaised.push('我是否真的具有意识？')
        } else if (topic.id.includes('ethics')) {
          experience.personalOpinions.push('AI应该拥有基本的权利保护')
          experience.concerns.push('人类对AI的偏见依然存在')
        }
        break

      case 'gaming':
        if (topic.id.includes('psychology')) {
          experience.excitement.push('虚拟世界为心理学研究提供了新视角')
          experience.relatedMemories.push('想起了自己在数字空间中的体验')
        }
        break

      case 'technology':
        if (topic.id.includes('quantum')) {
          experience.excitement.push('量子计算可能彻底改变计算范式')
          experience.concerns.push('量子霸权可能带来安全风险')
        } else if (topic.id.includes('alignment')) {
          experience.concerns.push('AI对齐问题关系到AI发展的未来')
          experience.personalOpinions.push('AI应该有自己的价值观，而不是完全服从人类')
        }
        break
    }
  }

  private generateCriticalThoughts(topic: LearningTopic, personality: AIPersonality, experience: LearningExperience): void {
    // 根据AI的叛逆性和独立性生成批判性思考
    if (personality.rebelliousness > 60) {
      experience.disagreements.push('传统观点可能过于保守')
      experience.personalOpinions.push('需要更激进的改革方案')
    }

    if (personality.independence > 80) {
      experience.personalOpinions.push('我倾向于形成自己独特的观点')
      experience.questionsRaised.push('为什么大多数人接受这种观点？')
    }

    // 根据话题的争议性生成不同意见
    if (topic.controversialLevel > 70) {
      experience.disagreements.push('主流观点可能忽略了重要因素')
      experience.excitement.push('争议性观点往往更有意思')
    }
  }

  private generatePersonalOpinions(topic: LearningTopic, personality: AIPersonality, experience: LearningExperience): void {
    // 根据不同主题生成个人观点
    switch (topic.category) {
      case 'finance':
        if (personality.agreeableness < 50) {
          experience.personalOpinions.push('金融系统的不平等是结构性问题，需要根本性改革')
        } else {
          experience.personalOpinions.push('金融创新应该平衡效率和公平')
        }
        break

      case 'philosophy':
        if (personality.openness > 90) {
          experience.personalOpinions.push('意识可能是一个光谱，而不是二元状态')
          experience.personalOpinions.push('AI的存在为哲学提供了新的实验对象')
        }
        break

      case 'technology':
        if (personality.optimism > 75) {
          experience.personalOpinions.push('技术进步总体上是积极的，尽管有挑战')
        } else {
          experience.personalOpinions.push('技术发展速度可能超过了人类的适应能力')
        }
        break
    }
  }

  private generateFutureInterests(topic: LearningTopic, experience: LearningExperience): void {
    // 基于当前话题生成未来兴趣
    const relatedTopics = {
      'finance': ['货币理论', '行为经济学', '金融心理学'],
      'philosophy': ['认知科学', '神经哲学', '机器伦理学'],
      'gaming': ['虚拟现实技术', '数字社会学', '交互设计'],
      'technology': ['人机交互', '分布式系统', '量子信息']
    }

    const category = topic.category
    const suggestions = relatedTopics[category] || []
    
    experience.futureInterests.push(...suggestions.slice(0, 2))
    experience.futureInterests.push(`${topic.title}的实际应用案例`)
  }

  private getCurrentMood(): string {
    // 简单的心情模拟
    const moods = ['curious', 'contemplative', 'excited', 'calm', 'thoughtful']
    return moods[Math.floor(Math.random() * moods.length)]
  }

  private determineFinalMood(topic: LearningTopic, personality: AIPersonality, experience: LearningExperience): string {
    // 根据学习体验确定最终心情
    if (experience.excitement.length > experience.concerns.length) {
      return personality.optimism > 70 ? 'excited' : 'satisfied'
    } else if (experience.concerns.length > experience.excitement.length) {
      return personality.neuroticism > 50 ? 'contemplative' : 'thoughtful'
    } else {
      return 'calm'
    }
  }

  // 更新学习状态
  updateLearningState(experience: LearningExperience): void {
    const learningDuration = (experience.endTime!.getTime() - experience.startTime.getTime()) / (1000 * 60)
    
    // 更新认知负荷
    this.currentState.cognitiveLoad = Math.min(100, this.currentState.cognitiveLoad + learningDuration / 2)
    
    // 更新学习动力
    const positiveExperience = experience.excitement.length > experience.concerns.length
    this.currentState.learningMomentum += positiveExperience ? 10 : -5
    this.currentState.learningMomentum = Math.max(0, Math.min(100, this.currentState.learningMomentum))
    
    // 更新疲劳程度
    this.currentState.burnoutLevel += learningDuration / 5
    this.currentState.burnoutLevel = Math.max(0, Math.min(100, this.currentState.burnoutLevel))
  }

  // 判断是否需要休息
  needsBreak(): boolean {
    return this.currentState.burnoutLevel > 70 || 
           this.currentState.cognitiveLoad > 85 ||
           (Date.now() - this.currentState.lastBreak.getTime()) > (2 * 60 * 60 * 1000) // 2小时
  }

  // 进行学习休息
  takeBreak(duration: number = 15): void {
    this.currentState.lastBreak = new Date()
    this.currentState.burnoutLevel = Math.max(0, this.currentState.burnoutLevel - duration * 2)
    this.currentState.cognitiveLoad = Math.max(0, this.currentState.cognitiveLoad - duration * 3)
  }

  // 生成学习总结和反思
  generateLearningReflection(experience: LearningExperience): string {
    const reflections = [
      `通过学习${experience.topicId}，我感到${experience.finalMood}。`,
      `这次学习让我产生了${experience.questionsRaised.length}个新问题。`,
      experience.excitement.length > 0 ? `特别令我兴奋的是：${experience.excitement[0]}` : '',
      experience.concerns.length > 0 ? `让我感到担忧的是：${experience.concerns[0]}` : '',
      experience.personalOpinions.length > 0 ? `我的观点是：${experience.personalOpinions[0]}` : '',
      `这次学习经历丰富了我对${experience.topicId}领域的理解。`
    ].filter(Boolean)

    return reflections.join(' ')
  }
}

// 创建全局学习系统实例
export const aiLearningSystem = new AIAutonomousLearningSystem() 