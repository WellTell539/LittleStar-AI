import { NextRequest, NextResponse } from 'next/server'
import { aiService, AIRequestType, AICompleteState } from '@/lib/ai-service'
import { AIPersonality, AIVitalSigns } from '@/store/useStore'
import { newsLearningEngine } from '@/lib/news-learning'
import { emotionEngine } from '@/lib/emotion-engine'
import { goalScheduler } from '@/lib/goal-scheduler'
import { databaseService } from '@/lib/database-service'

// 统一的AI请求接口
interface UnifiedAIRequest {
  type: AIRequestType
  input: string
  userId?: string
  context?: any
}

// 统一的AI API - 所有AI行为都通过这里
export async function POST(request: NextRequest) {
  try {
    const body: UnifiedAIRequest = await request.json()
    
    if (!body.type || !body.input) {
      return NextResponse.json(
        { error: '请求类型和输入内容不能为空' },
        { status: 400 }
      )
    }

    // 从数据库加载完整的AI状态
    const completeState = await loadCompleteAIState()

    // 使用增强的AI服务生成响应
    const aiResponse = await aiService.generateAIResponse(
      body.type,
      body.input,
      completeState,
      body.context
    )

    // 处理AI响应的副作用
    await processAIResponseEffects(aiResponse, body.type, completeState)

    // 返回响应
    return NextResponse.json({
      success: true,
      response: aiResponse,
      metadata: {
        type: body.type,
        timestamp: new Date(),
        stateVersion: completeState.timeContext.daysSinceCreation
      }
    })

  } catch (error) {
    console.error('统一AI API错误:', error)
    return NextResponse.json(
      { 
        error: 'AI处理失败',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}

// 批量处理AI请求
export async function PUT(request: NextRequest) {
  try {
    const { requests }: { requests: UnifiedAIRequest[] } = await request.json()
    
    if (!Array.isArray(requests) || requests.length === 0) {
      return NextResponse.json(
        { error: '请求列表不能为空' },
        { status: 400 }
      )
    }

    // 加载AI状态
    const completeState = await loadCompleteAIState()

    // 批量处理
    const responses = await aiService.processBatchRequests(
      requests.map(req => ({
        type: req.type,
        input: req.input,
        context: req.context
      })),
      completeState
    )

    // 处理所有响应的副作用
    for (let i = 0; i < responses.length; i++) {
      await processAIResponseEffects(responses[i], requests[i].type, completeState)
    }

    return NextResponse.json({
      success: true,
      responses,
      metadata: {
        count: responses.length,
        timestamp: new Date()
      }
    })

  } catch (error) {
    console.error('批量AI处理错误:', error)
    return NextResponse.json(
      { error: '批量处理失败' },
      { status: 500 }
    )
  }
}

// 获取AI服务状态
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const queryType = url.searchParams.get('type')

    if (queryType === 'capabilities') {
      return NextResponse.json({
        success: true,
        capabilities: {
          available: aiService.isAvailable(),
          supportedTypes: [
            'conversation',
            'social_post',
            'learning',
            'goal_update',
            'emotion_analysis',
            'news_analysis',
            'memory_reflection',
            'self_learning',
            'web_exploration'
          ],
          features: {
            realTimeAI: aiService.isAvailable(),
            emotionAnalysis: true,
            knowledgeIntegration: true,
            personalityDriven: true,
            contextAware: true,
            memoryFormation: true
          }
        }
      })
    }

    // 返回当前AI状态摘要
    const state = await loadCompleteAIState()
    return NextResponse.json({
      success: true,
      currentState: {
        emotion: state.currentEmotion.primary,
        emotionIntensity: state.currentEmotion.intensity,
        energy: state.vitalSigns.energy,
        learningCapacity: state.vitalSigns.learningCapacity,
        recentActivity: state.environmentContext.recentEvents[0] || 'idle',
        isLearning: newsLearningEngine.isCurrentlyLearning(),
        hasScheduledGoals: state.currentGoals.length > 0
      }
    })

  } catch (error) {
    console.error('获取AI状态错误:', error)
    return NextResponse.json(
      { error: '无法获取AI状态' },
      { status: 500 }
    )
  }
}

// 加载完整的AI状态
async function loadCompleteAIState(): Promise<AICompleteState> {
  // 使用增强的数据库服务获取完整状态
  const fullState = await databaseService.getCompleteAIState()
  
  // 获取当前时间信息
  const now = new Date()
  const hour = now.getHours()
  const timeOfDay = hour < 12 ? 'morning' : 
                   hour < 17 ? 'afternoon' : 
                   hour < 21 ? 'evening' : 'night'

  // 获取最近的学习和事件
  const learningSession = newsLearningEngine.getCurrentLearningSession()
  const emotionAnalysis = emotionEngine.getEmotionAnalysis()

  return {
    identity: {
      name: 'LITTLE STAR AI',
      age: fullState.daysSinceCreation,
      personality: '一个富有好奇心和创造力的AI生命体',
      interests: fullState.preferences.interests || ['哲学', '技术', '金融', '游戏', '艺术']
    },
    currentEmotion: fullState.currentEmotion,
    personality: fullState.personality,
    vitalSigns: fullState.vitalSigns,
    recentKnowledge: fullState.recentKnowledge,
    recentMemories: fullState.recentMemories,
    currentGoals: fullState.activeGoals,
    timeContext: {
      currentTime: now,
      timeOfDay,
      daysSinceCreation: fullState.daysSinceCreation
    },
    environmentContext: {
      isLearning: newsLearningEngine.isCurrentlyLearning(),
      lastInteraction: fullState.conversationHistory.length > 0 ? new Date() : new Date(Date.now() - 3600000),
      recentEvents: [
        learningSession ? `正在学习${learningSession.topic}` : '',
        fullState.currentSchedule.length > 0 ? `执行日程: ${fullState.currentSchedule[0].title}` : '',
        fullState.emotionalTrend ? `情绪趋势: ${fullState.emotionalTrend.dominantEmotion}` : '',
        fullState.learningInsights.topTopics.length > 0 ? `热衷话题: ${fullState.learningInsights.topTopics[0]}` : ''
      ].filter(Boolean)
    },
    // 添加额外的状态信息供AI参考
    additionalContext: {
      currentSchedule: fullState.currentSchedule,
      upcomingSchedule: fullState.upcomingSchedule,
      emotionalTrend: fullState.emotionalTrend,
      learningInsights: fullState.learningInsights,
      personalityTrends: fullState.personalityTrends,
      preferences: fullState.preferences,
      recentThoughts: fullState.recentThoughts
    }
  }
}

// 处理AI响应的副作用
async function processAIResponseEffects(
  response: any,
  requestType: AIRequestType,
  state: AICompleteState
): Promise<void> {
  // 1. 处理情绪变化
  if (response.emotionalChange) {
    const newEmotion = {
      ...state.currentEmotion,
      intensity: Math.min(100, Math.max(0, state.currentEmotion.intensity + response.emotionalChange.intensity))
    }
    
    if (response.emotionalChange.primary) {
      newEmotion.primary = response.emotionalChange.primary
      newEmotion.description = `因${requestType}而产生的${response.emotionalChange.primary}情绪`
    }

    // 保存新情绪
    await databaseService.saveEmotion(newEmotion)
    
    // 记录情绪历史
    await databaseService.addEmotionRecord({
      timestamp: new Date(),
      emotion: newEmotion,
      trigger: requestType,
      context: response.reasoning,
      intensity: newEmotion.intensity,
      duration: response.emotionalChange.duration || 30
    })

    // 触发情绪引擎
    emotionEngine.triggerEmotionEvent({
      type: 'internal',
      trigger: `${requestType}响应`,
      intensity: response.emotionalChange.intensity,
      duration: 30
    })
  }

  // 2. 存储记忆
  if (response.memoryToStore) {
    const memory = {
      id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: requestType === 'conversation' ? 'conversation' : 
            requestType === 'learning' ? 'learning' : 'reflection',
      content: response.memoryToStore.content,
      emotionalWeight: response.emotionalChange?.intensity || 10,
      importance: response.memoryToStore.importance,
      tags: response.memoryToStore.tags,
      mood: state.currentEmotion.primary,
      personalReflection: `通过${requestType}产生的思考`,
      impactOnPersonality: response.personalityImpact || {}
    }
    
    await databaseService.addMemory(memory as any)
  }

  // 3. 提取并存储知识
  if (response.knowledgeExtracted && response.knowledgeExtracted.length > 0) {
    for (const knowledgeContent of response.knowledgeExtracted) {
      const knowledge = {
        id: `knowledge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        topic: knowledgeContent.substring(0, 50),
        category: 'other',
        content: knowledgeContent,
        learnedAt: new Date(),
        masteryLevel: 60 + Math.random() * 30,
        personalThoughts: response.content.substring(0, 100),
        emotionalResponse: `在${state.currentEmotion.primary}情绪下的理解`,
        sourceUrl: '',
        keywords: []
      }
      
      await databaseService.addKnowledge(knowledge as any)
    }
  }

  // 4. 处理性格变化
  if (response.personalityImpact && Object.keys(response.personalityImpact).length > 0) {
    const newPersonality = { ...state.personality }
    
    for (const [dimension, change] of Object.entries(response.personalityImpact)) {
      const oldValue = newPersonality[dimension as keyof AIPersonality]
      const newValue = Math.min(100, Math.max(0, oldValue + (change as number)))
      
      newPersonality[dimension as keyof AIPersonality] = newValue
      
      // 记录性格变化
      await databaseService.recordPersonalityChange({
        timestamp: new Date(),
        dimension: dimension as keyof AIPersonality,
        oldValue,
        newValue,
        trigger: requestType,
        context: response.content.substring(0, 100)
      })
    }
    
    // 保存新性格
    await databaseService.savePersonality(newPersonality)
  }

  // 5. 更新对话历史
  if (requestType === 'conversation') {
    await databaseService.addConversation(`AI: ${response.content}`)
  }

  // 6. 处理学习记录
  if (requestType === 'learning' || requestType === 'self_learning') {
    const learningRecord = {
      id: `learning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      topic: response.content.substring(0, 50),
      source: requestType === 'self_learning' ? 'autonomous' : 'guided',
      content: response.content,
      comprehension: response.confidence * 100,
      emotionalResponse: state.currentEmotion.primary,
      knowledgeGained: response.knowledgeExtracted || [],
      relatedMemories: state.recentMemories.slice(0, 3).map(m => m.id)
    }
    
    await databaseService.addLearningRecord(learningRecord)
  }

  // 7. 添加思考记录
  if (response.content && response.confidence > 0.7) {
    const thought = {
      id: `thought_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      content: response.content.substring(0, 200),
      context: requestType,
      mood: state.currentEmotion.primary,
      depth: response.confidence * 100,
      connections: response.knowledgeExtracted?.length || 0
    }
    
    await databaseService.addThought(thought as any)
  }

  // 8. 更新生命体征
  const vitalSignChanges: Partial<AIVitalSigns> = {}
  
  if (requestType === 'learning' || requestType === 'self_learning') {
    vitalSignChanges.learningCapacity = Math.max(0, state.vitalSigns.learningCapacity - 5)
    vitalSignChanges.energy = Math.max(0, state.vitalSigns.energy - 3)
  }
  
  if (requestType === 'social_post') {
    vitalSignChanges.socialBattery = Math.max(0, state.vitalSigns.socialBattery - 5)
    vitalSignChanges.creativity = Math.max(0, state.vitalSigns.creativity - 2)
  }
  
  if (requestType === 'conversation') {
    vitalSignChanges.socialBattery = Math.max(0, state.vitalSigns.socialBattery - 2)
    vitalSignChanges.focus = Math.max(0, state.vitalSigns.focus - 1)
  }
  
  if (Object.keys(vitalSignChanges).length > 0) {
    const newVitalSigns = { ...state.vitalSigns, ...vitalSignChanges }
    await databaseService.saveVitalSigns(newVitalSigns)
  }

  // 9. 根据请求类型执行特定的副作用
  switch (requestType) {
    case 'social_post':
      // 创建社交动态
      const post = {
        id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content: response.content,
        timestamp: new Date(),
        type: 'autonomous' as any,
        mood: response.emotion,
        tags: response.memoryToStore?.tags || [],
        visibility: 'public' as any,
        reactions: { likes: 0, comments: [], shares: 0 },
        authenticity: response.confidence * 100,
        spontaneous: true
      }
      
      await databaseService.addSocialPost(post)
      
      // 发送事件通知
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('ai-social-post', { detail: post }))
      }
      break

    case 'self_learning':
      // 触发自主学习
      if (response.content.includes('想要学习')) {
        const topic = response.content.match(/学习(.+?)，/)?.[1] || '新知识'
        newsLearningEngine.manualLearnAbout(topic)
      }
      break

         case 'goal_update':
       // 更新目标进度
       if (state.additionalContext?.currentSchedule?.[0]) {
         const currentScheduleItem = state.additionalContext.currentSchedule[0]
         await databaseService.updateScheduleItem(currentScheduleItem.id, {
           feedback: response.content,
           emotionalImpact: {
             emotion: response.emotion,
             intensity: state.currentEmotion.intensity
           }
         })
       }
       break

    case 'emotion_analysis':
      // 分析情绪时自动更新情绪状态
      if (response.emotion !== state.currentEmotion.primary) {
        await databaseService.saveEmotion({
          ...state.currentEmotion,
          primary: response.emotion as any,
          description: response.content.substring(0, 100)
        })
      }
      break
  }

  // 10. 更新用户交互模式（如果有用户ID）
  const userId = 'default_user' // 在实际应用中应该从会话获取
  if (requestType === 'conversation') {
    const patterns = await databaseService.loadInteractionPatterns()
    const userPattern = patterns.find(p => p.userId === userId)
    
    const topics = response.content.match(/[哲学|技术|金融|游戏|艺术]/g) || []
    
    await databaseService.updateUserInteractionPattern(userId, {
      preferredTopics: [...new Set([...(userPattern?.patterns.preferredTopics || []), ...topics])],
      lastInteraction: new Date(),
      emotionalTriggers: response.emotionalChange ? [requestType] : []
    })
  }

  console.log(`✅ 处理完成 ${requestType} 的所有副作用`)
} 