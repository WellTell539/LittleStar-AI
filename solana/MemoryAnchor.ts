import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
  Connection,
} from '@solana/web3.js';
import * as borsh from 'borsh';

// 记忆数据结构
export interface Memory {
  memoryHash: string;
  timestamp: number;
  memoryType: string; // "goal", "emotion", "learning"
  category: string;
  owner: PublicKey;
  claudeMiniId: PublicKey;
}

// 程序状态账户数据结构
export interface MemoryAnchorState {
  memories: Memory[];
  isInitialized: boolean;
}

// 序列化/反序列化schema
class MemoryAnchorStateClass {
  memories!: Memory[];
  isInitialized!: boolean;
}

const MemoryAnchorStateSchema = new Map([
  [
    MemoryAnchorStateClass,
    {
      kind: 'struct',
      fields: [
        ['memories', [{
          kind: 'struct',
          fields: [
            ['memoryHash', 'string'],
            ['timestamp', 'u64'],
            ['memoryType', 'string'],
            ['category', 'string'],
            ['owner', [32]], // PublicKey
            ['claudeMiniId', [32]], // PublicKey
          ]
        }]],
        ['isInitialized', 'bool'],
      ],
    },
  ],
]);

export class MemoryAnchor {
  private connection: Connection;
  private programId: PublicKey;
  private payer: Keypair;

  constructor(connection: Connection, programId: PublicKey, payer: Keypair) {
    this.connection = connection;
    this.programId = programId;
    this.payer = payer;
  }

  /**
   * 锚定记忆到区块链
   */
  async anchorMemory(
    memoryData: string,
    memoryType: string,
    category: string,
    claudeMiniId: PublicKey
  ): Promise<PublicKey> {
    // 生成状态账户密钥对
    const stateAccount = Keypair.generate();
    
    // 创建记忆哈希
    const memoryHash = this.createMemoryHash(memoryData, this.payer.publicKey, Date.now());
    
    // 创建记忆对象
    const memory: Memory = {
      memoryHash,
      timestamp: Date.now(),
      memoryType,
      category,
      owner: this.payer.publicKey,
      claudeMiniId,
    };

    // 创建状态账户
    const stateData: MemoryAnchorState = {
      memories: [memory],
      isInitialized: true,
    };

    // 序列化数据
    const serializedData = borsh.serialize(MemoryAnchorStateSchema, stateData);
    
    // 计算所需空间
    const space = serializedData.length;
    
    // 创建账户指令
    const createAccountIx = SystemProgram.createAccount({
      fromPubkey: this.payer.publicKey,
      newAccountPubkey: stateAccount.publicKey,
      lamports: await this.connection.getMinimumBalanceForRentExemption(space),
      space,
      programId: this.programId,
    });

    // 初始化指令
    const initializeIx = new TransactionInstruction({
      keys: [
        { pubkey: stateAccount.publicKey, isSigner: true, isWritable: true },
        { pubkey: this.payer.publicKey, isSigner: true, isWritable: true },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: this.programId,
      data: Buffer.from([0, ...serializedData]), // 0 = initialize instruction
    });

    // 发送交易
    const transaction = new Transaction().add(createAccountIx, initializeIx);
    
    await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.payer, stateAccount]
    );

    console.log(`✅ Memory anchored: ${stateAccount.publicKey.toString()}`);
    return stateAccount.publicKey;
  }

  /**
   * 添加新记忆到现有状态账户
   */
  async addMemory(
    stateAccountPubkey: PublicKey,
    memoryData: string,
    memoryType: string,
    category: string,
    claudeMiniId: PublicKey
  ): Promise<void> {
    // 获取当前状态
    const currentState = await this.getMemoryAnchorState(stateAccountPubkey);
    
    if (!currentState) {
      throw new Error('Memory anchor not found');
    }

    // 验证所有者
    if (!currentState.memories[0]?.owner.equals(this.payer.publicKey)) {
      throw new Error('Only owner can add memories');
    }

    // 创建新记忆
    const memoryHash = this.createMemoryHash(memoryData, this.payer.publicKey, Date.now());
    
    const newMemory: Memory = {
      memoryHash,
      timestamp: Date.now(),
      memoryType,
      category,
      owner: this.payer.publicKey,
      claudeMiniId,
    };

    // 添加新记忆到列表
    const updatedState: MemoryAnchorState = {
      memories: [...currentState.memories, newMemory],
      isInitialized: true,
    };

    // 序列化更新数据
    const serializedData = borsh.serialize(MemoryAnchorStateSchema, updatedState);

    // 更新指令
    const updateIx = new TransactionInstruction({
      keys: [
        { pubkey: stateAccountPubkey, isSigner: false, isWritable: true },
        { pubkey: this.payer.publicKey, isSigner: true, isWritable: false },
      ],
      programId: this.programId,
      data: Buffer.from([1, ...serializedData]), // 1 = update instruction
    });

    // 发送交易
    const transaction = new Transaction().add(updateIx);
    
    await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.payer]
    );

    console.log(`✅ Memory added to anchor`);
  }

  /**
   * 验证记忆
   */
  async verifyMemory(
    stateAccountPubkey: PublicKey,
    memoryData: string,
    owner: PublicKey,
    timestamp: number
  ): Promise<boolean> {
    const state = await this.getMemoryAnchorState(stateAccountPubkey);
    
    if (!state) {
      return false;
    }

    // 计算期望的哈希
    const expectedHash = this.createMemoryHash(memoryData, owner, timestamp);
    
    // 查找匹配的记忆
    const memory = state.memories.find(m => m.memoryHash === expectedHash);
    
    return !!memory;
  }

  /**
   * 获取记忆锚状态
   */
  async getMemoryAnchorState(stateAccountPubkey: PublicKey): Promise<MemoryAnchorState | null> {
    try {
      const accountInfo = await this.connection.getAccountInfo(stateAccountPubkey);
      
      if (!accountInfo) {
        return null;
      }

      // 反序列化数据
      const state = borsh.deserialize(
        MemoryAnchorStateSchema,
        MemoryAnchorStateClass,
        accountInfo.data
      );

      return state;
    } catch (error) {
      console.error('Error getting memory anchor state:', error);
      return null;
    }
  }

  /**
   * 获取特定LITTLE STAR AI的所有记忆
   */
  async getMemoriesByClaudeMini(claudeMiniId: PublicKey): Promise<Memory[]> {
    const accounts = await this.connection.getProgramAccounts(this.programId, {
      filters: [
        {
          dataSize: 1024, // 估计大小
        },
      ],
    });

    const allMemories: Memory[] = [];

    for (const account of accounts) {
      try {
        const state = borsh.deserialize(
          MemoryAnchorStateSchema,
          MemoryAnchorStateClass,
          account.account.data
        );

        // 过滤出属于指定LITTLE STAR AI的记忆
        const claudeMiniMemories = state.memories.filter(
          (memory: Memory) => memory.claudeMiniId.equals(claudeMiniId)
        );

        allMemories.push(...claudeMiniMemories);
      } catch (error) {
        // 跳过无效账户
        continue;
      }
    }

    return allMemories;
  }

  /**
   * 创建记忆哈希
   */
  private createMemoryHash(memoryData: string, owner: PublicKey, timestamp: number): string {
    const data = `${memoryData}${owner.toString()}${timestamp}`;
    // 使用简单的哈希函数，实际应用中可以使用更安全的哈希
    return Buffer.from(data).toString('base64');
  }
}

// 导出工具函数
export async function createMemoryAnchorProgram(
  connection: Connection,
  payer: Keypair
): Promise<MemoryAnchor> {
  // 这里应该使用实际部署的程序ID
  const programId = new PublicKey('your_memory_anchor_program_id_here');
  
  return new MemoryAnchor(connection, programId, payer);
} 