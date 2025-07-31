'use client'

import { useState, useEffect } from 'react'
import { Badge } from './badge'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { 
  Coins, 
  Zap, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface BlockchainSelectorProps {
  onNetworkChange?: (network: 'ethereum' | 'solana') => void
}

export function BlockchainSelector({ onNetworkChange }: BlockchainSelectorProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<'ethereum' | 'solana'>('solana')
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    // 检查环境变量配置
    const network = process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK || 'solana'
    setSelectedNetwork(network as 'ethereum' | 'solana')
    
    // 检查Solana配置
    if (network === 'solana') {
      const hasSolanaConfig = !!(
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL &&
        process.env.NEXT_PUBLIC_CLAUDE_MINI_SBT_PROGRAM_ID
      )
      setIsConfigured(hasSolanaConfig)
    } else {
      // 检查以太坊配置
      const hasEthereumConfig = !!(
        process.env.NEXT_PUBLIC_INFURA_KEY &&
        process.env.NEXT_PUBLIC_SOULBOUND_ADDRESS
      )
      setIsConfigured(hasEthereumConfig)
    }
  }, [])

  const handleNetworkChange = (network: 'ethereum' | 'solana') => {
    setSelectedNetwork(network)
    onNetworkChange?.(network)
  }

  const networkConfigs = {
    ethereum: {
      name: 'Ethereum',
      icon: Coins,
      color: 'bg-blue-500',
      features: [
        { icon: Clock, label: '确认时间', value: '12秒', color: 'text-blue-600' },
        { icon: DollarSign, label: '交易费用', value: '$5-50', color: 'text-red-600' },
        { icon: TrendingUp, label: 'TPS', value: '15-30', color: 'text-orange-600' },
        { icon: Zap, label: '扩展性', value: '有限', color: 'text-yellow-600' }
      ],
      description: '成熟的智能合约平台，生态系统丰富'
    },
    solana: {
      name: 'Solana',
      icon: Zap,
      color: 'bg-purple-500',
      features: [
        { icon: Clock, label: '确认时间', value: '400ms', color: 'text-green-600' },
        { icon: DollarSign, label: '交易费用', value: '$0.00025', color: 'text-green-600' },
        { icon: TrendingUp, label: 'TPS', value: '65,000+', color: 'text-green-600' },
        { icon: Zap, label: '扩展性', value: '高', color: 'text-green-600' }
      ],
      description: '高性能区块链，低费用，快速确认'
    }
  }

  const currentConfig = networkConfigs[selectedNetwork]

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${currentConfig.color} text-white`}>
            <currentConfig.icon className="w-5 h-5" />
          </div>
          区块链网络选择
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 网络选择器 */}
        <div className="flex gap-2">
          {Object.entries(networkConfigs).map(([key, config]) => (
            <Button
              key={key}
              variant={selectedNetwork === key ? 'default' : 'outline'}
              onClick={() => handleNetworkChange(key as 'ethereum' | 'solana')}
              className="flex-1"
            >
              <config.icon className="w-4 h-4 mr-2" />
              {config.name}
            </Button>
          ))}
        </div>

        {/* 当前网络信息 */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <currentConfig.icon className="w-5 h-5" />
              {currentConfig.name}
            </h3>
            <Badge variant={isConfigured ? 'default' : 'secondary'}>
              {isConfigured ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  已配置
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 mr-1" />
                  未配置
                </>
              )}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">
            {currentConfig.description}
          </p>

          {/* 性能指标 */}
          <div className="grid grid-cols-2 gap-3">
            {currentConfig.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <feature.icon className="w-4 h-4" />
                <span className="text-muted-foreground">{feature.label}:</span>
                <span className={feature.color}>{feature.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 配置提示 */}
        {!isConfigured && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">需要配置</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              {selectedNetwork === 'solana' 
                ? '请在环境变量中配置 Solana RPC URL 和程序 ID'
                : '请在环境变量中配置 Infura Key 和合约地址'
              }
            </p>
          </div>
        )}

        {/* 推荐信息 */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">推荐使用 Solana</span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            对于AI应用场景，Solana提供更低的交易费用和更快的确认速度，
            更适合频繁的AI状态更新和记忆锚定操作。
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 