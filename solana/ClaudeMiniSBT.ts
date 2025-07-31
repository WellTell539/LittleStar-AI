import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
  Connection,
  clusterApiUrl,
} from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
  getAccount,
  getMint,
} from '@solana/spl-token';
import * as borsh from 'borsh';

// LITTLE STAR AI SBT 数据结构
export interface ClaudeMiniAttributes {
  name: string;
  createdAt: number;
  curiosity: number;
  creativity: number;
  empathy: number;
  analyticalThinking: number;
  emotionalIntelligence: number;
}

// 程序状态账户数据结构
export interface ClaudeMiniState {
  owner: PublicKey;
  attributes: ClaudeMiniAttributes;
  isInitialized: boolean;
}

// 序列化/反序列化schema
class ClaudeMiniStateClass {
  owner!: PublicKey;
  attributes!: ClaudeMiniAttributes;
  isInitialized!: boolean;
}

const ClaudeMiniStateSchema = new Map([
  [
    ClaudeMiniStateClass,
    {
      kind: 'struct',
      fields: [
        ['owner', [32]], // PublicKey
        ['attributes', {
          kind: 'struct',
          fields: [
            ['name', 'string'],
            ['createdAt', 'u64'],
            ['curiosity', 'u8'],
            ['creativity', 'u8'],
            ['empathy', 'u8'],
            ['analyticalThinking', 'u8'],
            ['emotionalIntelligence', 'u8'],
          ]
        }],
        ['isInitialized', 'bool'],
      ],
    },
  ],
]);

export class ClaudeMiniSBT {
  private connection: Connection;
  private programId: PublicKey;
  private payer: Keypair;

  constructor(connection: Connection, programId: PublicKey, payer: Keypair) {
    this.connection = connection;
    this.programId = programId;
    this.payer = payer;
  }

  /**
   * 创建LITTLE STAR AI SBT
   */
  async createClaudeMini(
    name: string,
    attributes: Omit<ClaudeMiniAttributes, 'name' | 'createdAt'>
  ): Promise<PublicKey> {
    // 生成状态账户密钥对
    const stateAccount = Keypair.generate();
    
    // 创建默认属性
    const defaultAttributes: ClaudeMiniAttributes = {
      name,
      createdAt: Date.now(),
      curiosity: attributes.curiosity || 70,
      creativity: attributes.creativity || 65,
      empathy: attributes.empathy || 80,
      analyticalThinking: attributes.analyticalThinking || 75,
      emotionalIntelligence: attributes.emotionalIntelligence || 72,
    };

    // 创建状态账户
    const stateData = {
      owner: this.payer.publicKey,
      attributes: defaultAttributes,
      isInitialized: true,
    };

    // 序列化数据
    const serializedData = borsh.serialize(ClaudeMiniStateSchema, stateData);
    
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

    console.log(`✅ LITTLE STAR AI SBT created: ${stateAccount.publicKey.toString()}`);
    return stateAccount.publicKey;
  }

  /**
   * 更新LITTLE STAR AI属性
   */
  async updateAttributes(
    stateAccountPubkey: PublicKey,
    newAttributes: Partial<ClaudeMiniAttributes>
  ): Promise<void> {
    // 获取当前状态
    const currentState = await this.getClaudeMiniState(stateAccountPubkey);
    
    if (!currentState) {
      throw new Error('LITTLE STAR AI not found');
    }

    // 验证所有者
    if (!currentState.owner.equals(this.payer.publicKey)) {
      throw new Error('Only owner can update attributes');
    }

    // 合并新属性
    const updatedAttributes = {
      ...currentState.attributes,
      ...newAttributes,
    };

    // 序列化更新数据
    const serializedData = borsh.serialize(ClaudeMiniStateSchema, {
      owner: currentState.owner,
      attributes: updatedAttributes,
      isInitialized: true,
    });

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

    console.log(`✅ LITTLE STAR AI attributes updated`);
  }

  /**
   * 获取LITTLE STAR AI状态
   */
  async getClaudeMiniState(stateAccountPubkey: PublicKey): Promise<ClaudeMiniState | null> {
    try {
      const accountInfo = await this.connection.getAccountInfo(stateAccountPubkey);
      
      if (!accountInfo) {
        return null;
      }

      // 反序列化数据
      const state = borsh.deserialize(
        ClaudeMiniStateSchema,
        ClaudeMiniStateClass,
        accountInfo.data
      );

      return state;
    } catch (error) {
      console.error('Error getting LITTLE STAR AI state:', error);
      return null;
    }
  }

  /**
   * 获取用户的所有LITTLE STAR AI
   */
  async getClaudeMinisByOwner(ownerPubkey: PublicKey): Promise<PublicKey[]> {
    const accounts = await this.connection.getProgramAccounts(this.programId, {
      filters: [
        {
          dataSize: 32 + 8 + 1 + 1 + 1 + 1 + 1 + 1, // 状态账户大小
        },
      ],
    });

    const userClaudeMinis: PublicKey[] = [];

    for (const account of accounts) {
      try {
        const state = borsh.deserialize(
          ClaudeMiniStateSchema,
          ClaudeMiniStateClass,
          account.account.data
        );

        if (state.owner.equals(ownerPubkey)) {
          userClaudeMinis.push(account.pubkey);
        }
      } catch (error) {
        // 跳过无效账户
        continue;
      }
    }

    return userClaudeMinis;
  }
}

// 导出工具函数
export async function createClaudeMiniSBTProgram(
  connection: Connection,
  payer: Keypair
): Promise<ClaudeMiniSBT> {
  // 这里应该使用实际部署的程序ID
  const programId = new PublicKey('your_program_id_here');
  
  return new ClaudeMiniSBT(connection, programId, payer);
} 