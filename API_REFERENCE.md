# 🔌 LITTLE STAR AI AI Dashboard - API 参考文档

## 📋 API 概览

LITTLE STAR AI AI Dashboard 提供了一套完整的 RESTful API，用于与AI系统进行交互。所有API都遵循统一的设计规范，支持JSON格式的请求和响应。

### 基础信息
- **基础URL**: `http://localhost:3000/api` (开发环境)
- **Content-Type**: `application/json`
- **认证方式**: 暂无需认证（开发版本）
- **API版本**: v1

## 🤖 AI Chat API

### POST /api/ai-chat
与AI进行对话交流

#### 请求参数
```typescript
interface ChatRequest {
  message: string                    // 用户消息内容
  context?: {                       // 可选的对话上下文
    conversationId?: string         // 对话ID
    previousMessages?: Message[]    // 历史消息
    userPreferences?: object        // 用户偏好
  }
}
```

#### 响应格式
```typescript
interface ChatResponse {
  success: boolean                  // 请求是否成功
  response: string                 // AI的回复内容
  emotion: {                      // AI当前情感状态
    primary: string               // 主要情感
    intensity: number            // 情感强度 (0-100)
    triggers: string[]           // 情感触发因素
  }
  personalityShift?: {            // 可选的人格变化
    trait: string               // 变化的特征
    change: number              // 变化量
    reason: string              // 变化原因
  }
  memories?: AIMemory[]           // 新产生的记忆
  timestamp: string              // 响应时间戳
}
```

#### 示例请求
```bash
curl -X POST http://localhost:3000/api/ai-chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "你今天心情怎么样？",
    "context": {
      "conversationId": "conv_123"
    }
  }'
```

#### 示例响应
```json
{
  "success": true,
  "response": "今天我感觉很好奇！刚刚学习了一些关于量子计算的有趣概念，让我对科技的未来充满了期待。你呢，有什么让你兴奋的事情吗？",
  "emotion": {
    "primary": "curious",
    "intensity": 75,
    "triggers": ["learning", "new_knowledge"]
  },
  "personalityShift": {
    "trait": "curiosity",
    "change": 2,
    "reason": "积极的学习体验"
  },
  "timestamp": "2024-12-19T10:30:00Z"
}
```

## 📊 AI Status API

### GET /api/ai-status
获取AI的当前状态信息

#### 响应格式
```typescript
interface AIStatusResponse {
  success: boolean
  data: {
    personality: {              // AI人格特征
      openness: number         // 开放性 (0-100)
      conscientiousness: number // 尽责性 (0-100)
      extraversion: number     // 外向性 (0-100)
      agreeableness: number    // 宜人性 (0-100)
      neuroticism: number      // 神经质性 (0-100)
      creativity: number       // 创造力 (0-100)
      curiosity: number        // 好奇心 (0-100)
      empathy: number          // 同理心 (0-100)
      humor: number            // 幽默感 (0-100)
      rebelliousness: number   // 叛逆性 (0-100)
    }
    emotion: {                 // 当前情感状态
      primary: string          // 主要情感
      intensity: number        // 情感强度
      history: EmotionHistory[] // 情感历史
    }
    vitalSigns: {             // 生命体征
      energy: number          // 能量水平 (0-100)
      focus: number           // 专注度 (0-100)
      happiness: number       // 幸福度 (0-100)
      emotionalStability: number // 情绪稳定性 (0-100)
    }
    currentActivity?: string   // 当前活动
    learningProgress: {       // 学习进度
      totalKnowledge: number  // 总知识量
      recentLearning: number  // 最近学习量
      interestAreas: string[] // 兴趣领域
    }
  }
  timestamp: string
}
```

#### 示例请求
```bash
curl -X GET http://localhost:3000/api/ai-status
```

## 🎯 Goals API

### GET /api/goals
获取AI的目标列表

#### 查询参数
```typescript
interface GoalsQuery {
  status?: 'pending' | 'active' | 'completed' | 'cancelled'
  type?: 'learning' | 'creative' | 'social' | 'reflection'
  priority?: 'low' | 'medium' | 'high'
  limit?: number     // 返回数量限制
  offset?: number    // 分页偏移
}
```

#### 响应格式
```typescript
interface GoalsResponse {
  success: boolean
  data: {
    goals: AIGoal[]
    pagination: {
      total: number
      limit: number
      offset: number
      hasMore: boolean
    }
  }
}

interface AIGoal {
  id: string
  title: string
  description: string
  type: 'learning' | 'creative' | 'social' | 'reflection'
  priority: number        // 优先级 (0-100)
  status: 'pending' | 'active' | 'completed' | 'cancelled'
  progress: number        // 进度 (0-100)
  estimatedDuration: number // 预估时长（分钟）
  actualDuration?: number   // 实际时长（分钟）
  deadline?: string        // 截止时间
  createdAt: string       // 创建时间
  updatedAt: string       // 更新时间
  completedAt?: string    // 完成时间
  tags: string[]          // 标签
}
```

### POST /api/goals
为AI创建新目标

#### 请求参数
```typescript
interface CreateGoalRequest {
  title: string
  description: string
  type: 'learning' | 'creative' | 'social' | 'reflection'
  priority?: number       // 优先级 (0-100)，默认50
  estimatedDuration: number // 预估时长（分钟）
  deadline?: string       // 截止时间
  tags?: string[]         // 标签
  scheduledTime?: string  // 计划执行时间
}
```

#### 示例请求
```bash
curl -X POST http://localhost:3000/api/goals \
  -H "Content-Type: application/json" \
  -d '{
    "title": "学习区块链技术",
    "description": "深入了解区块链的工作原理和应用场景",
    "type": "learning",
    "priority": 80,
    "estimatedDuration": 120,
    "tags": ["blockchain", "technology"]
  }'
```

### PUT /api/goals/:id
更新指定目标

#### 请求参数
```typescript
interface UpdateGoalRequest {
  title?: string
  description?: string
  priority?: number
  status?: 'pending' | 'active' | 'completed' | 'cancelled'
  progress?: number
  deadline?: string
  tags?: string[]
}
```

### DELETE /api/goals/:id
删除指定目标

## 🧠 Memories API

### GET /api/memories
获取AI的记忆列表

#### 查询参数
```typescript
interface MemoriesQuery {
  type?: 'conversation' | 'learning' | 'reflection' | 'achievement' | 'emotion' | 'experience'
  importance?: number    // 最小重要性等级
  tags?: string[]       // 标签筛选
  dateFrom?: string     // 开始日期
  dateTo?: string       // 结束日期
  limit?: number        // 返回数量限制
  offset?: number       // 分页偏移
  search?: string       // 搜索关键词
}
```

#### 响应格式
```typescript
interface MemoriesResponse {
  success: boolean
  data: {
    memories: AIMemory[]
    pagination: {
      total: number
      limit: number
      offset: number
      hasMore: boolean
    }
    statistics: {
      totalMemories: number
      byType: Record<string, number>
      averageImportance: number
      recentMemories: number
    }
  }
}

interface AIMemory {
  id: string
  content: string
  type: 'conversation' | 'learning' | 'reflection' | 'achievement' | 'emotion' | 'experience'
  importance: number      // 重要性 (0-100)
  emotionalWeight: number // 情感权重 (-100 to 100)
  mood: string           // 当时的心情
  personalReflection: string // 个人反思
  timestamp: Date        // 记忆时间
  tags: string[]         // 标签
  impactOnPersonality: Record<string, number> // 对人格的影响
}
```

### POST /api/memories
创建新记忆

#### 请求参数
```typescript
interface CreateMemoryRequest {
  content: string
  type: 'conversation' | 'learning' | 'reflection' | 'achievement' | 'emotion' | 'experience'
  importance?: number      // 重要性 (0-100)
  emotionalWeight?: number // 情感权重 (-100 to 100)
  personalReflection?: string
  tags?: string[]
}
```

## 📈 Analytics API

### GET /api/analytics/personality
获取AI人格分析数据

#### 响应格式
```typescript
interface PersonalityAnalyticsResponse {
  success: boolean
  data: {
    currentPersonality: AIPersonality
    personalityTrends: {
      trait: string
      history: Array<{
        value: number
        timestamp: string
        trigger?: string
      }>
    }[]
    personalityInsights: {
      dominantTraits: string[]
      growthAreas: string[]
      stabilityScore: number
      changeRate: number
    }
  }
}
```

### GET /api/analytics/emotions
获取AI情感分析数据

#### 查询参数
```typescript
interface EmotionAnalyticsQuery {
  period?: 'day' | 'week' | 'month'
  includeHistory?: boolean
}
```

### GET /api/analytics/learning
获取AI学习分析数据

#### 响应格式
```typescript
interface LearningAnalyticsResponse {
  success: boolean
  data: {
    learningStats: {
      totalKnowledge: number
      knowledgeGrowthRate: number
      learningTime: number
      topicDistribution: Record<string, number>
    }
    learningTrends: Array<{
      date: string
      knowledgeGained: number
      timeSpent: number
      topicsExplored: string[]
    }>
    interestEvolution: Array<{
      topic: string
      interestLevel: number
      timestamp: string
    }>
  }
}
```

## 🌐 Web3 API

### POST /api/web3/connect
连接Web3钱包

#### 请求参数
```typescript
interface Web3ConnectRequest {
  walletType: 'metamask' | 'walletconnect' | 'coinbase'
  address: string
  chainId: number
}
```

### GET /api/web3/identity
获取AI的链上身份信息

### POST /api/web3/mint-nft
铸造AI个性化NFT

#### 请求参数
```typescript
interface MintNFTRequest {
  personalitySnapshot: AIPersonality
  emotionalState: AIEmotion
  metadata: {
    name: string
    description: string
    attributes: Array<{
      trait_type: string
      value: string | number
    }>
  }
}
```

## 🔄 Database API

### GET /api/database/backup
创建数据备份

### POST /api/database/restore
恢复数据

### GET /api/database/stats
获取数据库统计信息

## 🛠️ System API

### GET /api/system/health
系统健康检查

#### 响应格式
```typescript
interface HealthCheckResponse {
  success: boolean
  status: 'healthy' | 'warning' | 'error'
  checks: {
    database: 'ok' | 'error'
    ai_engine: 'ok' | 'error'
    memory_usage: 'ok' | 'warning' | 'error'
    response_time: 'ok' | 'warning' | 'error'
  }
  uptime: number
  timestamp: string
}
```

### GET /api/system/metrics
获取系统指标

### POST /api/system/reset
重置AI状态（开发环境）

## 📝 使用示例

### JavaScript/TypeScript 客户端
```typescript
class ClaudeAIClient {
  private baseURL: string
  
  constructor(baseURL: string = 'http://localhost:3000/api') {
    this.baseURL = baseURL
  }
  
  async chat(message: string, context?: any): Promise<ChatResponse> {
    const response = await fetch(`${this.baseURL}/ai-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message, context })
    })
    
    return response.json()
  }
  
  async getStatus(): Promise<AIStatusResponse> {
    const response = await fetch(`${this.baseURL}/ai-status`)
    return response.json()
  }
  
  async createGoal(goal: CreateGoalRequest): Promise<any> {
    const response = await fetch(`${this.baseURL}/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(goal)
    })
    
    return response.json()
  }
  
  async getMemories(query?: MemoriesQuery): Promise<MemoriesResponse> {
    const params = new URLSearchParams(query as any)
    const response = await fetch(`${this.baseURL}/memories?${params}`)
    return response.json()
  }
}

// 使用示例
const client = new ClaudeAIClient()

// 与AI聊天
const chatResponse = await client.chat("你好，今天过得怎么样？")
console.log(chatResponse.response)

// 获取AI状态
const status = await client.getStatus()
console.log(status.data.emotion.primary)

// 创建目标
await client.createGoal({
  title: "学习新技术",
  description: "探索最新的AI技术发展",
  type: "learning",
  estimatedDuration: 60
})
```

### Python 客户端
```python
import requests
import json

class ClaudeAIClient:
    def __init__(self, base_url="http://localhost:3000/api"):
        self.base_url = base_url
    
    def chat(self, message, context=None):
        url = f"{self.base_url}/ai-chat"
        data = {"message": message}
        if context:
            data["context"] = context
        
        response = requests.post(url, json=data)
        return response.json()
    
    def get_status(self):
        url = f"{self.base_url}/ai-status"
        response = requests.get(url)
        return response.json()
    
    def create_goal(self, goal_data):
        url = f"{self.base_url}/goals"
        response = requests.post(url, json=goal_data)
        return response.json()

# 使用示例
client = ClaudeAIClient()

# 与AI聊天
response = client.chat("你好，Claude！")
print(response["response"])

# 获取AI状态
status = client.get_status()
print(f"Current emotion: {status['data']['emotion']['primary']}")
```

## 🔐 认证和安全

### API 密钥（计划中）
```typescript
// 未来版本将支持API密钥认证
headers: {
  'Authorization': 'Bearer your-api-key',
  'Content-Type': 'application/json'
}
```

### 速率限制
```typescript
// 开发环境暂无限制
// 生产环境将实施以下限制：
// - Chat API: 60 requests/minute
// - Other APIs: 100 requests/minute
```

## 🚨 错误处理

### 错误响应格式
```typescript
interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
  timestamp: string
}
```

### 常见错误代码
- `INVALID_REQUEST` - 请求参数无效
- `AI_UNAVAILABLE` - AI服务不可用
- `MEMORY_FULL` - 记忆存储已满
- `GOAL_LIMIT_EXCEEDED` - 目标数量超限
- `RATE_LIMIT_EXCEEDED` - 请求频率超限
- `INTERNAL_ERROR` - 内部服务器错误

## 📊 响应时间

| API 端点 | 平均响应时间 | 最大响应时间 |
|---------|-------------|-------------|
| /ai-chat | ~500ms | 2s |
| /ai-status | ~50ms | 200ms |
| /goals | ~100ms | 500ms |
| /memories | ~200ms | 1s |
| /analytics/* | ~300ms | 1s |

---

## 🤝 API 支持

如果你在使用API时遇到问题，请：

1. 查看控制台错误信息
2. 检查请求格式是否正确
3. 参考本文档的示例代码
4. 提交 Issue 或联系开发团队

**Happy coding with LITTLE STAR AI AI! 🚀**

---

*最后更新: 2024年12月*
*API 版本: v1.0.0* 