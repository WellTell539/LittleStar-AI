'use client'

import { useState, useEffect } from 'react'
import { useWeb3 } from '@/hooks/useWeb3'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Vote, Plus, Loader2, ThumbsUp, ThumbsDown, Clock } from 'lucide-react'

interface Goal {
  id: number
  title: string
  description: string
  proposer: string
  yesVotes: number
  noVotes: number
  votingDeadline: Date
  executed: boolean
  approved: boolean
}

export function GoalVoting() {
  const { account, contracts, proposeGoal, voteOnGoal } = useWeb3()
  const [goals, setGoals] = useState<Goal[]>([])
  const [isProposing, setIsProposing] = useState(false)
  const [isVoting, setIsVoting] = useState<number | null>(null)
  const [showProposalForm, setShowProposalForm] = useState(false)
  const [proposalTitle, setProposalTitle] = useState('')
  const [proposalDescription, setProposalDescription] = useState('')
  const [error, setError] = useState('')

  // Load goals from contract
  useEffect(() => {
    if (contracts.goalDAO) {
      loadGoals()
    }
  }, [contracts.goalDAO])

  const loadGoals = async () => {
    // In production, load actual goals from contract
    // For demo, use mock data
    setGoals([
      {
        id: 0,
        title: '学习 Web3 开发',
        description: '深入学习区块链技术和智能合约开发',
        proposer: '0x1234...5678',
        yesVotes: 5,
        noVotes: 2,
        votingDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        executed: false,
        approved: false
      }
    ])
  }

  const handlePropose = async () => {
    if (!proposalTitle.trim() || !proposalDescription.trim()) {
      setError('请填写完整的提案信息')
      return
    }

    setIsProposing(true)
    setError('')

    try {
      await proposeGoal(proposalTitle.trim(), proposalDescription.trim())
      
      // Reset form
      setProposalTitle('')
      setProposalDescription('')
      setShowProposalForm(false)
      
      // Reload goals
      await loadGoals()
    } catch (err: unknown) {
      console.error('Proposal error:', err)
      setError(err instanceof Error ? err.message : '提案失败，请重试')
    } finally {
      setIsProposing(false)
    }
  }

  const handleVote = async (goalId: number, support: boolean) => {
    setIsVoting(goalId)
    setError('')

    try {
      await voteOnGoal(goalId, support)
      
      // Reload goals
      await loadGoals()
    } catch (err: unknown) {
      console.error('Voting error:', err)
      setError(err instanceof Error ? err.message : '投票失败，请重试')
    } finally {
      setIsVoting(null)
    }
  }

  const calculateVotePercentage = (goal: Goal) => {
    const total = goal.yesVotes + goal.noVotes
    if (total === 0) return 50
    return (goal.yesVotes / total) * 100
  }

  const isVotingActive = (goal: Goal) => {
    return new Date() < goal.votingDeadline && !goal.executed
  }

  if (!account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>社区治理</CardTitle>
          <CardDescription>
            连接钱包并拥有 LITTLE STAR AI NFT 后可参与投票
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Vote className="h-5 w-5" />
                社区治理
              </CardTitle>
              <CardDescription>
                为 LITTLE STAR AI 的发展目标投票
              </CardDescription>
            </div>
            {!showProposalForm && (
              <Button
                onClick={() => setShowProposalForm(true)}
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                提出目标
              </Button>
            )}
          </div>
        </CardHeader>
        
        {showProposalForm && (
          <CardContent className="border-t">
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="proposal-title">目标标题</Label>
                <Input
                  id="proposal-title"
                  placeholder="简明扼要的目标标题..."
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  disabled={isProposing}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="proposal-description">目标描述</Label>
                <Textarea
                  id="proposal-description"
                  placeholder="详细描述这个目标的内容和意义..."
                  value={proposalDescription}
                  onChange={(e) => setProposalDescription(e.target.value)}
                  rows={3}
                  disabled={isProposing}
                />
              </div>
              
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              
              <div className="flex gap-3">
                <Button
                  onClick={handlePropose}
                  disabled={isProposing}
                  className="flex-1"
                >
                  {isProposing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      提交中...
                    </>
                  ) : (
                    '提交提案'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowProposalForm(false)
                    setProposalTitle('')
                    setProposalDescription('')
                    setError('')
                  }}
                  disabled={isProposing}
                >
                  取消
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal) => (
          <Card key={goal.id}>
            <CardHeader>
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold">{goal.title}</h3>
                  {isVotingActive(goal) ? (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      投票中
                    </Badge>
                  ) : goal.approved ? (
                    <Badge variant="default">已通过</Badge>
                  ) : goal.executed ? (
                    <Badge variant="outline">已结束</Badge>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">{goal.description}</p>
                <p className="text-xs text-muted-foreground">
                  提案人: {goal.proposer}
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Vote Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    支持: {goal.yesVotes}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsDown className="h-4 w-4 text-red-600" />
                    反对: {goal.noVotes}
                  </span>
                </div>
                <Progress value={calculateVotePercentage(goal)} className="h-2" />
              </div>
              
              {/* Vote Buttons */}
              {isVotingActive(goal) && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleVote(goal.id, true)}
                    disabled={isVoting === goal.id}
                    variant="outline"
                    className="flex-1"
                  >
                    {isVoting === goal.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ThumbsUp className="mr-2 h-4 w-4" />
                    )}
                    支持
                  </Button>
                  <Button
                    onClick={() => handleVote(goal.id, false)}
                    disabled={isVoting === goal.id}
                    variant="outline"
                    className="flex-1"
                  >
                    {isVoting === goal.id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ThumbsDown className="mr-2 h-4 w-4" />
                    )}
                    反对
                  </Button>
                </div>
              )}
              
              {/* Deadline */}
              <p className="text-xs text-muted-foreground text-center">
                {isVotingActive(goal)
                  ? `投票截止: ${goal.votingDeadline.toLocaleDateString('zh-CN')}`
                  : '投票已结束'
                }
              </p>
            </CardContent>
          </Card>
        ))}
        
        {goals.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">暂无提案</p>
              <p className="text-sm text-muted-foreground mt-2">
                成为第一个提出目标的人！
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 