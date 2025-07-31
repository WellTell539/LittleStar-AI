#!/usr/bin/env node
/**
 * Claude AI Dashboard 一键配置脚本
 * 按顺序执行所有配置：环境变量、数据库、Solana、Twitter
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 导入各个配置模块
const DatabaseSetup = require('./setup-database');
const SolanaDeployer = require('./deploy-solana');
const TwitterSetup = require('./setup-twitter');

class MasterSetup {
  constructor() {
    this.configFile = path.join(__dirname, '../setup-status.json');
    this.envFile = path.join(__dirname, '../.env.local');
    this.status = this.loadStatus();
  }

  // 加载配置状态
  loadStatus() {
    if (fs.existsSync(this.configFile)) {
      return JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
    }
    return {
      environment: false,
      database: false,
      solana: false,
      twitter: false,
      completedAt: null
    };
  }

  // 保存配置状态
  saveStatus() {
    fs.writeFileSync(this.configFile, JSON.stringify(this.status, null, 2));
  }

  // 显示欢迎界面
  showWelcome() {
    console.log(`
🚀 Claude AI Dashboard 一键配置向导
=====================================

本脚本将帮您完成以下配置：

✅ 1. 环境变量配置
   - OpenAI API: ${process.env.OPENAI_API_KEY ? '已配置' : '需要配置'}
   - 新闻API: ${process.env.NEXT_PUBLIC_NEWS_API_KEY ? '已配置' : '需要配置'}

🗄️  2. 数据库配置 (${this.status.database ? '✅ 已完成' : '⏳ 待配置'})
   - 自动启动 PostgreSQL 容器
   - 创建数据库表结构
   - 生成管理脚本

⚡ 3. Solana 区块链配置 (${this.status.solana ? '✅ 已完成' : '⏳ 待配置'})
   - 生成部署钱包
   - 部署智能程序
   - 配置 RPC 端点

🐦 4. Twitter 集成配置 (${this.status.twitter ? '✅ 已完成' : '⏳ 待配置'})
   - 指导账号注册
   - 配置 API 密钥
   - 测试自动同步

=====================================
预计耗时: 10-30分钟 (取决于网络和审核)
成本: 免费 (仅使用测试网络)
=====================================
`);
  }

  // 配置基础环境变量
  setupEnvironment() {
    console.log('\n📝 步骤 1: 配置基础环境变量');
    console.log('=====================================');

    try {
      // 创建基础环境配置
      let envContent = '';
      
      if (fs.existsSync(this.envFile)) {
        envContent = fs.readFileSync(this.envFile, 'utf8');
        console.log('📖 检测到现有 .env.local 文件');
      } else {
        console.log('🆕 创建新的 .env.local 文件');
        const envExample = path.join(__dirname, '../env.example');
        if (fs.existsSync(envExample)) {
          envContent = fs.readFileSync(envExample, 'utf8');
        }
      }

      // 配置用户提供的API密钥
      const userApiKeys = {
        'OPENAI_API_KEY': 'sk-your-actual-api-key-here',
        'NEXT_PUBLIC_NEWS_API_KEY': 'your-news-api-key-here',
        'BLOCKCHAIN_NETWORK': 'solana',
        'NEXT_PUBLIC_BLOCKCHAIN_NETWORK': 'solana',
        'NEXT_PUBLIC_SOLANA_RPC_URL': 'https://api.devnet.solana.com',
        'SOLANA_RPC_URL': 'https://api.devnet.solana.com',
        'SOLANA_WS_URL': 'wss://api.devnet.solana.com'
      };

      Object.entries(userApiKeys).forEach(([key, value]) => {
        if (envContent.includes(`${key}=`)) {
          envContent = envContent.replace(new RegExp(`${key}=.*`), `${key}=${value}`);
        } else {
          envContent += `\n${key}=${value}`;
        }
      });

      fs.writeFileSync(this.envFile, envContent);
      
      console.log('✅ 基础环境变量配置完成！');
      console.log(`   OpenAI API: ${userApiKeys.OPENAI_API_KEY.substring(0, 20)}...`);
      console.log(`   新闻API: ${userApiKeys.NEXT_PUBLIC_NEWS_API_KEY}`);
      console.log(`   区块链网络: Solana`);
      
      this.status.environment = true;
      this.saveStatus();
      
      return true;
    } catch (error) {
      console.error('❌ 环境变量配置失败:', error.message);
      return false;
    }
  }

  // 等待用户确认
  async waitForConfirmation(message) {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise(resolve => {
      readline.question(message + ' (按回车继续，输入 skip 跳过): ', (answer) => {
        readline.close();
        resolve(answer.toLowerCase() !== 'skip');
      });
    });
  }

  // 配置数据库
  async setupDatabase() {
    if (this.status.database) {
      console.log('\n✅ 数据库已配置，跳过此步骤');
      return true;
    }

    console.log('\n🗄️  步骤 2: 配置数据库');
    console.log('=====================================');
    
    const shouldSetup = await this.waitForConfirmation(
      '⚠️  这将启动 Docker 容器并创建数据库。确认继续？'
    );
    
    if (!shouldSetup) {
      console.log('⏭️  跳过数据库配置');
      return true;
    }

    try {
      const dbSetup = new DatabaseSetup();
      await dbSetup.setup();
      
      this.status.database = true;
      this.saveStatus();
      
      console.log('✅ 数据库配置完成！');
      return true;
    } catch (error) {
      console.error('❌ 数据库配置失败:', error.message);
      console.log('💡 可以稍后手动运行: node scripts/setup-database.js');
      return false;
    }
  }

  // 配置Solana
  async setupSolana() {
    if (this.status.solana) {
      console.log('\n✅ Solana 已配置，跳过此步骤');
      return true;
    }

    console.log('\n⚡ 步骤 3: 配置 Solana 区块链');
    console.log('=====================================');
    
    // 检查Solana依赖
    const hasSolanaCLI = this.checkSolanaDependencies();
    if (!hasSolanaCLI) {
      console.log('⚠️  Solana CLI 未安装，跳过 Solana 配置');
      console.log('💡 安装后可手动运行: node scripts/deploy-solana.js');
      return true;
    }
    
    const shouldSetup = await this.waitForConfirmation(
      '⚠️  这将创建钱包并部署智能合约到 Solana devnet。确认继续？'
    );
    
    if (!shouldSetup) {
      console.log('⏭️  跳过 Solana 配置');
      return true;
    }

    try {
      const solanaDeployer = new SolanaDeployer();
      await solanaDeployer.deploy();
      
      this.status.solana = true;
      this.saveStatus();
      
      console.log('✅ Solana 配置完成！');
      return true;
    } catch (error) {
      console.error('❌ Solana 配置失败:', error.message);
      console.log('💡 可以稍后手动运行: node scripts/deploy-solana.js');
      return false;
    }
  }

  // 检查Solana依赖
  checkSolanaDependencies() {
    try {
      execSync('solana --version', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  // 配置Twitter
  async setupTwitter() {
    if (this.status.twitter) {
      console.log('\n✅ Twitter 已配置，跳过此步骤');
      return true;
    }

    console.log('\n🐦 步骤 4: 配置 Twitter 集成');
    console.log('=====================================');
    
    const shouldSetup = await this.waitForConfirmation(
      '⚠️  Twitter 配置需要手动操作（注册账号、申请API）。开始配置向导？'
    );
    
    if (!shouldSetup) {
      console.log('⏭️  跳过 Twitter 配置');
      console.log('💡 稍后可手动运行: node scripts/setup-twitter.js');
      return true;
    }

    try {
      const twitterSetup = new TwitterSetup();
      await twitterSetup.setup();
      
      this.status.twitter = true;
      this.saveStatus();
      
      console.log('✅ Twitter 配置完成！');
      return true;
    } catch (error) {
      console.error('❌ Twitter 配置失败:', error.message);
      console.log('💡 可以稍后手动运行: node scripts/setup-twitter.js');
      return false;
    }
  }

  // 验证配置
  validateSetup() {
    console.log('\n🔍 验证配置状态');
    console.log('=====================================');
    
    const checks = [
      {
        name: 'OpenAI API',
        check: () => !!process.env.OPENAI_API_KEY,
        required: true
      },
      {
        name: '环境变量文件',
        check: () => fs.existsSync(this.envFile),
        required: true
      },
      {
        name: '数据库配置',
        check: () => this.status.database,
        required: false
      },
      {
        name: 'Solana 配置',
        check: () => this.status.solana,
        required: false
      },
      {
        name: 'Twitter 配置',
        check: () => this.status.twitter,
        required: false
      }
    ];

    let allRequired = true;
    let totalConfigured = 0;

    checks.forEach(({ name, check, required }) => {
      const passed = check();
      const status = passed ? '✅' : (required ? '❌' : '⚠️');
      const label = required ? '(必需)' : '(可选)';
      
      console.log(`   ${status} ${name} ${label}`);
      
      if (passed) {
        totalConfigured++;
      } else if (required) {
        allRequired = false;
      }
    });

    console.log(`\n📊 配置完成度: ${totalConfigured}/${checks.length}`);
    
    return { allRequired, totalConfigured, total: checks.length };
  }

  // 显示最终总结
  showFinalSummary(validation) {
    console.log('\n🎉 配置向导完成！');
    console.log('=====================================');
    
    if (validation.allRequired) {
      console.log('✅ 所有必需配置已完成，应用可以正常运行！');
    } else {
      console.log('⚠️  部分必需配置未完成，可能影响功能使用');
    }
    
    console.log(`📈 配置完成度: ${validation.totalConfigured}/${validation.total}`);
    
    console.log('\n🚀 下一步操作:');
    console.log('1. 启动开发服务器: npm run dev');
    console.log('2. 访问应用: http://localhost:3000');
    console.log('3. 查看 AI 状态和功能');
    
    console.log('\n📁 生成的文件和脚本:');
    console.log('- 环境配置: .env.local');
    console.log('- 数据库脚本: database-scripts/');
    console.log('- Solana 脚本: solana-scripts/');
    console.log('- Twitter 脚本: twitter-scripts/');
    console.log('- 配置状态: setup-status.json');
    
    console.log('\n🔧 后续配置:');
    if (!this.status.database) {
      console.log('- 数据库: node scripts/setup-database.js');
    }
    if (!this.status.solana) {
      console.log('- Solana: node scripts/deploy-solana.js');
    }
    if (!this.status.twitter) {
      console.log('- Twitter: node scripts/setup-twitter.js');
    }
    
    console.log('\n💡 提示:');
    console.log('- AI 功能基于 OpenAI API，确保密钥有效');
    console.log('- 数据库用于持久化存储，可选但推荐');
    console.log('- Solana 用于去中心化存储，体验 Web3 功能');
    console.log('- Twitter 用于社交同步，增强 AI 互动体验');
    
    // 更新完成状态
    if (validation.allRequired) {
      this.status.completedAt = new Date().toISOString();
      this.saveStatus();
    }
    
    console.log('\n=====================================');
    console.log('🎊 欢迎使用 Claude AI Dashboard！');
    console.log('=====================================\n');
  }

  // 主配置流程
  async run() {
    this.showWelcome();
    
    console.log('\n🔄 开始配置流程...\n');
    
    // 1. 环境变量配置
    const envResult = this.setupEnvironment();
    if (!envResult) {
      console.error('❌ 基础配置失败，无法继续');
      process.exit(1);
    }
    
    // 2. 数据库配置
    await this.setupDatabase();
    
    // 3. Solana配置
    await this.setupSolana();
    
    // 4. Twitter配置
    await this.setupTwitter();
    
    // 验证和总结
    const validation = this.validateSetup();
    this.showFinalSummary(validation);
  }
}

// 运行脚本
if (require.main === module) {
  const masterSetup = new MasterSetup();
  masterSetup.run().catch(error => {
    console.error('❌ 配置过程出错:', error.message);
    console.log('\n💡 您可以：');
    console.log('1. 检查错误信息并重试');
    console.log('2. 跳过出错的步骤，稍后手动配置');
    console.log('3. 查看详细文档: PROJECT_CONFIG_GUIDE.md');
    process.exit(1);
  });
}

module.exports = MasterSetup; 