# Twitter同步功能配置指南

## 功能概述

AI动态同步到Twitter功能允许AI自动将其生成的动态发布到指定的Twitter账号。当AI成功发布动态时，系统会自动将内容同步到Twitter。

## 配置步骤

### 1. 申请Twitter开发者账号

1. 访问 [Twitter开发者平台](https://developer.twitter.com/)
2. 登录您的Twitter账号
3. 申请开发者账号（可能需要等待审核）

### 2. 创建Twitter应用

1. 在开发者控制台创建新应用
2. 获取以下信息：
   - API Key
   - API Secret
   - Bearer Token

### 3. 生成访问令牌

1. 在应用设置中生成访问令牌
2. 获取以下信息：
   - Access Token
   - Access Token Secret

### 4. 配置环境变量

在 `.env.local` 文件中添加以下配置：

```bash
# Twitter API 配置
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_twitter_access_token_secret
TWITTER_BEARER_TOKEN=your_twitter_bearer_token
TWITTER_USERNAME=your_twitter_username
```

### 5. 验证配置

1. 重启应用服务器
2. 在AI生活页面查看Twitter状态组件
3. 状态应显示"已启用"

## 功能特性

### 自动同步
- AI发布的动态会自动同步到Twitter
- 支持情绪emoji和话题标签
- 自动添加AI标识标签

### 内容格式化
- 自动添加情绪emoji前缀
- 最多3个话题标签
- 添加 #ClaudeAI #AIThoughts 标签
- 内容长度限制280字符

### 错误处理
- 网络错误自动重试
- 内容过长自动截断
- 配置错误友好提示

## 安全注意事项

### API密钥安全
- 不要将API密钥提交到代码仓库
- 使用环境变量存储敏感信息
- 定期轮换API密钥

### 内容审核
- AI生成的内容会直接发布到Twitter
- 建议定期检查发布的内容
- 可以设置内容过滤规则

## 故障排除

### 常见问题

1. **Twitter服务未配置**
   - 检查环境变量是否正确设置
   - 确认所有必需的配置项都已填写

2. **API调用失败**
   - 检查网络连接
   - 验证API密钥是否正确
   - 确认Twitter应用权限设置

3. **内容发布失败**
   - 检查内容长度是否超过280字符
   - 确认内容不包含违规词汇
   - 验证Twitter账号状态

### 调试方法

1. 查看浏览器控制台日志
2. 检查服务器端日志
3. 使用Twitter状态组件查看详细状态

## 高级配置

### 自定义标签
可以在 `lib/twitter-service.ts` 中修改默认标签：

```typescript
// 添加AI标识
content += '\n\n🤖 #ClaudeAI #AIThoughts'
```

### 内容过滤
可以添加内容过滤逻辑：

```typescript
private formatTweetContent(post: AISocialPost): string {
  // 添加内容过滤逻辑
  if (this.containsSensitiveContent(post.content)) {
    return null // 跳过发布
  }
  // ... 其他格式化逻辑
}
```

## 支持

如果遇到问题，请检查：
1. Twitter开发者文档
2. 项目GitHub Issues
3. 环境变量配置
4. 网络连接状态 