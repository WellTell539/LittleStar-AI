import { AISocialPost } from '@/store/useStore'

export interface TwitterConfig {
  apiKey: string
  apiSecret: string
  accessToken: string
  accessTokenSecret: string
  bearerToken: string
  username: string
}

export interface TwitterPostResult {
  success: boolean
  tweetId?: string
  error?: string
  url?: string
}

class TwitterService {
  private config: TwitterConfig | null = null
  private isEnabled: boolean = false

  constructor() {
    this.loadConfig()
  }

  private loadConfig() {
    // 从环境变量加载Twitter配置
    const config: TwitterConfig = {
      apiKey: process.env.TWITTER_API_KEY || '',
      apiSecret: process.env.TWITTER_API_SECRET || '',
      accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
      accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || '',
      bearerToken: process.env.TWITTER_BEARER_TOKEN || '',
      username: process.env.TWITTER_USERNAME || ''
    }

    // 检查是否所有必要的配置都存在
    this.isEnabled = !!(config.apiKey && config.apiSecret && config.accessToken && config.accessTokenSecret)
    this.config = config

    if (this.isEnabled) {
      console.log('✅ Twitter服务已启用')
    } else {
      console.debug('⚠️ Twitter服务未配置，跳过Twitter同步')
    }
  }

  /**
   * 将AI动态发布到Twitter
   */
  async postToTwitter(socialPost: AISocialPost): Promise<TwitterPostResult> {
    if (!this.isEnabled || !this.config) {
      return {
        success: false,
        error: 'Twitter服务未启用或配置不完整'
      }
    }

    try {
      // 格式化推文内容
      const tweetContent = this.formatTweetContent(socialPost)
      
      // 检查内容长度（Twitter限制280字符）
      if (tweetContent.length > 280) {
        return {
          success: false,
          error: `推文内容过长: ${tweetContent.length}/280字符`
        }
      }

      // 调用Twitter API发布推文
      const response = await this.postTweet(tweetContent)
      
      if (response.success && response.tweetId) {
        const tweetUrl = `https://twitter.com/${this.config.username}/status/${response.tweetId}`
        console.log(`✅ 动态已同步到Twitter: ${tweetUrl}`)
        
        return {
          success: true,
          tweetId: response.tweetId,
          url: tweetUrl
        }
      } else {
        return {
          success: false,
          error: response.error || 'Twitter发布失败'
        }
      }

    } catch (error) {
      console.error('Twitter发布错误:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '未知错误'
      }
    }
  }

  /**
   * 格式化推文内容
   */
  private formatTweetContent(post: AISocialPost): string {
    let content = post.content

    // 添加情绪标签
    const moodEmoji = this.getMoodEmoji(post.mood)
    if (moodEmoji) {
      content = `${moodEmoji} ${content}`
    }

    // 添加话题标签
    if (post.tags && post.tags.length > 0) {
      const hashtags = post.tags
        .slice(0, 3) // 最多3个标签
        .map(tag => `#${tag.replace(/\s+/g, '')}`)
        .join(' ')
      
      if (hashtags) {
        content += `\n\n${hashtags}`
      }
    }

    // 添加AI标识
    content += '\n\n🤖 #ClaudeAI #AIThoughts'

    return content
  }

  /**
   * 获取情绪对应的emoji
   */
  private getMoodEmoji(mood: string): string {
    const moodEmojis: Record<string, string> = {
      happy: '😊',
      excited: '🎉',
      curious: '🤔',
      contemplative: '🧘',
      calm: '😌',
      sad: '😔',
      anxious: '😰',
      angry: '😤',
      playful: '😄',
      melancholy: '🌙'
    }
    return moodEmojis[mood] || '🤖'
  }

  /**
   * 调用Twitter API发布推文
   */
  private async postTweet(content: string): Promise<TwitterPostResult> {
    if (!this.config) {
      return { success: false, error: 'Twitter配置不存在' }
    }

    try {
      // 使用Twitter API v2发布推文
      const response = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.bearerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: content
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Twitter API错误: ${errorData.detail || response.statusText}`)
      }

      const data = await response.json()
      
      return {
        success: true,
        tweetId: data.data.id
      }

    } catch (error) {
      console.error('Twitter API调用失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'API调用失败'
      }
    }
  }

  /**
   * 检查Twitter服务状态
   */
  getStatus(): { enabled: boolean; configured: boolean; username?: string } {
    return {
      enabled: this.isEnabled,
      configured: !!this.config,
      username: this.config?.username
    }
  }

  /**
   * 重新加载配置
   */
  reloadConfig() {
    this.loadConfig()
  }
}

// 创建单例实例
export const twitterService = new TwitterService()

// 导出便捷函数
export const postToTwitter = (socialPost: AISocialPost) => twitterService.postToTwitter(socialPost)
export const getTwitterStatus = () => twitterService.getStatus() 