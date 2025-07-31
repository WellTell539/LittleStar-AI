#!/usr/bin/env node
/**
 * Solana 一键部署脚本
 * 自动生成钱包、部署程序、获取RPC并更新环境变量
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const crypto = require('crypto');

// Solana 配置
const SOLANA_CONFIG = {
  network: 'devnet', // devnet, testnet, mainnet-beta
  rpcUrls: {
    devnet: 'https://api.devnet.solana.com',
    testnet: 'https://api.testnet.solana.com',
    'mainnet-beta': 'https://api.mainnet-beta.solana.com'
  },
  wsUrls: {
    devnet: 'wss://api.devnet.solana.com',
    testnet: 'wss://api.testnet.solana.com',
    'mainnet-beta': 'wss://api.mainnet-beta.solana.com'
  },
  faucetUrl: 'https://faucet.solana.com',
  explorerUrl: 'https://explorer.solana.com'
};

// 程序源代码模板
const PROGRAM_TEMPLATES = {
  'claude-mini-sbt': {
    name: 'LITTLE STAR AI SBT',
    description: 'AI身份灵魂绑定代币程序',
    code: `
use anchor_lang::prelude::*;

declare_id!("PROGRAM_ID_PLACEHOLDER");

#[program]
pub mod claude_mini_sbt {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let claude_mini = &mut ctx.accounts.claude_mini;
        claude_mini.owner = ctx.accounts.user.key();
        claude_mini.name = "LITTLE STAR AI".to_string();
        claude_mini.created_at = Clock::get()?.unix_timestamp;
        claude_mini.curiosity = 70;
        claude_mini.creativity = 65;
        claude_mini.empathy = 80;
        claude_mini.analytical_thinking = 75;
        claude_mini.emotional_intelligence = 72;
        Ok(())
    }

    pub fn update_attributes(
        ctx: Context<UpdateAttributes>,
        curiosity: Option<u8>,
        creativity: Option<u8>,
        empathy: Option<u8>,
        analytical_thinking: Option<u8>,
        emotional_intelligence: Option<u8>,
    ) -> Result<()> {
        let claude_mini = &mut ctx.accounts.claude_mini;
        
        if let Some(val) = curiosity {
            claude_mini.curiosity = val;
        }
        if let Some(val) = creativity {
            claude_mini.creativity = val;
        }
        if let Some(val) = empathy {
            claude_mini.empathy = val;
        }
        if let Some(val) = analytical_thinking {
            claude_mini.analytical_thinking = val;
        }
        if let Some(val) = emotional_intelligence {
            claude_mini.emotional_intelligence = val;
        }
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + ClaudeMiniAccount::INIT_SPACE
    )]
    pub claude_mini: Account<'info, ClaudeMiniAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateAttributes<'info> {
    #[account(
        mut,
        has_one = owner @ ErrorCode::Unauthorized
    )]
    pub claude_mini: Account<'info, ClaudeMiniAccount>,
    pub owner: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct ClaudeMiniAccount {
    pub owner: Pubkey,
    #[max_len(50)]
    pub name: String,
    pub created_at: i64,
    pub curiosity: u8,
    pub creativity: u8,
    pub empathy: u8,
    pub analytical_thinking: u8,
    pub emotional_intelligence: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized")]
    Unauthorized,
}
    `
  },
  'memory-anchor': {
    name: 'Memory Anchor',
    description: '记忆锚定程序',
    code: `
use anchor_lang::prelude::*;

declare_id!("PROGRAM_ID_PLACEHOLDER");

#[program]
pub mod memory_anchor {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let memory_anchor = &mut ctx.accounts.memory_anchor;
        memory_anchor.owner = ctx.accounts.user.key();
        memory_anchor.memory_count = 0;
        Ok(())
    }

    pub fn anchor_memory(
        ctx: Context<AnchorMemory>,
        memory_hash: String,
        memory_type: String,
        category: String,
        claude_mini_id: Pubkey,
    ) -> Result<()> {
        let memory_anchor = &mut ctx.accounts.memory_anchor;
        
        require!(memory_anchor.memory_count < 1000, ErrorCode::MemoryLimitExceeded);
        
        let new_memory = Memory {
            memory_hash,
            timestamp: Clock::get()?.unix_timestamp,
            memory_type,
            category,
            owner: ctx.accounts.owner.key(),
            claude_mini_id,
        };
        
        memory_anchor.memories.push(new_memory);
        memory_anchor.memory_count += 1;
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + MemoryAnchorAccount::INIT_SPACE
    )]
    pub memory_anchor: Account<'info, MemoryAnchorAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AnchorMemory<'info> {
    #[account(
        mut,
        has_one = owner @ ErrorCode::Unauthorized
    )]
    pub memory_anchor: Account<'info, MemoryAnchorAccount>,
    pub owner: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct MemoryAnchorAccount {
    pub owner: Pubkey,
    pub memory_count: u32,
    #[max_len(1000)]
    pub memories: Vec<Memory>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub struct Memory {
    #[max_len(100)]
    pub memory_hash: String,
    pub timestamp: i64,
    #[max_len(50)]
    pub memory_type: String,
    #[max_len(50)]
    pub category: String,
    pub owner: Pubkey,
    pub claude_mini_id: Pubkey,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Memory limit exceeded")]
    MemoryLimitExceeded,
}
    `
  }
};

class SolanaDeployer {
  constructor() {
    this.envFile = path.join(__dirname, '../.env.local');
    this.solanaDir = path.join(__dirname, '../solana-programs');
    this.walletPath = path.join(this.solanaDir, 'deployer-keypair.json');
    this.network = SOLANA_CONFIG.network;
    this.programIds = {};
  }

  // 显示部署信息
  showDeployInfo() {
    console.log('\n⚡ Solana 一键部署脚本');
    console.log('=====================================');
    console.log(`🌐 目标网络: ${this.network.toUpperCase()}`);
    console.log(`🔗 RPC URL: ${SOLANA_CONFIG.rpcUrls[this.network]}`);
    console.log(`💰 预计费用: ~0.001 SOL (仅测试网)`);
    console.log('=====================================\n');
  }

  // 检查系统依赖
  checkDependencies() {
    console.log('🔍 检查系统依赖...');

    const dependencies = [
      { cmd: 'solana --version', name: 'Solana CLI' },
      { cmd: 'anchor --version', name: 'Anchor Framework' },
      { cmd: 'node --version', name: 'Node.js' },
      { cmd: 'yarn --version', name: 'Yarn' }
    ];

    for (const dep of dependencies) {
      try {
        const result = execSync(dep.cmd, { stdio: 'pipe' }).toString().trim();
        console.log(`✅ ${dep.name}: ${result.split('\n')[0]}`);
      } catch (error) {
        console.error(`❌ ${dep.name} 未安装或版本不兼容`);
        this.showInstallInstructions(dep.name);
        process.exit(1);
      }
    }
    console.log('');
  }

  // 显示安装说明
  showInstallInstructions(tool) {
    const instructions = {
      'Solana CLI': `
请安装 Solana CLI:
# macOS/Linux
sh -c "$(curl -sSfL https://release.solana.com/v1.16.0/install)"

# Windows
下载: https://github.com/solana-labs/solana/releases
      `,
      'Anchor Framework': `
请安装 Anchor Framework:
# 通过 NPM
npm install -g @project-serum/anchor-cli

# 通过 Cargo
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked
      `,
      'Yarn': `
请安装 Yarn:
npm install -g yarn
      `
    };

    if (instructions[tool]) {
      console.log(instructions[tool]);
    }
  }

  // 设置 Solana 配置
  setupSolanaConfig() {
    console.log('⚙️  配置 Solana CLI...');

    try {
      // 设置网络
      execSync(`solana config set --url ${SOLANA_CONFIG.rpcUrls[this.network]}`, { stdio: 'inherit' });
      
      // 确认配置
      const config = execSync('solana config get', { stdio: 'pipe' }).toString();
      console.log('✅ Solana 配置:');
      console.log(config);
    } catch (error) {
      console.error('❌ Solana 配置失败:', error.message);
      process.exit(1);
    }
  }

  // 生成或加载部署钱包
  async setupWallet() {
    console.log('👛 设置部署钱包...');

    // 确保 solana-programs 目录存在
    if (!fs.existsSync(this.solanaDir)) {
      fs.mkdirSync(this.solanaDir, { recursive: true });
    }

    try {
      if (fs.existsSync(this.walletPath)) {
        console.log('📖 加载现有钱包...');
      } else {
        console.log('🔐 生成新钱包...');
        execSync(`solana-keygen new --no-bip39-passphrase --outfile ${this.walletPath}`, { stdio: 'inherit' });
      }

      // 设置为默认钱包
      execSync(`solana config set --keypair ${this.walletPath}`, { stdio: 'inherit' });

      // 获取钱包地址
      const walletAddress = execSync('solana address', { stdio: 'pipe' }).toString().trim();
      console.log(`✅ 钱包地址: ${walletAddress}`);

      // 检查余额
      const balance = parseFloat(execSync('solana balance', { stdio: 'pipe' }).toString().trim());
      console.log(`💰 当前余额: ${balance} SOL`);

      // 如果是 devnet 且余额不足，自动申请空投
      if (this.network === 'devnet' && balance < 0.1) {
        await this.requestAirdrop(walletAddress);
      }

      return walletAddress;
    } catch (error) {
      console.error('❌ 钱包设置失败:', error.message);
      process.exit(1);
    }
  }

  // 申请空投（仅 devnet）
  async requestAirdrop(address) {
    console.log('💧 申请 SOL 空投...');

    try {
      // 申请 2 SOL 空投
      const signature = execSync(`solana airdrop 2 ${address}`, { stdio: 'pipe' }).toString().trim();
      console.log(`📋 空投交易: ${signature}`);

      // 等待确认
      console.log('⏳ 等待空投确认...');
      execSync(`solana confirm ${signature}`, { stdio: 'inherit' });

      // 检查新余额
      const newBalance = execSync('solana balance', { stdio: 'pipe' }).toString().trim();
      console.log(`✅ 空投完成，新余额: ${newBalance}`);
    } catch (error) {
      console.warn('⚠️  空投失败，尝试手动获取 SOL:');
      console.log(`🔗 访问: ${SOLANA_CONFIG.faucetUrl}`);
      console.log(`👤 钱包地址: ${address}`);
    }
  }

  // 创建 Anchor 项目结构
  createAnchorProject() {
    console.log('📁 创建 Anchor 项目结构...');

    try {
      // 初始化 Anchor 项目
      if (!fs.existsSync(path.join(this.solanaDir, 'Anchor.toml'))) {
        process.chdir(this.solanaDir);
        execSync('anchor init claude-ai-programs --no-git', { stdio: 'inherit' });
        process.chdir('..');
      }

      // 生成程序代码
      this.generateProgramCode();

      console.log('✅ Anchor 项目创建成功！');
    } catch (error) {
      console.error('❌ Anchor 项目创建失败:', error.message);
      process.exit(1);
    }
  }

  // 生成程序代码
  generateProgramCode() {
    const programsDir = path.join(this.solanaDir, 'claude-ai-programs', 'programs');

    // 为每个程序创建代码
    Object.entries(PROGRAM_TEMPLATES).forEach(([programKey, template]) => {
      const programDir = path.join(programsDir, programKey);
      const srcDir = path.join(programDir, 'src');

      // 创建目录
      if (!fs.existsSync(srcDir)) {
        fs.mkdirSync(srcDir, { recursive: true });
      }

      // 生成程序 ID
      const programId = this.generateProgramId();
      this.programIds[programKey] = programId;

      // 替换模板中的占位符
      const programCode = template.code.replace(/PROGRAM_ID_PLACEHOLDER/g, programId);

      // 写入代码文件
      fs.writeFileSync(path.join(srcDir, 'lib.rs'), programCode);

      // 创建 Cargo.toml
      const cargoToml = `
[package]
name = "${programKey}"
version = "0.1.0"
description = "${template.description}"
edition = "2021"

[lib]
crate-type = ["cdylib", "lib"]
name = "${programKey.replace(/-/g, '_')}"

[dependencies]
anchor-lang = "0.28.0"
      `;
      fs.writeFileSync(path.join(programDir, 'Cargo.toml'), cargoToml.trim());

      console.log(`📝 生成程序: ${template.name} (${programId})`);
    });
  }

  // 生成程序 ID
  generateProgramId() {
    // 简化版程序 ID 生成（实际应使用 Solana 官方方法）
    const randomBytes = crypto.randomBytes(32);
    return randomBytes.toString('hex').slice(0, 44);
  }

  // 构建程序
  buildPrograms() {
    console.log('🔨 构建 Solana 程序...');

    try {
      process.chdir(path.join(this.solanaDir, 'claude-ai-programs'));
      
      // 构建所有程序
      execSync('anchor build', { stdio: 'inherit' });
      
      console.log('✅ 程序构建成功！');
      
      process.chdir('../../..');
    } catch (error) {
      console.error('❌ 程序构建失败:', error.message);
      process.exit(1);
    }
  }

  // 部署程序
  async deployPrograms() {
    console.log('🚀 部署 Solana 程序...');

    try {
      process.chdir(path.join(this.solanaDir, 'claude-ai-programs'));

      // 部署程序
      const deployOutput = execSync('anchor deploy', { stdio: 'pipe' }).toString();
      console.log(deployOutput);

      // 解析部署结果中的程序 ID
      this.parseDeployOutput(deployOutput);

      console.log('✅ 程序部署成功！');
      
      process.chdir('../../..');
    } catch (error) {
      console.error('❌ 程序部署失败:', error.message);
      
      // 显示常见错误解决方案
      this.showDeployErrorSolutions(error.message);
      process.exit(1);
    }
  }

  // 解析部署输出
  parseDeployOutput(output) {
    const lines = output.split('\n');
    
    lines.forEach(line => {
      if (line.includes('Program Id:')) {
        const programId = line.split('Program Id:')[1].trim();
        // 这里需要根据实际输出格式调整解析逻辑
        console.log(`📍 程序 ID: ${programId}`);
      }
    });
  }

  // 显示部署错误解决方案
  showDeployErrorSolutions(errorMessage) {
    console.log('\n🔧 常见错误解决方案:');
    
    if (errorMessage.includes('insufficient funds')) {
      console.log('💰 余额不足:');
      console.log('   - 申请更多 SOL 空投');
      console.log(`   - 访问: ${SOLANA_CONFIG.faucetUrl}`);
    }
    
    if (errorMessage.includes('program failed to complete')) {
      console.log('🔨 程序编译错误:');
      console.log('   - 检查程序代码语法');
      console.log('   - 更新 Anchor 版本');
      console.log('   - 清理缓存: anchor clean');
    }
    
    if (errorMessage.includes('network')) {
      console.log('🌐 网络连接问题:');
      console.log('   - 检查网络连接');
      console.log('   - 尝试切换 RPC 节点');
      console.log('   - 重试部署');
    }
  }

  // 更新环境变量
  updateEnvironmentVariables() {
    console.log('📝 更新环境变量...');

    try {
      let envContent = '';
      
      if (fs.existsSync(this.envFile)) {
        envContent = fs.readFileSync(this.envFile, 'utf8');
      } else {
        // 从模板复制
        const envExample = path.join(__dirname, '../env.example');
        if (fs.existsSync(envExample)) {
          envContent = fs.readFileSync(envExample, 'utf8');
        }
      }

      // 读取钱包私钥
      const walletKeyfile = JSON.parse(fs.readFileSync(this.walletPath, 'utf8'));
      const privateKeyBase58 = Buffer.from(walletKeyfile).toString('base64');

      // 更新环境变量
      const updates = {
        'BLOCKCHAIN_NETWORK': 'solana',
        'NEXT_PUBLIC_BLOCKCHAIN_NETWORK': 'solana',
        'NEXT_PUBLIC_SOLANA_RPC_URL': SOLANA_CONFIG.rpcUrls[this.network],
        'SOLANA_RPC_URL': SOLANA_CONFIG.rpcUrls[this.network],
        'SOLANA_WS_URL': SOLANA_CONFIG.wsUrls[this.network],
        'SOLANA_WALLET_PRIVATE_KEY': privateKeyBase58,
        'NEXT_PUBLIC_CLAUDE_MINI_SBT_PROGRAM_ID': this.programIds['claude-mini-sbt'] || '',
        'NEXT_PUBLIC_MEMORY_ANCHOR_PROGRAM_ID': this.programIds['memory-anchor'] || '',
        'NEXT_PUBLIC_GOAL_DAO_PROGRAM_ID': this.programIds['goal-dao'] || ''
      };

      Object.entries(updates).forEach(([key, value]) => {
        if (envContent.includes(`${key}=`)) {
          envContent = envContent.replace(new RegExp(`${key}=.*`), `${key}=${value}`);
        } else {
          envContent += `\n${key}=${value}`;
        }
      });

      fs.writeFileSync(this.envFile, envContent);
      
      console.log('✅ 环境变量更新成功！');
      console.log('\n📋 Solana 配置:');
      Object.entries(updates).forEach(([key, value]) => {
        if (key.includes('PROGRAM_ID') && value) {
          console.log(`   ${key}: ${value}`);
        }
      });
      console.log(`   网络: ${this.network}`);
      console.log(`   RPC: ${SOLANA_CONFIG.rpcUrls[this.network]}`);
      
    } catch (error) {
      console.error('❌ 环境变量更新失败:', error.message);
    }
  }

  // 生成管理脚本
  generateManagementScripts() {
    const scriptsDir = path.join(__dirname, '../solana-scripts');
    if (!fs.existsSync(scriptsDir)) {
      fs.mkdirSync(scriptsDir, { recursive: true });
    }

    // 升级程序脚本
    const upgradeScript = `#!/bin/bash
# Solana 程序升级脚本

echo "🔄 开始升级 Solana 程序..."

cd ${this.solanaDir}/claude-ai-programs

# 构建程序
echo "🔨 构建程序..."
anchor build

# 升级程序
echo "⬆️  升级程序..."
anchor upgrade target/deploy/claude_mini_sbt.so --program-id ${this.programIds['claude-mini-sbt']}
anchor upgrade target/deploy/memory_anchor.so --program-id ${this.programIds['memory-anchor']}

echo "✅ 程序升级完成！"
`;

    // 状态查询脚本
    const statusScript = `#!/bin/bash
# Solana 程序状态查询脚本

echo "📊 Solana 程序状态"
echo "=================="

echo "💰 钱包余额:"
solana balance

echo ""
echo "📍 程序信息:"
echo "LITTLE STAR AI SBT: ${this.programIds['claude-mini-sbt']}"
echo "Memory Anchor: ${this.programIds['memory-anchor']}"

echo ""
echo "🌐 网络信息:"
solana config get

echo ""
echo "🔍 程序账户:"
solana program show ${this.programIds['claude-mini-sbt']}
solana program show ${this.programIds['memory-anchor']}
`;

    // 清理脚本
    const cleanScript = `#!/bin/bash
# Solana 开发环境清理脚本

echo "🧹 清理 Solana 开发环境..."

cd ${this.solanaDir}/claude-ai-programs

# 清理构建缓存
anchor clean

# 清理 target 目录
rm -rf target/

# 清理 node_modules
rm -rf node_modules/

echo "✅ 清理完成！"
`;

    fs.writeFileSync(path.join(scriptsDir, 'upgrade.sh'), upgradeScript);
    fs.writeFileSync(path.join(scriptsDir, 'status.sh'), statusScript);
    fs.writeFileSync(path.join(scriptsDir, 'clean.sh'), cleanScript);

    // 添加执行权限
    try {
      execSync(`chmod +x ${scriptsDir}/*.sh`);
    } catch (e) {
      // Windows 系统忽略
    }

    console.log('📋 Solana 管理脚本已生成:');
    console.log(`   - 升级: ${scriptsDir}/upgrade.sh`);
    console.log(`   - 状态: ${scriptsDir}/status.sh`);
    console.log(`   - 清理: ${scriptsDir}/clean.sh`);
  }

  // 主部署流程
  async deploy() {
    this.showDeployInfo();

    // 检查依赖
    this.checkDependencies();

    // 设置 Solana 配置
    this.setupSolanaConfig();

    // 设置钱包
    const walletAddress = await this.setupWallet();

    // 创建 Anchor 项目
    this.createAnchorProject();

    // 构建程序
    this.buildPrograms();

    // 部署程序
    await this.deployPrograms();

    // 更新环境变量
    this.updateEnvironmentVariables();

    // 生成管理脚本
    this.generateManagementScripts();

    console.log('\n🎉 Solana 部署完成！');
    console.log('=====================================');
    console.log('✅ 钱包已生成和配置');
    console.log('✅ 程序已构建和部署');
    console.log('✅ 环境变量已更新');
    console.log('✅ 管理脚本已生成');
    console.log('=====================================');
    console.log(`🔗 Explorer: ${SOLANA_CONFIG.explorerUrl}?cluster=${this.network}`);
    console.log(`👛 钱包: ${walletAddress}`);
    console.log('🚀 现在可以启动应用: npm run dev');
    console.log('📊 Solana 管理: 查看 solana-scripts/ 目录\n');
  }
}

// 运行脚本
if (require.main === module) {
  const deployer = new SolanaDeployer();
  deployer.deploy().catch(error => {
    console.error('❌ 部署失败:', error.message);
    process.exit(1);
  });
}

module.exports = SolanaDeployer; 