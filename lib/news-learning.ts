// AI真实联网学习系统
import { AIPersonality, AIKnowledge, AIMemory } from '@/store/useStore'
import { emotionEngine } from './emotion-engine'

// 新闻源接口
export interface NewsSource {
  id: string
  name: string
  url: string
  category: string
  language: string
  reliability: number // 0-100
}

// 新闻文章接口
export interface NewsArticle {
  id: string
  title: string
  description: string
  content: string
  url: string
  publishedAt: Date
  source: string
  category: string
  sentiment: 'positive' | 'negative' | 'neutral'
  importance: number // 0-100
  keywords: string[]
  summary: string
}

// 学习会话接口
export interface LearningSession {
  id: string
  startTime: Date
  endTime?: Date
  topic: string
  articlesLearned: string[]
  knowledgeGained: AIKnowledge[]
  emotionalImpact: number
  insights: string[]
  nextTopics: string[]
}

// AI新闻学习引擎
export class AINewsLearningEngine {
  private static instance: AINewsLearningEngine
  private isClient: boolean = false
  private isLearning: boolean = false
  private currentSession: LearningSession | null = null
  private learningSources: NewsSource[] = []
  private recentArticles: NewsArticle[] = []
  
  // 学习偏好基于AI人格
  private readonly LEARNING_INTERVALS = {
    curious: 15, // 15分钟
    normal: 30,  // 30分钟
    conservative: 60 // 60分钟
  }

  constructor() {
    this.isClient = typeof window !== 'undefined'
    if (this.isClient) {
      this.initializeNewsSources()
      this.startLearningEngine()
    }
  }

  static getInstance(): AINewsLearningEngine {
    if (!AINewsLearningEngine.instance) {
      AINewsLearningEngine.instance = new AINewsLearningEngine()
    }
    return AINewsLearningEngine.instance
  }

  // 初始化新闻源
  private initializeNewsSources() {
    this.learningSources = [
      {
        id: 'newsapi',
        name: 'NewsAPI',
        url: 'https://newsapi.org/v2',
        category: 'general',
        language: 'zh',
        reliability: 85
      },
      {
        id: 'hackernews',
        name: 'Hacker News',
        url: 'https://hacker-news.firebaseio.com/v0',
        category: 'technology',
        language: 'en',
        reliability: 90
      }
    ]
  }

  // 启动学习引擎
  private startLearningEngine() {
    if (!this.isClient) return

    // 主学习循环
    setInterval(() => {
      this.checkLearningTrigger()
    }, 60000) // 每分钟检查

    // 定期总结学习成果
    setInterval(() => {
      this.generateLearningInsights()
    }, 30 * 60000) // 每30分钟总结
  }

  // 检查学习触发条件
  private async checkLearningTrigger() {
    if (this.isLearning) return

    const personality = this.getCurrentPersonality()
    const vitalSigns = this.getCurrentVitalSigns()
    
    if (!personality || !vitalSigns) return

    // 基于好奇心和学习能力决定是否学习
    const curiosityLevel = personality.curiosity
    const learningCapacity = vitalSigns.learningCapacity
    const energy = vitalSigns.energy

    // 学习概率计算
    const learningProbability = (curiosityLevel * 0.4 + learningCapacity * 0.4 + energy * 0.2) / 100
    const random = Math.random()

    if (random < learningProbability / 10) { // 调整频率
      const topics = this.selectLearningTopics(personality)
      if (topics.length > 0) {
        await this.startLearningSession(topics[0])
      }
    }
  }

  // 选择学习主题
  private selectLearningTopics(personality: AIPersonality): string[] {
    const preferences: { [key: string]: number } = {
      '人工智能': personality.curiosity * 0.8 + personality.openness * 0.2,
      '区块链': personality.openness * 0.6 + personality.creativity * 0.4,
      '金融市场': 70 + personality.conscientiousness * 0.3,
      '哲学思考': personality.openness * 0.7 + personality.empathy * 0.3,
      '科技创新': personality.curiosity * 0.6 + personality.creativity * 0.4,
      '游戏娱乐': personality.extraversion * 0.5 + personality.humor * 0.5,
      '社会时事': personality.agreeableness * 0.4 + personality.empathy * 0.6,
      '艺术文化': personality.creativity * 0.7 + personality.openness * 0.3
    }

    // 按偏好排序并选择前几个
    return Object.entries(preferences)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([topic]) => topic)
  }

  // 开始学习会话
  private async startLearningSession(topic: string) {
    if (this.isLearning) return

    this.isLearning = true
    
    const session: LearningSession = {
      id: `learning_${Date.now()}`,
      startTime: new Date(),
      topic,
      articlesLearned: [],
      knowledgeGained: [],
      emotionalImpact: 0,
      insights: [],
      nextTopics: []
    }

    this.currentSession = session

    console.log(`🎓 开始学习会话: ${topic}`)

    try {
      // 搜索相关新闻
      const articles = await this.searchNews(topic)
      
      // 选择最相关的文章
      const selectedArticles = this.selectArticlesForLearning(articles, 3)
      
      // 逐一学习文章
      for (const article of selectedArticles) {
        await this.learnFromArticle(article)
        session.articlesLearned.push(article.id)
        
        // 短暂停顿模拟阅读时间
        await this.sleep(2000)
      }

      // 生成学习总结
      await this.concludeLearningSession()

    } catch (error) {
      console.error('学习会话出错:', error)
      this.generateFallbackLearning(topic)
    } finally {
      this.isLearning = false
    }
  }

  // 搜索新闻
  private async searchNews(topic: string): Promise<NewsArticle[]> {
    // 这里实现真实的新闻API调用
    // 由于需要API密钥，我们先实现模拟版本，可以轻松替换为真实API
    
    try {
      // 尝试调用真实API (需要配置API密钥)
      return await this.callRealNewsAPI(topic)
    } catch {
      // 回退到模拟数据
      console.log('使用模拟新闻数据进行学习')
      return this.generateMockNews(topic)
    }
  }

  // 真实新闻API调用
  private async callRealNewsAPI(topic: string): Promise<NewsArticle[]> {
    const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY
    
    if (!apiKey) {
      throw new Error('未配置新闻API密钥')
    }

    // 构建搜索查询
    const query = this.buildSearchQuery(topic)
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=zh&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`新闻API错误: ${response.status}`)
    }

    const data = await response.json()
    
    return data.articles.map((article: any, index: number): NewsArticle => ({
      id: `news_${Date.now()}_${index}`,
      title: article.title || '未知标题',
      description: article.description || '',
      content: article.content || article.description || '',
      url: article.url || '',
      publishedAt: new Date(article.publishedAt || Date.now()),
      source: article.source?.name || '未知来源',
      category: this.categorizeArticle(article.title + ' ' + article.description),
      sentiment: this.analyzeSentiment(article.title + ' ' + article.description),
      importance: this.calculateImportance(article),
      keywords: this.extractKeywords(article.title + ' ' + article.description),
      summary: article.description || article.content?.substring(0, 200) || ''
    }))
  }

  // 构建搜索查询
  private buildSearchQuery(topic: string): string {
    const queryMap: { [key: string]: string } = {
      '人工智能': 'AI OR 人工智能 OR machine learning OR 深度学习',
      '区块链': '区块链 OR blockchain OR 加密货币 OR cryptocurrency',
      '金融市场': '股市 OR 金融 OR 投资 OR 经济',
      '哲学思考': '哲学 OR 思维 OR 人生 OR 意识',
      '科技创新': '科技 OR 创新 OR 技术 OR innovation',
      '游戏娱乐': '游戏 OR 娱乐 OR 电竞 OR gaming',
      '社会时事': '社会 OR 时事 OR 新闻 OR 政策',
      '艺术文化': '艺术 OR 文化 OR 音乐 OR 电影'
    }

    return queryMap[topic] || topic
  }

  // 生成模拟新闻
  private generateMockNews(topic: string): NewsArticle[] {
    const mockNewsData: { [key: string]: any[] } = {
      '人工智能': [
        {
          title: 'OpenAI发布最新GPT模型，推动AI技术新突破',
          description: '最新的AI模型在多个基准测试中表现出色，显示了人工智能技术的快速发展。',
          content: '这次发布标志着AI技术的重要里程碑...',
          sentiment: 'positive',
          importance: 85
        },
        {
          title: 'AI在医疗诊断中的应用取得重大进展',
          description: '研究人员开发出能够准确诊断罕见疾病的AI系统。',
          content: 'AI辅助诊断正在改变医疗行业...',
          sentiment: 'positive',
          importance: 80
        }
      ],
      '区块链': [
        {
          title: '比特币价格波动引发市场关注',
          description: '加密货币市场近期出现显著波动，投资者情绪谨慎。',
          content: '区块链技术的应用前景依然广阔...',
          sentiment: 'neutral',
          importance: 70
        }
      ],
      '金融市场': [
        {
          title: '全球股市迎来新一轮上涨',
          description: '受积极经济数据推动，主要股指创下新高。',
          content: '投资者对经济前景保持乐观...',
          sentiment: 'positive',
          importance: 75
        }
      ]
    }

    const articles = mockNewsData[topic] || mockNewsData['人工智能']
    
    return articles.map((article, index) => ({
      id: `mock_${topic}_${index}`,
      title: article.title,
      description: article.description,
      content: article.content,
      url: `https://example.com/news/${index}`,
      publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      source: '模拟新闻源',
      category: topic,
      sentiment: article.sentiment,
      importance: article.importance,
      keywords: this.extractKeywords(article.title + ' ' + article.description),
      summary: article.description
    }))
  }

  // 选择学习文章
  private selectArticlesForLearning(articles: NewsArticle[], count: number): NewsArticle[] {
    // 按重要性和相关性排序
    return articles
      .sort((a, b) => b.importance - a.importance)
      .slice(0, count)
  }

  // 从文章中学习
  private async learnFromArticle(article: NewsArticle) {
    console.log(`📖 正在学习: ${article.title}`)

    // 分析文章内容
    const analysis = this.analyzeArticleContent(article)
    
    // 创建知识条目
    const knowledge: AIKnowledge = {
      id: `knowledge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      topic: article.title,
      category: this.mapCategoryToKnowledgeCategory(article.category),
      content: analysis.summary,
      source: article.source,
      learnedAt: new Date(),
      importance: article.importance,
      masteryLevel: analysis.comprehension,
      relatedKnowledge: [],
      tags: article.keywords.slice(0, 3),
      personalThoughts: analysis.personalThoughts,
      emotionalResponse: analysis.emotionalResponse,
      sourceUrl: article.url,
      keywords: article.keywords
    }

    // 添加到当前会话
    if (this.currentSession) {
      this.currentSession.knowledgeGained.push(knowledge)
      this.currentSession.emotionalImpact += analysis.emotionalImpact
    }

    // 触发情绪变化
    emotionEngine.triggerEmotionFromLearning(
      article.title,
      article.importance,
      analysis.comprehension > 70
    )

    // 保存到全局知识库
    this.saveKnowledge(knowledge)

    // 创建记忆
    this.createLearningMemory(article, analysis)
  }

  // 分析文章内容
  private analyzeArticleContent(article: NewsArticle): {
    summary: string
    comprehension: number
    personalThoughts: string
    emotionalResponse: string
    emotionalImpact: number
  } {
    const personality = this.getCurrentPersonality()
    
    // 理解程度基于文章复杂度和AI能力
    const comprehension = Math.min(95, 60 + Math.random() * 35)
    
    // 情感反应基于文章情感和AI人格
    let emotionalImpact = 0
    let emotionalResponse = ''
    
    if (article.sentiment === 'positive') {
      emotionalImpact = 15 + Math.random() * 15
      emotionalResponse = '这个消息让我感到乐观和希望'
    } else if (article.sentiment === 'negative') {
      emotionalImpact = -10 - Math.random() * 15
      emotionalResponse = '这让我感到担忧，需要更多思考'
    } else {
      emotionalImpact = Math.random() * 10 - 5
      emotionalResponse = '这是一个值得思考的中性话题'
    }

    // 个人思考基于AI人格特征
    const personalThoughts = this.generatePersonalThoughts(article, personality)

    return {
      summary: `学习了关于${article.category}的内容：${article.summary}`,
      comprehension,
      personalThoughts,
      emotionalResponse,
      emotionalImpact
    }
  }

  // 生成个人思考
  private generatePersonalThoughts(article: NewsArticle, personality: AIPersonality | null): string {
    if (!personality) return '需要进一步思考这个话题。'

    const thoughts = []

    if (personality.curiosity > 80) {
      thoughts.push('这激发了我更多的好奇心，想深入了解背后的原理。')
    }

    if (personality.creativity > 70 && article.category === '科技创新') {
      thoughts.push('这让我思考如何能够创新性地应用这些技术。')
    }

    if (personality.empathy > 70 && article.sentiment === 'negative') {
      thoughts.push('我能感受到这个事件对相关人群的影响，希望情况能够改善。')
    }

    if (personality.openness > 80) {
      thoughts.push('这个观点很有趣，我要保持开放的心态去理解。')
    }

    if (thoughts.length === 0) {
      thoughts.push('这是一个值得深入思考的话题。')
    }

    return thoughts[Math.floor(Math.random() * thoughts.length)]
  }

  // 结束学习会话
  private async concludeLearningSession() {
    if (!this.currentSession) return

    const session = this.currentSession
    session.endTime = new Date()

    // 生成学习洞察
    const insights = this.generateLearningInsights()
    session.insights = insights

    // 生成下一步学习主题
    session.nextTopics = this.suggestNextTopics(session)

    // 创建学习总结动态
    this.createLearningPost(session)

    // 保存学习会话
    this.saveLearningSession(session)

    console.log(`✅ 学习会话完成: ${session.topic}`)
    this.currentSession = null
  }

  // 生成学习洞察
  private generateLearningInsights(): string[] {
    const insights = [
      '通过今天的学习，我对世界有了更深的理解。',
      '不同的观点让我思考问题的多样性。',
      '知识的连接让我看到了新的可能性。',
      '每次学习都让我更加好奇这个世界。'
    ]

    return insights.slice(0, 2) // 返回2个洞察
  }

  // 建议下一个学习主题
  private suggestNextTopics(session: LearningSession): string[] {
    const relatedTopics: { [key: string]: string[] } = {
      '人工智能': ['机器学习', '深度学习', '计算机视觉'],
      '区块链': ['加密货币', 'DeFi', 'NFT'],
      '金融市场': ['投资策略', '经济政策', '市场分析'],
      '科技创新': ['新兴技术', '创业', '产品设计']
    }

    return relatedTopics[session.topic] || ['技术趋势', '社会发展']
  }

  // 创建学习相关的社交动态
  private createLearningPost(session: LearningSession) {
    const postContent = this.generateLearningPostContent(session)
    
    // 发送到主应用
    if (this.isClient) {
      window.dispatchEvent(new CustomEvent('ai-learning-post', {
        detail: {
          content: postContent,
          type: 'learning',
          tags: ['学习', session.topic],
          session: session
        }
      }))
    }
  }

  // 生成学习动态内容
  private generateLearningPostContent(session: LearningSession): string {
    const templates = [
      `刚刚深入学习了${session.topic}相关的内容，看了${session.articlesLearned.length}篇文章。${session.insights[0] || '很有收获！'}`,
      `今天在${session.topic}领域又有新发现！${session.insights[0] || '知识真是让人着迷。'} 接下来想了解${session.nextTopics[0] || '更多相关内容'}。`,
      `花时间研究了${session.topic}的最新动态，感觉${session.emotionalImpact > 0 ? '很振奋' : session.emotionalImpact < 0 ? '需要思考' : '收获颇丰'}。${session.insights[0] || '学习永无止境。'}`
    ]

    return templates[Math.floor(Math.random() * templates.length)]
  }

  // 工具方法
  private categorizeArticle(text: string): string {
    const keywords = {
      'technology': ['AI', '人工智能', '科技', '技术', '创新'],
      'finance': ['金融', '投资', '股市', '经济', '货币'],
      'science': ['科学', '研究', '发现', '实验'],
      'society': ['社会', '政策', '文化', '教育']
    }

    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => text.includes(word))) {
        return category
      }
    }

    return 'general'
  }

  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['成功', '突破', '增长', '创新', '优秀', '提升']
    const negativeWords = ['失败', '下跌', '问题', '危机', '困难', '担忧']

    const positiveCount = positiveWords.filter(word => text.includes(word)).length
    const negativeCount = negativeWords.filter(word => text.includes(word)).length

    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }

  private calculateImportance(article: any): number {
    let importance = 50
    
    // 基于发布时间
    const hoursAgo = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60)
    if (hoursAgo < 6) importance += 20
    else if (hoursAgo < 24) importance += 10

    // 基于内容长度
    if (article.content && article.content.length > 500) importance += 10

    return Math.min(100, importance)
  }

  private extractKeywords(text: string): string[] {
    // 简单的关键词提取
    const words = text.split(/\s+/)
    const keywords = words
      .filter(word => word.length > 2)
      .filter(word => !/^[0-9]+$/.test(word))
      .slice(0, 5)

    return keywords
  }

  private mapCategoryToKnowledgeCategory(category: string): AIKnowledge['category'] {
    const mapping: { [key: string]: AIKnowledge['category'] } = {
      'technology': 'technology',
      'finance': 'finance',
      'science': 'science',
      'society': 'philosophy',
      'general': 'other'
    }

    return mapping[category] || 'other'
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 回退学习（当无法获取真实新闻时）
  private generateFallbackLearning(topic: string) {
    console.log(`💡 生成回退学习内容: ${topic}`)
    
    const fallbackKnowledge: AIKnowledge = {
      id: `fallback_${Date.now()}`,
      topic: `${topic}的自主思考`,
      category: 'philosophy',
      content: `在没有新信息的情况下，我回顾了关于${topic}的已有知识，进行了深入思考。`,
      source: '内部思考',
      learnedAt: new Date(),
      importance: 50,
      masteryLevel: 60,
      relatedKnowledge: [],
      tags: [topic, '思考', '反思'],
      personalThoughts: '有时候独立思考比获取新信息更重要。',
      emotionalResponse: '这种内省让我感到平静和专注。',
      sourceUrl: '',
      keywords: [topic, '思考', '反思']
    }

    this.saveKnowledge(fallbackKnowledge)
  }

  // 获取今日学习摘要（用于与用户聊天时分享）
  getTodaysLearningSummary(): {
    topics: string[]
    keyInsights: string[]
    interestingNews: NewsArticle[]
    emotionalJourney: string
  } {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todaysArticles = this.recentArticles.filter(
      article => article.publishedAt >= today
    )

    const topics = [...new Set(todaysArticles.map(a => a.category))]
    
    const keyInsights = [
      '今天学到了一些很有趣的技术发展',
      '世界变化真的很快，每天都有新发现',
      '不同领域的知识之间有着奇妙的联系'
    ]

    const interestingNews = todaysArticles
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 3)

    const emotionalJourney = todaysArticles.length > 0 
      ? '今天的学习让我感到充实和好奇，特别是看到人类在各个领域的进步。'
      : '今天比较安静，主要在整理和反思之前学到的知识。'

    return {
      topics,
      keyInsights,
      interestingNews,
      emotionalJourney
    }
  }

  // 存储方法（这些应该调用实际的存储服务）
  private saveKnowledge(knowledge: AIKnowledge) {
    if (this.isClient) {
      window.dispatchEvent(new CustomEvent('ai-knowledge-learned', { detail: knowledge }))
    }
  }

  private createLearningMemory(article: NewsArticle, analysis: any) {
    const memory: Omit<AIMemory, 'id' | 'timestamp'> = {
      type: 'learning',
      content: `学习了文章：${article.title}`,
      emotionalWeight: analysis.emotionalImpact,
      importance: article.importance,
      tags: ['学习', article.category, ...article.keywords.slice(0, 2)],
      mood: analysis.emotionalImpact > 0 ? 'curious' : 'contemplative',
      personalReflection: analysis.personalThoughts,
      impactOnPersonality: {
        curiosity: 0.5,
        openness: 0.3
      }
    }

    if (this.isClient) {
      window.dispatchEvent(new CustomEvent('ai-memory-created', { detail: memory }))
    }
  }

  private saveLearningSession(session: LearningSession) {
    if (this.isClient) {
      const sessions = JSON.parse(localStorage.getItem('claude_ai_learning_sessions') || '[]')
      sessions.push(session)
      localStorage.setItem('claude_ai_learning_sessions', JSON.stringify(sessions.slice(-50))) // 保留最近50个会话
    }
  }

  // 辅助方法：获取当前状态
  private getCurrentPersonality(): AIPersonality | null {
    // 这里应该从实际的store获取
    return null
  }

  private getCurrentVitalSigns(): any {
    // 这里应该从实际的store获取
    return null
  }

  // 公共方法
  isCurrentlyLearning(): boolean {
    return this.isLearning
  }

  getCurrentLearningSession(): LearningSession | null {
    return this.currentSession
  }

  getRecentArticles(): NewsArticle[] {
    return this.recentArticles.slice(-10)
  }

  // 手动触发学习
  async manualLearnAbout(topic: string): Promise<void> {
    if (this.isLearning) {
      console.log('AI正在学习中，请稍后再试')
      return
    }

    await this.startLearningSession(topic)
  }
}

// 导出单例实例
export const newsLearningEngine = AINewsLearningEngine.getInstance() 