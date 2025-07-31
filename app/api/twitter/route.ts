import { NextRequest, NextResponse } from 'next/server'
import { twitterService } from '@/lib/twitter-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, mood, tags } = body

    if (!content) {
      return NextResponse.json(
        { success: false, error: '缺少推文内容' },
        { status: 400 }
      )
    }

    // 创建社交动态对象
    const socialPost = {
      id: `twitter-${Date.now()}`,
      content,
      type: 'thought' as const,
      timestamp: new Date(),
      mood: mood || 'calm',
      tags: tags || [],
      visibility: 'public' as const,
      reactions: {
        likes: 0,
        comments: [],
        shares: 0
      },
      authenticity: 100,
      spontaneous: true
    }

    // 发布到Twitter
    const result = await twitterService.postToTwitter(socialPost)

    if (result.success) {
      return NextResponse.json({
        success: true,
        tweetId: result.tweetId,
        url: result.url,
        message: '推文发布成功'
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Twitter API错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const status = twitterService.getStatus()
    
    return NextResponse.json({
      success: true,
      status,
      message: status.enabled ? 'Twitter服务已启用' : 'Twitter服务未配置'
    })
  } catch (error) {
    console.error('获取Twitter状态错误:', error)
    return NextResponse.json(
      { success: false, error: '获取状态失败' },
      { status: 500 }
    )
  }
} 