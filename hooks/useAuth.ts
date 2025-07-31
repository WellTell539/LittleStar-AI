import { useEffect, useState } from 'react'
import { useWeb3 } from './useWeb3'
import { useStore } from '@/store/useStore'

interface AuthSession {
  address: string
  chainId: number
  isOwner: boolean
  hasSBT: boolean
  signature?: string
  nonce?: string
  expiresAt?: number
}

export function useAuth() {
  const { account, chainId, sbt, isConnected } = useWeb3()
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // 生成登录消息
  const generateLoginMessage = (address: string, nonce: string) => {
    return `Welcome to LITTLE STAR AI!\n\nClick to sign in and accept the Terms of Service.\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nWallet address:\n${address}\n\nNonce:\n${nonce}`
  }
  
  // 验证签名并创建会话
  const authenticate = async () => {
    if (!account || !isConnected) return
    
    setIsLoading(true)
    
    try {
      // 生成随机 nonce
      const nonce = Math.random().toString(36).substring(7)
      const message = generateLoginMessage(account, nonce)
      
      // 请求用户签名
      if (!window.ethereum) {
        throw new Error('请安装 MetaMask!')
      }
      
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, account],
      })
      
      // 检查是否拥有 SBT
      let hasSBT = false
      if (sbt) {
        try {
          const balance = await sbt.balanceOf(account)
          hasSBT = balance > BigInt(0)
        } catch (error) {
          console.error('检查 SBT 余额失败:', error)
        }
      }
      
      // 创建会话
      const newSession: AuthSession = {
        address: account,
        chainId: chainId || 1337,
        isOwner: false, // TODO: 检查是否是合约 owner
        hasSBT,
        signature,
        nonce,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24小时过期
      }
      
      setSession(newSession)
      
      // 保存到 localStorage
      localStorage.setItem('claudeMiniSession', JSON.stringify(newSession))
      
      return newSession
    } catch (error) {
      console.error('认证失败:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }
  
  // 登出
  const logout = () => {
    setSession(null)
    localStorage.removeItem('claudeMiniSession')
  }
  
  // 检查会话是否有效
  const isSessionValid = (session: AuthSession): boolean => {
    if (!session.expiresAt) return false
    return Date.now() < session.expiresAt
  }
  
  // 初始化时检查本地存储的会话
  useEffect(() => {
    const storedSession = localStorage.getItem('claudeMiniSession')
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession) as AuthSession
        
        // 验证会话是否有效且地址匹配
        if (
          isSessionValid(parsedSession) &&
          parsedSession.address.toLowerCase() === account?.toLowerCase()
        ) {
          setSession(parsedSession)
        } else {
          localStorage.removeItem('claudeMiniSession')
        }
      } catch (error) {
        console.error('解析会话失败:', error)
        localStorage.removeItem('claudeMiniSession')
      }
    }
  }, [account])
  
  // 账户变化时清除会话
  useEffect(() => {
    if (session && account && session.address.toLowerCase() !== account.toLowerCase()) {
      logout()
    }
  }, [account, session])
  
  return {
    session,
    isAuthenticated: !!session && isSessionValid(session),
    isLoading,
    authenticate,
    logout,
    canVote: session?.hasSBT || false,
    isOwner: session?.isOwner || false,
  }
} 