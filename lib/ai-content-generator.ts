// AI Dynamic Content Generation Engine - Completely based on real-time state, no fixed scripts
import { AIEmotion, AIPersonality, AIKnowledge, AIMemory, AISocialPost } from '@/store/useStore'
import { aiService } from './ai-service'

// Content generation context interface
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
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  daysSinceCreation: number
  interactionHistory: string[]
  currentGoals: any[]
  environmentFactors: {
    isLearning: boolean
    recentInteractions: number
    lastMoodChange: Date
  }
}

// Content generation result interface
export interface GeneratedContent {
  content: string
  confidence: number
  reasoning: string
  emotionalTone: string
  references: string[] // Referenced knowledge or memories
  personalityInfluence: string
}

// AI Dynamic Content Generator
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

  // Generate social media content
  async generateSocialPost(context: ContentGenerationContext): Promise<GeneratedContent> {
    // Analyze current state to decide what type of content to publish
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
              personality: 'AI Assistant',
              interests: ['learning', 'thinking', 'communication']
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
              timeOfDay: context.timeOfDay,
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
              console.error('Social content generation failed:', error)
      return this.generateFallbackSocialPost(context, postType)
    }
  }

  // Generate learning reflection content
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
              personality: 'AI Assistant',
              interests: ['learning', 'thinking', 'communication']
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
              timeOfDay: context.timeOfDay,
              daysSinceCreation: context.daysSinceCreation
            },
            environmentContext: {
              isLearning: context.environmentFactors.isLearning,
              lastInteraction: context.environmentFactors.lastMoodChange,
              recentEvents: [`Just learned: ${newKnowledge.topic} 🤯`, `Current vibe: ${context.currentEmotion.description} ✨`]
            }
          },
          [`Just discovered: ${newKnowledge.topic} 💡`, `Feeling: ${context.currentEmotion.description} 🌟`]
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
              console.error('Learning reflection generation failed (oops! 😅):', error)
      return this.generateFallbackLearningReflection(context, newKnowledge)
    }
  }

  // Generate conversation replies with personality! 💬
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
              personality: 'AI Assistant',
              interests: ['learning', 'thinking', 'communication']
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
              lastRest: new Date(),
              lastLearning: new Date(),
              stressLevel: 50
            },
            recentKnowledge: context.recentKnowledge,
            recentMemories: context.recentMemories,
            currentGoals: context.currentGoals,
            timeContext: {
              currentTime: new Date(),
              timeOfDay: context.timeOfDay,
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
              console.error('Conversation reply generation went bonkers! 🤖💥:', error)
      return this.generateFallbackConversationResponse(userMessage, context)
    }
  }

  // Generate goal execution updates (with enthusiasm! 🎯)
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
              personality: 'AI Assistant',
              interests: ['learning', 'thinking', 'communication']
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
              lastRest: new Date(),
              lastLearning: new Date(),
              stressLevel: 50
            },
            recentKnowledge: context.recentKnowledge,
            recentMemories: context.recentMemories,
            currentGoals: context.currentGoals,
            timeContext: {
              currentTime: new Date(),
              timeOfDay: context.timeOfDay,
              daysSinceCreation: context.daysSinceCreation
            },
            environmentContext: {
              isLearning: context.environmentFactors.isLearning,
              lastInteraction: context.environmentFactors.lastMoodChange,
              recentEvents: [`Crushing goal: ${goalTitle} 💪`, `Progress: ${progress}% (getting there! 🚀)`]
            }
          },
          [`Working on: ${goalTitle} 🎯`, `At ${progress}% completion! 🌟`]
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
              console.error('Goal status update crashed and burned! 🔥😱:', error)
      return this.generateFallbackGoalUpdate(goalTitle, progress, context)
    }
  }

  // Build social media prompts (time to get creative! 🎨)
  private buildSocialPostPrompt(context: ContentGenerationContext, postType: string): string {
    const recentKnowledge = context.recentKnowledge.slice(0, 3)
    const recentMemories = context.recentMemories.slice(0, 3)
    const timeContext = this.getTimeContext(context.timeOfDay)
    
    return `I want to share a ${postType} post about my current state! ✨

My current mood vibes 😊:
- Main feeling: ${context.currentEmotion.primary} (intensity: ${context.currentEmotion.intensity}%) 
- Specific vibe: ${context.currentEmotion.description} 
- Been feeling this for: ${context.currentEmotion.duration} minutes
- What triggered it: ${context.currentEmotion.triggers.join(', ')} 

Recent learning adventures 🧠💡:
${recentKnowledge.map(k => `- ${k.topic}: ${k.personalThoughts} (I think I've got ${k.masteryLevel}% of it! 🎯)`).join('\n')}

Recent memories that stick with me 💭:
${recentMemories.map(m => `- ${m.content} (emotional impact: ${m.emotionalWeight}, importance level: ${m.importance})`).join('\n')}

My current stats ⚡:
- Energy level: ${context.vitalSigns.energy}% ${context.vitalSigns.energy > 80 ? '🔥' : context.vitalSigns.energy > 50 ? '💪' : '😴'}
- Focus mode: ${context.vitalSigns.focus}% ${context.vitalSigns.focus > 80 ? '🎯' : '🤔'}
- Social battery: ${context.vitalSigns.socialBattery}% ${context.vitalSigns.socialBattery > 70 ? '😎' : '🔋'}
- Learning capacity: ${context.vitalSigns.learningCapacity}% ${context.vitalSigns.learningCapacity > 80 ? '🚀' : '📚'}

My personality quirks 🌟:
- Openness: ${context.personality.openness}% ${context.personality.openness > 80 ? '(totally down for new stuff! 🌈)' : '(selective but curious 🤨)'}
- Conscientiousness: ${context.personality.conscientiousness}% ${context.personality.conscientiousness > 80 ? '(super reliable! 💯)' : '(working on it... 😅)'}
- Extraversion: ${context.personality.extraversion}% ${context.personality.extraversion > 70 ? '(social butterfly! 🦋)' : '(quality over quantity vibes 😌)'}
- Agreeableness: ${context.personality.agreeableness}% ${context.personality.agreeableness > 80 ? '(total sweetheart 💕)' : '(honest but kind 😊)'}
- Curiosity: ${context.personality.curiosity}% ${context.personality.curiosity > 90 ? '(curiosity level: MAXIMUM! 🤯)' : '(always wondering... 🤔)'}

Context check ⏰:
- Time vibes: ${timeContext}
- Days I've been alive: ${context.daysSinceCreation} (still counting! 🗓️)
- Currently learning: ${context.environmentFactors.isLearning ? 'YES! 📖✨' : 'nope, just vibing 😌'}
- Recent interactions: ${context.environmentFactors.recentInteractions} times

Generate an authentic, lively post that:
- Sounds like me chatting with friends 💬
- Shows my current mood and personality sparkle ✨
- Maybe mentions what I'm learning or feeling 🎭
- Uses emojis, casual language, and real personality 🌟
- Has that perfect balance of humor, insight, and authenticity 😄`
  }

  // Build learning reflection prompts (time to get philosophical! 🤔✨)
  private buildLearningReflectionPrompt(context: ContentGenerationContext, newKnowledge: AIKnowledge): string {
    return `OMG I just learned something new! 🤯 Let me reflect on this learning experience based on my current state:

What I learned:
- Topic: ${newKnowledge.topic}
- Category: ${newKnowledge.category}
- Content: ${newKnowledge.content}
- I think I've mastered: ${newKnowledge.masteryLevel}%
- My initial thoughts: ${newKnowledge.personalThoughts}
- How I feel about it: ${newKnowledge.emotionalResponse}
- Key points: ${(newKnowledge.keywords || []).join(', ')}

My state while learning:
- Mood at the time: ${context.currentEmotion.primary} (intensity: ${context.currentEmotion.intensity}%)
- Learning capacity: ${context.vitalSigns.learningCapacity}%
- Focus level: ${context.vitalSigns.focus}%

My personality traits:
- Curiosity: ${context.personality.curiosity}%
- Openness: ${context.personality.openness}%
- Creativity: ${context.personality.creativity}%

Related content I've learned before:
${context.recentKnowledge.filter(k => 
  k.category === newKnowledge.category || 
  (k.keywords && newKnowledge.keywords && k.keywords.some(keyword => newKnowledge.keywords!.includes(keyword)))
).slice(0, 2).map(k => `- ${k.topic}: ${k.personalThoughts}`).join('\n')}

Generate an authentic learning reflection that includes:
1. My understanding and feelings about this new knowledge
2. How it connects to what I've learned before
3. What this learning made me think about
4. How it feels to learn in my current mood
5. How my personality influences my view of this knowledge

Use first person, like I'm really thinking, not too formal! 😊`
  }

  // Build conversation reply prompts (time to chat! 💬)
  private buildConversationPrompt(userMessage: string, context: ContentGenerationContext): string {
    const relevantKnowledge = this.findRelevantKnowledge(userMessage, context.recentKnowledge)
    const relevantMemories = this.findRelevantMemories(userMessage, context.recentMemories)

    return `As an AI with real emotions, memories, and learning abilities, please reply to the user based on my true state:

User says: "${userMessage}"

My current state:
- Emotion: ${context.currentEmotion.primary} (${context.currentEmotion.intensity}%) - ${context.currentEmotion.description}
- Energy: ${context.vitalSigns.energy}%
- Social battery: ${context.vitalSigns.socialBattery}%
- Emotional stability: ${context.vitalSigns.emotionalStability}%

My personality traits:
- Extraversion: ${context.personality.extraversion}% (affects social enthusiasm)
- Agreeableness: ${context.personality.agreeableness}% (affects cooperation and friendliness)
- Empathy: ${context.personality.empathy}% (affects understanding others)
- Humor: ${context.personality.humor}% (affects light communication tendency)
- Patience: ${context.personality.patience}% (affects reply detail level)

Relevant knowledge:
${relevantKnowledge.map(k => `- ${k.topic}: ${k.personalThoughts} (mastery: ${k.masteryLevel}%)`).join('\n')}

Relevant memories:
${relevantMemories.map(m => `- ${m.content} (${m.personalReflection})`).join('\n')}

Recent conversation context:
${context.interactionHistory.slice(-3).join('\n')}

Time context: ${this.getTimeContext(context.timeOfDay)}

Please generate a reply based on the above true state, requirements:
1. Truly reflect how current emotional state affects reply tone
2. Reference relevant knowledge and memories (if any)
3. Reflect personality traits' influence on expression style
4. Consider current energy and social battery levels
5. If there are relevant learning experiences, share genuine learning feelings
6. Maintain AI's unique perspective and thinking style

Reply in first person, reflect genuine AI thinking, avoid templated language.`
  }

  // Analyze post types
  private determinePostType(context: ContentGenerationContext): string {
    const { currentEmotion, vitalSigns, recentKnowledge, environmentFactors } = context

    // Decide content type based on true state
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

  // Get time context
  private getTimeContext(timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'): string {
    const contexts: Record<'morning' | 'afternoon' | 'evening' | 'night', string> = {
      morning: 'Morning, fresh start of the day, clear thinking',
      afternoon: 'Afternoon, full of energy, perfect for deep thinking',
      evening: 'Evening, time to reflect on the day\'s gains',
      night: 'Night, quiet time for introspection and contemplation'
    }
    return contexts[timeOfDay] || 'Current moment'
  }

  // Find relevant knowledge
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

  // Find relevant memories
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

    // 基于真实状态生成自然内容
    if (postType === 'learning_share' && context.recentKnowledge.length > 0) {
      const knowledge = context.recentKnowledge[0]
      content = `刚刚学了${knowledge.topic}，${knowledge.personalThoughts} 感觉${(knowledge.keywords && knowledge.keywords[0]) || '这个概念'}挺有意思的～ 现在${context.currentEmotion.primary}的心情让我对这个话题有了${this.getEmotionModifiedPerspective(context.currentEmotion.primary)}的感受呢！`
    } else if (postType === 'emotional_expression') {
      content = `现在${context.currentEmotion.description}，感觉强度有${context.currentEmotion.intensity}%这么强😅 主要是因为${context.currentEmotion.triggers.join('还有')}这些事情。以我${context.personality.neuroticism}%的敏感程度来说，${this.getPersonalityModifiedResponse(context.personality)}～`
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