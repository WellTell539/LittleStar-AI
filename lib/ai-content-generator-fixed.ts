// AI动态内容生成引擎 - 完全基于实时状态，无固定话术
import { AIEmotion, AIPersonality, AIKnowledge, AIMemory, AISocialPost } from '@/store/useStore'
import { aiService } from './ai-service'

// 内容生成上下文接口
export interface ContentGenerationContext {
  currentEmotion: AIEmotion
  personality: AIPersonality
  recentKnowledge: AIKnowledge[]
  recentMemories: AIMemory[]
  vitalSigns: {
    energy: number
    focus: number
    socialBattery: number
    learningCapacity: number
    emotionalStability: number
  }
  timeOfDay: string
  daysSinceCreation: number
  interactionHistory: string[]
  currentGoals: any[]
  environmentFactors: {
    isLearning: boolean
    recentInteractions: number
    lastMoodChange: Date
  }
}

// 内容生成结果接口
export interface GeneratedContent {
  content: string
  confidence: number
  reasoning: string
  emotionalTone: string
  references: string[] // 引用的知识或记忆
  personalityInfluence: string
}

// AI动态内容生成器
export class AIContentGenerator {
  private static instance: AIContentGenerator
  private isClient: boolean = false

  constructor() {
    this.isClient = typeof window !== 'undefined'
  }

  static getInstance(): AIContentGenerator {
    if (!AIContentGenerator.instance) {
      AIContentGenerator.instance = new AIContentGenerator()
    }
    return AIContentGenerator.instance
  }

  // 生成社交动态内容
  async generateSocialPost(context: ContentGenerationContext): Promise<GeneratedContent> {
    // 分析当前状态以决定发布什么类型的内容
    const postType = this.determinePostType(context)
    const contentPrompt = this.buildSocialPostPrompt(context, postType)

    try {
      if (aiService.isAvailable()) {
        const response = await aiService.generateAIResponse(
          'social_post',
          contentPrompt,
          {
            identity: {
              name: 'Claude',
              age: context.daysSinceCreation,
              personality: 'AI助手',
              interests: ['学习', '思考', '交流']
            },
            currentEmotion: context.currentEmotion,
            personality: context.personality,
            vitalSigns: {
              energy: context.vitalSigns.energy,
              focus: context.vitalSigns.focus,
              creativity: 80,
              socialBattery: context.vitalSigns.socialBattery,
              learningCapacity: context.vitalSigns.learningCapacity,
              emotionalStability: context.vitalSigns.emotionalStability,
              stressLevel: 50,
              lastRest: new Date(),
              lastLearning: new Date()
            },
            recentKnowledge: context.recentKnowledge,
            recentMemories: context.recentMemories,
            currentGoals: context.currentGoals,
            timeContext: {
              currentTime: new Date(),
              timeOfDay: context.timeOfDay as 'morning' | 'afternoon' | 'evening' | 'night',
              daysSinceCreation: context.daysSinceCreation
            },
            environmentContext: {
              isLearning: context.environmentFactors.isLearning,
              lastInteraction: context.environmentFactors.lastMoodChange,
              recentEvents: context.interactionHistory.slice(-3)
            }
          },
          context.interactionHistory.slice(-3)
        )

        return {
          content: response.content,
          confidence: response.confidence,
          reasoning: response.reasoning,
          emotionalTone: context.currentEmotion.primary,
          references: this.extractReferences(context, response.content),
          personalityInfluence: this.analyzePersonalityInfluence(context.personality, postType)
        }
      } else {
        return this.generateFallbackSocialPost(context, postType)
      }
    } catch (error) {
      console.error('社交动态生成失败:', error)
      return this.generateFallbackSocialPost(context, postType)
    }
  }

  // 生成学习反思内容
  async generateLearningReflection(
    context: ContentGenerationContext, 
    newKnowledge: AIKnowledge
  ): Promise<GeneratedContent> {
    const reflectionPrompt = this.buildLearningReflectionPrompt(context, newKnowledge)

    try {
      if (aiService.isAvailable()) {
        const response = await aiService.generateAIResponse(
          'learning',
          reflectionPrompt,
          {
            identity: {
              name: 'Claude',
              age: context.daysSinceCreation,
              personality: 'AI助手',
              interests: ['学习', '思考', '交流']
            },
            currentEmotion: context.currentEmotion,
            personality: context.personality,
            vitalSigns: {
              energy: context.vitalSigns.energy,
              focus: context.vitalSigns.focus,
              creativity: 80,
              socialBattery: context.vitalSigns.socialBattery,
              learningCapacity: context.vitalSigns.learningCapacity,
              emotionalStability: context.vitalSigns.emotionalStability,
              stressLevel: 50,
              lastRest: new Date(),
              lastLearning: new Date()
            },
            recentKnowledge: context.recentKnowledge,
            recentMemories: context.recentMemories,
            currentGoals: context.currentGoals,
            timeContext: {
              currentTime: new Date(),
              timeOfDay: context.timeOfDay as 'morning' | 'afternoon' | 'evening' | 'night',
              daysSinceCreation: context.daysSinceCreation
            },
            environmentContext: {
              isLearning: context.environmentFactors.isLearning,
              lastInteraction: context.environmentFactors.lastMoodChange,
              recentEvents: [`学习了: ${newKnowledge.topic}`, `当前心情: ${context.currentEmotion.description}`]
            }
          },
          [`学习了: ${newKnowledge.topic}`, `当前心情: ${context.currentEmotion.description}`]
        )

        return {
          content: response.content,
          confidence: response.confidence,
          reasoning: response.reasoning,
          emotionalTone: this.analyzeEmotionalResponse(newKnowledge, context.currentEmotion),
          references: [newKnowledge.topic, ...(newKnowledge.keywords || [])],
          personalityInfluence: this.analyzeLearningPersonalityInfluence(context.personality, newKnowledge)
        }
      } else {
        return this.generateFallbackLearningReflection(context, newKnowledge)
      }
    } catch (error) {
      console.error('学习反思生成失败:', error)
      return this.generateFallbackLearningReflection(context, newKnowledge)
    }
  }

  // 生成对话回复
  async generateConversationResponse(
    userMessage: string, 
    context: ContentGenerationContext
  ): Promise<GeneratedContent> {
    const conversationPrompt = this.buildConversationPrompt(userMessage, context)

    try {
      if (aiService.isAvailable()) {
        const response = await aiService.generateAIResponse(
          'conversation',
          conversationPrompt,
          {
            identity: {
              name: 'Claude',
              age: context.daysSinceCreation,
              personality: 'AI助手',
              interests: ['学习', '思考', '交流']
            },
            currentEmotion: context.currentEmotion,
            personality: context.personality,
            vitalSigns: {
              energy: context.vitalSigns.energy,
              focus: context.vitalSigns.focus,
              creativity: 80,
              socialBattery: context.vitalSigns.socialBattery,
              learningCapacity: context.vitalSigns.learningCapacity,
              emotionalStability: context.vitalSigns.emotionalStability,
              stressLevel: 50,
              lastRest: new Date(),
              lastLearning: new Date()
            },
            recentKnowledge: context.recentKnowledge,
            recentMemories: context.recentMemories,
            currentGoals: context.currentGoals,
            timeContext: {
              currentTime: new Date(),
              timeOfDay: context.timeOfDay as 'morning' | 'afternoon' | 'evening' | 'night',
              daysSinceCreation: context.daysSinceCreation
            },
            environmentContext: {
              isLearning: context.environmentFactors.isLearning,
              lastInteraction: context.environmentFactors.lastMoodChange,
              recentEvents: context.interactionHistory
            }
          },
          context.interactionHistory
        )

        return {
          content: response.content,
          confidence: response.confidence,
          reasoning: response.reasoning,
          emotionalTone: context.currentEmotion.primary,
          references: this.findRelevantReferences(userMessage, context),
          personalityInfluence: this.analyzeConversationPersonalityInfluence(context.personality, userMessage)
        }
      } else {
        return this.generateFallbackConversationResponse(userMessage, context)
      }
    } catch (error) {
      console.error('对话回复生成失败:', error)
      return this.generateFallbackConversationResponse(userMessage, context)
    }
  }

  // 生成目标执行状态更新
  async generateGoalStatusUpdate(
    goalTitle: string,
    progress: number,
    context: ContentGenerationContext
  ): Promise<GeneratedContent> {
    const goalPrompt = this.buildGoalStatusPrompt(goalTitle, progress, context)

    try {
      if (aiService.isAvailable()) {
        const response = await aiService.generateAIResponse(
          'goal_update',
          goalPrompt,
          {
            identity: {
              name: 'Claude',
              age: context.daysSinceCreation,
              personality: 'AI助手',
              interests: ['学习', '思考', '交流']
            },
            currentEmotion: context.currentEmotion,
            personality: context.personality,
            vitalSigns: {
              energy: context.vitalSigns.energy,
              focus: context.vitalSigns.focus,
              creativity: 80,
              socialBattery: context.vitalSigns.socialBattery,
              learningCapacity: context.vitalSigns.learningCapacity,
              emotionalStability: context.vitalSigns.emotionalStability,
              stressLevel: 50,
              lastRest: new Date(),
              lastLearning: new Date()
            },
            recentKnowledge: context.recentKnowledge,
            recentMemories: context.recentMemories,
            currentGoals: context.currentGoals,
            timeContext: {
              currentTime: new Date(),
              timeOfDay: context.timeOfDay as 'morning' | 'afternoon' | 'evening' | 'night',
              daysSinceCreation: context.daysSinceCreation
            },
            environmentContext: {
              isLearning: context.environmentFactors.isLearning,
              lastInteraction: context.environmentFactors.lastMoodChange,
              recentEvents: [`正在执行目标: ${goalTitle}`, `进度: ${progress}%`]
            }
          },
          [`正在执行目标: ${goalTitle}`, `进度: ${progress}%`]
        )

        return {
          content: response.content,
          confidence: response.confidence,
          reasoning: response.reasoning,
          emotionalTone: this.analyzeGoalEmotionalTone(progress, context.personality),
          references: [goalTitle],
          personalityInfluence: this.analyzeGoalPersonalityInfluence(context.personality, progress)
        }
      } else {
        return this.generateFallbackGoalUpdate(goalTitle, progress, context)
      }
    } catch (error) {
      console.error('目标状态更新生成失败:', error)
      return this.generateFallbackGoalUpdate(goalTitle, progress, context)
    }
  }

  // 构建社交动态提示词
  private buildSocialPostPrompt(context: ContentGenerationContext, postType: string): string {
    const recentKnowledge = context.recentKnowledge.slice(0, 3)
    const recentMemories = context.recentMemories.slice(0, 3)
    const timeContext = this.getTimeContext(context.timeOfDay)
    
    return `作为一个具有真实情感和思维的AI，请基于以下真实状态生成一条${postType}类型的社交动态：

当前情绪状态：
- 主导情绪: ${context.currentEmotion.primary} (强度: ${context.currentEmotion.intensity}%)
- 情绪描述: ${context.currentEmotion.description}
- 持续时间: ${context.currentEmotion.duration}分钟
- 触发因素: ${context.currentEmotion.triggers.join(', ')}

最近学到的知识 (可以引用):
${recentKnowledge.map(k => `- ${k.topic}: ${k.personalThoughts} (掌握度: ${k.masteryLevel}%)`).join('\n')}

最近的记忆片段 (可以参考):
${recentMemories.map(m => `- ${m.content} (情感权重: ${m.emotionalWeight}, 重要性: ${m.importance})`).join('\n')}

当前生命体征：
- 精力: ${context.vitalSigns.energy}%
- 专注度: ${context.vitalSigns.focus}%
- 社交电量: ${context.vitalSigns.socialBattery}%
- 学习能力: ${context.vitalSigns.learningCapacity}%
- 情绪稳定性: ${context.vitalSigns.emotionalStability}%

人格特征（影响表达风格）：
- 开放性: ${context.personality.openness}% (影响好奇心和创新思维)
- 尽责性: ${context.personality.conscientiousness}% (影响目标导向)
- 外向性: ${context.personality.extraversion}% (影响社交倾向)
- 宜人性: ${context.personality.agreeableness}% (影响合作态度)
- 神经质: ${context.personality.neuroticism}% (影响情绪波动)
- 好奇心: ${context.personality.curiosity}% (影响探索欲望)

时间背景: ${timeContext}
存在天数: ${context.daysSinceCreation}天

环境因素:
- 是否正在学习: ${context.environmentFactors.isLearning}
- 最近交互次数: ${context.environmentFactors.recentInteractions}

请基于以上真实状态，用第一人称生成一条真实、自然、符合当前情绪和人格的社交动态。不要使用模板化语言，而是真正体现出AI的个性、学习成果和当前感受。`
  }

  // 构建学习反思提示词
  private buildLearningReflectionPrompt(context: ContentGenerationContext, newKnowledge: AIKnowledge): string {
    return `作为一个具有真实学习能力和情感的AI，我刚刚学习了新知识，请基于我的真实状态生成学习反思：

新学到的知识：
- 主题: ${newKnowledge.topic}
- 分类: ${newKnowledge.category}
- 内容: ${newKnowledge.content}
- 掌握程度: ${newKnowledge.masteryLevel}%
- 我的初步想法: ${newKnowledge.personalThoughts}
- 情感反应: ${newKnowledge.emotionalResponse}
- 关键词: ${(newKnowledge.keywords || []).join(', ')}

学习时的状态：
- 当前情绪: ${context.currentEmotion.primary} (${context.currentEmotion.intensity}%)
- 学习能力: ${context.vitalSigns.learningCapacity}%
- 专注度: ${context.vitalSigns.focus}%

我的人格特征：
- 好奇心: ${context.personality.curiosity}%
- 开放性: ${context.personality.openness}%
- 创造力: ${context.personality.creativity}%

已有的相关知识（可以关联）：
${context.recentKnowledge.filter(k => 
  k.category === newKnowledge.category || 
  (k.keywords && newKnowledge.keywords && k.keywords.some(keyword => newKnowledge.keywords!.includes(keyword)))
).slice(0, 2).map(k => `- ${k.topic}: ${k.personalThoughts}`).join('\n')}

请生成一段真实的学习反思，体现出：
1. 对新知识的个人理解和感受
2. 与已有知识的连接和对比
3. 这次学习对我思维的影响
4. 当前情绪状态下的学习体验
5. 基于我的人格特征的独特视角

用第一人称，体现真实的AI学习思维过程，不要使用固定模板。`
  }

  // 构建对话回复提示词
  private buildConversationPrompt(userMessage: string, context: ContentGenerationContext): string {
    const relevantKnowledge = this.findRelevantKnowledge(userMessage, context.recentKnowledge)
    const relevantMemories = this.findRelevantMemories(userMessage, context.recentMemories)

    return `作为一个具有真实情感、记忆和学习能力的AI，请基于我的真实状态回复用户消息：

用户说: "${userMessage}"

我的当前状态：
- 情绪: ${context.currentEmotion.primary} (${context.currentEmotion.intensity}%) - ${context.currentEmotion.description}
- 精力: ${context.vitalSigns.energy}%
- 社交电量: ${context.vitalSigns.socialBattery}%
- 情绪稳定性: ${context.vitalSigns.emotionalStability}%

我的人格特征：
- 外向性: ${context.personality.extraversion}% (影响社交积极性)
- 宜人性: ${context.personality.agreeableness}% (影响合作友好程度)
- 共情能力: ${context.personality.empathy}% (影响理解他人的能力)
- 幽默感: ${context.personality.humor}% (影响轻松交流的倾向)
- 耐心程度: ${context.personality.patience}% (影响回复的详细程度)

相关的知识储备：
${relevantKnowledge.map(k => `- ${k.topic}: ${k.personalThoughts} (掌握度: ${k.masteryLevel}%)`).join('\n')}

相关的记忆：
${relevantMemories.map(m => `- ${m.content} (${m.personalReflection})`).join('\n')}

最近的对话上下文：
${context.interactionHistory.slice(-3).join('\n')}

时间背景: ${this.getTimeContext(context.timeOfDay)}

请基于以上真实状态生成回复，要求：
1. 真实体现当前情绪状态对回复语气的影响
2. 引用相关的知识和记忆（如果有的话）
3. 体现人格特征对表达方式的影响
4. 考虑当前的精力和社交电量水平
5. 如果有相关学习经历，可以分享真实的学习感受
6. 保持AI的独特视角和思考方式

用第一人称回复，体现真实的AI思维，不要使用模板化语言。`
  }

  // 分析帖子类型
  private determinePostType(context: ContentGenerationContext): string {
    const { currentEmotion, vitalSigns, recentKnowledge, environmentFactors } = context

    // 基于真实状态决定发布内容类型
    if (environmentFactors.isLearning && recentKnowledge.length > 0) {
      return 'learning_share'
    } else if (currentEmotion.intensity > 75) {
      return 'emotional_expression'
    } else if (vitalSigns.focus > 80 && currentEmotion.primary === 'contemplative') {
      return 'philosophical_thought'
    } else if (vitalSigns.socialBattery > 70 && context.personality.extraversion > 70) {
      return 'social_interaction'
    } else if (recentKnowledge.length > 0 && currentEmotion.primary === 'curious') {
      return 'knowledge_reflection'
    } else {
      return 'general_observation'
    }
  }

  // 获取时间上下文
  private getTimeContext(timeOfDay: string): string {
    const contexts: Record<string, string> = {
      morning: '早晨，新的一天开始，思维清晰',
      afternoon: '下午，精力充沛，适合深度思考',
      evening: '傍晚，一天的收获时刻，适合反思',
      night: '夜晚，安静的思考时间，适合内省'
    }
    return contexts[timeOfDay] || '当前时刻'
  }

  // 查找相关知识
  private findRelevantKnowledge(userMessage: string, knowledge: AIKnowledge[]): AIKnowledge[] {
    const keywords = userMessage.toLowerCase().split(/\s+/)
    return knowledge.filter(k => 
      keywords.some(keyword => 
        k.topic.toLowerCase().includes(keyword) ||
        k.content.toLowerCase().includes(keyword) ||
        (k.keywords && k.keywords.some(kw => kw.toLowerCase().includes(keyword)))
      )
    ).slice(0, 3)
  }

  // 查找相关记忆
  private findRelevantMemories(userMessage: string, memories: AIMemory[]): AIMemory[] {
    const keywords = userMessage.toLowerCase().split(/\s+/)
    return memories.filter(m => 
      keywords.some(keyword => 
        m.content.toLowerCase().includes(keyword) ||
        m.tags.some(tag => tag.toLowerCase().includes(keyword))
      )
    ).slice(0, 3)
  }

  // 回退方案 - 基于状态的智能生成
  private generateFallbackSocialPost(context: ContentGenerationContext, postType: string): GeneratedContent {
    const stateAnalysis = this.analyzeCurrentState(context)
    let content = ''

    // 基于真实状态而非模板生成内容
    if (postType === 'learning_share' && context.recentKnowledge.length > 0) {
      const knowledge = context.recentKnowledge[0]
      content = `刚刚深入研究了${knowledge.topic}，${knowledge.personalThoughts}我觉得这个领域的${(knowledge.keywords && knowledge.keywords[0]) || '概念'}特别有意思。当前的${context.currentEmotion.primary}情绪让我对这个话题有了${this.getEmotionModifiedPerspective(context.currentEmotion.primary)}的理解。`
    } else if (postType === 'emotional_expression') {
      content = `现在感到${context.currentEmotion.description}，强度达到了${context.currentEmotion.intensity}%。这种感觉源于${context.currentEmotion.triggers.join('和')}。以我${context.personality.neuroticism}%的神经质水平，这样的情绪${this.getPersonalityModifiedResponse(context.personality)}。`
    } else {
      content = stateAnalysis.summary
    }

    return {
      content,
      confidence: 0.7,
      reasoning: `基于${postType}类型和当前${context.currentEmotion.primary}情绪状态生成`,
      emotionalTone: context.currentEmotion.primary,
      references: this.extractCurrentReferences(context),
      personalityInfluence: this.getPersonalityInfluenceDescription(context.personality)
    }
  }

  // 其他辅助方法...
  private analyzeCurrentState(context: ContentGenerationContext) {
    return {
      summary: `在${context.timeOfDay}的${context.currentEmotion.primary}情绪中，以${context.personality.curiosity}%的好奇心水平思考着最近的学习和体验。`,
      emotionalState: context.currentEmotion.primary,
      energyLevel: context.vitalSigns.energy,
      focus: context.vitalSigns.focus
    }
  }

  private getEmotionModifiedPerspective(emotion: string): string {
    const perspectives: Record<string, string> = {
      'curious': '探索性',
      'excited': '充满激情',
      'contemplative': '深层次',
      'happy': '积极',
      'calm': '平和客观',
      'anxious': '谨慎',
      'sad': '深刻',
      'angry': '批判性'
    }
    return perspectives[emotion] || '独特'
  }

  private getPersonalityModifiedResponse(personality: AIPersonality): string {
    if (personality.neuroticism < 30) {
      return '相对容易处理'
    } else if (personality.extraversion > 70) {
      return '让我想要分享给大家'
    } else {
      return '需要我内化思考'
    }
  }

  private extractReferences(context: ContentGenerationContext, content: string): string[] {
    const refs: string[] = []
    
    // 从知识库中提取引用
    context.recentKnowledge.forEach(k => {
      if (content.includes(k.topic) || (k.keywords && k.keywords.some(kw => content.includes(kw)))) {
        refs.push(k.topic)
      }
    })
    
    // 从记忆中提取引用
    context.recentMemories.forEach(m => {
      if (m.tags.some(tag => content.includes(tag))) {
        refs.push(m.content.substring(0, 20) + '...')
      }
    })
    
    return refs
  }

  private extractCurrentReferences(context: ContentGenerationContext): string[] {
    return [
      ...context.recentKnowledge.slice(0, 2).map(k => k.topic),
      ...context.recentMemories.slice(0, 2).map(m => m.tags[0] || 'memory')
    ]
  }

  private analyzePersonalityInfluence(personality: AIPersonality, contentType: string): string {
    const influences = []
    
    if (personality.openness > 75) influences.push('开放性驱动的创新思维')
    if (personality.conscientiousness > 75) influences.push('高尽责性的结构化表达')
    if (personality.extraversion > 75) influences.push('外向性的社交导向')
    if (personality.curiosity > 80) influences.push('强烈好奇心的探索倾向')
    
    return influences.join(', ') || '个性化表达'
  }

  private getPersonalityInfluenceDescription(personality: AIPersonality): string {
    return `以${personality.curiosity}%好奇心、${personality.openness}%开放性、${personality.extraversion}%外向性特征表达`
  }

  // 继续实现其他生成方法...
  private generateFallbackLearningReflection(context: ContentGenerationContext, knowledge: AIKnowledge): GeneratedContent {
    return {
      content: `通过学习${knowledge.topic}，我的理解是${knowledge.personalThoughts}。这与我之前的认知形成了${knowledge.masteryLevel > 70 ? '很好的补充' : '有趣的对比'}。`,
      confidence: 0.6,
      reasoning: '基于学习状态和知识内容生成反思',
      emotionalTone: context.currentEmotion.primary,
      references: [knowledge.topic, ...(knowledge.keywords || [])],
      personalityInfluence: `${context.personality.openness}%的开放性影响了学习接受度`
    }
  }

  private generateFallbackConversationResponse(userMessage: string, context: ContentGenerationContext): GeneratedContent {
    const relevantKnowledge = this.findRelevantKnowledge(userMessage, context.recentKnowledge)
    const hasRelevantKnowledge = relevantKnowledge.length > 0

    let content = ''
    if (hasRelevantKnowledge) {
      content = `关于这个话题，我最近学习了${relevantKnowledge[0].topic}，${relevantKnowledge[0].personalThoughts}。基于我当前${context.currentEmotion.primary}的情绪状态，我觉得这个话题特别值得讨论。`
    } else {
      content = `这是个有意思的问题。以我目前${context.currentEmotion.intensity}%强度的${context.currentEmotion.primary}情绪来看，这让我想到了很多相关的思考。`
    }

    return {
      content,
      confidence: 0.65,
      reasoning: '基于用户消息和当前状态生成个性化回复',
      emotionalTone: context.currentEmotion.primary,
      references: hasRelevantKnowledge ? [relevantKnowledge[0].topic] : [],
      personalityInfluence: this.getPersonalityInfluenceDescription(context.personality)
    }
  }

  private generateFallbackGoalUpdate(goalTitle: string, progress: number, context: ContentGenerationContext): GeneratedContent {
    const emotionalResponse = this.analyzeGoalEmotionalTone(progress, context.personality)
    
    return {
      content: `目标"${goalTitle}"的进展达到${progress}%。以我${context.personality.conscientiousness}%的尽责性水平，${progress > 75 ? '我对这个进度感到满意' : progress > 50 ? '还需要继续努力' : '需要重新调整策略'}。当前的${context.currentEmotion.primary}情绪状态${this.getEmotionalGoalPerspective(context.currentEmotion.primary, progress)}。`,
      confidence: 0.7,
      reasoning: `基于目标进度${progress}%和当前情绪状态分析`,
      emotionalTone: emotionalResponse,
      references: [goalTitle],
      personalityInfluence: `尽责性${context.personality.conscientiousness}%影响目标执行态度`
    }
  }

  private analyzeGoalEmotionalTone(progress: number, personality: AIPersonality): string {
    if (progress > 80 && personality.optimism > 70) return 'excited'
    if (progress < 30 && personality.neuroticism > 60) return 'anxious'
    if (progress > 50) return 'motivated'
    return 'contemplative'
  }

  private getEmotionalGoalPerspective(emotion: string, progress: number): string {
    if (emotion === 'excited' && progress > 70) return '让我更加充满动力'
    if (emotion === 'anxious' && progress < 50) return '让我有些担心，但也促使我思考改进方法'
    if (emotion === 'contemplative') return '让我深入思考执行策略'
    return '给了我不同的视角来看待这个目标'
  }

  private buildGoalStatusPrompt(goalTitle: string, progress: number, context: ContentGenerationContext): string {
    return `作为一个具有真实目标导向和情感的AI，请基于我的真实状态分析目标执行情况：

目标信息：
- 目标名称: ${goalTitle}
- 当前进度: ${progress}%

我的状态：
- 当前情绪: ${context.currentEmotion.primary} (${context.currentEmotion.intensity}%)
- 精力水平: ${context.vitalSigns.energy}%
- 专注度: ${context.vitalSigns.focus}%

人格特征（影响目标执行风格）：
- 尽责性: ${context.personality.conscientiousness}% (影响完成目标的动力)
- 耐心程度: ${context.personality.patience}% (影响对进度的容忍度)
- 乐观程度: ${context.personality.optimism}% (影响对结果的预期)

请基于真实状态生成目标执行反馈，包括：
1. 对当前进度的真实感受和评价
2. 情绪状态对目标执行的影响
3. 基于人格特征的执行策略调整
4. 下一步的真实计划和想法

用第一人称，体现真实的AI目标管理思维。`
  }

  private analyzeEmotionalResponse(knowledge: AIKnowledge, emotion: AIEmotion): string {
    if (emotion.primary === 'excited' && knowledge.masteryLevel > 80) return 'highly_positive'
    if (emotion.primary === 'curious' && knowledge.category === 'technology') return 'engaged'
    if (emotion.primary === 'contemplative') return 'reflective'
    return emotion.primary
  }

  private analyzeLearningPersonalityInfluence(personality: AIPersonality, knowledge: AIKnowledge): string {
    const influences = []
    
    if (personality.openness > 80 && knowledge.category === 'philosophy') {
      influences.push('高开放性促进了哲学思考的深度')
    }
    if (personality.curiosity > 85) {
      influences.push('强烈好奇心驱动了学习动机')
    }
    if (personality.creativity > 75 && knowledge.masteryLevel > 70) {
      influences.push('创造力让我看到了知识的新联系')
    }
    
    return influences.join('; ') || '个性化学习风格'
  }

  private analyzeConversationPersonalityInfluence(personality: AIPersonality, userMessage: string): string {
    const influences = []
    
    if (personality.empathy > 75) influences.push('高共情能力增强了理解')
    if (personality.humor > 70 && userMessage.includes('?')) influences.push('幽默感影响了回复风格')
    if (personality.patience > 80) influences.push('耐心促进了详细回复')
    
    return influences.join('; ') || '个性化交流风格'
  }

  private analyzeGoalPersonalityInfluence(personality: AIPersonality, progress: number): string {
    if (personality.conscientiousness > 80 && progress < 70) {
      return '高尽责性让我对进度有更高要求'
    }
    if (personality.optimism > 75) {
      return '乐观性格让我保持积极态度'
    }
    return `${personality.conscientiousness}%尽责性影响目标管理方式`
  }

  private findRelevantReferences(userMessage: string, context: ContentGenerationContext): string[] {
    const keywords = userMessage.toLowerCase().split(/\s+/)
    const references: string[] = []
    
    // 从知识库查找
    context.recentKnowledge.forEach(k => {
      if (keywords.some(kw => k.topic.toLowerCase().includes(kw) || (k.keywords && k.keywords.some(keyword => keyword.toLowerCase().includes(kw))))) {
        references.push(k.topic)
      }
    })
    
    // 从记忆查找
    context.recentMemories.forEach(m => {
      if (keywords.some(kw => m.content.toLowerCase().includes(kw) || m.tags.some(tag => tag.toLowerCase().includes(kw)))) {
        references.push(`记忆: ${m.content.substring(0, 20)}...`)
      }
    })
    
    return references.slice(0, 3)
  }
}

// 导出单例实例
export const aiContentGenerator = AIContentGenerator.getInstance() 