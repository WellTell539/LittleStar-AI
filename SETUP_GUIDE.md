# 🚀 LITTLE STAR AI AI Dashboard - 设置指南

## 📋 快速启动检查清单

### ✅ 基础要求
- [ ] Node.js 18+ 已安装
- [ ] npm 或 yarn 已安装
- [ ] 项目依赖已安装 (`npm install`)

### 🔑 必需配置（启用真实AI功能）
- [ ] OpenAI API密钥已配置
- [ ] 环境变量文件已创建

### 🌐 可选配置（完整功能）
- [ ] Web3功能配置（Infura等）
- [ ] 数据库配置（生产环境）

## 🔧 详细配置步骤

### 1. 环境变量配置

#### 创建环境文件
```bash
# 复制环境变量模板
cp env.example .env.local
```

#### 配置OpenAI API密钥 (必需)
1. 访问 [OpenAI平台](https://platform.openai.com/api-keys)
2. 登录并创建新的API密钥
3. 在 `.env.local` 文件中设置：
```env
OPENAI_API_KEY=sk-your-actual-api-key-here
```

⚠️ **重要**: 没有此密钥，AI将使用模拟响应，无法体验真实的情感AI功能。

### 2. 验证配置

#### 启动开发服务器
```bash
npm run dev
```

#### 检查AI服务状态
1. 打开浏览器访问 `http://localhost:3000`
2. 查看右上角AI状态指示器
3. 进入"聊天"页面测试AI响应

#### 状态指示器说明
- 🟢 **绿色**: 真实AI服务已启用
- 🟡 **黄色**: 使用模拟AI响应
- 🔴 **红色**: 服务错误

### 3. 功能验证

#### 测试AI情感模拟
1. 在聊天中发送: "你现在心情怎么样？"
2. 观察AI的个性化回应
3. 注意AI情绪状态的变化

#### 测试数据持久化
1. 与AI对话几轮
2. 刷新页面
3. 检查对话历史是否保留

#### 测试高级功能
1. 查看"洞察"页面的AI分析
2. 设置AI目标并观察执行
3. 查看AI的记忆和社交动态

## 🌟 高级配置

### Web3功能配置（可选）

#### 获取Infura密钥
1. 访问 [Infura](https://infura.io/dashboard)
2. 创建新项目
3. 获取项目ID

#### 配置Web3
```env
NEXT_PUBLIC_INFURA_KEY=your_infura_project_id
NEXT_PUBLIC_ENABLE_WEB3=true
```

### 生产环境数据库（可选）

#### PostgreSQL配置
```env
DATABASE_URL=postgresql://username:password@localhost:5432/claude_ai
```

#### 部署到云服务
支持部署到：
- Vercel (推荐)
- Netlify
- Railway
- 自有服务器

## 🛠️ 故障排除

### 常见问题

#### 1. AI没有响应
**症状**: 聊天后没有AI回复

**解决方案**:
```bash
# 检查控制台错误
# 在浏览器开发者工具中查看Console

# 检查API密钥
echo $OPENAI_API_KEY

# 重启开发服务器
npm run dev
```

#### 2. 配置文件不生效
**症状**: 环境变量没有被读取

**解决方案**:
```bash
# 确保文件名正确
ls -la | grep env

# 文件应该叫 .env.local (不是 .env)
# 重启开发服务器
```

#### 3. 数据不持久化
**症状**: 刷新页面后数据丢失

**解决方案**:
- 检查浏览器是否启用localStorage
- 清除浏览器缓存
- 检查浏览器隐私设置

#### 4. OpenAI API额度不足
**症状**: API调用失败

**解决方案**:
1. 检查OpenAI账户余额
2. 升级OpenAI计划
3. 暂时使用模拟模式

### 调试技巧

#### 启用调试模式
```env
NEXT_PUBLIC_DEBUG_MODE=true
```

#### 查看详细日志
```bash
# 开发环境
npm run dev

# 查看浏览器控制台
# 查看Network标签页的API请求
```

#### 重置所有数据
在浏览器控制台执行：
```javascript
// 清除所有AI数据
Object.keys(localStorage)
  .filter(key => key.startsWith('claude_ai_'))
  .forEach(key => localStorage.removeItem(key))

// 刷新页面
location.reload()
```

## 📊 性能优化

### 客户端优化
- 定期清理旧数据
- 限制记忆和对话历史数量
- 使用浏览器缓存

### API调用优化
- 合理设置AI响应长度
- 避免频繁的API调用
- 实现请求缓存

## 🔒 安全注意事项

### API密钥安全
- 永远不要提交API密钥到版本控制
- 使用环境变量存储敏感信息
- 定期轮换API密钥

### 数据隐私
- AI对话可能会发送到OpenAI
- 不要在对话中包含敏感信息
- 了解OpenAI的数据使用政策

## 📈 使用建议

### 最佳实践
1. **定期与AI交流**: 帮助AI建立更丰富的人格
2. **设置有意义的目标**: 观察AI的学习和成长
3. **观察情绪变化**: 体验AI的情感演化
4. **备份重要数据**: 定期导出AI记忆和设置

### 探索建议
1. 尝试不同类型的对话主题
2. 测试AI在不同情绪状态下的反应
3. 观察AI的学习进度和兴趣发展
4. 参与Web3功能（如果已配置）

## 🎯 下一步

配置完成后，你可以：

1. **开始对话**: 与你的AI伙伴建立联系
2. **设置目标**: 为AI规划学习和成长路径
3. **观察演化**: 见证AI人格的发展
4. **分享体验**: 与社区分享你的AI故事

## 📞 获取帮助

如果遇到问题：

1. 查看 [项目文档](./PROJECT_GUIDE.md)
2. 检查 [API参考](./API_REFERENCE.md)
3. 查看 [部署指南](./DEPLOYMENT.md)
4. 提交GitHub Issue

---

**祝你与AI伙伴的旅程愉快！** 🤖✨ 