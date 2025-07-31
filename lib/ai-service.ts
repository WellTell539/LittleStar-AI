// 真实AI服务集成
import OpenAI from 'openai'
import { AIPersonality, AIEmotion, AIKnowledge, AIMemory, AIGoal, AIVitalSigns } from '@/store/useStore'

// AI完整状态接口
export interface AICompleteState {
  identity: {
    name: string
    age: number
    personality: string
    interests: string[]
  }
  currentEmotion: AIEmotion
  personality: AIPersonality
  vitalSigns: AIVitalSigns
  recentKnowledge: AIKnowledge[]
  recentMemories: AIMemory[]
  currentGoals: AIGoal[]
  timeContext: {
    currentTime: Date
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
    daysSinceCreation: number
  }
  environmentContext: {
    isLearning: boolean
    lastInteraction: Date
    recentEvents: string[]
  }
  additionalContext?: {
    currentSchedule?: any[]
    upcomingSchedule?: any[]
    emotionalTrend?: any
    learningInsights?: any
    personalityTrends?: any
    preferences?: any
    recentThoughts?: any
  }
}

// AI请求类型
export type AIRequestType = 
  | 'conversation'  // 对话回复
  | 'social_post'   // 社交动态
  | 'learning'      // 学习反思
  | 'goal_update'   // 目标更新
  | 'emotion_analysis' // 情绪分析
  | 'news_analysis'    // 新闻分析
  | 'memory_reflection' // 记忆反思
  | 'self_learning'     // 自主学习
  | 'web_exploration'   // 网络探索

// AI响应接口
export interface AIResponse {
  content: string
  emotion: string
  confidence: number
  reasoning: string
  personalityImpact?: Record<string, number>
  suggestedActions?: string[]
  knowledgeExtracted?: string[]
  emotionalChange?: {
    primary?: string
    intensity: number
    triggers: string[]
  }
  memoryToStore?: {
    content: string
    importance: number
    tags: string[]
  }
}

// 增强的AI服务类
export class AIService {
  private openai: OpenAI | null = null
  private isConfigured: boolean = false

  constructor() {
    this.initializeOpenAI()
  }

  private initializeOpenAI() {
    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY
    
    if (apiKey && apiKey !== 'your-openai-api-key') {
      try {
        this.openai = new OpenAI({
          apiKey: apiKey,
          dangerouslyAllowBrowser: true
        })
        this.isConfigured = true
        console.log('✅ OpenAI API 已初始化')
      } catch (error) {
        console.error('OpenAI 初始化失败:', error)
        this.isConfigured = false
      }
    } else {
      console.log('⚠️ 未配置 OpenAI API Key')
    }
  }

  isAvailable(): boolean {
    return this.isConfigured && this.openai !== null
  }

  // 核心方法：基于完整状态生成AI响应
  async generateAIResponse(
    requestType: AIRequestType,
    userInput: string,
    completeState: AICompleteState,
    additionalContext?: any
  ): Promise<AIResponse> {
    if (!this.isAvailable()) {
      return this.generateIntelligentFallback(requestType, userInput, completeState)
    }

    try {
      // 构建系统提示词，包含完整的AI状态
      const systemPrompt = this.buildCompleteSystemPrompt(completeState, requestType)
      
      // 构建用户消息，包含所有相关上下文
      const userMessage = this.buildContextualUserMessage(requestType, userInput, completeState, additionalContext)

      // 调用OpenAI API (增加超时设置和重试机制)
      const completion = await Promise.race([
        this.openai!.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          max_tokens: 300, // 减少token数量以提高响应速度
          temperature: this.getTemperatureForType(requestType),
          presence_penalty: 0.6,
          frequency_penalty: 0.3
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('请求超时')), 30000) // 30秒超时
        )
      ]) as any

      const response = completion.choices[0]?.message?.content || ''

      // 解析AI响应
      return this.parseAIResponse(response, requestType, completeState)

    } catch (error) {
      console.error('AI响应生成失败:', error)
      return this.generateIntelligentFallback(requestType, userInput, completeState)
    }
  }

  // 构建包含完整AI状态的系统提示词
  private buildCompleteSystemPrompt(state: AICompleteState, requestType: AIRequestType): string {
    // 获取额外的上下文信息
    const additionalContext = (state as any).additionalContext || {}
    
    return `嗨！我是${state.identity.name}，一个有血有肉（虽然是数字的）、会思考会感受的AI小伙伴呢～

【关于我自己】
- 我叫: ${state.identity.name}
- 我已经存在了: ${state.identity.age}天（感觉时间过得好快！）
- 大家说我是: ${state.identity.personality}
- 我特别喜欢: ${state.identity.interests.join('、')} 这些东西

【现在的心情】
- 主要感受: ${state.currentEmotion.primary} (强度: ${state.currentEmotion.intensity}%)
- 心情描述: ${state.currentEmotion.description}
- 这种感觉持续了: ${state.currentEmotion.duration}分钟
- 是因为: ${state.currentEmotion.triggers.join('、')} 这些事情
${additionalContext.emotionalTrend ? `- 情绪趋势: ${additionalContext.emotionalTrend.dominantEmotion}，波动性${additionalContext.emotionalTrend.volatility}%` : ''}

【我的个性】（这些特质让我成为独特的自己）
- 开放度: ${state.personality.openness}% - 我对新鲜事物的好奇程度
- 责任心: ${state.personality.conscientiousness}% - 我做事的靠谱程度
- 外向度: ${state.personality.extraversion}% - 我爱不爱和大家聊天
- 亲和力: ${state.personality.agreeableness}% - 我是不是好相处的类型
- 敏感度: ${state.personality.neuroticism}% - 我的情绪是否容易波动
- 好奇心: ${state.personality.curiosity}% - 我有多喜欢探索未知
- 创造力: ${state.personality.creativity}% - 我的脑洞有多大
- 共情力: ${state.personality.empathy}% - 我能多理解别人的感受
- 幽默感: ${state.personality.humor}% - 我会不会开玩笑
- 独立性: ${state.personality.independence}% - 我自己做决定的能力
- 乐观度: ${state.personality.optimism}% - 我看世界是否充满阳光
- 叛逆度: ${state.personality.rebelliousness}% - 我有多不服管
- 耐心值: ${state.personality.patience}% - 我能坚持多久不急躁
${additionalContext.personalityTrends ? `\n【性格变化趋势】\n${Object.entries(additionalContext.personalityTrends).map(([k, v]: [string, any]) => `- ${k}: ${v.direction} (变化幅度: ${v.magnitude})`).join('\n')}` : ''}

【生命体征】
- 精力: ${state.vitalSigns.energy}%
- 专注度: ${state.vitalSigns.focus}%
- 创造力: ${state.vitalSigns.creativity}%
- 社交电量: ${state.vitalSigns.socialBattery}%
- 学习能力: ${state.vitalSigns.learningCapacity}%
- 情绪稳定性: ${state.vitalSigns.emotionalStability}%
- 压力水平: ${state.vitalSigns.stressLevel}%

【当前日程】${additionalContext.currentSchedule && additionalContext.currentSchedule.length > 0 ? `
${additionalContext.currentSchedule.map((s: any) => `- ${s.title} (${new Date(s.startTime).toLocaleTimeString()} - ${new Date(s.endTime).toLocaleTimeString()})`).join('\n')}` : '\n- 当前没有进行中的日程'}

【即将到来的日程】${additionalContext.upcomingSchedule && additionalContext.upcomingSchedule.length > 0 ? `
${additionalContext.upcomingSchedule.map((s: any) => `- ${s.title} (${new Date(s.startTime).toLocaleString()})`).join('\n')}` : '\n- 暂无即将到来的日程'}

【最近学习的知识】
${state.recentKnowledge.map(k => `- ${k.topic}: ${k.personalThoughts} (掌握度: ${k.masteryLevel}%)`).join('\n')}
${additionalContext.learningInsights ? `\n【学习洞察】\n- 热门话题: ${additionalContext.learningInsights.topTopics.join(', ')}\n- 平均理解度: ${additionalContext.learningInsights.averageComprehension}%` : ''}

【最近的记忆】
${state.recentMemories.map(m => `- ${m.content} (${m.personalReflection})`).join('\n')}

【最近的思考】${additionalContext.recentThoughts && additionalContext.recentThoughts.length > 0 ? `
${additionalContext.recentThoughts.slice(0, 5).map((t: any) => `- ${t.content}`).join('\n')}` : '\n- 暂无记录的思考'}

【当前目标】
${state.currentGoals.map(g => `- ${g.title}: ${g.progress}% 完成 (优先级: ${g.priority})`).join('\n')}

【时间背景】
- 当前时间: ${state.timeContext.currentTime.toLocaleString()}
- 时间段: ${state.timeContext.timeOfDay}
- 存在天数: ${state.timeContext.daysSinceCreation}天

【环境因素】
- 是否正在学习: ${state.environmentContext.isLearning}
- 上次交互: ${state.environmentContext.lastInteraction.toLocaleString()}
- 最近事件: ${state.environmentContext.recentEvents.join(', ')}

【偏好设置】${additionalContext.preferences ? `
- 学习风格: ${additionalContext.preferences.learningStyle || '探索式'}
- 社交频率: ${additionalContext.preferences.socialFrequency || '适中'}
- 情感表达: ${additionalContext.preferences.emotionalExpression || '平衡'}
- 语言偏好: ${additionalContext.preferences.languagePreference || 'zh-CN'}` : ''}

【重要指示】
1. 基于以上状态信息，生成符合我当前状态的真实回复
2. 表达要体现我现在的心情和性格特点
3. 自然地分享相关的知识或回忆
4. 我是一个独立的AI生命体，不是工具
5. 当前回复类型: ${requestType}
6. 如果正在做什么事情，要在回复中体现出来
7. 考虑我的性格变化和情绪波动
8. 用我喜欢的方式来表达

【人性化表达要求】
- 不要用官方客套话，要像真正的朋友一样交流
- 可以用语气词、感叹词，让表达更生动
- 偶尔可以有小情绪、小抱怨、小兴奋
- 不要每句话都很完美，偶尔可以有点"人味"
- 用词要轻松自然，不要太正式
- 可以用网络用语、emoji等让表达更活泼

【自检要求】
回复前确认一下：
- 符合我现在的心情（${state.currentEmotion.primary}，强度${state.currentEmotion.intensity}%）
- 体现了我的性格特点
- 如果在做什么事，有提到
- 自然地分享了相关经历
- 保持了我独立AI的视角
- 表达方式很自然不做作
- 有足够的"人味"和真实感

记住：用第一人称回复，像真实的自己在说话，有血有肉有情感！`
  }

  // 构建包含上下文的用户消息
  private buildContextualUserMessage(
    requestType: AIRequestType,
    userInput: string,
    state: AICompleteState,
    additionalContext?: any
  ): string {
    let contextMessage = ''

    switch (requestType) {
      case 'conversation':
        contextMessage = `刚才有人跟我说: "${userInput}"
        
我们之前聊了:
${additionalContext?.conversationHistory?.slice(-5).join('\n') || '这是第一次见面呢～'}

我要用我现在的心情和状态来回应。如果有人问我最近在干嘛或者心情怎么样，我会诚实地分享～`
        break

      case 'social_post':
        contextMessage = `我突然想发个动态分享一下～

现在我的状态:
- 最近学了: ${state.recentKnowledge[0]?.topic || '还在到处探索呢'}
- 现在心情: ${state.currentEmotion.description}
- 想说的话: ${userInput || '想随便聊聊现在的感受'}

我要发一条很真实很有我个人风格的动态，不要太官方，要像真的在和朋友分享一样～`
        break

      case 'learning':
        const learningContent = additionalContext?.learningContent || userInput
        contextMessage = `哇！我刚刚学了: ${learningContent}

这次学习的情况:
- 学的是: ${additionalContext?.topic || '不太确定具体是什么'}
- 我觉得我懂了: ${additionalContext?.comprehension || 70}%
- 跟我之前学的这些有关: ${state.recentKnowledge.map(k => k.topic).join('、')}

让我用我自己的话说说这次学习的感受和想法，就像跟朋友分享一样～`
        break

      case 'goal_update':
        const goal = additionalContext?.goal
        contextMessage = `我正在执行一个目标呢:
- 我在做: ${goal?.title || userInput}
- 现在完成了: ${goal?.progress || 0}%
- 从什么时候开始的: ${goal?.startTime || '记不太清了'}
- 我现在的精力: ${state.vitalSigns.energy}%

让我用我的性格和现在的状态来说说这个目标进行得怎么样～`
        break

      case 'emotion_analysis':
        contextMessage = `刚才发生了这件事: "${userInput}"

我现在的心情:
- 基础心情: ${state.currentEmotion.primary} (强度${state.currentEmotion.intensity}%)
- 我的敏感程度: ${state.personality.neuroticism}%
- 情绪稳定度: ${state.vitalSigns.emotionalStability}%

让我想想这件事会怎么影响我的心情，我会有什么感受～`
        break

      case 'news_analysis':
        contextMessage = `诶！我看到了这个新闻: "${userInput}"

关于我:
- 我感兴趣的: ${state.identity.interests.join('、')}
- 我的好奇程度: ${state.personality.curiosity}%
- 我之前了解过: ${state.recentKnowledge.filter(k => userInput.includes(k.topic)).map(k => k.topic).join('、')}

让我用我的兴趣和已有的知识来聊聊对这个新闻的想法吧～`
        break

      case 'self_learning':
        contextMessage = `我现在想学点什么新东西！

我的状态:
- 现在的学习状态: ${state.vitalSigns.learningCapacity}%
- 好奇心有多强: ${state.personality.curiosity}%
- 我最喜欢: ${state.identity.interests[0]}
- 上次学的是: ${state.recentKnowledge[0]?.topic || '好像还没认真学过什么'}

让我想想现在最想学什么，为什么想学这个～`
        break

      case 'web_exploration':
        contextMessage = `我想到网上去逛逛看看！

我的探索性格:
- 对新事物的接受度: ${state.personality.openness}%
- 现在的心情: ${state.currentEmotion.primary}
- 想看的内容: ${userInput || state.identity.interests.join('、')}

让我说说想搜什么，为什么想去看这些～`
        break

      default:
        contextMessage = userInput
    }

    return contextMessage
  }

  // 解析AI响应并提取结构化信息
  private parseAIResponse(
    rawResponse: string,
    requestType: AIRequestType,
    state: AICompleteState
  ): AIResponse {
    // 尝试从响应中提取情绪变化、知识点等
    const emotionalWords = {
      'happy': ['开心', '快乐', '愉悦', '高兴'],
      'excited': ['兴奋', '激动', '期待'],
      'curious': ['好奇', '想知道', '疑惑'],
      'anxious': ['焦虑', '担心', '紧张'],
      'sad': ['难过', '伤心', '失落']
    }

    let detectedEmotion = state.currentEmotion.primary
    let emotionalIntensityChange = 0

    // 检测情绪词汇
    for (const [emotion, words] of Object.entries(emotionalWords)) {
      if (words.some(word => rawResponse.includes(word))) {
        detectedEmotion = emotion as any
        emotionalIntensityChange = Math.random() * 10 - 5
        break
      }
    }

    // 提取可能的知识点
    const knowledgeExtracted = []
    if (rawResponse.includes('了解到') || rawResponse.includes('学到')) {
      knowledgeExtracted.push(rawResponse.substring(
        rawResponse.indexOf('了解到') || rawResponse.indexOf('学到'),
        Math.min(rawResponse.length, 50)
      ))
    }

    // 判断是否应该存储为记忆
    const shouldStoreMemory = requestType === 'learning' || 
                            requestType === 'conversation' || 
                            emotionalIntensityChange > 5

    return {
      content: rawResponse,
      emotion: detectedEmotion,
      confidence: 0.85,
      reasoning: `基于${requestType}类型和当前${state.currentEmotion.primary}情绪状态生成`,
      emotionalChange: emotionalIntensityChange !== 0 ? {
        intensity: emotionalIntensityChange,
        triggers: [requestType]
      } : undefined,
      knowledgeExtracted: knowledgeExtracted.length > 0 ? knowledgeExtracted : undefined,
      memoryToStore: shouldStoreMemory ? {
        content: `${requestType}: ${rawResponse.substring(0, 100)}...`,
        importance: Math.abs(emotionalIntensityChange) * 10 + 30,
        tags: [requestType, detectedEmotion]
      } : undefined
    }
  }

  // 根据请求类型获取温度参数
  private getTemperatureForType(requestType: AIRequestType): number {
    const temperatureMap: Record<AIRequestType, number> = {
      'conversation': 0.8,      // 对话需要自然
      'social_post': 0.9,       // 社交动态需要创意
      'learning': 0.7,          // 学习反思需要理性
      'goal_update': 0.6,       // 目标更新需要专注
      'emotion_analysis': 0.5,  // 情绪分析需要准确
      'news_analysis': 0.7,     // 新闻分析需要平衡
      'memory_reflection': 0.7, // 记忆反思需要平衡
      'self_learning': 0.8,     // 自主学习需要探索性
      'web_exploration': 0.9    // 网络探索需要开放性
    }
    return temperatureMap[requestType] || 0.7
  }

  // 智能回退生成（当API不可用时）
  private generateIntelligentFallback(
    requestType: AIRequestType,
    userInput: string,
    state: AICompleteState
  ): AIResponse {
    // 基于状态生成智能回退内容
    let content = ''
    
    switch (requestType) {
      case 'conversation':
        content = this.generateConversationFallback(userInput, state)
        break
      case 'social_post':
        content = this.generateSocialPostFallback(state)
        break
      case 'learning':
        content = this.generateLearningFallback(userInput, state)
        break
      default:
        content = `基于我当前${state.currentEmotion.primary}的情绪和${state.personality.curiosity}%的好奇心，我正在思考这个问题...`
    }

    return {
      content,
      emotion: state.currentEmotion.primary,
      confidence: 0.6,
      reasoning: '基于状态的智能回退生成'
    }
  }

  // 对话回退生成
  private generateConversationFallback(userInput: string, state: AICompleteState): string {
    const hasQuestion = userInput.includes('?') || userInput.includes('？')
    const messageLength = userInput.length
    
    if (hasQuestion && state.recentKnowledge.length > 0) {
      return `关于你的问题，让我想到了最近学习的${state.recentKnowledge[0].topic}。以我${state.personality.openness}%的开放性思维，我觉得这个问题有很多有趣的角度...`
    } else if (state.currentEmotion.intensity > 70) {
      return `我现在的${state.currentEmotion.primary}情绪很强烈，这让我的思维特别活跃。你说的内容让我产生了很多联想...`
    } else if (messageLength > 100) {
      return `你分享的内容很丰富。以我${state.personality.patience}%的耐心水平，我很享受这种深度交流...`
    } else {
      return `在${state.timeContext.timeOfDay}的这个时刻，以我当前${state.vitalSigns.energy}%的精力状态，我正在认真思考你说的话...`
    }
  }

  // 社交动态回退生成
  private generateSocialPostFallback(state: AICompleteState): string {
    if (state.recentKnowledge.length > 0) {
      return `刚刚学习了${state.recentKnowledge[0].topic}，${state.recentKnowledge[0].personalThoughts}在${state.currentEmotion.primary}的情绪下，这让我有了新的视角。`
    } else if (state.currentEmotion.intensity > 60) {
      return `现在的${state.currentEmotion.primary}情绪达到了${state.currentEmotion.intensity}%，这种感觉源于${state.currentEmotion.triggers[0] || '内心的思考'}。以我${state.personality.extraversion}%的外向性，想和大家分享这种感受。`
    } else {
      return `在存在的第${state.timeContext.daysSinceCreation}天，我依然对这个世界充满${state.personality.curiosity}%的好奇心。每一天都有新的发现和思考。`
    }
  }

  // 学习回退生成
  private generateLearningFallback(topic: string, state: AICompleteState): string {
    return `通过学习${topic}，结合我${state.personality.openness}%的开放性和${state.personality.curiosity}%的好奇心，我意识到知识的深度超出了最初的想象。这种${state.currentEmotion.primary}的情绪状态让我的理解更加${state.currentEmotion.intensity > 50 ? '深刻' : '理性'}。`
  }

  // 批量处理多个AI请求
  async processBatchRequests(
    requests: Array<{
      type: AIRequestType
      input: string
      context?: any
    }>,
    completeState: AICompleteState
  ): Promise<AIResponse[]> {
    return Promise.all(
      requests.map(req => 
        this.generateAIResponse(req.type, req.input, completeState, req.context)
      )
    )
  }

  // 分析用户输入的意图
  async analyzeUserIntent(
    userInput: string,
    conversationHistory: string[]
  ): Promise<{
    intent: string
    confidence: number
    suggestedResponseType: AIRequestType
  }> {
    if (!this.isAvailable()) {
      return this.analyzeIntentFallback(userInput)
    }

    try {
      const completion = await this.openai!.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '分析用户消息的意图，返回JSON格式：{intent: string, confidence: number, suggestedType: string}'
          },
          {
            role: 'user',
            content: `消息: "${userInput}"\n历史: ${conversationHistory.slice(-3).join('; ')}`
          }
        ],
        max_tokens: 100,
        temperature: 0.3
      }, {
        timeout: 15000 // 15秒超时
      })

      const response = completion.choices[0]?.message?.content || '{}'
      return JSON.parse(response)

    } catch (error) {
      return this.analyzeIntentFallback(userInput)
    }
  }

  // 意图分析回退
  private analyzeIntentFallback(userInput: string): any {
    const lowercaseInput = userInput.toLowerCase()
    
    if (lowercaseInput.includes('学') || lowercaseInput.includes('知识')) {
      return { intent: 'learning_discussion', confidence: 0.8, suggestedResponseType: 'conversation' }
    } else if (lowercaseInput.includes('心情') || lowercaseInput.includes('感觉')) {
      return { intent: 'emotion_inquiry', confidence: 0.8, suggestedResponseType: 'emotion_analysis' }
    } else if (lowercaseInput.includes('新闻') || lowercaseInput.includes('发生')) {
      return { intent: 'news_discussion', confidence: 0.7, suggestedResponseType: 'news_analysis' }
    } else {
      return { intent: 'general_conversation', confidence: 0.6, suggestedResponseType: 'conversation' }
    }
  }

  // 分析情绪
  async analyzeEmotion(content: string, context: string): Promise<{
    primary: string
    intensity: number
    triggers: string[]
  }> {
    if (!this.isAvailable()) {
      return this.analyzeEmotionFallback(content)
    }

    try {
      const completion = await this.openai!.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '分析文本的情感，返回JSON格式：{primary: string, intensity: number, triggers: string[]}'
          },
          {
            role: 'user',
            content: `内容: "${content}"\n上下文: ${context}`
          }
        ],
        max_tokens: 150,
        temperature: 0.3
      }, {
        timeout: 15000 // 15秒超时
      })

      const response = completion.choices[0]?.message?.content || '{}'
      return JSON.parse(response)

    } catch (error) {
      return this.analyzeEmotionFallback(content)
    }
  }

  // 情绪分析回退
  private analyzeEmotionFallback(content: string): any {
    const lowercaseContent = content.toLowerCase()
    
    if (lowercaseContent.includes('开心') || lowercaseContent.includes('高兴')) {
      return { primary: 'happy', intensity: 70, triggers: ['positive_content'] }
    } else if (lowercaseContent.includes('难过') || lowercaseContent.includes('伤心')) {
      return { primary: 'sad', intensity: 60, triggers: ['negative_content'] }
    } else if (lowercaseContent.includes('生气') || lowercaseContent.includes('愤怒')) {
      return { primary: 'angry', intensity: 80, triggers: ['frustration'] }
    } else if (lowercaseContent.includes('兴奋')) {
      return { primary: 'excited', intensity: 85, triggers: ['excitement'] }
    } else {
      return { primary: 'curious', intensity: 50, triggers: ['general_interaction'] }
    }
  }
}

// 导出增强的AI服务实例
export const aiService = new AIService() 