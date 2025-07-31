#!/usr/bin/env node
/**
 * 环境变量配置脚本
 * 创建预配置的.env.local文件
 */

const fs = require('fs');
const path = require('path');

const envContent = `# Claude AI Dashboard 环境变量配置 (预配置版本)
# 基于用户提供的API密钥自动生成

# ==================== AI API 配置 ====================
# OpenAI API 密钥 (已预配置)
OPENAI_API_KEY=sk-your-actual-api-key-here

# 新闻API密钥 (已预配置)
NEXT_PUBLIC_NEWS_API_KEY=your-news-api-key-here

# ==================== 区块链配置 ====================
# 选择区块链网络: "ethereum" 或 "solana"
BLOCKCHAIN_NETWORK=solana

# === Solana配置 (默认使用Solana) ===
# Solana网络配置
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_WS_URL=wss://api.devnet.solana.com

# Solana程序ID（部署后由脚本自动填写）
CLAUDE_MINI_SBT_PROGRAM_ID=
MEMORY_ANCHOR_PROGRAM_ID=
GOAL_DAO_PROGRAM_ID=

# 前端Solana配置（浏览器可访问）
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_CLAUDE_MINI_SBT_PROGRAM_ID=
NEXT_PUBLIC_MEMORY_ANCHOR_PROGRAM_ID=
NEXT_PUBLIC_GOAL_DAO_PROGRAM_ID=
NEXT_PUBLIC_BLOCKCHAIN_NETWORK=solana

# Solana钱包配置（部署脚本自动生成）
SOLANA_WALLET_PRIVATE_KEY=

# ==================== 智能合约地址 ====================
# 部署后自动填入，开发时可留空
NEXT_PUBLIC_SOULBOUND_ADDRESS=
NEXT_PUBLIC_MEMORY_ANCHOR_ADDRESS=
NEXT_PUBLIC_GOAL_DAO_ADDRESS=

# ==================== 外部服务 ====================
# 数据库连接 (配置脚本自动填写)
DATABASE_URL=

# ==================== 应用设置 ====================
# API 基础地址
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api

# 功能开关
NEXT_PUBLIC_ENABLE_WEB3=true
NEXT_PUBLIC_ENABLE_AI_INSIGHTS=true
NEXT_PUBLIC_ENABLE_VOICE=true
NEXT_PUBLIC_ENABLE_BLOCKCHAIN_STORAGE=true

# 调试模式
NEXT_PUBLIC_DEBUG_MODE=false

# ==================== Twitter API 配置 ====================
# Twitter API v2 配置 (配置脚本将指导获取)
# 获取: https://developer.twitter.com/en/portal/dashboard
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_TOKEN_SECRET=
TWITTER_BEARER_TOKEN=
TWITTER_USERNAME=

# ==================== 快速开始 ====================
# 🚀 一键启动 (推荐)
# 1. 运行配置: npm run setup
# 2. 启动应用: npm run dev
# 3. 访问: http://localhost:3000

# 🔧 手动配置
# 1. 数据库: npm run setup:database
# 2. Solana: npm run setup:solana  
# 3. Twitter: npm run setup:twitter

# 📊 管理命令
# - 数据库备份: npm run db:backup
# - Solana状态: npm run solana:status
# - Twitter测试: npm run twitter:test
`;

const envPath = path.join(__dirname, '../.env.local');

try {
  // 检查是否已存在.env.local
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local 文件已存在');
    console.log('如需重新创建，请先删除现有文件：rm .env.local');
    process.exit(0);
  }

  // 创建.env.local文件
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ 已创建预配置的 .env.local 文件');
  console.log('📋 包含以下预配置内容:');
  console.log('   - OpenAI API 密钥');
  console.log('   - 新闻API 密钥');
  console.log('   - Solana 网络配置');
  console.log('   - 基础应用设置');
  console.log('');
  console.log('🚀 下一步:');
  console.log('   npm run dev  # 立即启动应用');
  console.log('   npm run setup  # 完整配置所有功能');
  
} catch (error) {
  console.error('❌ 创建环境文件失败:', error.message);
  process.exit(1);
}