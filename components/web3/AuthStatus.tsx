'use client'

import { useAuth } from '@/hooks/useAuth'
import { useWeb3 } from '@/hooks/useWeb3'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, LogOut, Shield, User } from 'lucide-react'

export function AuthStatus() {
  const { isConnected, account } = useWeb3()
  const { session, isAuthenticated, isLoading, authenticate, logout, canVote, isOwner } = useAuth()
  
  if (!isConnected) {
    return null
  }
  
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          认证状态
        </CardTitle>
        <CardDescription>管理您的 Web3 身份认证</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAuthenticated && session ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-mono">{formatAddress(session.address)}</span>
              </div>
              <div className="flex items-center gap-2">
                {session.hasSBT && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    SBT 持有者
                  </Badge>
                )}
                {isOwner && (
                  <Badge variant="default" className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    管理员
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>链 ID: {session.chainId}</p>
              {session.expiresAt && (
                <p>
                  会话过期时间: {new Date(session.expiresAt).toLocaleString('zh-CN')}
                </p>
              )}
            </div>
            
            <div className="pt-2 space-y-2">
              <div className="text-sm">
                <p className="font-medium mb-1">权限:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>查看和创建记忆 ✓</li>
                  <li>设置每日目标 ✓</li>
                  {canVote && <li>参与治理投票 ✓</li>}
                  {isOwner && <li>管理智能合约 ✓</li>}
                </ul>
              </div>
            </div>
            
            <Button
              onClick={logout}
              variant="outline"
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              退出登录
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              连接钱包地址: {account && formatAddress(account)}
            </p>
            <p className="text-sm text-muted-foreground">
              请进行身份认证以解锁所有功能
            </p>
            <Button
              onClick={authenticate}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? '认证中...' : '签名认证'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
} 