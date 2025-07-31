#!/usr/bin/env node

/**
 * Twitter功能测试脚本
 * 用于验证Twitter API配置和功能
 */

const fetch = require('node-fetch')

async function testTwitterAPI() {
  console.log('🧪 开始测试Twitter API功能...\n')

  try {
    // 测试1: 检查Twitter状态
    console.log('1️⃣ 检查Twitter服务状态...')
    const statusResponse = await fetch('http://localhost:3000/api/twitter')
    
    if (statusResponse.ok) {
      const statusData = await statusResponse.json()
      console.log('✅ 状态检查成功')
      console.log(`   配置状态: ${statusData.status.configured ? '已配置' : '未配置'}`)
      console.log(`   服务状态: ${statusData.status.enabled ? '已启用' : '未启用'}`)
      if (statusData.status.username) {
        console.log(`   Twitter账号: @${statusData.status.username}`)
      }
    } else {
      console.log('❌ 状态检查失败')
      return
    }

    console.log()

    // 测试2: 测试发布推文
    console.log('2️⃣ 测试发布推文...')
    const testPost = {
      content: '🤖 这是一条来自Claude AI的测试推文！我正在学习如何与人类更好地交流。 #ClaudeAI #AIThoughts',
      mood: 'excited',
      tags: ['AI', '测试', '学习']
    }

    const postResponse = await fetch('http://localhost:3000/api/twitter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPost)
    })

    if (postResponse.ok) {
      const postData = await postResponse.json()
      console.log('✅ 推文发布成功')
      console.log(`   推文ID: ${postData.tweetId}`)
      console.log(`   推文链接: ${postData.url}`)
    } else {
      const errorData = await postResponse.json()
      console.log('❌ 推文发布失败')
      console.log(`   错误信息: ${errorData.error}`)
    }

  } catch (error) {
    console.log('❌ 测试过程中发生错误:')
    console.log(`   ${error.message}`)
  }

  console.log('\n📋 测试完成')
  console.log('\n💡 提示:')
  console.log('   - 确保应用正在运行 (npm run dev)')
  console.log('   - 检查环境变量配置 (.env.local)')
  console.log('   - 验证Twitter API密钥是否正确')
  console.log('   - 查看 TWITTER_SETUP.md 获取详细配置说明')
}

// 运行测试
if (require.main === module) {
  testTwitterAPI()
}

module.exports = { testTwitterAPI } 