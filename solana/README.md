# Claude AI Dashboard - Solana 区块链集成

## 概述

本项目将Claude AI Dashboard从以太坊迁移到Solana区块链，提供更高效、低成本的区块链集成方案。

## 主要特性

### 🚀 Solana优势
- **高性能**: 每秒65,000+交易处理能力
- **低成本**: 交易费用极低（约$0.00025/笔）
- **快速确认**: 400ms区块时间
- **可扩展性**: 支持水平扩展

### 🤖 AI功能
- **LITTLE STAR AI SBT**: Soulbound Token，不可转让的AI身份证明
- **记忆锚定**: 将AI记忆哈希存储到区块链
- **目标DAO**: 社区投票管理AI目标
- **Twitter同步**: AI动态自动发布到Twitter

## 技术架构

### 智能合约（Solana程序）
1. **ClaudeMiniSBT.ts** - AI身份SBT程序
2. **MemoryAnchor.ts** - 记忆锚定程序
3. **GoalDAO.ts** - 目标治理程序

### 前端集成
- **@solana/web3.js** - Solana Web3客户端
- **@solana/wallet-adapter-react** - 钱包适配器
- **borsh** - 数据序列化

## 安装和配置

### 1. 安装依赖
```bash
cd solana
npm install
```

### 2. 环境配置
创建 `.env` 文件：
```bash
# Solana网络配置
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_WS_URL=wss://api.devnet.solana.com

# 程序ID（部署后填写）
CLAUDE_MINI_SBT_PROGRAM_ID=your_program_id_here
MEMORY_ANCHOR_PROGRAM_ID=your_program_id_here
GOAL_DAO_PROGRAM_ID=your_program_id_here

# 钱包配置
WALLET_PRIVATE_KEY=your_private_key_here
```

### 3. 编译项目
```bash
npm run build
```

## 部署指南

### 开发网部署
```bash
npm run deploy:devnet
```

### 主网部署
```bash
npm run deploy:mainnet
```

## 使用示例

### 创建LITTLE STAR AI SBT
```typescript
import { Connection, Keypair } from '@solana/web3.js';
import { ClaudeMiniSBT } from './ClaudeMiniSBT';

const connection = new Connection(process.env.SOLANA_RPC_URL!);
const payer = Keypair.fromSecretKey(/* your private key */);

const claudeMiniSBT = new ClaudeMiniSBT(connection, programId, payer);

// 创建AI身份
const claudeMiniId = await claudeMiniSBT.createClaudeMini(
  "LITTLE STAR AI #1",
  {
    curiosity: 80,
    creativity: 75,
    empathy: 85,
    analyticalThinking: 90,
    emotionalIntelligence: 78
  }
);
```

### 锚定记忆
```typescript
import { MemoryAnchor } from './MemoryAnchor';

const memoryAnchor = new MemoryAnchor(connection, programId, payer);

// 锚定AI记忆
const memoryId = await memoryAnchor.anchorMemory(
  "今天学习了新的编程概念",
  "learning",
  "programming",
  claudeMiniId
);
```

## 与以太坊版本的区别

| 特性 | 以太坊版本 | Solana版本 |
|------|------------|------------|
| 编程语言 | Solidity | Rust/TypeScript |
| 开发框架 | Hardhat | Anchor/SDK |
| 交易费用 | 高（$5-50） | 极低（$0.00025） |
| 确认时间 | 12秒 | 400ms |
| 扩展性 | 有限 | 高 |
| 开发复杂度 | 中等 | 简单 |

## 迁移计划

### 第一阶段：基础迁移
- [x] 创建Solana程序结构
- [x] 实现ClaudeMiniSBT
- [x] 实现MemoryAnchor
- [ ] 实现GoalDAO

### 第二阶段：前端集成
- [ ] 更新前端依赖
- [ ] 集成Solana钱包
- [ ] 更新合约调用

### 第三阶段：测试和优化
- [ ] 单元测试
- [ ] 集成测试
- [ ] 性能优化

## 开发指南

### 本地开发
```bash
# 启动本地Solana测试验证器
solana-test-validator

# 部署到本地网络
npm run deploy:local

# 运行测试
npm test
```

### 调试
```bash
# 查看程序日志
solana logs <program_id>

# 查看账户信息
solana account <account_address>
```

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

## 许可证

MIT License

## 支持

如有问题，请查看：
- [Solana文档](https://docs.solana.com/)
- [项目Issues](../../issues)
- [技术文档](./docs/) 