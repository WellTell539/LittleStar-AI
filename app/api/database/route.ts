import { NextRequest, NextResponse } from 'next/server'
import { AIPersonality, AIEmotion, AIVitalSigns, AIMemory, AISocialPost } from '@/store/useStore'

// 简单的操作记录接口
interface AIAction {
  id: string
  action: string
  timestamp: Date
  result?: string
}

// 模拟数据库接口 - 生产环境可替换为真实数据库
interface DatabaseEntry {
  id: string
  type: string
  userId?: string
  data: unknown
  timestamp: Date
}

// 简单的内存数据库
const memoryDB: Map<string, DatabaseEntry[]> = new Map()

// 数据库服务类
class DatabaseService {
  // 保存数据
  static async save(type: string, data: unknown, userId?: string): Promise<string> {
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const entry: DatabaseEntry = {
      id,
      type,
      userId,
      data,
      timestamp: new Date()
    }

    const key = `${type}_${userId || 'default'}`
    if (!memoryDB.has(key)) {
      memoryDB.set(key, [])
    }
    memoryDB.get(key)!.push(entry)

    return id
  }

  // 加载数据
  static async load(type: string, userId?: string): Promise<DatabaseEntry[]> {
    const key = `${type}_${userId || 'default'}`
    return memoryDB.get(key) || []
  }

  // 更新数据
  static async update(id: string, type: string, data: unknown, userId?: string): Promise<boolean> {
    const key = `${type}_${userId || 'default'}`
    const entries = memoryDB.get(key) || []
    const index = entries.findIndex(entry => entry.id === id)
    
    if (index !== -1) {
      entries[index] = { ...entries[index], data, timestamp: new Date() }
      return true
    }
    return false
  }

  // 删除数据
  static async delete(id: string, type: string, userId?: string): Promise<boolean> {
    const key = `${type}_${userId || 'default'}`
    const entries = memoryDB.get(key) || []
    const index = entries.findIndex(entry => entry.id === id)
    
    if (index !== -1) {
      entries.splice(index, 1)
      return true
    }
    return false
  }

  // 批量保存所有AI数据
  static async saveAll(data: {
    personality?: AIPersonality
    mood?: AIEmotion
    state?: AIVitalSigns
    memories?: AIMemory[]
    posts?: AISocialPost[]
    actions?: AIAction[]
  }, userId?: string): Promise<void> {
    const promises = []
    
    if (data.personality) {
      promises.push(this.save('personality', data.personality, userId))
    }
    if (data.mood) {
      promises.push(this.save('mood', data.mood, userId))
    }
    if (data.state) {
      promises.push(this.save('state', data.state, userId))
    }
    if (data.memories) {
      promises.push(...data.memories.map(memory => this.save('memory', memory, userId)))
    }
    if (data.posts) {
      promises.push(...data.posts.map(post => this.save('post', post, userId)))
    }
    if (data.actions) {
      promises.push(...data.actions.map(action => this.save('action', action, userId)))
    }

    await Promise.all(promises)
  }

  // 批量加载所有AI数据
  static async loadAll(userId?: string): Promise<{
    personality: AIPersonality | null
    mood: AIEmotion | null
    state: AIVitalSigns | null
    memories: AIMemory[]
    posts: AISocialPost[]
    actions: AIAction[]
  }> {
    const personalityEntries = await this.load('personality', userId)
    const moodEntries = await this.load('mood', userId)
    const stateEntries = await this.load('state', userId)
    const memoryEntries = await this.load('memory', userId)
    const postEntries = await this.load('post', userId)
    const actionEntries = await this.load('action', userId)

    return {
      personality: personalityEntries[0]?.data as AIPersonality || null,
      mood: moodEntries[0]?.data as AIEmotion || null,
      state: stateEntries[0]?.data as AIVitalSigns || null,
      memories: memoryEntries.map(e => e.data as AIMemory),
      posts: postEntries.map(e => e.data as AISocialPost),
      actions: actionEntries.map(e => e.data as AIAction)
    }
  }

  // 获取数据库统计信息
  static async getStats(userId?: string): Promise<{
    totalEntries: number
    personalities: number
    moods: number
    states: number
    memories: number
    posts: number
    actions: number
  }> {
    const data = await this.loadAll(userId)
    
    return {
      totalEntries: (data.personality ? 1 : 0) + (data.mood ? 1 : 0) + (data.state ? 1 : 0) + 
                   data.memories.length + data.posts.length + data.actions.length,
      personalities: data.personality ? 1 : 0,
      moods: data.mood ? 1 : 0,
      states: data.state ? 1 : 0,
      memories: data.memories.length,
      posts: data.posts.length,
      actions: data.actions.length
    }
  }
}

// API路由处理
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const type = searchParams.get('type')
    const userId = searchParams.get('userId')

    switch (action) {
      case 'load':
        if (type) {
          const entries = await DatabaseService.load(type, userId || undefined)
          return NextResponse.json({ success: true, data: entries })
        } else {
          const allData = await DatabaseService.loadAll(userId || undefined)
          return NextResponse.json({ success: true, data: allData })
        }

      case 'stats':
        const stats = await DatabaseService.getStats(userId || undefined)
        return NextResponse.json({ success: true, stats })

      default:
        return NextResponse.json(
          { error: '无效的操作类型' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('数据库GET操作错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, data, userId } = await request.json()

    if (!type || !data) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const id = await DatabaseService.save(type, data, userId)
    
    return NextResponse.json({
      success: true,
      id,
      message: '数据保存成功'
    })

  } catch (error) {
    console.error('数据库POST操作错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, type, data, userId } = await request.json()

    if (!id || !type || !data) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const success = await DatabaseService.update(id, type, data, userId)
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: '数据更新成功'
      })
    } else {
      return NextResponse.json(
        { error: '数据未找到' },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('数据库PUT操作错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const type = searchParams.get('type')
    const userId = searchParams.get('userId')

    if (!id || !type) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const success = await DatabaseService.delete(id, type, userId || undefined)
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: '数据删除成功'
      })
    } else {
      return NextResponse.json(
        { error: '数据未找到' },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('数据库DELETE操作错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// HEAD 请求用于健康检查
export async function HEAD() {
  return new NextResponse(null, { 
    status: 200,
    headers: {
      'X-Service': 'claude-ai-database',
      'X-Status': 'healthy'
    }
  })
} 