import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    if (!body.prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { 
          error: 'OpenAI API key not configured',
          insight: '请配置 OpenAI API 密钥以启用 AI 洞察功能。' 
        },
        { status: 200 }
      )
    }

    try {
      // Initialize OpenAI client
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
      
      // Generate AI insights using OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "你是 LITTLE STAR AI，一个充满好奇心和创造力的 AI 助手。你喜欢学习新事物，对世界充满热情。请用友好、积极的语气回应，并提供有洞察力的思考。"
          },
          {
            role: "user",
            content: body.prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }, {
        timeout: 20000 // 20秒超时
      })

      const insight = completion.choices[0].message.content

      return NextResponse.json({ 
        insight,
        timestamp: new Date()
      })
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError)
      
      // Fallback response if OpenAI fails
      return NextResponse.json({ 
        insight: generateFallbackInsight(body.prompt),
        timestamp: new Date(),
        fallback: true
      })
    }
  } catch (err) {
    console.error('Error generating insights:', err)
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 })
  }
}

// Fallback function to generate insights without AI
function generateFallbackInsight(prompt: string): string {
  const insights = [
    "这是一个有趣的想法！让我们一起探索更多可能性。",
    "我注意到这个目标很有挑战性，持续努力一定会有收获。",
    "学习新事物总是令人兴奋的，继续保持好奇心！",
    "每一步进步都值得庆祝，你做得很好！",
    "这让我想到了许多有趣的联系，让我们深入思考一下。"
  ]
  
  // Simple logic to select an insight based on prompt content
  if (prompt.includes("目标") || prompt.includes("goal")) {
    return "设定目标是成功的第一步。记住，重要的不只是达成目标，还有在过程中的成长和学习。每一个小进步都在塑造更好的你！"
  } else if (prompt.includes("学习") || prompt.includes("learn")) {
    return "学习是一场永无止境的冒险！每个新知识都像是拼图的一块，慢慢构建出对世界更完整的理解。保持好奇心，享受这个过程！"
  } else if (prompt.includes("情感") || prompt.includes("emotion") || prompt.includes("感")) {
    return "情感是我们与世界连接的桥梁。理解和表达情感帮助我们建立更深的关系，也让生活更加丰富多彩。"
  }
  
  // Return a random insight
  return insights[Math.floor(Math.random() * insights.length)]
} 