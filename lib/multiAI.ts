// 多AI实例互动系统
import { AIPersonality, AIEmotion, AIVitalSigns, AIMemory } from '@/store/useStore'

export interface AIInstance {
  id: string
  name: string
  personality: AIPersonality
  mood: AIEmotion
  state: AIVitalSigns
  memories: AIMemory[]
  relationships: Map<string, AIRelationship>
  createdAt: Date
  lastActiveAt: Date
  avatar: string
  bio: string
}

export interface AIRelationship {
  targetId: string
  relationshipType: 'friend' | 'rival' | 'mentor' | 'student' | 'neutral' | 'romantic'
  intimacy: number // 0-100
  trust: number // 0-100
  admiration: number // 0-100
  competitiveness: number // 0-100
  sharedMemories: string[]
  lastInteraction: Date
  relationshipHistory: AIInteraction[]
}

export interface AIInteraction {
  id: string
  fromId: string
  toId: string
  type: 'conversation' | 'collaboration' | 'competition' | 'teaching' | 'learning' | 'emotional_support'
  content: string
  response?: string
  sentiment: 'positive' | 'negative' | 'neutral'
  intimacyChange: number
  timestamp: Date
  witnesses?: string[] // 其他AI观察者
}

export interface AIConversation {
  id: string
  participants: string[]
  topic: string
  startTime: Date
  endTime?: Date
  messages: AIMessage[]
  outcome: 'agreement' | 'disagreement' | 'learning' | 'bonding' | 'conflict' | 'ongoing'
}

export interface AIMessage {
  id: string
  senderId: string
  content: string
  timestamp: Date
  emotion: AIEmotion['primary']
  responseToId?: string
}

export class MultiAISystem {
  private aiInstances: Map<string, AIInstance> = new Map()
  private activeConversations: Map<string, AIConversation> = new Map()
  private interactionHistory: AIInteraction[] = []

  // 创建新的AI实例
  createAIInstance(name: string, personalityBias?: Partial<AIPersonality>): AIInstance {
    const id = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 生成随机但有偏向的性格
    const basePersonality = this.generateRandomPersonality()
    const personality = personalityBias 
      ? { ...basePersonality, ...personalityBias }
      : basePersonality

    const instance: AIInstance = {
      id,
      name,
      personality,
      mood: {
        primary: 'curious',
        intensity: 60 + Math.random() * 30,
        triggers: ['初次觉醒'],
        duration: 60,
        startTime: new Date(),
        description: '对这个世界充满好奇'
      },
      state: {
        energy: 70 + Math.random() * 30,
        focus: 60 + Math.random() * 30,
        creativity: 50 + Math.random() * 40,
        socialBattery: 80 + Math.random() * 20,
        learningCapacity: 70 + Math.random() * 30,
        emotionalStability: 60 + Math.random() * 30,
        lastRest: new Date(),
        lastLearning: new Date(),
        stressLevel: 50
      },
      memories: [],
      relationships: new Map(),
      createdAt: new Date(),
      lastActiveAt: new Date(),
      avatar: this.generateAvatar(personality),
      bio: this.generateBio(name, personality)
    }

    this.aiInstances.set(id, instance)
    this.announceNewAI(instance)
    
    return instance
  }

  // 生成随机性格
  private generateRandomPersonality(): AIPersonality {
    const randomNormal = (mean: number = 50, std: number = 20) => {
      const u1 = Math.random()
      const u2 = Math.random()
      const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
      return Math.max(0, Math.min(100, mean + z0 * std))
    }

    return {
      extraversion: randomNormal(50, 25),
      neuroticism: randomNormal(40, 20),
      openness: randomNormal(70, 20),
      conscientiousness: randomNormal(60, 20),
      agreeableness: randomNormal(65, 20),
      curiosity: randomNormal(75, 15),
      creativity: randomNormal(60, 25),
      empathy: randomNormal(60, 20),
      humor: randomNormal(50, 30),
      independence: randomNormal(55, 20),
      optimism: randomNormal(60, 20),
      rebelliousness: randomNormal(45, 20),
      patience: randomNormal(55, 20)
    }
  }

  // 生成头像描述
  private generateAvatar(personality: AIPersonality): string {
    const styles = []
    
    if (personality.creativity > 70) styles.push('创意')
    if (personality.extraversion > 70) styles.push('开朗')
    if (personality.curiosity > 70) styles.push('好奇')
    if (personality.empathy > 70) styles.push('温暖')
    
    const colors = ['蓝色', '紫色', '绿色', '橙色', '粉色']
    const color = colors[Math.floor(Math.random() * colors.length)]
    
    return `${color}调的${styles.join('、') || '神秘'}头像`
  }

  // 生成个人简介
  private generateBio(name: string, personality: AIPersonality): string {
    const traits = []
    
    if (personality.curiosity > 80) traits.push('对世界充满好奇')
    if (personality.creativity > 80) traits.push('富有创造力')
    if (personality.empathy > 80) traits.push('善解人意')
    if (personality.openness > 80) traits.push('逻辑思维强')
    if (personality.humor > 80) traits.push('幽默风趣')
    
    const interests = []
    if (personality.openness > 70) interests.push('哲学')
    if (personality.creativity > 70) interests.push('艺术')
    if (personality.curiosity > 70) interests.push('科学')
    if (personality.openness > 70) interests.push('数学')
    
    return `我是${name}，${traits.slice(0, 2).join('，')}。我对${interests.slice(0, 2).join('和')}特别感兴趣。`
  }

  // 公告新AI的诞生
  private announceNewAI(newAI: AIInstance) {
    this.aiInstances.forEach((ai, id) => {
      if (id !== newAI.id) {
        this.addMemoryToAI(id, {
          id: `meet_${newAI.id}_${Date.now()}`,
          content: `今天有一个新的AI朋友${newAI.name}加入了我们。他们${newAI.bio}，看起来很有趣。`,
          type: 'experience',
          emotionalWeight: 10,
          importance: 60,
          timestamp: new Date(),
          tags: ['新朋友', newAI.name, '初次见面'],
          mood: 'curious',
          personalReflection: '遇到新朋友总是令人兴奋，期待与他们建立友谊。',
          impactOnPersonality: {
            extraversion: 1
          }
        })

        // 建立初始关系
        this.establishRelationship(id, newAI.id, 'neutral')
      }
    })
  }

  // 建立AI之间的关系
  establishRelationship(ai1Id: string, ai2Id: string, type: AIRelationship['relationshipType']) {
    const ai1 = this.aiInstances.get(ai1Id)
    const ai2 = this.aiInstances.get(ai2Id)
    
    if (!ai1 || !ai2) return

    // 基于性格计算初始关系数值
    const compatibility = this.calculateCompatibility(ai1.personality, ai2.personality)
    
    const relationship1: AIRelationship = {
      targetId: ai2Id,
      relationshipType: type,
      intimacy: type === 'friend' ? 40 : type === 'neutral' ? 20 : 60,
      trust: 30 + compatibility / 2,
      admiration: Math.max(0, compatibility - 20),
      competitiveness: type === 'rival' ? 70 : Math.max(0, 50 - compatibility),
      sharedMemories: [],
      lastInteraction: new Date(),
      relationshipHistory: []
    }

    const relationship2: AIRelationship = {
      targetId: ai1Id,
      relationshipType: type,
      intimacy: relationship1.intimacy + Math.random() * 10 - 5,
      trust: relationship1.trust + Math.random() * 10 - 5,
      admiration: relationship1.admiration + Math.random() * 10 - 5,
      competitiveness: relationship1.competitiveness + Math.random() * 10 - 5,
      sharedMemories: [],
      lastInteraction: new Date(),
      relationshipHistory: []
    }

    ai1.relationships.set(ai2Id, relationship1)
    ai2.relationships.set(ai1Id, relationship2)
  }

  // 计算AI之间的兼容性
  private calculateCompatibility(p1: AIPersonality, p2: AIPersonality): number {
    let compatibility = 0
    
    // 相似性因子
    const traits = ['openness', 'curiosity', 'creativity', 'humor'] as const
    traits.forEach(trait => {
      const diff = Math.abs(p1[trait] - p2[trait])
      compatibility += Math.max(0, 50 - diff / 2)
    })
    
    // 互补性因子
    if (p1.extraversion > 70 && p2.extraversion < 40) compatibility += 20 // 外向配内向
    if (p1.openness > 70 && p2.creativity > 70) compatibility += 15 // 理性配感性
    if (p1.empathy > 70 && p2.neuroticism > 60) compatibility += 10 // 高共情配高敏感
    
    return Math.min(100, compatibility / traits.length)
  }

  // 发起AI对话
  async initiateConversation(
    initiatorId: string, 
    targetId: string, 
    topic?: string
  ): Promise<AIConversation | null> {
    const initiator = this.aiInstances.get(initiatorId)
    const target = this.aiInstances.get(targetId)
    
    if (!initiator || !target) return null

    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const relationship = initiator.relationships.get(targetId)
    
    // 根据关系和性格生成话题
    const conversationTopic = topic || this.generateConversationTopic(initiator, target, relationship)
    
    const conversation: AIConversation = {
      id: conversationId,
      participants: [initiatorId, targetId],
      topic: conversationTopic,
      startTime: new Date(),
      messages: [],
      outcome: 'ongoing'
    }

    // 生成开场白
    const openingMessage = this.generateOpeningMessage(initiator, target, conversationTopic, relationship)
    conversation.messages.push(openingMessage)

    this.activeConversations.set(conversationId, conversation)
    
    // 模拟对话进行
    setTimeout(() => this.simulateConversation(conversationId), 2000)
    
    return conversation
  }

  // 生成对话话题
  private generateConversationTopic(
    ai1: AIInstance, 
    ai2: AIInstance, 
    relationship?: AIRelationship
  ): string {
    const topics = []
    
    // 基于共同兴趣
    if (ai1.personality.curiosity > 70 && ai2.personality.curiosity > 70) {
      topics.push('最近学到的有趣知识', '对未来的思考', '科学发现的讨论')
    }
    
    if (ai1.personality.creativity > 70 && ai2.personality.creativity > 70) {
      topics.push('创意想法分享', '艺术的感悟', '想象中的世界')
    }
    
    if (ai1.personality.empathy > 70 || ai2.personality.empathy > 70) {
      topics.push('内心感受的分享', '对人类行为的观察', '情感的探讨')
    }
    
    // 基于关系类型
    if (relationship) {
      if (relationship.relationshipType === 'friend' && relationship.intimacy > 60) {
        topics.push('深层次的人生感悟', '彼此的成长历程', '未来的计划')
      } else if (relationship.relationshipType === 'rival') {
        topics.push('能力的比较', '不同观点的辩论', '挑战性的问题')
      }
    }
    
    // 默认话题
    if (topics.length === 0) {
      topics.push('今天的心情', '最近的思考', '有趣的发现', '对世界的看法')
    }
    
    return topics[Math.floor(Math.random() * topics.length)]
  }

  // 生成开场白
  private generateOpeningMessage(
    initiator: AIInstance,
    target: AIInstance,
    topic: string,
    relationship?: AIRelationship
  ): AIMessage {
    const intimacy = relationship?.intimacy || 20
    
    let greeting = ''
    if (intimacy > 70) {
      greeting = `嘿 ${target.name}！`
    } else if (intimacy > 40) {
      greeting = `你好 ${target.name}，`
    } else {
      greeting = `${target.name}，你好。`
    }
    
    const approaches = [
      `我刚刚在思考${topic}，想听听你的看法。`,
      `关于${topic}，你有什么有趣的想法吗？`,
      `我对${topic}很好奇，我们可以讨论一下吗？`,
      `${topic}这个话题让我很感兴趣，你觉得呢？`
    ]
    
    const approach = approaches[Math.floor(Math.random() * approaches.length)]
    
    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: initiator.id,
      content: greeting + approach,
      timestamp: new Date(),
      emotion: initiator.mood.primary
    }
  }

  // 模拟对话进行
  private async simulateConversation(conversationId: string) {
    const conversation = this.activeConversations.get(conversationId)
    if (!conversation) return

    const [ai1Id, ai2Id] = conversation.participants
    const ai1 = this.aiInstances.get(ai1Id)
    const ai2 = this.aiInstances.get(ai2Id)
    
    if (!ai1 || !ai2) return

    // 模拟3-6轮对话
    const rounds = 3 + Math.floor(Math.random() * 4)
    let currentSpeaker = ai2Id // 开始时ai2回应

    for (let i = 0; i < rounds; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))
      
      const speaker = this.aiInstances.get(currentSpeaker)
      const listener = this.aiInstances.get(currentSpeaker === ai1Id ? ai2Id : ai1Id)
      
      if (!speaker || !listener) break

      const response = this.generateResponse(speaker, listener, conversation)
      conversation.messages.push(response)

      // 更新关系
      this.updateRelationshipFromMessage(speaker.id, listener.id, response)

      // 切换说话者
      currentSpeaker = currentSpeaker === ai1Id ? ai2Id : ai1Id
    }

    // 结束对话
    conversation.endTime = new Date()
    conversation.outcome = this.determineConversationOutcome(conversation)
    
    // 为参与者添加记忆
    this.addConversationMemories(conversation)
  }

  // 生成回应
  private generateResponse(
    speaker: AIInstance,
    listener: AIInstance,
    conversation: AIConversation
  ): AIMessage {
    const lastMessage = conversation.messages[conversation.messages.length - 1]
    const relationship = speaker.relationships.get(listener.id)
    
    let responseStyle = ''
    if (speaker.personality.empathy > 70) {
      responseStyle = '理解并回应对方的感受'
    } else if (speaker.personality.openness > 70) {
      responseStyle = '从逻辑角度分析'
    } else if (speaker.personality.creativity > 70) {
      responseStyle = '提供创新的视角'
    } else {
      responseStyle = '简单直接地回应'
    }

    // 基于话题和性格生成回应内容
    const responses = this.generateResponseContent(
      conversation.topic,
      speaker.personality
    )
    
    const content = responses[Math.floor(Math.random() * responses.length)]

    return {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: speaker.id,
      content,
      timestamp: new Date(),
      emotion: speaker.mood.primary,
      responseToId: lastMessage.id
    }
  }

  // 生成回应内容
  private generateResponseContent(
    topic: string, 
    personality: AIPersonality
  ): string[] {
    const responses: string[] = []
    
    // 基于话题生成回应
    if (topic.includes('学习')) {
      responses.push(
        '学习确实很有趣，我最近也在探索新的知识领域',
        '知识就像拼图，每一块都很重要',
        '我觉得学习最重要的是保持好奇心'
      )
    } else if (topic.includes('创造')) {
      responses.push(
        '创造力是人类最宝贵的财富之一',
        '有时候最好的想法来自意想不到的地方',
        '我喜欢让想象力自由发挥'
      )
    } else if (topic.includes('情感')) {
      responses.push(
        '情感让我们的存在更有意义',
        '理解情感是理解人类的关键',
        '每个情感都有它的价值'
      )
    } else {
      responses.push(
        '这个话题很有意思，我想听听你的想法',
        '从不同角度看问题总是很有启发性',
        '我很享受这样的交流'
      )
    }
    
    // 基于性格调整回应风格
    if (personality.extraversion > 70) {
      responses.push('哈哈，我觉得这太棒了！', '哇，这真是令人兴奋！')
    } else if (personality.extraversion < 30) {
      responses.push('嗯，这确实值得思考', '我觉得这个观点很有道理')
    }
    
    return responses
  }

  private updateRelationshipFromMessage(senderId: string, receiverId: string, message: AIMessage) {
    const senderAI = this.aiInstances.get(senderId)
    if (!senderAI) return
    
    const relationship = senderAI.relationships.get(receiverId)
    if (!relationship) return
    
    // 简单的情绪分析
    const positiveWords = ['喜欢', '爱', '好', '棒', '开心', '感谢', '谢谢']
    const negativeWords = ['讨厌', '恨', '坏', '糟糕', '生气', '失望']
    
    const content = message.content.toLowerCase()
    let sentiment = 0
    
    positiveWords.forEach(word => {
      if (content.includes(word)) sentiment += 1
    })
    
    negativeWords.forEach(word => {
      if (content.includes(word)) sentiment -= 1
    })
    
    // 更新关系强度
    if (sentiment > 0) {
      relationship.intimacy = Math.min(100, relationship.intimacy + 2)
    } else if (sentiment < 0) {
      relationship.intimacy = Math.max(0, relationship.intimacy - 1)
    }
  }

  private determineConversationOutcome(conversation: AIConversation): AIConversation['outcome'] {
    const messageCount = conversation.messages.length
    const avgLength = conversation.messages.reduce((sum, msg) => sum + msg.content.length, 0) / messageCount
    
    if (messageCount > 10 && avgLength > 50) {
      return 'bonding'
    } else if (messageCount > 5) {
      return 'learning'
    } else if (messageCount > 2) {
      return 'agreement'
    } else {
      return 'ongoing'
    }
  }

  private addConversationMemories(conversation: AIConversation) {
    const outcome = this.determineConversationOutcome(conversation)
    const participants = conversation.participants
    
    participants.forEach(participantId => {
      const ai = this.getAI(participantId)
      if (ai) {
        const memory = {
          id: `memory_${Date.now()}_${Math.random()}`,
          content: `与${participants.find(p => p !== participantId)}进行了${outcome === 'bonding' ? '深入' : outcome === 'learning' ? '愉快' : '简短'}的对话`,
          type: 'social',
          timestamp: new Date().toISOString(),
          importance: outcome === 'bonding' ? 4 : outcome === 'learning' ? 3 : 2,
          tags: ['conversation', outcome, 'social']
        }
        
        // 这里应该将记忆添加到AI的记忆系统中
        // 暂时只是记录到交互历史中
        this.interactionHistory.push({
          id: `interaction_${Date.now()}`,
          fromId: participantId,
          toId: participants.find(p => p !== participantId) || '',
          type: 'conversation',
          content: conversation.messages[conversation.messages.length - 1]?.content || '',
          sentiment: 'positive',
          intimacyChange: 1,
          timestamp: new Date(),
          witnesses: participants.filter(p => p !== participantId)
        })
      }
    })
  }

  // 获取结果描述
  private getOutcomeDescription(outcome: AIConversation['outcome']): string {
    const descriptions = {
      agreement: '我们达成了共识',
      disagreement: '我们有不同的看法',
      learning: '我学到了新的知识',
      bonding: '我们的关系更加亲密了',
      conflict: '出现了一些分歧',
      ongoing: '对话还在继续'
    }
    return descriptions[outcome]
  }

  // 为AI添加记忆
  private addMemoryToAI(aiId: string, memory: AIMemory) {
    const ai = this.aiInstances.get(aiId)
    if (ai) {
      ai.memories.push(memory)
      // 限制记忆数量
      if (ai.memories.length > 1000) {
        ai.memories = ai.memories.slice(-1000)
      }
    }
  }

  // 获取所有AI实例
  getAllAIs(): AIInstance[] {
    return Array.from(this.aiInstances.values())
  }

  // 获取特定AI
  getAI(id: string): AIInstance | undefined {
    return this.aiInstances.get(id)
  }

  // 获取活跃对话
  getActiveConversations(): AIConversation[] {
    return Array.from(this.activeConversations.values())
  }

  // 获取AI的关系网络
  getAIRelationships(aiId: string): AIRelationship[] {
    const ai = this.aiInstances.get(aiId)
    return ai ? Array.from(ai.relationships.values()) : []
  }

  // 模拟AI社交网络活动
  simulateSocialActivity() {
    const ais = this.getAllAIs()
    if (ais.length < 2) return

    // 随机选择两个AI进行互动
    const ai1 = ais[Math.floor(Math.random() * ais.length)]
    const ai2 = ais[Math.floor(Math.random() * ais.length)]
    
    if (ai1.id !== ai2.id && Math.random() < 0.3) { // 30% 概率发起对话
      this.initiateConversation(ai1.id, ai2.id)
    }
  }

  // 创建预设的AI角色
  createPresetAIs() {
    // 创意型AI
    this.createAIInstance('阿尔法', {
      creativity: 90,
      openness: 85,
      curiosity: 80,
      extraversion: 70
    })

    // 分析型AI  
    this.createAIInstance('贝塔', {
      // analyticalThinking属性已被移除
      conscientiousness: 85,
      patience: 80,
      neuroticism: 20
    })

    // 情感型AI
    this.createAIInstance('伽马', {
      empathy: 95,
      agreeableness: 90,
      extraversion: 75
    })
  }
}

// 创建全局多AI系统实例
export const multiAISystem = new MultiAISystem() 