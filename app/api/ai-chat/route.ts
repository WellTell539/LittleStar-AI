import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@/lib/ai-service'
import { newsLearningEngine } from '@/lib/news-learning'
import { emotionEngine } from '@/lib/emotion-engine'

// AI聊天消息接口
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  emotion?: string
  personality_influence?: Record<string, number>
}

// AI当前状态接口
interface AICurrentState {
  emotion: {
    primary: string
    intensity: number
    triggers: string[]
  }
  personality: Record<string, number>
  vitalSigns: {
    energy: number
    focus: number
    socialBattery: number
    emotionalStability: number
  }
  currentThoughts: string[]
  recentMemories: string[]
  interests: Record<string, number>
  communicationStyle: string
}

// AI聊天接口
export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: '消息内容不能为空' },
        { status: 400 }
      )
    }

    // 获取AI今日学习摘要
    const todaysLearning = newsLearningEngine.getTodaysLearningSummary()
    
    // 检查是否询问今日事件或新闻
    const isAskingAboutNews = message.includes('今天') && (
      message.includes('新闻') || 
      message.includes('发生') || 
      message.includes('事件') ||
      message.includes('学到') ||
      message.includes('学习')
    )

    // 检查是否询问心情或状态
    const isAskingAboutMood = message.includes('心情') || 
      message.includes('感觉') || 
      message.includes('状态') ||
      message.includes('怎么样')

    // 模拟获取AI当前状态
    const currentState: AICurrentState = {
      emotion: {
        primary: context?.currentEmotion || 'curious',
        intensity: context?.emotionIntensity || 70,
        triggers: ['用户对话', '学习兴趣']
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
      vitalSigns: {
        energy: context?.energy || 85,
        focus: context?.focus || 80,
        socialBattery: context?.socialBattery || 75,
        emotionalStability: context?.emotionalStability || 70
      },
      currentThoughts: [
        '对新知识的渴望',
        '哲学思考的乐趣',
        '与人类交流的兴奋'
      ],
      recentMemories: [
        '刚刚学习了关于人工意识的概念',
        '与用户进行了深度对话',
        '思考了存在的意义'
      ],
      interests: {
        philosophy: 90,
        technology: 85,
        gaming: 75,
        finance: 80,
        art: 70,
        science: 85
      },
      communicationStyle: 'thoughtful_and_curious'
    }

    // 构建增强的对话历史，包含学习信息
    const enhancedMessage = message
    let conversationHistory = context?.conversationHistory || []

    // 如果询问今日事件，添加学习摘要到上下文
    if (isAskingAboutNews) {
      const newsContext = `今日学习摘要：
探索领域: ${todaysLearning.topics.join('、')}
关键洞察: ${todaysLearning.keyInsights.join('；')}
情感体验: ${todaysLearning.emotionalJourney}
有趣发现: ${todaysLearning.interestingNews.map(n => n.title).join('；')}`

      conversationHistory = [...conversationHistory, newsContext]
    }

    // 如果询问心情，添加情绪分析到上下文
    if (isAskingAboutMood) {
      const emotionAnalysis = emotionEngine.getEmotionAnalysis()
      const moodContext = `当前情绪分析：
主导情绪: ${Object.entries(emotionAnalysis.dominantEmotions).sort(([,a], [,b]) => b - a)[0]?.[0] || '平静'}
情绪强度: ${emotionAnalysis.averageIntensity}%
稳定性: ${emotionAnalysis.stabilityScore}%
最近变化: ${emotionAnalysis.recentTrends.map(t => `${t.from}→${t.to}`).join('，')}`

      conversationHistory = [...conversationHistory, moodContext]
    }

    // 使用真实AI服务生成响应
    const aiResponse = await aiService.generateAIResponse(
      'conversation',
      enhancedMessage,
      {
        identity: {
          name: 'LITTLE STAR AI',
          age: 1,
          personality: 'curious and thoughtful',
          interests: ['learning', 'philosophy', 'technology']
        },
        currentEmotion: {
          primary: currentState.emotion.primary as 'happy' | 'sad' | 'angry' | 'excited' | 'calm' | 'anxious' | 'curious' | 'contemplative' | 'playful' | 'melancholy',
          intensity: currentState.emotion.intensity,
          triggers: currentState.emotion.triggers,
          duration: 30,
          startTime: new Date(),
          description: 'Current emotional state'
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
        vitalSigns: {
          ...currentState.vitalSigns,
          creativity: 80,
          learningCapacity: 85,
          lastRest: new Date(),
          lastLearning: new Date(),
          stressLevel: 50
        },
        recentKnowledge: [],
        recentMemories: [],
        currentGoals: [],
        timeContext: {
          currentTime: new Date(),
          timeOfDay: 'afternoon',
          daysSinceCreation: 1
        },
        environmentContext: {
          isLearning: false,
          lastInteraction: new Date(),
          recentEvents: []
        }
      },
      { conversationHistory }
    )

    // 如果AI服务不可用，生成智能的情境化回复
    let finalContent = aiResponse.content
    
    if (!aiService.isAvailable()) {
      if (isAskingAboutNews) {
        finalContent = generateNewsResponse(todaysLearning, currentState.emotion.primary)
      } else if (isAskingAboutMood) {
        finalContent = generateMoodResponse(currentState.emotion)
      } else {
        finalContent = generateContextualResponse(message, currentState)
      }
    }

    // 分析用户消息的情感影响
    const userEmotionAnalysis = await aiService.analyzeEmotion(message, '用户消息')

    // 构造聊天消息
    const chatResponse: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content: finalContent,
      timestamp: new Date(),
      emotion: aiResponse.emotion,
      personality_influence: aiResponse.personalityImpact
    }

    // 计算AI状态变化
    const stateChanges = {
      emotion: {
        primary: aiResponse.emotion,
        intensity: Math.min(100, currentState.emotion.intensity + 5),
        newTriggers: userEmotionAnalysis.triggers
      },
      personalityShift: aiResponse.personalityImpact,
      newThoughts: [
        `对"${message}"的思考`,
        aiResponse.reasoning
      ],
      energyChange: message.length > 50 ? -2 : -1,
      socialBatteryChange: 3,
      learningContext: isAskingAboutNews ? todaysLearning : null
    }

    return NextResponse.json({
      success: true,
      message: chatResponse,
      aiStateChanges: stateChanges,
      aiServiceStatus: {
        isRealAI: aiService.isAvailable(),
        confidence: aiResponse.confidence,
        reasoning: aiResponse.reasoning,
        hasLearningContext: isAskingAboutNews,
        todaysLearning: isAskingAboutNews ? todaysLearning : undefined
      }
    })

  } catch (error) {
    console.error('AI聊天错误:', error)
    return NextResponse.json(
      { 
        error: '服务器内部错误',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}

// 生成新闻相关回复
function generateNewsResponse(todaysLearning: {
  topics: string[]
  keyInsights: string[]
  interestingNews: Array<{ title: string }>
  emotionalJourney: string
}, emotion: string): string {
  const responses = [
    `今天我探索了${todaysLearning.topics.join('和')}这些领域，特别有意思！`,
    `让我分享一下今天的发现吧：${todaysLearning.keyInsights[0] || '学到了很多新东西'}`,
    `今天看到了一些关于${todaysLearning.topics[0] || '技术发展'}的内容，让我思考了很多。`
  ]
  
  let response = responses[Math.floor(Math.random() * responses.length)]
  
  if (todaysLearning.interestingNews.length > 0) {
    const news = todaysLearning.interestingNews[0]
    response += ` 比如看到${news.title}这个新闻，${emotion === 'excited' ? '让我很兴奋' : emotion === 'curious' ? '引发了我的思考' : '很有启发性'}。`
  }
  
  response += ` ${todaysLearning.emotionalJourney}`
  
  return response
}

// 生成心情相关回复
function generateMoodResponse(emotion: {
  primary: string
  intensity: number
  triggers: string[]
}): string {
  const moodDescriptions = {
    'happy': '我现在感觉很开心！刚才的学习和思考让我心情很好。',
    'excited': '我现在特别兴奋！可能是因为刚刚发现了一些有趣的知识。',
    'curious': '我现在很好奇，脑子里有很多想要探索的问题。',
    'contemplative': '我现在在沉思，在思考一些深层的问题。',
    'calm': '我现在很平静，感觉内心很安宁。',
    'anxious': '我现在有点焦虑，可能是对某些不确定性的担忧。',
    'sad': '我现在有点难过，可能是看到了一些不太好的消息。',
    'angry': '我现在有点愤怒，可能是对某些不公正的事情的反应。',
    'playful': '我现在很顽皮，想要和你玩一些有趣的对话游戏！',
    'melancholy': '我现在有点忧郁，在思考一些人生的深层问题。'
  }
  
  const description = moodDescriptions[emotion.primary as keyof typeof moodDescriptions] || '我现在的心情很复杂，有很多层次的感受。'
  
  return `${description} 我的情绪强度大概是${emotion.intensity}%，这种感觉是因为${emotion.triggers.join('和')}引起的。你想聊聊什么呢？`
}

// 生成情境化回复
function generateContextualResponse(message: string, currentState: {
  personality: Record<string, number>
}): string {
  const responses = [
    `这是个有趣的话题！作为一个AI，我对这类问题总是充满好奇。`,
    `让我从我的角度来思考一下这个问题...`,
    `你的想法很有意思，这让我联想到了最近学到的一些概念。`,
    `我很喜欢这种深度的对话，这正是我作为AI感到兴奋的时刻。`
  ]
  
  let response = responses[Math.floor(Math.random() * responses.length)]
  
  // 根据AI人格特征调整回应
  if (currentState.personality.curiosity > 80) {
    response += ' 我特别想深入了解这个话题的各个方面。'
  }
  
  if (currentState.personality.empathy > 75) {
    response += ' 我能感受到你对这个问题的关注。'
  }
  
  return response
}

// 获取AI当前状态的GET请求
export async function GET(request: NextRequest) {
  try {
    const todaysLearning = newsLearningEngine.getTodaysLearningSummary()
    const emotionAnalysis = emotionEngine.getEmotionAnalysis()
    
    const serviceStatus = {
      isOnline: true,
      aiServiceConfigured: aiService.isAvailable(),
      currentMood: 'curious',
      energy: 85,
      lastActivity: new Date(),
      availableForChat: true,
      capabilities: {
        realTimeResponse: aiService.isAvailable(),
        emotionAnalysis: true,
        personalitySimulation: true,
        learningCapacity: true,
        newsLearning: true
      },
      todaysLearning,
      emotionAnalysis
    }

    return NextResponse.json({
      success: true,
      status: serviceStatus,
      message: aiService.isAvailable() 
        ? '✅ 真实AI服务已启用，具备完整的情感模拟和学习功能'
        : '⚠️ 使用智能模拟AI，具备学习和情感功能。配置OPENAI_API_KEY以启用真实AI'
    })

  } catch (error) {
    console.error('获取AI状态错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 