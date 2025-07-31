// 数据同步服务 - 确保前端状态与数据库保持同步
import { databaseService } from './database-service'
import { StoreState } from '@/store/useStore'

export class DataSyncService {
  private static instance: DataSyncService
  private syncInterval: NodeJS.Timeout | null = null
  private isClient: boolean = false

  constructor() {
    this.isClient = typeof window !== 'undefined'
  }

  static getInstance(): DataSyncService {
    if (!DataSyncService.instance) {
      DataSyncService.instance = new DataSyncService()
    }
    return DataSyncService.instance
  }

  // 启动自动同步
  startAutoSync(getState: () => StoreState, setState: (state: Partial<StoreState>) => void) {
    if (!this.isClient) return

    // 首次同步 - 从数据库加载状态
    this.loadFromDatabase(setState)

    // 设置定期同步（每30秒）
    this.syncInterval = setInterval(() => {
      this.syncToDatabase(getState())
    }, 30000)

    // 监听页面关闭事件，保存数据
    window.addEventListener('beforeunload', () => {
      this.syncToDatabase(getState())
    })

    console.log('✅ 数据同步服务已启动')
  }

  // 停止自动同步
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  // 从数据库加载状态到前端
  async loadFromDatabase(setState: (state: Partial<StoreState>) => void) {
    try {
      console.log('📥 从数据库加载状态...')

      const [
        personality,
        emotion,
        vitalSigns,
        memories,
        knowledge,
        thoughts,
        goals,
        socialPosts
      ] = await Promise.all([
        databaseService.loadPersonality(),
        databaseService.loadEmotion(),
        databaseService.loadVitalSigns(),
        databaseService.loadMemories(),
        databaseService.loadKnowledge(),
        databaseService.loadThoughts(),
        databaseService.loadGoals(),
        databaseService.loadSocialPosts(),
        databaseService.loadConversationHistory()
      ])

      // 更新前端状态
      setState({
        aiPersonality: personality,
        currentEmotion: emotion,
        vitalSigns,
        memories,
        knowledge,
        thoughts,
        goals,
        socialPosts
      })

      console.log('✅ 状态加载完成')
    } catch (error) {
      console.error('❌ 加载状态失败:', error)
    }
  }

  // 同步前端状态到数据库
  async syncToDatabase(state: StoreState) {
    try {
      console.log('💾 同步状态到数据库...')

      await Promise.all([
        databaseService.savePersonality(state.aiPersonality),
        databaseService.saveEmotion(state.currentEmotion),
        databaseService.saveVitalSigns(state.vitalSigns),
        databaseService.saveMemories(state.memories),
        databaseService.saveKnowledge(state.knowledge),
        databaseService.saveThoughts(state.thoughts),
        databaseService.saveGoals(state.goals),
        databaseService.saveSocialPosts(state.socialPosts)
      ])

      console.log('✅ 状态同步完成')
    } catch (error) {
      console.error('❌ 同步状态失败:', error)
    }
  }

  // 立即同步特定数据
  async syncSpecific(dataType: string, data: any) {
    try {
      switch (dataType) {
        case 'emotion':
          await databaseService.saveEmotion(data)
          await databaseService.addEmotionRecord({
            timestamp: new Date(),
            emotion: data,
            trigger: 'state_change',
            context: '状态更新',
            intensity: data.intensity,
            duration: data.duration
          })
          break
        case 'memory':
          await databaseService.addMemory(data)
          break
        case 'knowledge':
          await databaseService.addKnowledge(data)
          break
        case 'thought':
          await databaseService.addThought(data)
          break
        case 'goal':
          await databaseService.addGoal(data)
          break
        case 'post':
          await databaseService.addSocialPost(data)
          break
        case 'personality':
          await databaseService.savePersonality(data)
          break
        case 'vitalSigns':
          await databaseService.saveVitalSigns(data)
          break
      }
      console.log(`✅ ${dataType} 已同步`)
    } catch (error) {
      console.error(`❌ ${dataType} 同步失败:`, error)
    }
  }

  // 监听状态变化并自动同步
  subscribeToStateChanges(store: any) {
    if (!this.isClient) return

    // 监听特定的状态变化
    const unsubscribers: (() => void)[] = []

    // 情绪变化
    unsubscribers.push(
      store.subscribe(
        (state: StoreState) => state.currentEmotion,
        (emotion: any) => this.syncSpecific('emotion', emotion),
        { fireImmediately: false }
      )
    )

    // 记忆添加
    unsubscribers.push(
      store.subscribe(
        (state: StoreState) => state.memories.length,
        () => {
          const state = store.getState()
          if (state.memories.length > 0) {
            this.syncSpecific('memory', state.memories[0])
          }
        },
        { fireImmediately: false }
      )
    )

    // 知识添加
    unsubscribers.push(
      store.subscribe(
        (state: StoreState) => state.knowledge.length,
        () => {
          const state = store.getState()
          if (state.knowledge.length > 0) {
            this.syncSpecific('knowledge', state.knowledge[0])
          }
        },
        { fireImmediately: false }
      )
    )

    // 社交动态
    unsubscribers.push(
      store.subscribe(
        (state: StoreState) => state.socialPosts.length,
        () => {
          const state = store.getState()
          if (state.socialPosts.length > 0) {
            this.syncSpecific('post', state.socialPosts[0])
          }
        },
        { fireImmediately: false }
      )
    )

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe())
    }
  }

  // 获取数据库使用情况
  getStorageStatus() {
    return databaseService.getStorageUsage()
  }

  // 清理旧数据
  async cleanupOldData() {
    await databaseService.cleanupOldData()
  }

  // 导出所有数据
  async exportData() {
    return await databaseService.exportAllData()
  }

  // 导入数据
  async importData(data: any) {
    await databaseService.importAllData(data)
  }
}

// 导出单例实例
export const dataSyncService = DataSyncService.getInstance() 