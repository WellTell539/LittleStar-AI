'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { MessageSquare, ThumbsUp, ThumbsDown, Meh } from 'lucide-react'

type FeedbackType = 'positive' | 'neutral' | 'negative'

export function UserFeedback() {
  const [personalityStats] = useState({
    empathy: 75,
    creativity: 68,
    analyticalThinking: 71,
    emotionalIntelligence: 76
  })
  
  const addUserFeedback = (feedback: { type: FeedbackType; content: string; impact: number }) => {
    // Mock implementation
    console.log('Adding feedback:', feedback)
  }
  
  const adaptBehavior = () => {
    // Mock implementation
    console.log('Adapting behavior')
  }
  
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('neutral')
  const [feedbackContent, setFeedbackContent] = useState('')
  const [impactLevel, setImpactLevel] = useState([5])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!feedbackContent.trim()) return
    
    setIsSubmitting(true)
    
    // Add feedback
    addUserFeedback({
      type: feedbackType,
      content: feedbackContent.trim(),
      impact: impactLevel[0]
    })
    
    // Trigger behavior adaptation
    adaptBehavior()
    
    // Reset form
    setFeedbackContent('')
    setFeedbackType('neutral')
    setImpactLevel([5])
    setIsSubmitting(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          提供反馈
        </CardTitle>
        <CardDescription>
          你的反馈将帮助 LITTLE STAR AI 学习和成长
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Feedback Type */}
          <div className="space-y-2">
            <Label>反馈类型</Label>
            <RadioGroup
              value={feedbackType}
              onValueChange={(value: FeedbackType) => setFeedbackType(value)}
            >
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="positive" id="positive" />
                  <Label 
                    htmlFor="positive" 
                    className="flex items-center gap-1 cursor-pointer"
                  >
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    积极
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="neutral" id="neutral" />
                  <Label 
                    htmlFor="neutral" 
                    className="flex items-center gap-1 cursor-pointer"
                  >
                    <Meh className="h-4 w-4 text-yellow-600" />
                    中性
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="negative" id="negative" />
                  <Label 
                    htmlFor="negative" 
                    className="flex items-center gap-1 cursor-pointer"
                  >
                    <ThumbsDown className="h-4 w-4 text-red-600" />
                    消极
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>
          
          {/* Feedback Content */}
          <div className="space-y-2">
            <Label htmlFor="feedback-content">反馈内容</Label>
            <Textarea
              id="feedback-content"
              placeholder="告诉 LITTLE STAR AI 它做得怎么样..."
              value={feedbackContent}
              onChange={(e) => setFeedbackContent(e.target.value)}
              rows={3}
              required
            />
          </div>
          
          {/* Impact Level */}
          <div className="space-y-2">
            <Label>影响程度</Label>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">低</span>
              <Slider
                value={impactLevel}
                onValueChange={setImpactLevel}
                min={1}
                max={10}
                step={1}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">高</span>
              <span className="text-sm font-medium w-8">{impactLevel[0]}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              影响程度决定了这条反馈对 LITTLE STAR AI 个性发展的影响力
            </p>
          </div>
          
          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !feedbackContent.trim()}
          >
            提交反馈
          </Button>
        </form>
        
        {/* Current Personality Preview */}
        <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
          <h4 className="text-sm font-medium">当前个性特征</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>情商: {personalityStats.emotionalIntelligence}</div>
            <div>创造力: {personalityStats.creativity}</div>
            <div>同理心: {personalityStats.empathy}</div>
            <div>分析思维: {personalityStats.analyticalThinking}</div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            你的反馈将影响这些特征的发展方向
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 