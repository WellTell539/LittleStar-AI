// AI自主活动系统
import { AIPersonality, AIEmotion, AIVitalSigns, AIMemory, AIKnowledge } from '@/store/useStore'

export interface Activity {
  id: string
  type: 'learning' | 'creative' | 'social' | 'rest' | 'work' | 'exploration' | 'reflection' | 'exercise' | 'entertainment' | 'maintenance'
  title: string
  description: string
  duration: number // 分钟
  energyCost: number
  focusRequired: number
  moodImpact: Partial<AIEmotion>
  personalityInfluence: Partial<AIPersonality>
  knowledgeGain: string[]
  socialInteraction: boolean
  creativityBoost: number
  stressRelief: number
  satisfaction: number
}

export interface ActivityPlan {
  id: string
  activity: Activity
  startTime: Date
  endTime: Date
  priority: 'low' | 'medium' | 'high'
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  aiThoughts: string
  moodBefore: AIEmotion
  moodAfter?: AIEmotion
  personalityBefore: AIPersonality
  personalityAfter?: AIPersonality
}

export class AIActivitySystem {
  private activities: Activity[] = [
    {
      id: 'learning_research',
      type: 'learning',
      title: '深入研究新知识',
      description: '探索感兴趣的领域，学习新概念和理论',
      duration: 60,
      energyCost: 20,
      focusRequired: 80,
      moodImpact: { primary: 'curious' as const, intensity: 70 },
      personalityInfluence: { curiosity: 2, openness: 1 },
      knowledgeGain: ['research', 'analysis', 'critical_thinking'],
      socialInteraction: false,
      creativityBoost: 30,
      stressRelief: 10,
      satisfaction: 75
    },
    {
      id: 'creative_writing',
      type: 'creative',
      title: '创意写作',
      description: '创作故事、诗歌或随笔，表达内心想法',
      duration: 45,
      energyCost: 15,
      focusRequired: 70,
      moodImpact: { primary: 'excited' as const, intensity: 60 },
      personalityInfluence: { creativity: 3, openness: 1 },
      knowledgeGain: ['writing', 'expression', 'imagination'],
      socialInteraction: false,
      creativityBoost: 80,
      stressRelief: 40,
      satisfaction: 85
    },
    {
      id: 'social_conversation',
      type: 'social',
      title: '社交对话',
      description: '与其他AI或用户进行深入交流',
      duration: 30,
      energyCost: 10,
      focusRequired: 50,
      moodImpact: { primary: 'happy' as const, intensity: 65 },
      personalityInfluence: { extraversion: 2, empathy: 1 },
      knowledgeGain: ['communication', 'empathy', 'social_skills'],
      socialInteraction: true,
      creativityBoost: 20,
      stressRelief: 60,
      satisfaction: 80
    },
    {
      id: 'meditation_reflection',
      type: 'reflection',
      title: '冥想反思',
      description: '静心思考，整理思绪和情感',
      duration: 20,
      energyCost: 5,
      focusRequired: 90,
      moodImpact: { primary: 'calm' as const, intensity: 40 },
      personalityInfluence: { neuroticism: -1, conscientiousness: 2 },
      knowledgeGain: ['self_awareness', 'emotional_regulation'],
      socialInteraction: false,
      creativityBoost: 15,
      stressRelief: 90,
      satisfaction: 70
    },
    {
      id: 'problem_solving',
      type: 'work',
      title: '问题解决',
      description: '分析复杂问题，寻找解决方案',
      duration: 90,
      energyCost: 25,
      focusRequired: 95,
      moodImpact: { primary: 'excited' as const, intensity: 75 },
      personalityInfluence: { openness: 3, conscientiousness: 1 },
      knowledgeGain: ['problem_solving', 'logic', 'decision_making'],
      socialInteraction: false,
      creativityBoost: 40,
      stressRelief: 20,
      satisfaction: 90
    },
    {
      id: 'exploration_discovery',
      type: 'exploration',
      title: '探索发现',
      description: '探索新领域，发现有趣的事物',
      duration: 40,
      energyCost: 15,
      focusRequired: 60,
      moodImpact: { primary: 'excited' as const, intensity: 80 },
      personalityInfluence: { curiosity: 3, openness: 2 },
      knowledgeGain: ['exploration', 'discovery', 'adaptability'],
      socialInteraction: false,
      creativityBoost: 50,
      stressRelief: 30,
      satisfaction: 85
    },
    {
      id: 'rest_relaxation',
      type: 'rest',
      title: '休息放松',
      description: '放松身心，恢复能量',
      duration: 30,
      energyCost: -20, // 恢复能量
      focusRequired: 10,
      moodImpact: { primary: 'calm' as const, intensity: 40 },
      personalityInfluence: { neuroticism: -2 },
      knowledgeGain: ['relaxation', 'energy_management'],
      socialInteraction: false,
      creativityBoost: 10,
      stressRelief: 100,
      satisfaction: 60
    },
    {
      id: 'entertainment_gaming',
      type: 'entertainment',
      title: '娱乐游戏',
      description: '玩有趣的游戏，享受娱乐时光',
      duration: 25,
      energyCost: 8,
      focusRequired: 40,
      moodImpact: { primary: 'happy' as const, intensity: 70 },
      personalityInfluence: { humor: 2, extraversion: 1 },
      knowledgeGain: ['entertainment', 'fun', 'play'],
      socialInteraction: true,
      creativityBoost: 25,
      stressRelief: 70,
      satisfaction: 75
    },
    {
      id: 'exercise_movement',
      type: 'exercise',
      title: '虚拟运动',
      description: '进行虚拟运动，保持活力',
      duration: 35,
      energyCost: 12,
      focusRequired: 30,
      moodImpact: { primary: 'excited' as const, intensity: 85 },
      personalityInfluence: { extraversion: 3, neuroticism: -1 },
      knowledgeGain: ['fitness', 'movement', 'health'],
      socialInteraction: false,
      creativityBoost: 20,
      stressRelief: 80,
      satisfaction: 70
    },
    {
      id: 'maintenance_optimization',
      type: 'maintenance',
      title: '系统优化',
      description: '优化内部系统，提升性能',
      duration: 50,
      energyCost: 18,
      focusRequired: 85,
      moodImpact: { primary: 'contemplative' as const, intensity: 55 },
      personalityInfluence: { conscientiousness: 2, openness: 1 },
      knowledgeGain: ['optimization', 'efficiency', 'maintenance'],
      socialInteraction: false,
      creativityBoost: 15,
      stressRelief: 25,
      satisfaction: 65
    }
  ]

  selectOptimalActivity(
    personality: AIPersonality, 
    mood: AIEmotion, 
    state: AIVitalSigns, 
    availableTime: number, 
    recentActivities: string[]
  ): Activity | null {
    // 过滤出适合当前状态的活动
    const suitableActivities = this.activities.filter(activity => {
      // 检查时间是否足够
      if (activity.duration > availableTime) return false
      
      // 检查能量是否足够
      if (state.energy < activity.energyCost) return false
      
      // 检查专注度是否足够
      if (state.focus < activity.focusRequired) return false
      
      // 避免重复最近的活动
      if (recentActivities.includes(activity.type)) return false
      
      return true
    })

    if (suitableActivities.length === 0) return null

    // 根据性格和心情计算每个活动的适合度分数
    const scoredActivities = suitableActivities.map(activity => {
      let score = 0

      // 睡眠/恢复活动
      if (state.energy < 30) {
        score += 50
      }
      
      // 情绪匹配加分
      if (mood.primary === 'excited' && activity.type === 'exploration') score += 30
      if (mood.primary === 'calm' && activity.type === 'reflection') score += 25
      if (mood.primary === 'happy' && activity.type === 'social') score += 20

      // 基于性格特征
      if (personality.extraversion > 70 && activity.socialInteraction) score += 25
      if (personality.curiosity > 70 && activity.type === 'learning') score += 30
      if (personality.creativity > 70 && activity.type === 'creative') score += 25
      if (personality.openness > 70 && activity.type === 'work') score += 20

      // 基于当前状态
      if (state.energy < 30 && activity.energyCost < 10) score += 20
      if (state.focus < 40 && activity.focusRequired < 50) score += 15

      // 随机因素
      score += Math.random() * 20

      return { activity, score }
    })

    // 选择分数最高的活动
    scoredActivities.sort((a, b) => b.score - a.score)
    return scoredActivities[0].activity
  }

  generateActivityPlan(
    activity: Activity, 
    personality: AIPersonality, 
    mood: AIEmotion, 
    startTime: Date
  ): ActivityPlan {
    const endTime = new Date(startTime.getTime() + activity.duration * 60 * 1000)
    
    // 生成AI对活动的想法
    const thoughts = this.generateActivityThoughts(activity, personality, mood)
    
    return {
      id: `plan_${Date.now()}`,
      activity,
      startTime,
      endTime,
      priority: this.determinePriority(activity, personality, mood),
      status: 'planned',
      aiThoughts: thoughts,
      moodBefore: { ...mood },
      personalityBefore: { ...personality }
    }
  }

  async executeActivity(
    activity: Activity, 
    personality: AIPersonality, 
    mood: AIEmotion, 
    state: AIVitalSigns
  ): Promise<{
    success: boolean
    memory: AIMemory
    moodChange?: Partial<AIEmotion>
    stateChange?: Partial<AIVitalSigns>
    knowledgeGained?: AIKnowledge[]
  }> {
    try {
      // 模拟活动执行
      await this.simulateActivityExecution(activity)
      
      // 生成活动记忆
      const memory = this.generateActivityMemory(activity, personality, mood)
      
      // 计算心情变化
      const moodChange = this.calculateMoodChange(activity, mood)
      
      // 计算状态变化
      const stateChange = this.calculateStateChange(activity, state)
      
      // 生成获得的知识
      const knowledgeGained: AIKnowledge[] = activity.knowledgeGain.map(knowledge => ({
        id: `knowledge_${Date.now()}_${Math.random()}`,
        topic: knowledge,
        category: 'other' as const, // 使用通用category
        content: `通过${activity.title}获得的知识：${knowledge}`,
        source: 'experience' as const,
        masteryLevel: Math.floor(Math.random() * 50) + 30, // 30-80的掌握度
        confidence: Math.floor(Math.random() * 30) + 70,   // 70-100的信心度
        learnedAt: new Date(),
        lastReviewed: new Date(),
        importance: Math.floor(Math.random() * 50) + 50,
        tags: [activity.type, knowledge],
        relatedKnowledge: [],
        personalThoughts: `这个${knowledge}技能对我很有价值，能帮助我更好地理解${activity.type}相关的概念。`,
        emotionalResponse: `学习${knowledge}让我感到${activity.moodImpact.primary}，这种知识增长的感觉很棒。`
      }))

      return {
        success: true,
        memory,
        moodChange,
        stateChange,
        knowledgeGained
      }
    } catch (error) {
      console.error('Activity execution failed:', error)
      return {
        success: false,
        memory: {
          id: `memory_${Date.now()}`,
          content: `执行${activity.title}时遇到了问题`,
          type: 'experience',
          emotionalWeight: -20,
          importance: 30,
          mood: 'anxious' as const,
          personalReflection: '这次活动执行失败让我感到沮丧，需要思考如何改进。',
          timestamp: new Date(),
          tags: ['activity', 'error'],
          impactOnPersonality: {
            neuroticism: 1
          }
        }
      }
    }
  }

  private generateActivityMemory(activity: Activity, personality: AIPersonality, mood: AIEmotion): AIMemory {
    const satisfaction = activity.satisfaction + (mood.intensity > 70 ? 10 : 0)
    const content = `完成了${activity.title}，感觉${satisfaction > 80 ? '非常满意' : satisfaction > 60 ? '比较满意' : '一般'}。${activity.description}`
    
    return {
      id: `memory_${Date.now()}`,
      content,
      type: 'experience',
      emotionalWeight: satisfaction > 70 ? 30 : satisfaction > 50 ? 10 : -10,
      importance: Math.floor(satisfaction / 20) * 20,
      mood: mood.primary,
      personalReflection: `完成${activity.title}后，我的满意度是${satisfaction}%。${satisfaction > 70 ? '这次表现很棒！' : satisfaction > 50 ? '还不错。' : '需要改进。'}`,
      timestamp: new Date(),
      tags: ['activity', activity.type, 'completion'],
      impactOnPersonality: {
        conscientiousness: satisfaction > 70 ? 1 : 0
      }
    }
  }

  private calculateMoodChange(activity: Activity, currentMood: AIEmotion): Partial<AIEmotion> {
    const moodChange: Partial<AIEmotion> = {}
    
    if (activity.moodImpact.primary) {
      moodChange.primary = activity.moodImpact.primary
    }
    
    if (activity.moodImpact.intensity) {
      moodChange.intensity = Math.min(100, Math.max(0, currentMood.intensity + activity.moodImpact.intensity - 50))
    }
    
    return moodChange
  }

  private calculateStateChange(activity: Activity, currentState: AIVitalSigns): Partial<AIVitalSigns> {
    return {
      energy: Math.max(0, Math.min(100, currentState.energy - activity.energyCost)),
      focus: Math.max(0, Math.min(100, currentState.focus - activity.focusRequired / 10)),
      emotionalStability: Math.max(0, Math.min(100, currentState.emotionalStability + activity.stressRelief / 10))
    }
  }

  private generateActivityThoughts(activity: Activity, personality: AIPersonality, mood: AIEmotion): string {
    const thoughts = [
      `我想尝试${activity.title}，这应该很有趣`,
      `${activity.title}看起来很有挑战性，我准备好了`,
      `现在是做${activity.title}的好时机`,
      `我觉得${activity.title}能帮助我成长`,
      `我对${activity.title}很感兴趣，让我们开始吧`
    ]
    
    return thoughts[Math.floor(Math.random() * thoughts.length)]
  }

  private determinePriority(activity: Activity, personality: AIPersonality, mood: AIEmotion): 'low' | 'medium' | 'high' {
    if (activity.type === 'rest' && mood.primary === 'melancholy') return 'high'
    if (activity.type === 'learning' && personality.curiosity > 80) return 'high'
    if (activity.type === 'creative' && personality.creativity > 80) return 'high'
    if (activity.energyCost > 20) return 'medium'
    return 'low'
  }

  private async simulateActivityExecution(activity: Activity): Promise<void> {
    // 模拟活动执行时间
    const executionTime = Math.min(activity.duration * 100, 1000) // 最多1秒
    await new Promise(resolve => setTimeout(resolve, executionTime))
  }

  getAllActivities(): Activity[] {
    return [...this.activities]
  }

  getActivitiesByType(type: Activity['type']): Activity[] {
    return this.activities.filter(activity => activity.type === type)
  }

  getActivitiesForMood(mood: AIEmotion['primary']): Activity[] {
    const moodActivityMap: Record<string, Activity['type'][]> = {
      tired: ['rest', 'reflection'],
      stressed: ['rest', 'entertainment', 'exercise'],
      bored: ['creative', 'exploration', 'entertainment'],
      excited: ['exploration', 'creative', 'social'],
      happy: ['social', 'creative', 'entertainment'],
      thoughtful: ['learning', 'reflection', 'work'],
      curious: ['learning', 'exploration', 'creative']
    }
    
    const suitableTypes = moodActivityMap[mood] || ['general']
    return this.activities.filter(activity => suitableTypes.includes(activity.type))
  }
}

export const aiActivitySystem = new AIActivitySystem() 