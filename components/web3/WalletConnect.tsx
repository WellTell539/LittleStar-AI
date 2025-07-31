'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useWeb3 } from '@/hooks/useWeb3'
import { Wallet, LogOut, Loader2 } from 'lucide-react'

export function WalletConnect() {
  const { account, chainId, isConnecting, error, connectWallet, disconnect } = useWeb3()

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getNetworkName = (chainId: number) => {
    const networks: { [key: number]: string } = {
      1: 'Ethereum',
      11155111: 'Sepolia',
      1337: 'Localhost',
      137: 'Polygon',
      80001: 'Mumbai'
    }
    return networks[chainId] || `Chain ${chainId}`
  }

  if (account) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">{formatAddress(account)}</p>
              <p className="text-xs text-muted-foreground">
                {chainId && getNetworkName(chainId)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={disconnect}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">连接钱包</h3>
        </div>
        
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        
        <Button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full"
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              连接中...
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              连接 MetaMask
            </>
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          连接钱包以铸造 LITTLE STAR AI NFT 并参与治理
        </p>
      </div>
    </Card>
  )
} 