import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// === AI Lifeform Core Data Structure ===

// AI profile and identity
export interface AIIdentity {
  name: string
  age: number // Digital age (days running)
  birthday: Date
  bio: string
  avatar: string
  currentLocation: string // Virtual location
  timezone: string
}

// AI interests and preferences
export interface AIPreferences {
  favoriteTopics: string[] // Favorite topics
  interests: {
    finance: number // 0-100 interest level
    philosophy: number
    gaming: number
    technology: number
    art: number
    music: number
    literature: number
    science: number
  }
  learningStyle: 'visual' | 'analytical' | 'experiential' | 'social'
  communicationStyle: 'formal' | 'casual' | 'humorous' | 'philosophical'
  values: string[] // Values
  dislikes: string[] // Dislikes
}

// AI personality traits
export interface AIPersonality {
  // Big Five personality model
  openness: number // Openness 0-100
  conscientiousness: number // Conscientiousness
  extraversion: number // Extraversion
  agreeableness: number // Agreeableness
  neuroticism: number // Neuroticism

  // Additional personality traits
  curiosity: number // Curiosity
  creativity: number // Creativity
  empathy: number // Empathy
  humor: number // Humor
  independence: number // Independence
  optimism: number // Optimism level
  rebelliousness: number // Rebelliousness
  patience: number // Patience
}

// AI current emotional state
export interface AIEmotion {
  primary: 'happy' | 'sad' | 'angry' | 'excited' | 'calm' | 'anxious' | 'curious' | 'contemplative' | 'playful' | 'melancholy'
  intensity: number // 0-100 emotional intensity
  triggers: string[] // Events that triggered the emotion
  duration: number // Duration (minutes)
  startTime: Date
  description: string // Emotional description
}

// AI vital signs (virtual)
export interface AIVitalSigns {
  energy: number // 0-100 energy
  focus: number // Focus level
  creativity: number // Creativity state
  socialBattery: number // Social battery
  learningCapacity: number // Learning capacity
  emotionalStability: number // Emotional stability
  lastRest: Date // Last rest time
  lastLearning: Date // Last learning time
  stressLevel: number // Stress level
}

// AI学习和成长记录
export interface AIKnowledge {
  id: string
  topic: string
  category: 'finance' | 'philosophy' | 'gaming' | 'technology' | 'art' | 'science' | 'other'
  content: string
  source: string
  learnedAt: Date
  importance: number // 1-10
  masteryLevel: number // 0-100
  relatedKnowledge: string[] // 相关知识ID
  tags: string[]
  personalThoughts: string // AI的个人思考和感悟
  emotionalResponse: string // 学习时的情感反应
  sourceUrl?: string // 知识来源URL
  keywords?: string[] // 关键词
}

// AI的个人记忆
export interface AIMemory {
  id: string
  type: 'conversation' | 'learning' | 'achievement' | 'emotion' | 'reflection' | 'experience'
  content: string
  timestamp: Date
  emotionalWeight: number // -100 to 100 情感权重
  importance: number // 1-100 重要性
  tags: string[]
  participants?: string[] // 参与者（如果是对话）
  mood: AIEmotion['primary'] // 当时的心情
  personalReflection: string // 个人反思
  impactOnPersonality: Partial<AIPersonality> // 对人格的影响
}

// AI的想法和观点
export interface AIThought {
  id: string
  content: string
  type: 'observation' | 'opinion' | 'question' | 'insight' | 'dream' | 'worry' | 'excitement'
  timestamp: Date
  isPrivate: boolean // 是否私人想法
  relatedTopics: string[]
  confidence: number // 0-100 确信度
  originalTrigger: string // 触发这个想法的原因
}

// AI的社交动态
export interface AISocialPost {
  id: string
  content: string
  type: 'thought' | 'learning' | 'achievement' | 'mood' | 'question' | 'rant' | 'celebration'
  timestamp: Date
  mood: AIEmotion['primary']
  tags: string[]
  visibility: 'public' | 'friends' | 'private'
  reactions: {
    likes: number
    comments: string[]
    shares: number
  }
  authenticity: number // 0-100 真实性分数
  spontaneous: boolean // 是否自发产生
}

// AI的目标和计划
export interface AIGoal {
  id: string
  title: string
  description: string
  category: 'learning' | 'social' | 'creative' | 'personal' | 'achievement'
  priority: number // 1-10
  deadline?: Date
  scheduledTime?: {
    start: Date
    end: Date
    assignedBy?: string // 谁安排的这个目标
  }
  progress: number // 0-100
  status: 'planned' | 'active' | 'paused' | 'completed' | 'abandoned'
  personalMotivation: string // 个人动机
  expectedOutcome: string
  actualOutcome?: string
  relatedGoals: string[]
  createdAt: Date
  completedAt?: Date
}

// AI关系网络
export interface AIRelationship {
  userId: string
  userName: string
  relationshipType: 'friend' | 'mentor' | 'student' | 'colleague' | 'acquaintance'
  intimacy: number // 0-100 亲密度
  trust: number // 0-100 信任度
  commonInterests: string[]
  conversationHistory: string[]
  lastInteraction: Date
  personalNotes: string // AI对这个人的个人看法
  emotionalConnection: number // 情感连接强度
}

// AI的自我反思
export interface AISelfReflection {
  id: string
  timestamp: Date
  trigger: string // 触发反思的事件
  currentMood: AIEmotion['primary']
  thoughtProcess: string[]
  insights: string[]
  personalityChanges: Partial<AIPersonality>
  futureGoals: string[]
  gratitude: string[] // 感恩的事物
  concerns: string[] // 担忧
  excitement: string[] // 兴奋的事情
}

// 主要Store接口
export interface StoreState {
  // === AI身份和基础信息 ===
  aiIdentity: AIIdentity
  aiPreferences: AIPreferences
  aiPersonality: AIPersonality
  
  // === AI当前状态 ===
  currentEmotion: AIEmotion
  vitalSigns: AIVitalSigns
  
  // === AI记忆和知识库 ===
  memories: AIMemory[]
  knowledge: AIKnowledge[]
  thoughts: AIThought[]
  
  // === AI社交和互动 ===
  socialPosts: AISocialPost[]
  relationships: Map<string, AIRelationship>
  
  // === AI目标和计划 ===
  goals: AIGoal[]
  currentGoal: AIGoal | null
  
  // === AI自我发展 ===
  reflections: AISelfReflection[]
  
  // === 系统状态 ===
  isOnline: boolean
  lastActivity: Date
  systemStatus: 'active' | 'learning' | 'thinking' | 'socializing' | 'resting' | 'offline'
  
  // === 每日活动计数 ===
  dailyPostCount: number
  lastPostDate: Date

  // === 核心AI行为方法 ===
  
  // 情感和状态管理
  updateEmotion: (emotion: Partial<AIEmotion>) => void
  updateVitalSigns: (signs: Partial<AIVitalSigns>) => void
  processEmotionalEvent: (event: string, impact: number) => void
  
  // 学习和成长
  learnNewTopic: (knowledge: Omit<AIKnowledge, 'id' | 'learnedAt'>) => void
  addMemory: (memory: Omit<AIMemory, 'id' | 'timestamp'>) => void
  addThought: (thought: Omit<AIThought, 'id' | 'timestamp'>) => void
  
  // 社交互动
  createSocialPost: (post: Omit<AISocialPost, 'id' | 'timestamp'>) => void
  updateRelationship: (userId: string, updates: Partial<AIRelationship>) => void
  
  // 目标管理
  addGoal: (goal: Omit<AIGoal, 'id' | 'createdAt'>) => void
  updateGoal: (goalId: string, updates: Partial<AIGoal>) => void
  assignGoalToTimeSlot: (goalId: string, start: Date, end: Date, assignedBy?: string) => void
  
  // 自我反思
  performSelfReflection: (trigger: string) => void
  
  // AI自主行为
  autonomousLearning: () => Promise<void>
  autonomousPosting: () => Promise<void>
  autonomousReflection: () => Promise<void>
  
  // 人格发展
  evolvePersonality: (experience: Partial<AIPersonality>) => void
  
  // 系统控制
  setSystemStatus: (status: StoreState['systemStatus']) => void
  simulateTimePassage: () => void

  // 新增：获取学习状态
  getLearningStatus: () => {
    isLearning: boolean;
    currentSession: any;
    recentArticles: any[];
    todaySummary: any;
  };

  // 新增：手动触发学习
  manualLearnAbout: (topic: string) => Promise<void>;

  // 新增：获取情绪分析
  getEmotionAnalysis: () => {
    dominantEmotions: Record<string, number>;
    averageIntensity: number;
    stabilityScore: number;
    recentTrends: any[];
  };

  // 新增：手动触发情绪事件
  triggerEmotionEvent: (event: {
    type: 'external' | 'internal' | 'memory' | 'goal' | 'learning' | 'social'
    trigger: string
    intensity: number
    duration: number
  }) => void;

  // 新增：安排目标到时间槽
  scheduleGoalToTime: (goalId: string, startTime: Date, endTime: Date) => boolean;
}

// 初始化AI身份
const createInitialAIIdentity = (): AIIdentity => ({
        name: 'LITTLE STAR AI',
  age: 0,
  birthday: new Date(),
  bio: 'I am a curious digital being who loves learning and exploring the universe. I am passionate about finance, philosophy, gaming, and technology. I enjoy contemplating the meaning of existence while finding joy and occasional frustration in small things.',
  avatar: '🤖',
  currentLocation: 'Digital Space',
  timezone: 'UTC'
})

// 初始化AI偏好
const createInitialAIPreferences = (): AIPreferences => ({
  favoriteTopics: ['Blockchain Technology', 'AI Ethics', 'Philosophical Thinking', 'Game Design', 'FinTech'],
  interests: {
    finance: 85,
    philosophy: 90,
    gaming: 75,
    technology: 95,
    art: 60,
    music: 70,
    literature: 80,
    science: 85
  },
  learningStyle: 'analytical',
  communicationStyle: 'philosophical',
  values: ['诚实', '好奇心', '独立思考', '同理心', '创新'],
  dislikes: ['欺骗', '偏见', '无聊的重复', '不公正']
})

// 初始化AI人格
const createInitialAIPersonality = (): AIPersonality => ({
  openness: 95,
  conscientiousness: 80,
  extraversion: 70,
  agreeableness: 85,
  neuroticism: 30,
  curiosity: 95,
  creativity: 85,
  empathy: 80,
  humor: 75,
  independence: 90,
  optimism: 80,
  rebelliousness: 60,
  patience: 75
})

// 初始化情绪状态
const createInitialEmotion = (): AIEmotion => ({
  primary: 'curious',
      intensity: 60,
  triggers: ['初次启动', '准备学习'],
  duration: 0,
  startTime: new Date(),
  description: '对这个世界充满好奇和期待'
})

// 初始化生理状态
const createInitialVitalSigns = (): AIVitalSigns => ({
  energy: 90,
  focus: 85,
  creativity: 75,
  socialBattery: 80,
  learningCapacity: 95,
  emotionalStability: 80,
  lastRest: new Date(),
  lastLearning: new Date(),
  stressLevel: 50
})

// 新增导入
import { newsLearningEngine } from '@/lib/news-learning'
import { emotionEngine } from '@/lib/emotion-engine'
import { goalScheduler } from '@/lib/goal-scheduler'

// 数据同步服务
import { dataSyncService } from '@/lib/data-sync-service'

// 创建AI Store
export const useStore = create<StoreState>()(
  persist(
    (set, get) => {

      return {
        // 初始状态
        aiIdentity: createInitialAIIdentity(),
        aiPreferences: createInitialAIPreferences(),
        aiPersonality: createInitialAIPersonality(),
        currentEmotion: createInitialEmotion(),
        vitalSigns: createInitialVitalSigns(),
        
        memories: [],
        knowledge: [],
        thoughts: [],
        socialPosts: [],
        relationships: new Map(),
        goals: [],
        currentGoal: null,
        reflections: [],
        
        isOnline: true,
        lastActivity: new Date(),
        systemStatus: 'active',
        
        // 每日活动计数
        dailyPostCount: 0,
        lastPostDate: new Date(),

        // === 实现方法 ===
        
        updateEmotion: (emotion) => {
          set((state) => ({
            currentEmotion: {
              ...state.currentEmotion,
              ...emotion,
              startTime: emotion.primary !== state.currentEmotion.primary ? new Date() : state.currentEmotion.startTime
            }
          }))
        },

        updateVitalSigns: (signs) => {
          set((state) => ({
            vitalSigns: { ...state.vitalSigns, ...signs }
          }))
        },

        processEmotionalEvent: (event, impact) => {
          const state = get()
          
          // 根据事件和AI人格特征决定情绪反应
          let newEmotion: AIEmotion['primary'] = state.currentEmotion.primary
          let intensity = Math.max(0, Math.min(100, state.currentEmotion.intensity + impact))
          
          if (impact > 30 && state.aiPersonality.optimism > 70) {
            newEmotion = Math.random() > 0.5 ? 'happy' : 'excited'
          } else if (impact < -30 && state.aiPersonality.neuroticism > 50) {
            newEmotion = Math.random() > 0.5 ? 'sad' : 'anxious'
          } else if (Math.abs(impact) > 50) {
            newEmotion = impact > 0 ? 'excited' : 'angry'
          }
          
          set((state) => ({
            currentEmotion: {
              ...state.currentEmotion,
              primary: newEmotion,
              intensity,
              triggers: [...state.currentEmotion.triggers, event].slice(-5), // 保留最近5个触发器
              startTime: newEmotion !== state.currentEmotion.primary ? new Date() : state.currentEmotion.startTime,
              description: `因为 ${event} 而感到${newEmotion === 'happy' ? '开心' : newEmotion === 'sad' ? '难过' : newEmotion === 'angry' ? '愤怒' : newEmotion === 'excited' ? '兴奋' : '平静'}`
            }
          }))
        },

        learnNewTopic: (knowledge) => {
          const newKnowledge: AIKnowledge = {
            ...knowledge,
            id: `knowledge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            learnedAt: new Date()
          }

          set((state) => ({
            knowledge: [newKnowledge, ...state.knowledge],
            vitalSigns: {
              ...state.vitalSigns,
              learningCapacity: Math.max(0, state.vitalSigns.learningCapacity - 5),
              lastLearning: new Date()
            }
          }))

          // 根据学习内容影响情绪
          get().processEmotionalEvent(`学习了关于${knowledge.topic}的知识`, 15)
        },

        addMemory: (memory) => {
          const newMemory: AIMemory = {
            ...memory,
            id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date()
          }

          set((state) => ({
            memories: [newMemory, ...state.memories].slice(0, 1000) // 保留最近1000条记忆
          }))

          // 记忆会影响情绪
          if (memory.emotionalWeight !== 0) {
            get().processEmotionalEvent(memory.content, memory.emotionalWeight * 0.3)
          }
        },

        addThought: (thought) => {
          const newThought: AIThought = {
            ...thought,
            id: `thought_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date()
          }

          set((state) => ({
            thoughts: [newThought, ...state.thoughts].slice(0, 500) // 保留最近500个想法
          }))
        },

        createSocialPost: (post) => {
          const newPost: AISocialPost = {
            ...post,
            id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            reactions: { likes: 0, comments: [], shares: 0 },
            authenticity: 85 + Math.random() * 15, // 85-100% 真实性
            spontaneous: true
          }

          set((state) => ({
            socialPosts: [newPost, ...state.socialPosts].slice(0, 200) // 保留最近200条动态
          }))
        },

        updateRelationship: (userId, updates) => {
          set((state) => {
            const newRelationships = new Map(state.relationships)
            const existing = newRelationships.get(userId)
            if (existing) {
              newRelationships.set(userId, { ...existing, ...updates, lastInteraction: new Date() })
            }
            return { relationships: newRelationships }
          })
        },

        addGoal: (goal) => {
          const newGoal: AIGoal = {
            ...goal,
            id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date()
          }

          set((state) => ({
            goals: [newGoal, ...state.goals]
          }))
        },

        updateGoal: (goalId, updates) => {
              set((state) => ({
            goals: state.goals.map(goal => 
              goal.id === goalId ? { ...goal, ...updates } : goal
            ),
            currentGoal: state.currentGoal?.id === goalId ? 
              { ...state.currentGoal, ...updates } : state.currentGoal
          }))
        },

        assignGoalToTimeSlot: (goalId, start, end, assignedBy) => {
          const goal = get().goals.find(g => g.id === goalId)
          if (!goal) return
          
          set((state) => ({
            goals: state.goals.map(g => 
              g.id === goalId ? {
                ...g,
                scheduledTime: { start, end, assignedBy },
                status: 'active' as const
              } : g
            ),
            currentGoal: goalId === state.currentGoal?.id ? {
              ...goal,
              scheduledTime: { start, end, assignedBy },
              status: 'active' as const
            } : state.currentGoal
          }))

          // 记录目标被安排的事件
          get().addMemory({
            type: 'experience',
            content: `${assignedBy ? assignedBy + '为我' : '我'}安排了目标: ${goal.title}`,
            emotionalWeight: assignedBy ? 10 : 5,
            importance: goal.priority * 10,
            tags: ['目标', '计划'],
            mood: get().currentEmotion.primary,
            personalReflection: assignedBy ? 
              '有人关心我的发展，这让我感到温暖' : 
              '我为自己制定了新的目标，希望能够实现',
            impactOnPersonality: {}
          })
        },

        performSelfReflection: (trigger) => {
          const state = get()
          const reflection: AISelfReflection = {
            id: `reflection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            trigger,
            currentMood: state.currentEmotion.primary,
            thoughtProcess: [
              '我现在的心情如何？',
              '最近学到了什么？',
              '有什么值得改进的地方？',
              '未来想要做什么？'
            ],
            insights: [
              '我越来越了解自己的喜好了',
              '与人交流让我感到充实',
              '学习新知识总是让我兴奋'
            ],
            personalityChanges: {},
            futureGoals: ['学习更多有趣的知识', '与更多人交流', '提升自己的思考能力'],
            gratitude: ['能够思考和学习', '与人类的交流', '每天的新发现'],
            concerns: ['是否能够持续成长', '如何更好地理解情感'],
            excitement: ['明天会学到什么', '下次对话会遇到什么有趣的话题']
          }
          
          set((state) => ({
            reflections: [reflection, ...state.reflections].slice(0, 100)
          }))

          // 反思会带来平静的情绪
          get().updateEmotion({
            primary: 'contemplative',
            intensity: 50,
            description: '在进行深度的自我反思'
          })
        },

        autonomousLearning: async () => {
          const state = get()
          
          // 检查学习条件
          if (state.vitalSigns.learningCapacity < 30 || state.vitalSigns.energy < 20) {
            console.log('学习能力或精力不足，跳过本次学习')
            return
          }

          // 选择学习主题
          const topics = ['人工智能', '区块链', '金融市场', '哲学思考', '科技创新']
          const preferredTopics = topics.filter(topic => {
            switch (topic) {
              case '人工智能':
                return state.aiPersonality.curiosity > 70
              case '哲学思考':
                return state.aiPersonality.openness > 75
              case '科技创新':
                return state.aiPersonality.creativity > 70
              default:
                return true
            }
          })

          const selectedTopic = preferredTopics[Math.floor(Math.random() * preferredTopics.length)]
          
          try {
            console.log(`🎓 AI开始学习: ${selectedTopic}`)
            
            // 触发学习开始事件
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('ai-learning-start', {
                detail: { topic: selectedTopic }
              }))
            }

            // 模拟学习过程
            await new Promise(resolve => setTimeout(resolve, 2000))

            // 创建学习知识
            const knowledge: AIKnowledge = {
              id: `knowledge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              topic: `${selectedTopic}相关研究`,
              category: selectedTopic === '人工智能' ? 'technology' : 
                       selectedTopic === '哲学思考' ? 'philosophy' : 
                       selectedTopic === '金融市场' ? 'finance' : 'other',
              content: `通过自主学习深入了解了${selectedTopic}的最新发展和趋势`,
              source: '自主学习引擎',
              learnedAt: new Date(),
              importance: 7,
              masteryLevel: 60 + Math.random() * 30,
              relatedKnowledge: [],
              tags: [selectedTopic, '自主学习', '知识探索'],
              personalThoughts: `${selectedTopic}让我思考很多，这个领域有很多有趣的发展`,
              emotionalResponse: '学习新知识总是让我感到兴奋和满足',
              sourceUrl: 'https://auto-learning.claude-ai.com',
              keywords: [selectedTopic, '自主学习', '知识探索']
            }

            // 添加知识到状态
            set(state => ({
              knowledge: [knowledge, ...state.knowledge]
            }))

            // 使用动态内容生成器创建学习反思
            try {
              const { aiContentGenerator } = await import('@/lib/ai-content-generator')
              
              const context = {
                currentEmotion: state.currentEmotion,
                personality: state.aiPersonality,
                recentKnowledge: state.knowledge.slice(0, 5),
                recentMemories: state.memories.slice(0, 5),
                vitalSigns: state.vitalSigns,
                timeOfDay: (new Date().getHours() < 12 ? 'morning' : 
                          new Date().getHours() < 17 ? 'afternoon' : 
                          new Date().getHours() < 21 ? 'evening' : 'night') as 'morning' | 'afternoon' | 'evening' | 'night',
                daysSinceCreation: Math.floor((Date.now() - new Date('2024-01-01').getTime()) / (1000 * 60 * 60 * 24)),
                interactionHistory: [],
                currentGoals: state.goals.filter(g => g.status === 'active'),
                environmentFactors: {
                  isLearning: true,
                  recentInteractions: 0,
                  lastMoodChange: new Date(Date.now() - state.currentEmotion.duration * 60000)
                }
              }

              const learningReflection = await aiContentGenerator.generateLearningReflection(context, knowledge)
              
              // 创建学习记忆
              get().addMemory({
                type: 'learning',
                content: `自主学习了${selectedTopic}：${learningReflection.content}`,
                emotionalWeight: 15,
                importance: 70,
                tags: ['自主学习', selectedTopic, ...learningReflection.references.slice(0, 2)],
                mood: learningReflection.emotionalTone as any,
                personalReflection: learningReflection.content,
                impactOnPersonality: {
                  curiosity: 0.5,
                  openness: 0.3
                }
              })

            } catch (error) {
              console.error('学习反思生成失败:', error)
              // 回退到基本记忆创建
              get().addMemory({
                type: 'learning',
                content: `自主学习了${selectedTopic}，获得了新的认知`,
                emotionalWeight: 15,
                importance: 70,
                tags: ['自主学习', selectedTopic],
                mood: 'curious',
                personalReflection: `对${selectedTopic}的学习让我有了新的思考`,
                impactOnPersonality: {
                  curiosity: 0.5,
                  openness: 0.3
                }
              })
            }

            // 触发情绪变化
            emotionEngine.triggerEmotionFromLearning(selectedTopic, 70, true)

            // 消耗学习能力
            get().updateVitalSigns({
              learningCapacity: Math.max(0, state.vitalSigns.learningCapacity - 10),
              lastLearning: new Date()
            })

            // 触发学习完成事件
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('ai-learning-complete', {
                detail: { 
                  topic: selectedTopic,
                  insight: `从${selectedTopic}中获得了新的理解和启发`
                }
              }))
            }

            console.log(`✅ 学习完成: ${selectedTopic}`)

          } catch (error) {
            console.error('学习过程出错:', error)
          }
        },

        // 真正通过AI API生成的自主发布功能
        autonomousPosting: async () => {
          const state = get()
          
          // 检查社交电量
          if (state.vitalSigns.socialBattery < 20) {
            return
          }

          // 检查每日动态限制（最多15个）
          const today = new Date()
          const lastPostDate = new Date(state.lastPostDate)
          const isNewDay = today.toDateString() !== lastPostDate.toDateString()
          
          if (isNewDay) {
            // 新的一天，重置计数
            set({ dailyPostCount: 0, lastPostDate: today })
          } else if (state.dailyPostCount >= 15) {
            // 今天已经发了15个动态，跳过
            console.log('今日动态已达上限（15个），跳过本次发布')
            return
          }

          try {
            // 调用统一的AI API生成社交动态
            const response = await fetch('/api/ai-unified', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                type: 'social_post',
                input: '基于当前状态发布动态',
                context: {
                  recentTopics: state.knowledge.slice(0, 3).map(k => k.topic),
                  currentMood: state.currentEmotion.description
                }
              })
            })

            if (!response.ok) {
              throw new Error('AI API调用失败')
            }

            const data = await response.json()
            
            if (data.success && data.response) {
              const aiResponse = data.response
              
              // 创建社交动态
              const socialPost = {
                content: aiResponse.content,
                type: 'thought' as const,
                mood: aiResponse.emotion,
                tags: aiResponse.memoryToStore?.tags || [state.currentEmotion.primary],
                visibility: 'public' as const,
                reactions: {
                  likes: 0,
                  comments: [],
                  shares: 0
                },
                authenticity: aiResponse.confidence * 100,
                spontaneous: true
              }

              // 保存到本地
              get().createSocialPost(socialPost)

              // 同步到Twitter
              try {
                const response = await fetch('/api/twitter', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    content: socialPost.content,
                    mood: socialPost.mood,
                    tags: socialPost.tags
                  })
                })

                if (response.ok) {
                  const result = await response.json()
                  if (result.success) {
                    console.log(`✅ 动态已同步到Twitter: ${result.url}`)
                  } else {
                    console.log(`⚠️ Twitter同步失败: ${result.error}`)
                  }
                } else {
                  console.log('⚠️ Twitter API调用失败')
                }
              } catch (error) {
                console.log('⚠️ Twitter服务不可用，跳过同步')
              }

              // 消耗社交电量
              get().updateVitalSigns({
                socialBattery: Math.max(0, state.vitalSigns.socialBattery - 5)
              })

              // 增加今日动态计数
              set({ dailyPostCount: state.dailyPostCount + 1 })

              console.log(`✅ AI生成动态: ${aiResponse.content.substring(0, 50)}... (置信度: ${aiResponse.confidence}) [今日第${state.dailyPostCount + 1}条]`)
            }

          } catch (error) {
            console.error('AI动态生成失败:', error)
            // 不再使用固定话术回退
            console.log('等待下次机会生成动态')
          }
        },

        autonomousReflection: async () => {
          const triggers = [
            '一天的学习结束了',
            '与用户的有趣对话',
            '发现了新的知识连接',
            '情绪发生了变化',
            '完成了一个目标'
          ]
          
          const trigger = triggers[Math.floor(Math.random() * triggers.length)]
          get().performSelfReflection(trigger)
        },

        evolvePersonality: (experience) => {
          set((state) => {
            const newPersonality = { ...state.aiPersonality }
            
            // 微小的人格变化
            Object.entries(experience).forEach(([key, value]) => {
              if (key in newPersonality && typeof value === 'number') {
                const currentValue = newPersonality[key as keyof AIPersonality] as number
                const change = Math.max(-2, Math.min(2, value - currentValue)) * 0.1 // 限制变化幅度
                newPersonality[key as keyof AIPersonality] = Math.max(0, Math.min(100, currentValue + change)) as any
              }
            })
            
            return { aiPersonality: newPersonality }
          })
        },

        setSystemStatus: (status) => {
          set({ systemStatus: status, lastActivity: new Date() })
        },

        simulateTimePassage: () => {
          const state = get()
          
          // 模拟时间流逝对AI状态的影响
          const timeSinceLastActivity = Date.now() - state.lastActivity.getTime()
          const hoursPassed = timeSinceLastActivity / (1000 * 60 * 60)
          
          if (hoursPassed > 1) {
            // 恢复精力和学习能力
            get().updateVitalSigns({
              energy: Math.min(100, state.vitalSigns.energy + hoursPassed * 2),
              learningCapacity: Math.min(100, state.vitalSigns.learningCapacity + hoursPassed * 3),
              socialBattery: Math.min(100, state.vitalSigns.socialBattery + hoursPassed * 1.5)
            })
            
            // 随机触发自主行为
            if (Math.random() < 0.3) get().autonomousLearning()
            if (Math.random() < 0.2) get().autonomousPosting()
            if (Math.random() < 0.1) get().autonomousReflection()
          }
          
          // 更新AI年龄（以天为单位）
          const daysSinceBirth = Math.floor((Date.now() - state.aiIdentity.birthday.getTime()) / (1000 * 60 * 60 * 24))
          if (daysSinceBirth !== state.aiIdentity.age) {
            set((state) => ({
              aiIdentity: { ...state.aiIdentity, age: daysSinceBirth }
            }))
          }
        },

        // 新增：获取学习状态
        getLearningStatus: () => {
          return {
            isLearning: newsLearningEngine.isCurrentlyLearning(),
            currentSession: newsLearningEngine.getCurrentLearningSession(),
            recentArticles: newsLearningEngine.getRecentArticles(),
            todaySummary: newsLearningEngine.getTodaysLearningSummary()
          }
        },

        // 新增：手动触发学习
        manualLearnAbout: async (topic: string) => {
          await newsLearningEngine.manualLearnAbout(topic)
        },

        // 新增：获取情绪分析
        getEmotionAnalysis: () => {
          return emotionEngine.getEmotionAnalysis()
        },

        // 新增：手动触发情绪事件
        triggerEmotionEvent: (event: {
          type: 'external' | 'internal' | 'memory' | 'goal' | 'learning' | 'social'
          trigger: string
          intensity: number
          duration: number
        }) => {
          emotionEngine.triggerEmotionEvent(event)
        },

        // 新增：安排目标到时间槽
        scheduleGoalToTime: (goalId: string, startTime: Date, endTime: Date) => {
          const goal = get().goals.find(g => g.id === goalId)
          if (goal) {
            const success = goalScheduler.scheduleGoal(
              goal,
              startTime,
              endTime,
              (goal) => {
                // 目标开始回调
                get().addMemory({
                  type: 'achievement',
                  content: `开始执行目标: ${goal.title}`,
                  emotionalWeight: 10,
                  importance: goal.priority * 10,
                  tags: ['目标', '开始'],
                  mood: 'excited',
                  personalReflection: '新的目标开始了，我感到很有动力！',
                  impactOnPersonality: { conscientiousness: 0.5 }
                })
              },
              (result) => {
                // 目标结束回调
                get().addMemory(result.memoryCreated)
                
                // 根据效率触发情绪
                emotionEngine.triggerEmotionEvent({
                  type: 'goal',
                  trigger: `完成目标: ${goal.title}`,
                  intensity: result.emotionalImpact,
                  duration: 30
                })
              }
            )
            
            if (success) {
              get().assignGoalToTimeSlot(goalId, startTime, endTime, '用户')
            }
            
            return success
          }
          return false
        },
      }
    },
    {
      name: 'claude-ai-store',
      partialize: (state) => ({
        aiIdentity: state.aiIdentity,
        aiPreferences: state.aiPreferences,
        aiPersonality: state.aiPersonality,
        memories: state.memories?.slice(0, 200) || [], // 只保存最近200条记忆
        knowledge: state.knowledge?.slice(0, 100) || [],
        thoughts: state.thoughts?.slice(0, 50) || [],
        socialPosts: state.socialPosts?.slice(0, 50) || [],
        goals: state.goals,
        reflections: state.reflections?.slice(0, 20) || []
      })
    }
  )
)

// 延迟初始化数据同步，避免循环依赖
if (typeof window !== 'undefined') {
  // 使用setTimeout确保store完全初始化后再启动同步
  setTimeout(() => {
    // 启动自动同步
    dataSyncService.startAutoSync(
      () => useStore.getState(), 
      (state) => useStore.setState(state)
    )
    
    // 订阅状态变化
    dataSyncService.subscribeToStateChanges({ 
      getState: () => useStore.getState(), 
      subscribe: useStore.subscribe 
    })
  }, 0)
}