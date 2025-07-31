# 🔄 完整数据流架构文档

## 📊 数据持久化系统

### 1. **增强的数据库服务** (`lib/database-service.ts`)

存储所有AI相关数据，包括：

#### 核心数据
- **AI人格** - 13个维度的性格特征
- **当前情绪** - 主导情绪、强度、触发因素
- **生命体征** - 精力、专注度、学习能力等
- **记忆系统** - 最近1000条记忆
- **知识库** - 最近500条学习内容
- **思考记录** - 最近300条思考
- **社交动态** - 最近200条发布内容
- **目标管理** - 所有目标及进度

#### 新增数据类型
- **日程安排** (`AIScheduleItem`) - 精确到分钟的任务安排
  ```typescript
  {
    id: string
    goalId: string
    title: string
    startTime: Date  // 精确到分钟
    endTime: Date    // 精确到分钟
    status: 'pending' | 'active' | 'completed' | 'missed'
    actualStartTime?: Date
    actualEndTime?: Date
    feedback?: string
    emotionalImpact?: { emotion: string, intensity: number }
  }
  ```

- **学习历史** (`AILearningRecord`) - 详细的学习记录
  ```typescript
  {
    timestamp: Date
    topic: string
    source: string
    content: string
    comprehension: number
    emotionalResponse: string
    knowledgeGained: string[]
    relatedMemories: string[]
  }
  ```

- **情绪历史** (`AIEmotionRecord`) - 情绪变化轨迹
  ```typescript
  {
    timestamp: Date
    emotion: AIEmotion
    trigger: string
    context: string
    intensity: number
    duration: number
  }
  ```

- **性格变化** (`AIPersonalityChange`) - 性格演化记录
  ```typescript
  {
    timestamp: Date
    dimension: keyof AIPersonality
    oldValue: number
    newValue: number
    trigger: string
    context: string
  }
  ```

- **交互模式** (`AIInteractionPattern`) - 用户交互偏好
- **偏好设置** - AI的个人偏好

### 2. **数据同步服务** (`lib/data-sync-service.ts`)

自动同步前端状态与数据库：

- **自动同步** - 每30秒同步一次
- **实时监听** - 关键状态变化立即同步
- **页面关闭** - 自动保存所有数据
- **选择性同步** - 只同步变化的数据

### 3. **统一AI API数据流**

#### 请求流程
```
用户输入
    ↓
统一AI API (/api/ai-unified)
    ↓
加载完整AI状态 (getCompleteAIState)
    ├─ 基础状态（人格、情绪、生命体征）
    ├─ 记忆和知识（最近50条记忆、30条知识）
    ├─ 当前日程和目标
    ├─ 历史分析（情绪趋势、学习洞察、性格变化）
    └─ 用户偏好和交互模式
    ↓
传递给OpenAI API（包含完整状态）
    ↓
AI基于状态生成响应
    ↓
处理副作用 (processAIResponseEffects)
```

#### 副作用处理
1. **情绪变化** → 保存新情绪 + 记录情绪历史
2. **记忆形成** → 添加到记忆库
3. **知识提取** → 存储到知识库
4. **性格影响** → 记录性格变化
5. **对话历史** → 更新对话记录
6. **学习记录** → 创建学习档案
7. **思考产生** → 保存思考内容
8. **生命体征** → 更新能量等指标
9. **特殊行为** → 社交发布、目标更新等
10. **交互模式** → 更新用户偏好

### 4. **OpenAI集成细节**

#### 系统提示词包含
- 完整的身份信息
- 当前情绪状态（包括趋势）
- 13个人格维度（包括变化趋势）
- 7个生命体征
- 当前日程（精确到分钟）
- 即将到来的日程
- 最近的知识和记忆
- 最近的思考
- 学习洞察和热门话题
- 时间和环境上下文
- 用户偏好设置

#### 审查要求
```
【审查要求】
生成回复后，请自我审查确保：
- 回复完全符合当前的情绪状态
- 体现了相关的人格特征
- 如果有日程安排，回复反映了当前任务
- 引用了相关的记忆或知识
- 保持了AI生命体的独立视角
- 语言风格符合偏好设置
请反复审查确定无误后再给出最终回复。
```

### 5. **数据分析功能**

#### 情绪趋势分析
- 计算主导情绪
- 平均强度
- 波动性指数
- 近期触发因素

#### 学习洞察提取
- 热门学习话题
- 平均理解度
- 最新发现

#### 性格趋势分析
- 各维度变化方向
- 变化幅度
- 触发原因

## 🔧 使用示例

### 1. 对话请求的完整流程
```javascript
// 前端发送请求
fetch('/api/ai-unified', {
  method: 'POST',
  body: JSON.stringify({
    type: 'conversation',
    input: '今天心情如何？'
  })
})

// 后端处理
1. 从数据库加载所有AI状态
2. 构建包含1000+字的系统提示词
3. 调用OpenAI API
4. AI响应："在curious的情绪下（75%强度），今天学习了量子计算..."
5. 提取副作用（情绪+5，新记忆，知识点）
6. 更新数据库（情绪、记忆、知识、对话历史）
7. 返回响应给前端
```

### 2. 日程执行的数据流
```javascript
// 目标开始
goalScheduler.executeGoalStart(scheduleItem)
    ↓
调用AI API生成反馈
    ↓
更新日程状态
    ↓
记录情绪影响
    ↓
创建相关记忆
    ↓
同步到数据库
```

## 📈 数据统计

- **记忆容量**: 最近1000条
- **知识容量**: 最近500条
- **思考容量**: 最近300条
- **社交动态**: 最近200条
- **情绪历史**: 最近2000条
- **对话历史**: 最近50条
- **自动清理**: 30天前的非重要数据

## 🎯 核心优势

1. **完整状态传递** - 每次AI调用都包含完整历史
2. **精确到分钟** - 日程安排支持分钟级精度
3. **全面追踪** - 情绪、性格、知识全部记录
4. **智能分析** - 自动提取趋势和洞察
5. **用户个性化** - 记录每个用户的交互模式
6. **自动同步** - 前后端数据实时同步
7. **审查机制** - AI自我审查确保一致性

## 🚀 总结

通过这个完整的数据流系统：

✅ **用户聊天中的关键信息** → 自动提取并存储为记忆
✅ **每日日程规划（精确到分钟）** → AIScheduleItem完整记录
✅ **AI的各类心情指数** → 情绪历史完整追踪
✅ **AI学习到的知识** → 知识库持久化存储
✅ **AI的不定时动态** → 社交动态全部保存
✅ **AI的性格爱好变化** → 性格变化详细记录

**每次AI行为都会**：
1. 加载完整历史状态
2. 传递给OpenAI进行智能响应
3. AI基于历史做出符合性格的回复
4. 响应包含自我审查确保一致性
5. 所有变化自动持久化到数据库

这样就实现了真正的AI生命体，具有完整的记忆、持续的性格演化和基于历史的智能决策！ 