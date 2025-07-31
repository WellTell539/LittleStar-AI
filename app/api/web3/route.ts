import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'

// 智能合约ABI - 简化版本
const CLAUDE_MINI_SBT_ABI = [
  "function mintTo(address to, string memory name, string memory uri) external returns (uint256)",
  "function tokenOfOwner(address owner) external view returns (uint256)",
  "function exists(uint256 tokenId) external view returns (bool)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function updatePersonality(uint256 tokenId, uint8[5] memory traits) external",
  "function getPersonality(uint256 tokenId) external view returns (uint8[5] memory)"
]

const MEMORY_ANCHOR_ABI = [
  "function anchorMemory(uint256 tokenId, uint8 memoryType, bytes32 contentHash, string memory metadata) external returns (uint256)",
  "function getMemory(uint256 memoryId) external view returns (tuple(uint256 tokenId, uint8 memoryType, bytes32 contentHash, string metadata, uint256 timestamp))",
  "function getTokenMemories(uint256 tokenId) external view returns (uint256[] memory)",
  "function verifyMemory(uint256 memoryId, bytes32 contentHash) external view returns (bool)"
]

const GOAL_DAO_ABI = [
  "function proposeGoal(string memory title, string memory description, uint256 deadline) external returns (uint256)",
  "function vote(uint256 proposalId, bool support) external",
  "function executeProposal(uint256 proposalId) external",
  "function getProposal(uint256 proposalId) external view returns (tuple(string title, string description, uint256 deadline, uint256 forVotes, uint256 againstVotes, bool executed, address proposer))",
  "function hasVoted(uint256 proposalId, address voter) external view returns (bool)"
]

// 错误处理
class Web3Error extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'Web3Error'
  }
}

// Web3 服务类
class Web3Service {
  private provider: ethers.JsonRpcProvider | null = null
  private signer: ethers.Wallet | null = null

  constructor() {
    this.initializeProvider()
  }

  private initializeProvider() {
    const rpcUrl = process.env.SEPOLIA_RPC_URL || process.env.MAINNET_RPC_URL
    const privateKey = process.env.PRIVATE_KEY

    if (rpcUrl) {
      this.provider = new ethers.JsonRpcProvider(rpcUrl)
      
      if (privateKey && privateKey.length === 66) {
        try {
          this.signer = new ethers.Wallet(privateKey, this.provider)
        } catch (error) {
          console.error('Failed to initialize signer:', error)
        }
      }
    }
  }

  private getContractAddress(contractName: string): string {
    const addresses = {
      sbt: process.env.NEXT_PUBLIC_SOULBOUND_ADDRESS,
      memory: process.env.NEXT_PUBLIC_MEMORY_ANCHOR_ADDRESS,
      dao: process.env.NEXT_PUBLIC_GOAL_DAO_ADDRESS
    }

    const address = addresses[contractName as keyof typeof addresses]
    if (!address) {
      throw new Web3Error(`Contract address not configured for ${contractName}`)
    }
    return address
  }

  private getContract(contractName: string, abi: string[]) {
    if (!this.provider) {
      throw new Web3Error('Provider not initialized')
    }

    const address = this.getContractAddress(contractName)
    return new ethers.Contract(address, abi, this.signer || this.provider)
  }

  // SBT 相关功能
  async mintSBT(userAddress: string, name: string): Promise<{ tokenId: string; txHash: string }> {
    if (!this.signer) {
      throw new Web3Error('Signer not available for minting')
    }

    const contract = this.getContract('sbt', CLAUDE_MINI_SBT_ABI)
    const uri = `https://api.claude-mini.com/metadata/${userAddress}`

    try {
      const tx = await contract.mintTo(userAddress, name, uri)
      const receipt = await tx.wait()
      
      // 从事件中获取tokenId
             const mintEvent = receipt.logs.find((log: unknown) => {
         const logWithTopics = log as { topics?: string[] }
         return logWithTopics.topics?.[0] === ethers.id('Transfer(address,address,uint256)')
       })
       const logWithTopics = mintEvent as { topics?: string[] }
       const tokenId = logWithTopics?.topics?.[3] ? ethers.toNumber(logWithTopics.topics[3]) : '1'

      return {
        tokenId: tokenId.toString(),
        txHash: receipt.hash
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new Web3Error(`Failed to mint SBT: ${errorMessage}`)
    }
  }

  async getSBTInfo(userAddress: string): Promise<{ 
    tokenId: string | null
    exists: boolean
    personality?: number[]
    uri?: string
  }> {
    const contract = this.getContract('sbt', CLAUDE_MINI_SBT_ABI)

    try {
      const tokenId = await contract.tokenOfOwner(userAddress)
      const exists = await contract.exists(tokenId)

      if (!exists) {
        return { tokenId: null, exists: false }
      }

      const [personality, uri] = await Promise.all([
        contract.getPersonality(tokenId),
        contract.tokenURI(tokenId)
      ])

      return {
        tokenId: tokenId.toString(),
        exists: true,
        personality: personality.map((p: any) => ethers.toNumber(p)),
        uri
      }
    } catch (error: any) {
      if (error.message.includes('ERC721: invalid token ID')) {
        return { tokenId: null, exists: false }
      }
      throw new Web3Error(`Failed to get SBT info: ${error.message}`)
    }
  }

  async updatePersonality(tokenId: string, traits: number[]): Promise<string> {
    if (!this.signer) {
      throw new Web3Error('Signer not available for updating')
    }

    const contract = this.getContract('sbt', CLAUDE_MINI_SBT_ABI)

    try {
      const tx = await contract.updatePersonality(tokenId, traits)
      const receipt = await tx.wait()
      return receipt.hash
    } catch (error: any) {
      throw new Web3Error(`Failed to update personality: ${error.message}`)
    }
  }

  // 记忆锚定功能
  async anchorMemory(tokenId: string, memoryType: number, content: string): Promise<{ 
    memoryId: string
    txHash: string 
  }> {
    if (!this.signer) {
      throw new Web3Error('Signer not available for anchoring')
    }

    const contract = this.getContract('memory', MEMORY_ANCHOR_ABI)
    const contentHash = ethers.keccak256(ethers.toUtf8Bytes(content))
    const metadata = JSON.stringify({
      content: content.substring(0, 200),
      timestamp: Date.now(),
      version: '1.0'
    })

    try {
      const tx = await contract.anchorMemory(tokenId, memoryType, contentHash, metadata)
      const receipt = await tx.wait()
      
      // 从事件中获取memoryId
      const anchorEvent = receipt.logs.find((log: any) => 
        log.fragment?.name === 'MemoryAnchored'
      )
      const memoryId = anchorEvent ? ethers.toNumber(anchorEvent.args[0]) : '1'

      return {
        memoryId: memoryId.toString(),
        txHash: receipt.hash
      }
    } catch (error: any) {
      throw new Web3Error(`Failed to anchor memory: ${error.message}`)
    }
  }

  async getMemory(memoryId: string): Promise<{
    tokenId: string
    memoryType: number
    contentHash: string
    metadata: string
    timestamp: number
  }> {
    const contract = this.getContract('memory', MEMORY_ANCHOR_ABI)

    try {
      const memory = await contract.getMemory(memoryId)
      return {
        tokenId: memory.tokenId.toString(),
        memoryType: ethers.toNumber(memory.memoryType),
        contentHash: memory.contentHash,
        metadata: memory.metadata,
        timestamp: ethers.toNumber(memory.timestamp)
      }
    } catch (error: any) {
      throw new Web3Error(`Failed to get memory: ${error.message}`)
    }
  }

  async getTokenMemories(tokenId: string): Promise<string[]> {
    const contract = this.getContract('memory', MEMORY_ANCHOR_ABI)

    try {
      const memoryIds = await contract.getTokenMemories(tokenId)
      return memoryIds.map((id: any) => id.toString())
    } catch (error: any) {
      throw new Web3Error(`Failed to get token memories: ${error.message}`)
    }
  }

  // DAO 功能
  async proposeGoal(title: string, description: string, deadline: number): Promise<{
    proposalId: string
    txHash: string
  }> {
    if (!this.signer) {
      throw new Web3Error('Signer not available for proposing')
    }

    const contract = this.getContract('dao', GOAL_DAO_ABI)

    try {
      const tx = await contract.proposeGoal(title, description, deadline)
      const receipt = await tx.wait()
      
      // 从事件中获取proposalId
      const proposeEvent = receipt.logs.find((log: any) => 
        log.fragment?.name === 'ProposalCreated'
      )
      const proposalId = proposeEvent ? ethers.toNumber(proposeEvent.args[0]) : '1'

      return {
        proposalId: proposalId.toString(),
        txHash: receipt.hash
      }
    } catch (error: any) {
      throw new Web3Error(`Failed to propose goal: ${error.message}`)
    }
  }

  async vote(proposalId: string, support: boolean): Promise<string> {
    if (!this.signer) {
      throw new Web3Error('Signer not available for voting')
    }

    const contract = this.getContract('dao', GOAL_DAO_ABI)

    try {
      const tx = await contract.vote(proposalId, support)
      const receipt = await tx.wait()
      return receipt.hash
    } catch (error: any) {
      throw new Web3Error(`Failed to vote: ${error.message}`)
    }
  }

  async getProposal(proposalId: string): Promise<{
    title: string
    description: string
    deadline: number
    forVotes: number
    againstVotes: number
    executed: boolean
    proposer: string
  }> {
    const contract = this.getContract('dao', GOAL_DAO_ABI)

    try {
      const proposal = await contract.getProposal(proposalId)
      return {
        title: proposal.title,
        description: proposal.description,
        deadline: ethers.toNumber(proposal.deadline),
        forVotes: ethers.toNumber(proposal.forVotes),
        againstVotes: ethers.toNumber(proposal.againstVotes),
        executed: proposal.executed,
        proposer: proposal.proposer
      }
    } catch (error: any) {
      throw new Web3Error(`Failed to get proposal: ${error.message}`)
    }
  }

  // 网络状态检查
  async getNetworkInfo(): Promise<{
    chainId: number
    blockNumber: number
    gasPrice: string
    isConnected: boolean
  }> {
    if (!this.provider) {
      return {
        chainId: 0,
        blockNumber: 0,
        gasPrice: '0',
        isConnected: false
      }
    }

    try {
      const [network, blockNumber, gasPrice] = await Promise.all([
        this.provider.getNetwork(),
        this.provider.getBlockNumber(),
        this.provider.getFeeData()
      ])

      return {
        chainId: Number(network.chainId),
        blockNumber,
        gasPrice: ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei'),
        isConnected: true
      }
    } catch (error) {
      return {
        chainId: 0,
        blockNumber: 0,
        gasPrice: '0',
        isConnected: false
      }
    }
  }
}

// 初始化Web3服务
const web3Service = new Web3Service()

// GET - 查询操作
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const address = searchParams.get('address')
    const id = searchParams.get('id')

    switch (action) {
      case 'network':
        const networkInfo = await web3Service.getNetworkInfo()
        return NextResponse.json({
          success: true,
          data: networkInfo
        })

      case 'sbt':
        if (!address) {
          return NextResponse.json(
            { success: false, error: 'Address is required' },
            { status: 400 }
          )
        }
        const sbtInfo = await web3Service.getSBTInfo(address)
        return NextResponse.json({
          success: true,
          data: sbtInfo
        })

      case 'memory':
        if (!id) {
          return NextResponse.json(
            { success: false, error: 'Memory ID is required' },
            { status: 400 }
          )
        }
        const memory = await web3Service.getMemory(id)
        return NextResponse.json({
          success: true,
          data: memory
        })

      case 'memories':
        if (!id) {
          return NextResponse.json(
            { success: false, error: 'Token ID is required' },
            { status: 400 }
          )
        }
        const memories = await web3Service.getTokenMemories(id)
        return NextResponse.json({
          success: true,
          data: memories
        })

      case 'proposal':
        if (!id) {
          return NextResponse.json(
            { success: false, error: 'Proposal ID is required' },
            { status: 400 }
          )
        }
        const proposal = await web3Service.getProposal(id)
        return NextResponse.json({
          success: true,
          data: proposal
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error: any) {
    console.error('Web3 GET error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error instanceof Web3Error ? 400 : 500 }
    )
  }
}

// POST - 写入操作
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'mint':
        const { address, name } = body
        if (!address || !name) {
          return NextResponse.json(
            { success: false, error: 'Address and name are required' },
            { status: 400 }
          )
        }
        const mintResult = await web3Service.mintSBT(address, name)
        return NextResponse.json({
          success: true,
          data: mintResult
        })

      case 'updatePersonality':
        const { tokenId, traits } = body
        if (!tokenId || !traits || !Array.isArray(traits)) {
          return NextResponse.json(
            { success: false, error: 'Token ID and traits array are required' },
            { status: 400 }
          )
        }
        const updateResult = await web3Service.updatePersonality(tokenId, traits)
        return NextResponse.json({
          success: true,
          data: { txHash: updateResult }
        })

      case 'anchorMemory':
        const { tokenId: memTokenId, memoryType, content } = body
        if (!memTokenId || memoryType === undefined || !content) {
          return NextResponse.json(
            { success: false, error: 'Token ID, memory type, and content are required' },
            { status: 400 }
          )
        }
        const anchorResult = await web3Service.anchorMemory(memTokenId, memoryType, content)
        return NextResponse.json({
          success: true,
          data: anchorResult
        })

      case 'propose':
        const { title, description, deadline } = body
        if (!title || !description || !deadline) {
          return NextResponse.json(
            { success: false, error: 'Title, description, and deadline are required' },
            { status: 400 }
          )
        }
        const proposeResult = await web3Service.proposeGoal(title, description, deadline)
        return NextResponse.json({
          success: true,
          data: proposeResult
        })

      case 'vote':
        const { proposalId, support } = body
        if (!proposalId || support === undefined) {
          return NextResponse.json(
            { success: false, error: 'Proposal ID and support are required' },
            { status: 400 }
          )
        }
        const voteResult = await web3Service.vote(proposalId, support)
        return NextResponse.json({
          success: true,
          data: { txHash: voteResult }
        })

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error: any) {
    console.error('Web3 POST error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error instanceof Web3Error ? 400 : 500 }
    )
  }
} 