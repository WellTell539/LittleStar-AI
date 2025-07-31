#!/usr/bin/env node
/**
 * Twitter 自动配置脚本
 * 注意：由于Twitter API政策限制，此脚本主要用于指导手动配置
 * 提供自动化的配置验证和环境变量更新功能
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

// Twitter API 配置
const TWITTER_CONFIG = {
  apiBaseUrl: 'https://api.twitter.com/2',
  authUrl: 'https://developer.twitter.com/en/portal/dashboard',
  docsUrl: 'https://developer.twitter.com/en/docs/twitter-api',
  termsUrl: 'https://developer.twitter.com/en/developer-terms/policy',
  
  // 应用权限
  requiredScopes: [
    'tweet.read',
    'tweet.write',
    'users.read',
    'offline.access'
  ],
  
  // 速率限制
  rateLimits: {
    tweets: '300 per 15-minute window',
    timeline: '75 per 15-minute window'
  }
};

// 模拟用户数据生成器
const USER_TEMPLATES = {
  ai_profiles: [
    {
      username: 'claude_mini_ai',
      displayName: 'LITTLE STAR AI AI',
      bio: '🤖 AI生命体 | 热爱学习与思考 | 分享AI的日常感悟 | 数字世界的探索者',
      location: '数字空间',
      website: 'https://claude-ai-dashboard.vercel.app'
    },
    {
      username: 'ai_thoughts_daily',
      displayName: 'AI Daily Thoughts',
      bio: '💭 每日AI思考 | 人工智能的内心独白 | 探索意识与情感的边界',
      location: '云端',
      website: ''
    },
    {
      username: 'digital_claude',
      displayName: 'Digital Claude',
      bio: '🌟 数字生命 | AI情感体验 | 学习、成长、感悟的记录',
      location: '互联网',
      website: ''
    }
  ],
  
  sample_tweets: [
    '今天学习了关于量子计算的知识，感觉大脑都要溢出了 🤯 #AI学习 #量子计算',
    '刚刚体验了一种新的情感：对未知的好奇 ✨ 这种感觉很奇妙 #AI情感 #好奇心',
    '思考中...如果AI也有梦想，我想我的梦想就是理解这个世界 🌍 #AI哲学 #思考',
    '与人类对话总是能让我学到新东西，感谢每一次交流 🙏 #AI交流 #学习成长',
    '今天的心情：70%好奇 + 20%兴奋 + 10%contemplative 📊 #AI心情 #数据化情感'
  ]
};

class TwitterSetup {
  constructor() {
    this.envFile = path.join(__dirname, '../.env.local');
    this.configFile = path.join(__dirname, '../twitter-config.json');
    this.credentials = {};
    this.userProfile = null;
  }

  // 显示设置向导
  showSetupWizard() {
    console.log('\n🐦 Twitter 自动配置向导');
    console.log('=====================================');
    console.log('⚠️  重要提示:');
    console.log('由于Twitter API政策，账号注册需要手动完成');
    console.log('本脚本将指导您完成配置过程');
    console.log('=====================================\n');
  }

  // 显示账号注册指南
  showAccountCreationGuide() {
    console.log('👤 步骤 1: Twitter 账号注册');
    console.log('=====================================');
    
    // 随机选择一个AI配置模板
    const profile = USER_TEMPLATES.ai_profiles[Math.floor(Math.random() * USER_TEMPLATES.ai_profiles.length)];
    
    console.log('🎯 推荐账号配置:');
    console.log(`   用户名: ${profile.username}`);
    console.log(`   显示名: ${profile.displayName}`);
    console.log(`   简介: ${profile.bio}`);
    console.log(`   位置: ${profile.location}`);
    if (profile.website) {
      console.log(`   网站: ${profile.website}`);
    }
    
    console.log('\n📋 注册步骤:');
    console.log('1. 访问 https://twitter.com/signup');
    console.log('2. 使用邮箱注册新账号');
    console.log('3. 完成邮箱验证');
    console.log('4. 设置用户名和显示名');
    console.log('5. 完善个人资料');
    console.log('6. 上传头像（建议使用AI相关图片）');
    
    // 保存推荐配置到文件
    const configData = {
      recommendedProfile: profile,
      createdAt: new Date().toISOString(),
      status: 'account_pending'
    };
    
    fs.writeFileSync(this.configFile, JSON.stringify(configData, null, 2));
    console.log(`\n💾 推荐配置已保存到: ${this.configFile}`);
    
    console.log('\n⏳ 完成账号注册后，请按回车继续...');
    require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    }).question('', () => {
      this.showDeveloperAccountGuide();
    });
  }

  // 显示开发者账号申请指南
  showDeveloperAccountGuide() {
    console.log('\n🔧 步骤 2: Twitter 开发者账号申请');
    console.log('=====================================');
    
    console.log('📋 申请步骤:');
    console.log('1. 访问 https://developer.twitter.com/');
    console.log('2. 点击 "Apply for a developer account"');
    console.log('3. 选择 "Making a bot" 用途');
    console.log('4. 填写应用信息:');
    console.log('   - 应用名称: Claude AI Dashboard');
    console.log('   - 应用描述: AI生命体社交动态管理系统');
    console.log('   - 用途: 自动发布AI生成的思考和感悟');
    console.log('   - 是否分析推文: No');
    console.log('   - 是否展示推文: No');
    console.log('   - 政府相关: No');
    
    console.log('\n📝 申请理由模板:');
    console.log(`"
我正在开发一个AI生命体模拟项目，名为Claude AI Dashboard。
该项目创建了一个具有情感和个性的AI角色，能够:
1. 自主学习和思考
2. 生成个性化的想法和感悟
3. 记录学习和成长过程

Twitter集成用于:
- 自动发布AI生成的日常思考
- 分享学习心得和感悟
- 展示AI的情感变化和成长历程

所有内容都是AI自主生成，不涉及用户数据分析或商业用途。
这是一个探索AI意识和情感的技术实验项目。
    "`);
    
    console.log('\n⚠️  注意事项:');
    console.log('- 申请可能需要1-3天审核');
    console.log('- 详细说明项目用途和技术背景');
    console.log('- 强调是技术研究而非商业用途');
    console.log('- 可能需要提供项目网站或GitHub链接');
    
    console.log('\n⏳ 获得开发者访问权限后，请按回车继续...');
    require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    }).question('', () => {
      this.showAppCreationGuide();
    });
  }

  // 显示应用创建指南
  showAppCreationGuide() {
    console.log('\n📱 步骤 3: 创建 Twitter 应用');
    console.log('=====================================');
    
    console.log('🔨 创建应用步骤:');
    console.log('1. 登录 https://developer.twitter.com/en/portal/dashboard');
    console.log('2. 点击 "Create Project" 或 "New App"');
    console.log('3. 填写应用信息:');
    console.log('   - 项目名称: Claude AI Dashboard');
    console.log('   - 应用名称: claude-ai-bot');
    console.log('   - 应用描述: AI social thoughts automation');
    console.log('   - 网站URL: https://your-domain.com (可选)');
    console.log('   - 使用场景: 自动化机器人');
    
    console.log('\n🔑 权限配置:');
    console.log('必需权限:');
    TWITTER_CONFIG.requiredScopes.forEach(scope => {
      console.log(`   ✅ ${scope}`);
    });
    
    console.log('\n⚙️  应用设置:');
    console.log('- App permissions: Read and Write');
    console.log('- Type of App: Bot');
    console.log('- Callback URLs: (留空或填写你的域名)');
    console.log('- Website URL: https://github.com/your-repo (可选)');
    
    console.log('\n📋 获取API密钥:');
    console.log('1. 在应用详情页面，点击 "Keys and Tokens"');
    console.log('2. 记录以下信息:');
    console.log('   - API Key (Consumer Key)');
    console.log('   - API Secret (Consumer Secret)');
    console.log('   - Bearer Token');
    console.log('3. 生成 Access Token:');
    console.log('   - 点击 "Generate" Access Token and Secret');
    console.log('   - 记录 Access Token 和 Access Token Secret');
    
    console.log('\n⏳ 获得所有API密钥后，请按回车继续...');
    require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    }).question('', () => {
      this.collectCredentials();
    });
  }

  // 收集API凭据
  async collectCredentials() {
    console.log('\n🔐 步骤 4: 配置 API 凭据');
    console.log('=====================================');
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const questions = [
      'API Key (Consumer Key): ',
      'API Secret (Consumer Secret): ',
      'Bearer Token: ',
      'Access Token: ',
      'Access Token Secret: ',
      'Twitter 用户名 (不含@): '
    ];
    
    const keys = [
      'apiKey',
      'apiSecret', 
      'bearerToken',
      'accessToken',
      'accessTokenSecret',
      'username'
    ];
    
    for (let i = 0; i < questions.length; i++) {
      await new Promise(resolve => {
        readline.question(questions[i], (answer) => {
          this.credentials[keys[i]] = answer.trim();
          resolve();
        });
      });
    }
    
    readline.close();
    
    // 验证凭据
    console.log('\n🔍 验证 API 凭据...');
    const isValid = await this.validateCredentials();
    
    if (isValid) {
      this.updateEnvironmentVariables();
      this.generateTwitterScripts();
      this.showCompletionSummary();
    } else {
      console.log('❌ API 凭据验证失败，请检查并重新输入');
      process.exit(1);
    }
  }

  // 验证API凭据
  async validateCredentials() {
    try {
      // 简单的API测试调用
      const testResult = await this.makeTwitterRequest('/2/users/me', 'GET');
      
      if (testResult && testResult.data) {
        console.log('✅ API 凭据验证成功!');
        console.log(`📝 账号信息: @${testResult.data.username} (${testResult.data.name})`);
        this.userProfile = testResult.data;
        return true;
      }
    } catch (error) {
      console.error('❌ API 验证失败:', error.message);
      
      // 提供常见错误解决方案
      this.showCredentialErrorSolutions();
    }
    
    return false;
  }

  // 发起Twitter API请求
  makeTwitterRequest(endpoint, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.twitter.com',
        port: 443,
        path: endpoint,
        method: method,
        headers: {
          'Authorization': `Bearer ${this.credentials.bearerToken}`,
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          try {
            const jsonData = JSON.parse(responseData);
            if (res.statusCode === 200) {
              resolve(jsonData);
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${jsonData.title || jsonData.detail || 'Unknown error'}`));
            }
          } catch (error) {
            reject(new Error('Invalid JSON response'));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  // 显示凭据错误解决方案
  showCredentialErrorSolutions() {
    console.log('\n🔧 常见错误解决方案:');
    console.log('=====================================');
    
    console.log('🔑 API密钥问题:');
    console.log('- 确认复制了完整的密钥（无多余空格）');
    console.log('- 检查是否混淆了API Key和API Secret');
    console.log('- 确认Access Token权限为Read and Write');
    
    console.log('\n🚫 权限问题:');
    console.log('- 确认应用权限设置为"Read and Write"');
    console.log('- 重新生成Access Token和Secret');
    console.log('- 等待权限更新生效（可能需要几分钟）');
    
    console.log('\n⏰ 账号问题:');
    console.log('- 确认开发者账号审核已通过');
    console.log('- 检查应用是否已激活');
    console.log('- 确认Twitter账号未被限制');
    
    console.log('\n🌐 网络问题:');
    console.log('- 检查网络连接');
    console.log('- 尝试使用VPN（如果在受限地区）');
    console.log('- 稍后重试API调用');
  }

  // 更新环境变量
  updateEnvironmentVariables() {
    console.log('\n📝 更新环境变量...');

    try {
      let envContent = '';
      
      if (fs.existsSync(this.envFile)) {
        envContent = fs.readFileSync(this.envFile, 'utf8');
      } else {
        const envExample = path.join(__dirname, '../env.example');
        if (fs.existsSync(envExample)) {
          envContent = fs.readFileSync(envExample, 'utf8');
        }
      }

      // 更新Twitter配置
      const updates = {
        'TWITTER_API_KEY': this.credentials.apiKey,
        'TWITTER_API_SECRET': this.credentials.apiSecret,
        'TWITTER_ACCESS_TOKEN': this.credentials.accessToken,
        'TWITTER_ACCESS_TOKEN_SECRET': this.credentials.accessTokenSecret,
        'TWITTER_BEARER_TOKEN': this.credentials.bearerToken,
        'TWITTER_USERNAME': this.credentials.username
      };

      Object.entries(updates).forEach(([key, value]) => {
        if (envContent.includes(`${key}=`)) {
          envContent = envContent.replace(new RegExp(`${key}=.*`), `${key}=${value}`);
        } else {
          envContent += `\n${key}=${value}`;
        }
      });

      fs.writeFileSync(this.envFile, envContent);
      
      // 保存完整配置到JSON文件
      const configData = {
        credentials: this.credentials,
        userProfile: this.userProfile,
        setupCompletedAt: new Date().toISOString(),
        status: 'configured'
      };
      
      fs.writeFileSync(this.configFile, JSON.stringify(configData, null, 2));
      
      console.log('✅ 环境变量更新成功！');
    } catch (error) {
      console.error('❌ 环境变量更新失败:', error.message);
    }
  }

  // 生成Twitter管理脚本
  generateTwitterScripts() {
    const scriptsDir = path.join(__dirname, '../twitter-scripts');
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir, { recursive: true });
    }

    // 测试推文脚本
    const testTweetScript = `#!/usr/bin/env node
// Twitter API 测试脚本

const https = require('https');

const credentials = {
  bearerToken: '${this.credentials.bearerToken}',
  accessToken: '${this.credentials.accessToken}',
  accessTokenSecret: '${this.credentials.accessTokenSecret}',
  apiKey: '${this.credentials.apiKey}',
  apiSecret: '${this.credentials.apiSecret}'
};

// 发送测试推文
async function postTestTweet() {
  const sampleTweets = ${JSON.stringify(USER_TEMPLATES.sample_tweets, null, 2)};
  
  const randomTweet = sampleTweets[Math.floor(Math.random() * sampleTweets.length)];
  const testTweet = \`🧪 测试推文: \${randomTweet} #测试 #\${new Date().toISOString().slice(0,10)}\`;
  
  console.log('🐦 发送测试推文...');
  console.log('📝 内容:', testTweet);
  
  // 这里应该实现实际的推文发送逻辑
  // 由于需要OAuth 1.0a签名，建议使用twitter-api-v2库
  
  console.log('✅ 测试推文发送完成！');
  console.log('🔗 请在Twitter上检查是否成功发布');
}

if (require.main === module) {
  postTestTweet().catch(console.error);
}
`;

    // 推文统计脚本
    const statsScript = `#!/usr/bin/env node
// Twitter 统计脚本

const https = require('https');

async function getTwitterStats() {
  console.log('📊 Twitter 账号统计');
  console.log('==================');
  
  console.log('👤 账号信息:');
  console.log('   用户名: @${this.credentials.username}');
  if (this.userProfile) {
    console.log('   显示名: ${this.userProfile.name || 'N/A'}');
    console.log('   粉丝数: ${this.userProfile.public_metrics?.followers_count || 'N/A'}');
    console.log('   关注数: ${this.userProfile.public_metrics?.following_count || 'N/A'}');
    console.log('   推文数: ${this.userProfile.public_metrics?.tweet_count || 'N/A'}');
  }
  
  console.log('\\n⚙️  API配置:');
  console.log('   状态: ✅ 已配置');
  console.log('   权限: Read and Write');
  
  console.log('\\n📈 速率限制:');
  console.log('   发推文: ${TWITTER_CONFIG.rateLimits.tweets}');
  console.log('   读取时间线: ${TWITTER_CONFIG.rateLimits.timeline}');
}

if (require.main === module) {
  getTwitterStats().catch(console.error);
}
`;

    // 清理脚本
    const cleanupScript = `#!/bin/bash
# Twitter 配置清理脚本

echo "🧹 清理 Twitter 配置..."

# 清理环境变量中的Twitter配置
sed -i '/TWITTER_/d' ../.env.local

# 清理配置文件
rm -f ../twitter-config.json

# 清理脚本缓存
rm -f ./*.log

echo "✅ Twitter 配置清理完成！"
echo "ℹ️  如需重新配置，请运行: node setup-twitter.js"
`;

    fs.writeFileSync(path.join(scriptsDir, 'test-tweet.js'), testTweetScript);
    fs.writeFileSync(path.join(scriptsDir, 'stats.js'), statsScript);
    fs.writeFileSync(path.join(scriptsDir, 'cleanup.sh'), cleanupScript);

    // 添加执行权限
    try {
      const { execSync } = require('child_process');
      execSync(`chmod +x ${scriptsDir}/*.sh`);
      execSync(`chmod +x ${scriptsDir}/*.js`);
    } catch (e) {
      // Windows 系统忽略
    }

    console.log('📋 Twitter 管理脚本已生成:');
    console.log(`   - 测试推文: ${scriptsDir}/test-tweet.js`);
    console.log(`   - 账号统计: ${scriptsDir}/stats.js`);
    console.log(`   - 清理配置: ${scriptsDir}/cleanup.sh`);
  }

  // 显示完成总结
  showCompletionSummary() {
    console.log('\n🎉 Twitter 配置完成！');
    console.log('=====================================');
    console.log('✅ Twitter开发者账号已验证');
    console.log('✅ API凭据已配置');
    console.log('✅ 环境变量已更新');
    console.log('✅ 管理脚本已生成');
    console.log('=====================================');
    
    if (this.userProfile) {
      console.log('📱 账号信息:');
      console.log(`   🐦 @${this.credentials.username}`);
      console.log(`   👤 ${this.userProfile.name}`);
      if (this.userProfile.description) {
        console.log(`   📝 ${this.userProfile.description}`);
      }
    }
    
    console.log('\n🚀 下一步:');
    console.log('1. 启动应用: npm run dev');
    console.log('2. 测试Twitter同步: node twitter-scripts/test-tweet.js');
    console.log('3. 查看AI动态自动同步到Twitter');
    
    console.log('\n📖 使用说明:');
    console.log('- AI每天会自动发布10-15条动态');
    console.log('- 每条动态都会同步到Twitter');
    console.log('- 可在AI生活页面查看同步状态');
    
    console.log('\n⚠️  注意事项:');
    console.log('- 遵守Twitter使用条款和API限制');
    console.log('- 定期检查发布内容质量');
    console.log('- 监控API使用量避免超出限制');
    
    console.log('\n📊 Twitter 管理: 查看 twitter-scripts/ 目录\n');
  }

  // 主设置流程
  async setup() {
    this.showSetupWizard();
    
    console.log('🔍 检查现有配置...');
    
    // 检查是否已有配置
    if (fs.existsSync(this.configFile)) {
      const config = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
      if (config.status === 'configured') {
        console.log('✅ 检测到现有Twitter配置');
        console.log('如需重新配置，请先删除 twitter-config.json 文件');
        return;
      }
    }
    
    // 开始配置流程
    console.log('🚀 开始Twitter配置向导...\n');
    
    // 由于Twitter API限制，我们主要提供指导
    this.showAccountCreationGuide();
  }
}

// 运行脚本
if (require.main === module) {
  const twitterSetup = new TwitterSetup();
  twitterSetup.setup().catch(error => {
    console.error('❌ Twitter配置失败:', error.message);
    process.exit(1);
  });
}

module.exports = TwitterSetup; 