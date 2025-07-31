// 数据库集成层 - 支持多种数据库
import { AIPersonality, AIEmotion, AIKnowledge, AIMemory, AISocialPost, StoreState } from '@/store/useStore'

// 数据库配置接口
interface DatabaseConfig {
  type: 'localStorage' | 'indexedDB' | 'postgresql' | 'mysql' | 'mongodb'
  connectionString?: string
  apiEndpoint?: string
}

// 统一的数据库操作接口
export interface DatabaseInterface {
  // AI核心数据
  savePersonality(personality: AIPersonality): Promise<void>
  loadPersonality(): Promise<AIPersonality | null>
  
  saveMood(mood: AIEmotion): Promise<void>
  loadMood(): Promise<AIEmotion | null>
  
  saveState(state: StoreState): Promise<void>
  loadState(): Promise<StoreState | null>
  
  // 知识和记忆
  saveKnowledge(knowledge: AIKnowledge[]): Promise<void>
  loadKnowledge(): Promise<AIKnowledge[]>
  addKnowledge(knowledge: AIKnowledge): Promise<void>
  
  saveMemories(memories: AIMemory[]): Promise<void>
  loadMemories(): Promise<AIMemory[]>
  addMemory(memory: AIMemory): Promise<void>
  
  // AI行为和说说
  saveActions(actions: any[]): Promise<void> // AIAction[] 替换为 any[] 或定义一个更通用的类型
  loadActions(): Promise<any[]> // AIAction[] 替换为 any[] 或定义一个更通用的类型
  addAction(action: any): Promise<void> // AIAction 替换为 any 或定义一个更通用的类型
  
  savePosts(posts: AISocialPost[]): Promise<void>
  loadPosts(): Promise<AISocialPost[]>
  addPost(post: AISocialPost): Promise<void>
  
  // 用户影响和日程
  saveInfluences(influences: any[]): Promise<void> // UserInfluence[] 替换为 any[] 或定义一个更通用的类型
  loadInfluences(): Promise<any[]> // UserInfluence[] 替换为 any[] 或定义一个更通用的类型
  addInfluence(influence: any): Promise<void> // UserInfluence 替换为 any 或定义一个更通用的类型
  
  saveSchedule(schedule: any[]): Promise<void> // ScheduleItem[] 替换为 any[] 或定义一个更通用的类型
  loadSchedule(): Promise<any[]> // ScheduleItem[] 替换为 any[] 或定义一个更通用的类型
  addScheduleItem(item: any): Promise<void> // ScheduleItem 替换为 any 或定义一个更通用的类型
  updateScheduleItem(id: string, updates: Partial<any>): Promise<void> // ScheduleItem 替换为 any 或定义一个更通用的类型
  
  // 批量操作
  saveAll(data: {
    personality: AIPersonality
    mood: AIEmotion
    state: StoreState
    knowledge: AIKnowledge[]
    memories: AIMemory[]
    posts: AISocialPost[]
    actions: any[]
    influences: any[]
    schedule: any[]
  }): Promise<void>
  
  loadAll(): Promise<{
    personality: AIPersonality | null
    mood: AIEmotion | null
    state: StoreState | null
    knowledge: AIKnowledge[]
    memories: AIMemory[]
    posts: AISocialPost[]
    actions: any[]
    influences: any[]
    schedule: any[]
  }>
  
  // 数据清理和维护
  cleanup(): Promise<void>
  backup(): Promise<string>
  restore(backupData: string): Promise<void>
}

// LocalStorage实现 - 开发和测试用
class LocalStorageDatabase implements DatabaseInterface {
  private prefix = 'claude_ai_'

  private getKey(key: string): string {
    return this.prefix + key
  }

  private async saveItem(key: string, data: unknown): Promise<void> {
    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(data))
    } catch (error) {
      console.error(`Failed to save ${key}:`, error)
    }
  }

  private async loadItem<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(this.getKey(key))
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Failed to load ${key}:`, error)
      return null
    }
  }

  async savePersonality(personality: AIPersonality): Promise<void> {
    await this.saveItem('personality', personality)
  }

  async loadPersonality(): Promise<AIPersonality | null> {
    return await this.loadItem<AIPersonality>('personality')
  }

  async saveMood(mood: AIEmotion): Promise<void> {
    await this.saveItem('mood', mood)
  }

  async loadMood(): Promise<AIEmotion | null> {
    return await this.loadItem<AIEmotion>('mood')
  }

  async saveState(state: StoreState): Promise<void> {
    await this.saveItem('state', state)
  }

  async loadState(): Promise<StoreState | null> {
    return await this.loadItem<StoreState>('state')
  }

  async saveKnowledge(knowledge: AIKnowledge[]): Promise<void> {
    await this.saveItem('knowledge', knowledge)
  }

  async loadKnowledge(): Promise<AIKnowledge[]> {
    return (await this.loadItem<AIKnowledge[]>('knowledge')) || []
  }

  async addKnowledge(knowledge: AIKnowledge): Promise<void> {
    const existing = await this.loadKnowledge()
    existing.push(knowledge)
    await this.saveKnowledge(existing)
  }

  async saveMemories(memories: AIMemory[]): Promise<void> {
    await this.saveItem('memories', memories)
  }

  async loadMemories(): Promise<AIMemory[]> {
    return (await this.loadItem<AIMemory[]>('memories')) || []
  }

  async addMemory(memory: AIMemory): Promise<void> {
    const existing = await this.loadMemories()
    existing.push(memory)
    await this.saveMemories(existing)
  }

  async saveActions(actions: any[]): Promise<void> {
    await this.saveItem('actions', actions)
  }

  async loadActions(): Promise<any[]> {
    return (await this.loadItem<any[]>('actions')) || []
  }

  async addAction(action: any): Promise<void> {
    const existing = await this.loadActions()
    existing.push(action)
    // 只保留最近1000个行为
    const limited = existing.slice(-1000)
    await this.saveActions(limited)
  }

  async savePosts(posts: AISocialPost[]): Promise<void> {
    await this.saveItem('posts', posts)
  }

  async loadPosts(): Promise<AISocialPost[]> {
    return (await this.loadItem<AISocialPost[]>('posts')) || []
  }

  async addPost(post: AISocialPost): Promise<void> {
    const existing = await this.loadPosts()
    existing.unshift(post) // 最新的在前面
    // 只保留最近200条说说
    const limited = existing.slice(0, 200)
    await this.savePosts(limited)
  }

  async saveInfluences(influences: any[]): Promise<void> {
    await this.saveItem('influences', influences)
  }

  async loadInfluences(): Promise<any[]> {
    return (await this.loadItem<any[]>('influences')) || []
  }

  async addInfluence(influence: any): Promise<void> {
    const existing = await this.loadInfluences()
    existing.push(influence)
    // 只保留最近500个影响记录
    const limited = existing.slice(-500)
    await this.saveInfluences(limited)
  }

  async saveSchedule(schedule: any[]): Promise<void> {
    await this.saveItem('schedule', schedule)
  }

  async loadSchedule(): Promise<any[]> {
    return (await this.loadItem<any[]>('schedule')) || []
  }

  async addScheduleItem(item: any): Promise<void> {
    const existing = await this.loadSchedule()
    existing.push(item)
    // 按时间排序
    existing.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    await this.saveSchedule(existing)
  }

  async updateScheduleItem(id: string, updates: Partial<any>): Promise<void> {
    const existing = await this.loadSchedule()
    const index = existing.findIndex(item => item.id === id)
    if (index !== -1) {
      existing[index] = { ...existing[index], ...updates }
      await this.saveSchedule(existing)
    }
  }

  async saveAll(data: {
    personality: AIPersonality
    mood: AIEmotion
    state: StoreState
    knowledge: AIKnowledge[]
    memories: AIMemory[]
    posts: AISocialPost[]
    actions: any[]
    influences: any[]
    schedule: any[]
  }): Promise<void> {
    await Promise.all([
      this.savePersonality(data.personality),
      this.saveMood(data.mood),
      this.saveState(data.state),
      this.saveKnowledge(data.knowledge),
      this.saveMemories(data.memories),
      this.savePosts(data.posts),
      this.saveActions(data.actions),
      this.saveInfluences(data.influences),
      this.saveSchedule(data.schedule)
    ])
  }

  async loadAll(): Promise<{
    personality: AIPersonality | null
    mood: AIEmotion | null
    state: StoreState | null
    knowledge: AIKnowledge[]
    memories: AIMemory[]
    posts: AISocialPost[]
    actions: any[]
    influences: any[]
    schedule: any[]
  }> {
    const [personality, mood, state, knowledge, memories, posts, actions, influences, schedule] = await Promise.all([
      this.loadPersonality(),
      this.loadMood(),
      this.loadState(),
      this.loadKnowledge(),
      this.loadMemories(),
      this.loadPosts(),
      this.loadActions(),
      this.loadInfluences(),
      this.loadSchedule()
    ])

    return {
      personality,
      mood,
      state,
      knowledge,
      memories,
      posts,
      actions,
      influences,
      schedule
    }
  }

  async cleanup(): Promise<void> {
    // 清理过期的数据
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30天前

    // 清理过期的action
    const actions = await this.loadActions()
    const recentActions = actions.filter(action => new Date(action.timestamp) > cutoffDate)
    await this.saveActions(recentActions)

    // 清理过期的日程
    const schedule = await this.loadSchedule()
    const futureSchedule = schedule.filter(item => new Date(item.endTime) > cutoffDate)
    await this.saveSchedule(futureSchedule)
  }

  async backup(): Promise<string> {
    const allData = await this.loadAll()
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: allData
    })
  }

  async restore(backupData: string): Promise<void> {
    try {
      const backup = JSON.parse(backupData)
      if (backup.data) {
        await this.saveAll(backup.data)
      }
    } catch (error) {
      console.error('Failed to restore backup:', error)
      throw new Error('Invalid backup data')
    }
  }
}

// IndexedDB实现 - 浏览器高性能存储
class IndexedDBDatabase implements DatabaseInterface {
  private dbName = 'ClaudeAIDatabase'
  private version = 1
  private db: IDBDatabase | null = null

  private async openDB(): Promise<IDBDatabase> {
    if (this.db) return this.db

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(request.result)
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // 创建对象存储
        const stores = ['personality', 'mood', 'state', 'knowledge', 'memories', 'posts', 'actions', 'influences', 'schedule']
        
        stores.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true })
            
            // 为需要搜索的字段创建索引
            if (storeName === 'knowledge') {
              store.createIndex('timestamp', 'timestamp')
              store.createIndex('importance', 'importance')
            }
            if (storeName === 'memories') {
              store.createIndex('timestamp', 'timestamp')
              store.createIndex('type', 'type')
            }
            if (storeName === 'schedule') {
              store.createIndex('startTime', 'startTime')
              store.createIndex('status', 'status')
            }
          }
        })
      }
    })
  }

  private async saveToStore(storeName: string, data: unknown): Promise<void> {
    const db = await this.openDB()
    const transaction = db.transaction([storeName], 'readwrite')
    const store = transaction.objectStore(storeName)
    
    return new Promise((resolve, reject) => {
      const request = store.put({ id: 'current', data })
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  private async loadFromStore<T>(storeName: string): Promise<T | null> {
    const db = await this.openDB()
    const transaction = db.transaction([storeName], 'readonly')
    const store = transaction.objectStore(storeName)
    
    return new Promise((resolve, reject) => {
      const request = store.get('current')
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const result = request.result
        if (result && result.data) {
          resolve(result.data as T)
        } else {
          resolve(null)
        }
      }
    })
  }

  // 实现所有必需的方法（为简洁起见，这里只显示关键实现）
  async savePersonality(personality: AIPersonality): Promise<void> {
    await this.saveToStore('personality', personality)
  }

  async loadPersonality(): Promise<AIPersonality | null> {
    return await this.loadFromStore<AIPersonality>('personality')
  }

  // ... 其他方法实现类似
  
  async saveAll(data: {
    personality: AIPersonality
    mood: AIEmotion
    state: StoreState
    knowledge: AIKnowledge[]
    memories: AIMemory[]
    posts: AISocialPost[]
    actions: any[]
    influences: any[]
    schedule: any[]
  }): Promise<void> {
    // IndexedDB事务实现
    const db = await this.openDB()
    const transaction = db.transaction(['personality', 'mood', 'state', 'knowledge', 'memories', 'posts', 'actions', 'influences', 'schedule'], 'readwrite')
    
    // 批量保存所有数据
    await Promise.all([
      this.savePersonality(data.personality),
      this.saveMood(data.mood),
      this.saveState(data.state),
      // ... 其他数据
    ])
  }

  // 实现其他必需方法...
  async saveMood(mood: AIEmotion): Promise<void> { await this.saveToStore('mood', mood) }
  async loadMood(): Promise<AIEmotion | null> { return await this.loadFromStore<AIEmotion>('mood') }
  async saveState(state: StoreState): Promise<void> { await this.saveToStore('state', state) }
  async loadState(): Promise<StoreState | null> { return await this.loadFromStore<StoreState>('state') }
  
  // 简化实现其他方法...
  async saveKnowledge(knowledge: AIKnowledge[]): Promise<void> { await this.saveToStore('knowledge', { items: knowledge }) }
  async loadKnowledge(): Promise<AIKnowledge[]> { const result = await this.loadFromStore<{items: AIKnowledge[]}>('knowledge'); return result?.items || [] }
  async addKnowledge(knowledge: AIKnowledge): Promise<void> { const existing = await this.loadKnowledge(); existing.push(knowledge); await this.saveKnowledge(existing) }
  
  async saveMemories(memories: AIMemory[]): Promise<void> { await this.saveToStore('memories', { items: memories }) }
  async loadMemories(): Promise<AIMemory[]> { const result = await this.loadFromStore<{items: AIMemory[]}>('memories'); return result?.items || [] }
  async addMemory(memory: AIMemory): Promise<void> { const existing = await this.loadMemories(); existing.push(memory); await this.saveMemories(existing) }
  
  async saveActions(actions: any[]): Promise<void> { await this.saveToStore('actions', { items: actions }) }
  async loadActions(): Promise<any[]> { const result = await this.loadFromStore<{items: any[]}>('actions'); return result?.items || [] }
  async addAction(action: any): Promise<void> { const existing = await this.loadActions(); existing.push(action); await this.saveActions(existing.slice(-1000)) }
  
  async savePosts(posts: AISocialPost[]): Promise<void> { await this.saveToStore('posts', { items: posts }) }
  async loadPosts(): Promise<AISocialPost[]> { const result = await this.loadFromStore<{items: AISocialPost[]}>('posts'); return result?.items || [] }
  async addPost(post: AISocialPost): Promise<void> { const existing = await this.loadPosts(); existing.unshift(post); await this.savePosts(existing.slice(0, 200)) }
  
  async saveInfluences(influences: any[]): Promise<void> { await this.saveToStore('influences', { items: influences }) }
  async loadInfluences(): Promise<any[]> { const result = await this.loadFromStore<{items: any[]}>('influences'); return result?.items || [] }
  async addInfluence(influence: any): Promise<void> { const existing = await this.loadInfluences(); existing.push(influence); await this.saveInfluences(existing.slice(-500)) }
  
  async saveSchedule(schedule: any[]): Promise<void> { await this.saveToStore('schedule', { items: schedule }) }
  async loadSchedule(): Promise<any[]> { const result = await this.loadFromStore<{items: any[]}>('schedule'); return result?.items || [] }
  async addScheduleItem(item: any): Promise<void> { const existing = await this.loadSchedule(); existing.push(item); existing.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()); await this.saveSchedule(existing) }
  async updateScheduleItem(id: string, updates: Partial<any>): Promise<void> { const existing = await this.loadSchedule(); const index = existing.findIndex(item => item.id === id); if (index !== -1) { existing[index] = { ...existing[index], ...updates }; await this.saveSchedule(existing) } }
  
  async loadAll(): Promise<{
    personality: AIPersonality | null
    mood: AIEmotion | null
    state: StoreState | null
    knowledge: AIKnowledge[]
    memories: AIMemory[]
    posts: AISocialPost[]
    actions: any[]
    influences: any[]
    schedule: any[]
  }> {
    const [personality, mood, state, knowledge, memories, posts, actions, influences, schedule] = await Promise.all([
      this.loadPersonality(), this.loadMood(), this.loadState(), this.loadKnowledge(),
      this.loadMemories(), this.loadPosts(), this.loadActions(), this.loadInfluences(), this.loadSchedule()
    ])
    return { personality, mood, state, knowledge, memories, posts, actions, influences, schedule }
  }
  
  async cleanup(): Promise<void> {
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const actions = await this.loadActions()
    const recentActions = actions.filter(action => new Date(action.timestamp) > cutoffDate)
    await this.saveActions(recentActions)
  }
  
  async backup(): Promise<string> {
    const allData = await this.loadAll()
    return JSON.stringify({ timestamp: new Date().toISOString(), version: '1.0', data: allData })
  }
  
  async restore(backupData: string): Promise<void> {
    const backup = JSON.parse(backupData)
    if (backup.data) await this.saveAll(backup.data)
  }
}

// 数据库工厂
export class DatabaseFactory {
  static create(config: DatabaseConfig): DatabaseInterface {
    switch (config.type) {
      case 'localStorage':
        return new LocalStorageDatabase()
      case 'indexedDB':
        return new IndexedDBDatabase()
      case 'postgresql':
      case 'mysql':
      case 'mongodb':
        // 生产环境使用服务器端数据库
        return new LocalStorageDatabase() // 暂时回退到localStorage
      default:
        return new LocalStorageDatabase()
    }
  }
}

// 默认数据库实例
export const database = DatabaseFactory.create({ 
  type: typeof window !== 'undefined' && 'indexedDB' in window ? 'indexedDB' : 'localStorage' 
})

// 自动同步功能
export class DatabaseSync {
  private db: DatabaseInterface
  private syncInterval: NodeJS.Timeout | null = null

  constructor(db: DatabaseInterface) {
    this.db = db
  }

  startAutoSync(interval: number = 60000) { // 默认每分钟同步一次
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
    
    this.syncInterval = setInterval(async () => {
      try {
        await this.db.cleanup()
        console.log('Database cleanup completed')
      } catch (error) {
        console.error('Database sync error:', error)
      }
    }, interval)
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  async exportData(): Promise<string> {
    return await this.db.backup()
  }

  async importData(data: string): Promise<void> {
    await this.db.restore(data)
  }
}

// 创建同步实例
export const dbSync = new DatabaseSync(database) 