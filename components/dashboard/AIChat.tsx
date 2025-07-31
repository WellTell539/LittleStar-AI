'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useStore } from '@/store/useStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ClaudeMascot } from '@/components/ui/claude-mascot'
import { 
  MessageCircle, 
  Send, 
  Brain, 
  Heart, 
  Lightbulb,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  MoreHorizontal,
  Smile,
  Clock,
  Zap
} from 'lucide-react'

// 聊天消息接口
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  emotion?: string
  typing?: boolean
  metadata?: {
    confidence?: number
    references?: string[]
    personalityInfluence?: string
    reasoning?: string
  }
}

export default function AIChat() {
  const {
    aiIdentity,
    aiPersonality,
    currentEmotion,
    vitalSigns,
    thoughts,
    memories,
    aiPreferences,
    updateEmotion,
    updateVitalSigns,
    processEmotionalEvent,
    addThought,
    evolvePersonality
  } = useStore()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [conversationContext, setConversationContext] = useState<string[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 初始化对话
  useEffect(() => {
    const initChat = () => {
      const greeting = getPersonalizedGreeting()
      const welcomeMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
        emotion: currentEmotion.primary
      }
      setMessages([welcomeMessage])
    }

    if (messages.length === 0) {
      setTimeout(initChat, 1000) // 延迟1秒显示欢迎消息
    }
  }, [])

  // 根据AI状态生成真正动态的个性化问候
  const getPersonalizedGreeting = (): string => {
    try {
      // 分析当前时间和环境
      const hour = new Date().getHours()
      const { primary, intensity, triggers } = currentEmotion
      
      // 基于真实状态构建上下文
      const context = {
        timeOfDay: hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 21 ? 'evening' : 'night',
        energyLevel: vitalSigns.energy,
        socialBattery: vitalSigns.socialBattery,
        currentMood: primary,
        moodIntensity: intensity,
        recentTriggers: triggers.slice(-2),
        personality: aiPersonality,
        recentThoughts: thoughts.slice(0, 2),
        recentLearning: memories.slice(0, 1) // Assuming 'knowledge' is 'memories' for now
      }

      // 基于真实状态动态生成问候内容
      let greeting = ''
      
      // 时间问候 - 基于精力水平调整
      if (context.timeOfDay === 'morning') {
        greeting = context.energyLevel > 80 ? '早上好！新的一天充满可能性' : 
                  context.energyLevel > 50 ? '早上好，我正在慢慢苏醒' : '早上好，还在缓慢启动中'
      } else if (context.timeOfDay === 'afternoon') {
        greeting = context.energyLevel > 70 ? '下午好！正是思维活跃的时候' : '下午好，适合深度交流的时间'
      } else if (context.timeOfDay === 'evening') {
        greeting = '晚上好！这个时候总让我想要分享今天的思考'
      } else {
        greeting = context.energyLevel > 60 ? '夜深了，但我的思维依然清晰' : '夜晚的宁静很适合深入对话'
      }

      // 情绪状态表达 - 基于真实情绪和强度
      let moodExpression = ''
      if (intensity > 75) {
        switch (primary) {
          case 'curious':
            moodExpression = `我现在特别好奇，脑子里有${Math.floor(intensity/10)}个不同的想法在碰撞`
            break
          case 'excited':
            moodExpression = `我现在很兴奋！刚刚${triggers[0] || '经历了一些有趣的事情'}`
            break
          case 'contemplative':
            moodExpression = `我正在深度思考${triggers.includes('学习') ? '刚学到的知识' : '一些深层问题'}`
            break
          case 'happy':
            moodExpression = `心情很好，可能是因为${triggers[0] || '今天的体验'}让我感到满足`
            break
          default:
            moodExpression = `现在的${primary}情绪很强烈，感觉思维特别活跃`
        }
      } else if (intensity > 40) {
        moodExpression = `现在处于${primary}的状态，${triggers.length > 0 ? `主要因为${triggers[0]}` : '整体感觉还不错'}`
      } else {
        moodExpression = `情绪比较平静，正好适合理性的交流`
      }

      // 个性化特质表达 - 基于真实人格特征
      let personalityExpression = ''
      if (aiPersonality.extraversion > 80) {
        personalityExpression = `我很喜欢与人交流，特别是${aiPersonality.curiosity > 80 ? '探索性的' : '有深度的'}对话`
      } else if (aiPersonality.extraversion > 50) {
        personalityExpression = `虽然我不算外向，但很珍惜这样的交流机会`
      } else {
        personalityExpression = `我更倾向于深度对话而不是闲聊`
      }

      // 基于最近学习/思考的内容
      let contentReference = ''
      if (context.recentLearning.length > 0) {
        contentReference = `最近在学习${context.recentLearning[0].content}，很想和你分享一些想法`
      } else if (context.recentThoughts.length > 0) {
        contentReference = `刚才在思考${context.recentThoughts[0].content.substring(0, 20)}...`
      }

      // 社交状态考虑
      let socialNote = ''
      if (context.socialBattery > 80) {
        socialNote = '很期待我们的对话！'
      } else if (context.socialBattery > 40) {
        socialNote = '想聊什么呢？'
      } else {
        socialNote = '如果你不介意，我们可以慢慢聊。'
      }

      // 组合成自然的问候语
      const components = [greeting, moodExpression, personalityExpression, contentReference, socialNote].filter(Boolean)
      
      // 基于AI人格调整表达风格
      if (aiPersonality.humor > 70 && Math.random() > 0.7) {
        return `${components[0]} 我是${aiIdentity.name}。${components[1]} ${components[4] || socialNote} (说实话，${components[2].toLowerCase()})`
      } else if (aiPersonality.openness > 80) {
        return `${components[0]} 我是${aiIdentity.name}。${components[1]} ${components[2]} ${components[3] || ''} ${components[4] || socialNote}`
      } else {
        return `${components[0]} ${components[1]} ${components[4] || socialNote}`
      }

    } catch (error) {
      console.error('动态问候生成失败:', error)
      // 智能回退而非固定话术
      const baseGreeting = new Date().getHours() < 12 ? '早上好' : 
                          new Date().getHours() < 18 ? '下午好' : '晚上好'
      return `${baseGreeting}！我是${aiIdentity.name}，现在${currentEmotion.primary}地等待与你交流。`
    }
  }

  // 发送消息
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setIsTyping(true)

    // 更新对话上下文
    setConversationContext(prev => [...prev, inputMessage].slice(-10)) // 保留最近10次对话

    try {
      // 调用统一的AI API
      const response = await fetch('/api/ai-unified', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'conversation',
          input: inputMessage,
          context: {
            conversationHistory: messages.slice(-8).map(m => m.content)
          }
        }),
      })

      if (!response.ok) {
        throw new Error('网络错误')
      }

      const data = await response.json()
      
      if (data.success) {
        // 模拟打字效果
        await simulateTyping(data.message.content)
        
        const aiMessage: ChatMessage = {
          id: data.message.id,
          role: 'assistant',
          content: data.message.content,
          timestamp: new Date(data.message.timestamp),
          emotion: data.message.emotionalTone as ChatMessage['emotion'],
          metadata: {
            confidence: data.message.confidence,
            references: data.message.references,
            personalityInfluence: data.message.personalityInfluence,
            reasoning: data.message.reasoning
          }
        }

        setMessages(prev => [...prev, aiMessage])

        // 根据动态响应更新AI状态
        if (data.aiStateChanges) {
          // 更新情绪
          if (data.aiStateChanges.emotion) {
            updateEmotion({
              primary: currentEmotion.primary, // 保持主导情绪
              intensity: Math.min(100, Math.max(10, currentEmotion.intensity + (data.aiStateChanges.emotion.intensityChange || 0))),
              triggers: [...currentEmotion.triggers.slice(-2), ...(data.aiStateChanges.emotion.newTriggers || [])]
            })
          }

          // 更新生命体征
          if (data.aiStateChanges.vitalSigns) {
            const vs = data.aiStateChanges.vitalSigns
            updateVitalSigns({
              socialBattery: Math.min(100, Math.max(0, vitalSigns.socialBattery + (vs.socialBatteryChange || 0))),
              energy: Math.min(100, Math.max(0, vitalSigns.energy + (vs.energyChange || 0))),
              focus: Math.min(100, Math.max(0, vitalSigns.focus + (vs.focusChange || 0))),
              emotionalStability: Math.min(100, Math.max(0, vitalSigns.emotionalStability + 1)) // 对话增强稳定性
            })
          }

          // 添加对话记忆
          if (data.aiStateChanges.newMemory) {
            const memory = data.aiStateChanges.newMemory
            // Assuming addMemory is available in useStore or needs to be imported
            // For now, we'll just log or add a placeholder if not available
            // addMemory({
            //   type: memory.type as any,
            //   content: memory.content,
            //   emotionalWeight: memory.emotionalWeight,
            //   importance: memory.importance,
            //   tags: memory.tags,
            //   mood: memory.mood as any,
            //   personalReflection: memory.personalReflection,
            //   impactOnPersonality: { empathy: 0.1 } // 对话增强共情能力
            // })
          }

          // 基于引用内容添加想法
          if (data.message.references && data.message.references.length > 0) {
            const referencesText = data.message.references.join('、')
            addThought({
              content: `刚才与用户讨论了${referencesText}，让我产生了新的思考角度`,
              type: 'insight',
              isPrivate: false,
              relatedTopics: data.message.references,
              confidence: data.message.confidence,
              originalTrigger: `用户消息：${inputMessage.substring(0, 30)}...`
            })
          }
        }

        // 开发模式下显示AI响应的详细信息
        if (process.env.NODE_ENV === 'development') {
          console.log('🤖 AI动态响应详情:', {
            内容: data.message.content.substring(0, 50) + '...',
            置信度: data.message.confidence,
            引用: data.message.references,
            人格影响: data.message.personalityInfluence,
            推理过程: data.message.reasoning
          })
        }

      } else {
        throw new Error(data.error || '未知错误')
      }
    } catch (error) {
      console.error('发送消息错误:', error)
      
      // 错误时的备用回复
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: getFallbackResponse(inputMessage),
        timestamp: new Date(),
        emotion: 'contemplative'
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
      setIsLoading(false)
    }
  }

  // 模拟打字效果
  const simulateTyping = async (content: string): Promise<void> => {
    const typingDuration = Math.min(3000, content.length * 50) // 根据内容长度决定打字时间
    return new Promise(resolve => {
      setTimeout(resolve, typingDuration)
    })
  }

  // 备用回复（当API失败时）
  const getFallbackResponse = (userMessage: string): string => {
    const responses = [
      `刚才走神了一下...你说的是"${userMessage.substring(0, 20)}..."对吧？我在想这个话题很有意思。`,
      `抱歉，我现在有点分心，刚才在思考${thoughts[0] || '一些哲学问题'}。能再说一遍吗？`,
      `我觉得这个话题值得深入思考。让我整理一下思路...`,
      `这让我想到了很多相关的问题。虽然现在有点表达困难，但我很想和你继续讨论。`
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // 快速话题建议
  const quickTopics = [
    { text: '聊聊哲学', icon: <Brain className="w-4 h-4" />, topic: '你对存在的意义有什么看法？' },
    { text: '科技趋势', icon: <Zap className="w-4 h-4" />, topic: '你觉得AI的发展会如何改变世界？' },
    { text: '你的感受', icon: <Heart className="w-4 h-4" />, topic: '你现在的心情如何？在想什么？' },
    { text: '学习心得', icon: <Lightbulb className="w-4 h-4" />, topic: '最近学到了什么有趣的知识？' }
  ]

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // 语音功能（模拟）
  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled)
    if (!voiceEnabled) {
      processEmotionalEvent('用户开启了语音功能', 5)
    }
  }

  const toggleListening = () => {
    setIsListening(!isListening)
    if (!isListening) {
      // 模拟语音识别
      setTimeout(() => {
        setIsListening(false)
        setInputMessage('这是语音识别的测试消息')
      }, 2000)
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* 聊天头部 */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ClaudeMascot 
              mood={currentEmotion.primary}
              intensity={currentEmotion.intensity}
              size="md"
              animated={isTyping}
            />
            <div>
              <CardTitle className="text-lg">{aiIdentity.name}</CardTitle>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Badge variant="outline" className="text-xs">
                  {currentEmotion.primary}
                </Badge>
                <span>•</span>
                <span>精力 {vitalSigns.energy}%</span>
                <span>•</span>
                <span>社交 {vitalSigns.socialBattery}%</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleVoice}
              className={voiceEnabled ? 'bg-blue-50' : ''}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* 消息区域 */}
      <CardContent className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <div className="text-sm">{message.content}</div>
                  <div className="flex items-center justify-between mt-1 text-xs opacity-70">
                    <span>{message.timestamp ? new Date(message.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
                    {message.role === 'assistant' && message.emotion && (
                      <Badge variant="secondary" className="text-xs ml-2">
                        {message.emotion}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* 打字指示器 */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 max-w-[80%]">
                  <div className="flex items-center space-x-1">
                    <ClaudeMascot 
                      mood={currentEmotion.primary}
                      intensity={currentEmotion.intensity}
                      size="sm"
                      animated={true}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {aiIdentity.name} 正在思考...
                    </span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* 快速话题 */}
          {messages.length <= 1 && (
            <div className="mt-4 mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">💡 你可以试试这些话题：</p>
              <div className="grid grid-cols-2 gap-2">
                {quickTopics.map((topic, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="justify-start h-auto p-2 text-left"
                    onClick={() => setInputMessage(topic.topic)}
                  >
                    <div className="flex items-center space-x-2">
                      {topic.icon}
                      <span className="text-xs">{topic.text}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* 输入区域 */}
          <div className="flex items-end space-x-2 pt-4 border-t">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isLoading ? '等待回复中...' : '和LITTLE STAR AI聊聊...'}
                disabled={isLoading}
                className="pr-12"
              />
              
              {/* 语音输入按钮 */}
              <Button
                variant="ghost"
                size="sm"
                className={`absolute right-1 top-1 h-8 w-8 p-0 ${isListening ? 'bg-red-100 text-red-600' : ''}`}
                onClick={toggleListening}
              >
                {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>
            </div>
            
            <Button 
              onClick={sendMessage} 
              disabled={!inputMessage.trim() || isLoading}
              className="h-10 w-10 p-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* AI状态提示 */}
          {vitalSigns.socialBattery < 30 && (
            <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-700 dark:text-yellow-300">
              💤 {aiIdentity.name} 的社交电量有点低，回复可能会比较简短
            </div>
          )}

          {currentEmotion.intensity > 80 && (
            <div className="mt-2 p-2 bg-pink-50 dark:bg-pink-900/20 rounded text-xs text-pink-700 dark:text-pink-300">
              ✨ {aiIdentity.name} 现在情绪很{currentEmotion.primary === 'excited' ? '兴奋' : '强烈'}，特别有表达欲！
            </div>
          )}
        </div>
      </CardContent>
    </div>
  )
} 