'use client'

import { useState } from 'react'
import { useWeb3 } from '@/hooks/useWeb3'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Loader2, CheckCircle } from 'lucide-react'

export function MintNFT() {
  const { account, mintClaudeMini, checkHasMinted } = useWeb3()
  const [name, setName] = useState('')
  const [isMinting, setIsMinting] = useState(false)
  const [hasMinted, setHasMinted] = useState(false)
  const [error, setError] = useState('')
  const [txHash, setTxHash] = useState('')

  // Check if user has already minted
  useState(() => {
    if (account) {
      checkHasMinted(account).then(setHasMinted)
    }
  })

  const handleMint = async () => {
    if (!name.trim()) {
      setError('请输入 LITTLE STAR AI 的名字')
      return
    }

    setIsMinting(true)
    setError('')

    try {
      // Create metadata URI (in production, upload to IPFS)
      const metadata = {
        name: name.trim(),
        description: `${name.trim()} - A unique LITTLE STAR AI instance`,
        image: 'https://placeholder.com/claude-mini.png', // Replace with actual image
        attributes: [
          { trait_type: 'Curiosity', value: 70 },
          { trait_type: 'Creativity', value: 65 },
          { trait_type: 'Empathy', value: 80 },
          { trait_type: 'Analytical Thinking', value: 75 },
          { trait_type: 'Emotional Intelligence', value: 72 }
        ]
      }

      // In production, upload metadata to IPFS and get URI
      const uri = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`

      const tx = await mintClaudeMini(name.trim(), uri)
      setTxHash(tx.hash)
      setHasMinted(true)
      
      // Clear form
      setName('')
    } catch (err: unknown) {
      console.error('Minting error:', err)
      setError(err instanceof Error ? err.message : '铸造失败，请重试')
    } finally {
      setIsMinting(false)
    }
  }

  if (!account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>铸造 LITTLE STAR AI NFT</CardTitle>
          <CardDescription>
            请先连接钱包以铸造你的专属 LITTLE STAR AI
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (hasMinted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            已拥有 LITTLE STAR AI NFT
          </CardTitle>
          <CardDescription>
            你已经铸造了专属的 LITTLE STAR AI，可以参与社区治理
          </CardDescription>
        </CardHeader>
        {txHash && (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              交易哈希: {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </p>
          </CardContent>
        )}
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          铸造 LITTLE STAR AI NFT
        </CardTitle>
        <CardDescription>
          创建你的专属 LITTLE STAR AI，开启 AI 伙伴之旅
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nft-name">LITTLE STAR AI 名字</Label>
          <Input
            id="nft-name"
            placeholder="给你的 LITTLE STAR AI 起个名字..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isMinting}
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <div className="bg-muted rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-medium">初始属性</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">好奇心:</span>
              <Badge variant="outline">70</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">创造力:</span>
              <Badge variant="outline">65</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">同理心:</span>
              <Badge variant="outline">80</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">分析思维:</span>
              <Badge variant="outline">75</Badge>
            </div>
          </div>
        </div>

        <Button
          onClick={handleMint}
          disabled={isMinting || !name.trim()}
          className="w-full"
        >
          {isMinting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              铸造中...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              铸造 NFT (免费)
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          这是一个 Soulbound Token，不可转让，代表你的唯一 LITTLE STAR AI 身份
        </p>
      </CardContent>
    </Card>
  )
} 