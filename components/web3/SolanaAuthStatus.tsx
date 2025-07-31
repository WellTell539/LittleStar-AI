'use client'

import { useState, useEffect } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Wallet, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Copy,
  ExternalLink
} from 'lucide-react'
import { useSolanaService, isSolanaConfigured } from '@/lib/solana-service'

export function SolanaAuthStatus() {
  const { publicKey, connected, connecting, disconnecting, wallet } = useWallet()
  const { connection } = useConnection()
  const [balance, setBalance] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const solanaService = useSolanaService()

  // 获取钱包余额
  useEffect(() => {
    const getBalance = async () => {
      if (publicKey && connection) {
        try {
          const lamports = await connection.getBalance(publicKey)
          setBalance(lamports / 1e9) // 转换为SOL
        } catch (error) {
          console.error('获取余额失败:', error)
          setBalance(null)
        }
      } else {
        setBalance(null)
      }
    }

    getBalance()
  }, [publicKey, connection])

  const copyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toString())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const openInExplorer = () => {
    if (publicKey) {
      const explorerUrl = `https://explorer.solana.com/address/${publicKey.toString()}?cluster=devnet`
      window.open(explorerUrl, '_blank')
    }
  }

  const getStatusInfo = () => {
    if (connecting) {
      return {
        status: 'connecting',
        color: 'bg-yellow-100 text-yellow-700',
        icon: AlertCircle,
        text: '连接中...'
      }
    }
    
    if (disconnecting) {
      return {
        status: 'disconnecting',
        color: 'bg-yellow-100 text-yellow-700',
        icon: AlertCircle,
        text: '断开连接中...'
      }
    }
    
    if (connected && publicKey) {
      return {
        status: 'connected',
        color: 'bg-green-100 text-green-700',
        icon: CheckCircle,
        text: '已连接'
      }
    }
    
    return {
      status: 'disconnected',
      color: 'bg-red-100 text-red-700',
      icon: XCircle,
      text: '未连接'
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon
  const solanaConfigured = isSolanaConfigured()
  const serviceStatus = solanaService?.getStatus()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Solana钱包状态
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 连接状态 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">连接状态:</span>
          <Badge variant="secondary" className={statusInfo.color}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusInfo.text}
          </Badge>
        </div>

        {/* 钱包信息 */}
        {connected && publicKey && (
          <>
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">钱包地址:</span>
              <div className="flex items-center gap-2 p-2 bg-muted rounded text-sm font-mono">
                <span className="flex-1 truncate">
                  {publicKey.toString()}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyAddress}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={openInExplorer}
                  className="h-6 w-6 p-0"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
              {copied && (
                <span className="text-xs text-green-600">地址已复制！</span>
              )}
            </div>

            {/* 余额 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">余额:</span>
              <span className="text-sm font-medium">
                {balance !== null ? `${balance.toFixed(4)} SOL` : '加载中...'}
              </span>
            </div>

            {/* 钱包类型 */}
            {wallet && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">钱包类型:</span>
                <span className="text-sm font-medium">{wallet.adapter.name}</span>
              </div>
            )}
          </>
        )}

        {/* Solana服务状态 */}
        {solanaConfigured && serviceStatus && (
          <div className="space-y-2 pt-2 border-t">
            <span className="text-sm font-medium">Solana服务状态:</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                {serviceStatus.claudeMiniSBTReady ? (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-500" />
                )}
                <span>LITTLE STAR AI SBT</span>
              </div>
              <div className="flex items-center gap-1">
                {serviceStatus.memoryAnchorReady ? (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-500" />
                )}
                <span>Memory Anchor</span>
              </div>
            </div>
          </div>
        )}

        {/* 配置提示 */}
        {!solanaConfigured && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Solana未配置</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              请在环境变量中配置Solana RPC URL和程序ID以启用完整功能。
            </p>
          </div>
        )}

        {/* 钱包按钮 */}
        <div className="flex gap-2 pt-2">
          {!connected ? (
            <WalletMultiButton className="flex-1" />
          ) : (
            <WalletDisconnectButton className="flex-1" />
          )}
        </div>
      </CardContent>
    </Card>
  )
} 