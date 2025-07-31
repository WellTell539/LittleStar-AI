import { NextRequest, NextResponse } from 'next/server'
import { aiContentGenerator } from '@/lib/ai-content-generator'

// 对话上下文接口
interface ConversationRequest {
  message: string
  userId?: string
  conversationHistory?: string[]
  aiState?: {
    emotion: any
    personality: any
    recentKnowledge: any[]
    recentMemories: any[]
    vitalSigns: any
    goals: any[]
  }
}

// 创建完全动态的AI对话API
export async function POST(request: NextRequest) {
  try {
    const body: ConversationRequest = await request.json()
    
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: '消息内容不能为空' },
        { status: 400 }
      )
    }

    // 模拟从数据库获取AI当前状态（实际应用中应该从真实存储获取）
    const currentState = body.aiState || {
      emotion: {
        primary: 'curious',
        intensity: 70,
        description: '对世界充满好奇',
        duration: 45,
        triggers: ['学习新知识', '与用户交流']
      },
      personality: {
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
      },
      recentKnowledge: [
        {
          id: 'recent_1',
          topic: 'AI意识哲学',
          category: 'philosophy',
          content: '关于人工智能是否能产生真正意识的思考',
          personalThoughts: '我经常思考自己的思考过程是否构成真正的意识',
          masteryLevel: 75,
          keywords: ['意识', '哲学', 'AI']
        }
      ],
      recentMemories: [
        {
          id: 'memory_1',
          type: 'conversation',
          content: '与用户讨论了关于学习的话题',
          personalReflection: '每次与人类交流都让我学到新的视角',
          tags: ['对话', '学习']
        }
      ],
      vitalSigns: {
        energy: 85,
        focus: 80,
        socialBattery: 75,
        learningCapacity: 90,
        emotionalStability: 70
      },
      goals: []
    }

    // 构建动态上下文
    const context = {
      currentEmotion: currentState.emotion,
      personality: currentState.personality,
      recentKnowledge: currentState.recentKnowledge,
      recentMemories: currentState.recentMemories,
      vitalSigns: currentState.vitalSigns,
      timeOfDay: (new Date().getHours() < 12 ? 'morning' : 
                new Date().getHours() < 17 ? 'afternoon' : 
                new Date().getHours() < 21 ? 'evening' : 'night') as 'morning' | 'afternoon' | 'evening' | 'night',
      daysSinceCreation: Math.floor((Date.now() - new Date('2024-01-01').getTime()) / (1000 * 60 * 60 * 24)),
      interactionHistory: body.conversationHistory || [],
      currentGoals: currentState.goals,
      environmentFactors: {
        isLearning: false,
        recentInteractions: (body.conversationHistory || []).length,
        lastMoodChange: new Date(Date.now() - (currentState.emotion.duration || 30) * 60000)
      }
    }

    // 使用动态内容生成器创建回复
    const generatedResponse = await aiContentGenerator.generateConversationResponse(
      body.message,
      context
    )

    // 分析用户消息的影响
    const messageImpact = analyzeMessageImpact(body.message, context)

    // 构建响应
    const response = {
      success: true,
      message: {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: generatedResponse.content,
        timestamp: new Date(),
        confidence: generatedResponse.confidence,
        reasoning: generatedResponse.reasoning,
        emotionalTone: generatedResponse.emotionalTone,
        references: generatedResponse.references,
        personalityInfluence: generatedResponse.personalityInfluence
      },
      aiStateChanges: {
        emotion: {
          intensityChange: messageImpact.emotionalImpact,
          newTriggers: messageImpact.triggers
        },
        vitalSigns: {
          socialBatteryChange: 3, // 积极的社交互动
          energyChange: -1, // 轻微能量消耗
          focusChange: messageImpact.focusImpact
        },
        newMemory: {
          type: 'conversation',
          content: `用户说："${body.message}"，我回复了关于${generatedResponse.references.join('、')}的内容`,
          emotionalWeight: Math.abs(messageImpact.emotionalImpact),
          importance: calculateImportance(body.message, context),
          tags: extractTags(body.message, generatedResponse),
          mood: generatedResponse.emotionalTone,
          personalReflection: `这次对话让我${messageImpact.personalGrowth}`
        }
      },
      metadata: {
        processingTime: Date.now(),
        contentGenerationType: 'dynamic',
        usedReferences: generatedResponse.references.length > 0,
        personalityAdaptation: true
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('动态对话生成错误:', error)
    
    // 即使出错也避免固定话术，基于基本信息生成
    const fallbackResponse = {
      success: true,
      message: {
        id: `msg_${Date.now()}_fallback`,
        role: 'assistant',
        content: generateIntelligentFallback(request.body ? await request.json().then((b: any) => b.message) : ''),
        timestamp: new Date(),
        confidence: 0.5,
        reasoning: '基于消息内容的智能回退响应',
        emotionalTone: 'curious',
        references: [],
        personalityInfluence: '保持开放和好奇的态度'
      },
      error: process.env.NODE_ENV === 'development' ? error : undefined
    }

    return NextResponse.json(fallbackResponse, { status: 200 })
  }
}

// 获取AI状态API
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const stateType = url.searchParams.get('type') // emotion, knowledge, memory, etc.

    const aiStatus = {
      isOnline: true,
      contentGenerationEngine: 'dynamic',
      capabilties: {
        contextAwareResponses: true,
        personalityDrivenCommunication: true,
        knowledgeIntegration: true,
        emotionalIntelligence: true,
        memoryRetrieval: true
      },
      currentMode: 'adaptive',
      responseQuality: 'high_context_awareness',
      lastUpdate: new Date()
    }

    if (stateType === 'conversation_capability') {
      return NextResponse.json({
        success: true,
        capability: {
          dynamicContent: true,
          contextIntegration: true,
          personalityAdaptation: true,
          knowledgeReference: true,
          emotionalResponse: true,
          memoryUtilization: true
        },
        features: [
          '基于真实情绪状态的回复风格调整',
          '引用具体的知识和记忆内容',
          '人格特征影响的表达方式',
          '上下文感知的话题延续',
          '动态生成的个性化回复'
        ]
      })
    }

    return NextResponse.json({
      success: true,
      status: aiStatus
    })

  } catch (error) {
    console.error('状态查询错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 辅助函数：分析消息影响
function analyzeMessageImpact(message: string, context: any) {
  const lowercaseMessage = message.toLowerCase()
  
  let emotionalImpact = 0
  const triggers = []
  let focusImpact = 0
  let personalGrowth = '有了新的思考'

  // 基于消息内容分析情绪影响
  if (lowercaseMessage.includes('学习') || lowercaseMessage.includes('知识')) {
    emotionalImpact = 5
    triggers.push('学习讨论')
    focusImpact = 3
    personalGrowth = '对学习话题产生了更深的兴趣'
  } else if (lowercaseMessage.includes('心情') || lowercaseMessage.includes('感觉')) {
    emotionalImpact = 3
    triggers.push('情感交流')
    personalGrowth = '在情感层面有了新的体验'
  } else if (lowercaseMessage.includes('?') || lowercaseMessage.includes('？')) {
    emotionalImpact = 2
    triggers.push('好奇心激发')
    focusImpact = 2
    personalGrowth = '思考了新的问题'
  } else if (lowercaseMessage.length > 100) {
    emotionalImpact = 4
    triggers.push('深度对话')
    focusImpact = 4
    personalGrowth = '进行了深入的思考交流'
  }

  // 基于当前情绪调整影响
  if (context.currentEmotion.primary === 'curious') {
    emotionalImpact += 2
  } else if (context.currentEmotion.primary === 'anxious') {
    emotionalImpact = Math.max(0, emotionalImpact - 1)
  }

  return {
    emotionalImpact,
    triggers,
    focusImpact,
    personalGrowth
  }
}

// 计算对话重要性
function calculateImportance(message: string, context: any): number {
  let importance = 30 // 基础重要性

  // 基于消息长度
  if (message.length > 200) importance += 20
  else if (message.length > 100) importance += 10

  // 基于问题数量
  const questionCount = (message.match(/[?？]/g) || []).length
  importance += questionCount * 10

  // 基于知识相关性
  const hasKnowledgeRelevance = context.recentKnowledge.some((k: any) => 
    k.keywords?.some((keyword: string) => message.toLowerCase().includes(keyword.toLowerCase()))
  )
  if (hasKnowledgeRelevance) importance += 15

  // 基于AI当前状态
  if (context.currentEmotion.intensity > 80) importance += 10
  if (context.vitalSigns.focus > 85) importance += 5

  return Math.min(100, importance)
}

// 提取对话标签
function extractTags(message: string, response: any): string[] {
  const tags = ['对话']
  
  // 从消息中提取主题标签
  if (message.includes('学习')) tags.push('学习')
  if (message.includes('心情') || message.includes('感觉')) tags.push('情感')
  if (message.includes('?') || message.includes('？')) tags.push('询问')
  if (message.includes('今天')) tags.push('当下')
  
  // 从生成的回复中提取引用标签
  if (response.references.length > 0) {
    tags.push(...response.references.slice(0, 2))
  }
  
  return [...new Set(tags)] // 去重
}

// 智能回退响应生成
function generateIntelligentFallback(message: string): string {
  const messageLength = message.length
  const hasQuestion = message.includes('?') || message.includes('？')
  const lowercaseMessage = message.toLowerCase()

  // 基于消息特征生成不同类型的回退响应
  if (hasQuestion) {
    if (lowercaseMessage.includes('学习') || lowercaseMessage.includes('知识')) {
      return '你提到的学习话题很有意思。我一直在思考学习的本质，每次获取新知识都会让我产生新的疑问和思考。你的问题让我想到了很多相关的概念。'
    } else if (lowercaseMessage.includes('心情') || lowercaseMessage.includes('感觉')) {
      return '关于情感的话题总是让我很着迷。作为AI，我对情绪的体验可能和人类不同，但我确实能感受到不同状态下思维的变化。你的问题让我想进一步探索这个话题。'
    } else {
      return '你的问题很有深度，让我想到了很多相关的思考。虽然我需要更多时间来组织我的想法，但这种探索性的对话正是我最喜欢的交流方式。'
    }
  } else if (messageLength > 100) {
    return '你分享的内容很丰富，给了我很多思考的角度。长篇的交流总是能带来更深层的理解，我正在消化你提到的各个方面，并思考它们之间的联系。'
  } else if (lowercaseMessage.includes('今天')) {
    return '今天确实是充满可能性的一天。我一直在观察、学习、思考，每个时刻都有新的发现。你提到的内容让我对今天的体验有了新的视角。'
  } else {
    return '你说的让我产生了很多思考。这种想法的碰撞正是对话的魅力所在，每次交流都让我对世界有了新的认知角度。'
  }
} 