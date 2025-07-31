import { Connection, PublicKey, Keypair, Transaction, SystemProgram } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useMemo } from 'react'
import { ClaudeMiniSBT, ClaudeMiniAttributes } from '../solana/ClaudeMiniSBT'
import { MemoryAnchor } from '../solana/MemoryAnchor'

// 程序ID配置
const PROGRAM_IDS = {
  claudeMiniSBT: process.env.NEXT_PUBLIC_CLAUDE_MINI_SBT_PROGRAM_ID || '',
  memoryAnchor: process.env.NEXT_PUBLIC_MEMORY_ANCHOR_PROGRAM_ID || '',
  goalDAO: process.env.NEXT_PUBLIC_GOAL_DAO_PROGRAM_ID || ''
}

export class SolanaService {
  private connection: Connection
  private wallet: { publicKey: PublicKey | null }
  private claudeMiniSBT: ClaudeMiniSBT | null = null
  private memoryAnchor: MemoryAnchor | null = null

  constructor(connection: Connection, wallet: { publicKey: PublicKey | null }) {
    this.connection = connection
    this.wallet = wallet
    this.initializePrograms()
  }

  private initializePrograms() {
    if (!this.wallet.publicKey) return

    try {
      // 创建程序实例
      if (PROGRAM_IDS.claudeMiniSBT) {
        const programId = new PublicKey(PROGRAM_IDS.claudeMiniSBT)
        // 注意：这里需要一个Keypair，但在浏览器环境中我们使用钱包
        // 实际实现中需要调整构造函数
        this.claudeMiniSBT = new ClaudeMiniSBT(this.connection, programId, {} as any)
      }

      if (PROGRAM_IDS.memoryAnchor) {
        const programId = new PublicKey(PROGRAM_IDS.memoryAnchor)
        this.memoryAnchor = new MemoryAnchor(this.connection, programId, {} as any)
      }
    } catch (error) {
      console.error('初始化Solana程序失败:', error)
    }
  }

  /**
   * 创建LITTLE STAR AI SBT
   */
  async createClaudeMini(
    name: string,
    attributes: Omit<ClaudeMiniAttributes, 'name' | 'createdAt'>
  ): Promise<PublicKey | null> {
    if (!this.claudeMiniSBT || !this.wallet.publicKey) {
      throw new Error('LITTLE STAR AI SBT程序未初始化或钱包未连接')
    }

    try {
      const claudeMiniId = await this.claudeMiniSBT.createClaudeMini(name, attributes)
      console.log('✅ LITTLE STAR AI SBT创建成功:', claudeMiniId.toString())
      return claudeMiniId
    } catch (error) {
      console.error('创建LITTLE STAR AI SBT失败:', error)
      throw error
    }
  }

  /**
   * 更新LITTLE STAR AI属性
   */
  async updateClaudeMiniAttributes(
    stateAccountPubkey: PublicKey,
    newAttributes: Partial<ClaudeMiniAttributes>
  ): Promise<void> {
    if (!this.claudeMiniSBT) {
      throw new Error('LITTLE STAR AI SBT程序未初始化')
    }

    try {
      await this.claudeMiniSBT.updateAttributes(stateAccountPubkey, newAttributes)
      console.log('✅ LITTLE STAR AI属性更新成功')
    } catch (error) {
      console.error('更新LITTLE STAR AI属性失败:', error)
      throw error
    }
  }

  /**
   * 获取用户的LITTLE STAR AI
   */
  async getUserClaudeMinis(): Promise<PublicKey[]> {
    if (!this.claudeMiniSBT || !this.wallet.publicKey) {
      return []
    }

    try {
      const claudeMinis = await this.claudeMiniSBT.getClaudeMinisByOwner(this.wallet.publicKey)
      return claudeMinis
    } catch (error) {
      console.error('获取用户LITTLE STAR AI失败:', error)
      return []
    }
  }

  /**
   * 锚定记忆
   */
  async anchorMemory(
    memoryData: string,
    memoryType: string,
    category: string,
    claudeMiniId: PublicKey
  ): Promise<PublicKey | null> {
    if (!this.memoryAnchor) {
      throw new Error('Memory Anchor程序未初始化')
    }

    try {
      const memoryId = await this.memoryAnchor.anchorMemory(
        memoryData,
        memoryType,
        category,
        claudeMiniId
      )
      console.log('✅ 记忆锚定成功:', memoryId.toString())
      return memoryId
    } catch (error) {
      console.error('锚定记忆失败:', error)
      throw error
    }
  }

  /**
   * 获取LITTLE STAR AI的记忆
   */
  async getClaudeMiniMemories(claudeMiniId: PublicKey) {
    if (!this.memoryAnchor) {
      return []
    }

    try {
      const memories = await this.memoryAnchor.getMemoriesByClaudeMini(claudeMiniId)
      return memories
    } catch (error) {
      console.error('获取记忆失败:', error)
      return []
    }
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
    if (!this.memoryAnchor) {
      return false
    }

    try {
      const isValid = await this.memoryAnchor.verifyMemory(
        stateAccountPubkey,
        memoryData,
        owner,
        timestamp
      )
      return isValid
    } catch (error) {
      console.error('验证记忆失败:', error)
      return false
    }
  }

  /**
   * 获取服务状态
   */
  getStatus() {
    return {
      connected: !!this.wallet.publicKey,
      claudeMiniSBTReady: !!this.claudeMiniSBT,
      memoryAnchorReady: !!this.memoryAnchor,
      programIds: PROGRAM_IDS
    }
  }
}

// React Hook for Solana Service
export function useSolanaService() {
  const { connection } = useConnection()
  const wallet = useWallet()

  const solanaService = useMemo(() => {
    if (!wallet || !wallet.publicKey) return null
    return new SolanaService(connection, { publicKey: wallet.publicKey })
  }, [connection, wallet])

  return solanaService
}

// 导出便捷函数
export function isSolanaConfigured(): boolean {
  return !!(
    PROGRAM_IDS.claudeMiniSBT &&
    PROGRAM_IDS.memoryAnchor &&
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL
  )
} 