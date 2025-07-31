'use client'

import React, { useEffect, useState } from 'react'
import { useStore } from '@/store/useStore'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Heart, 
  Sparkles, 
  Brain, 
  Zap, 
  Cloud, 
  Smile, 
  Frown, 
  Meh,
  Activity,
  TrendingUp,
  AlertCircle,
  CloudRain,  // 使用CloudRain代替Storm
  Sun
} from 'lucide-react'

// 情绪可视化组件
export default function EmotionIndicator() {
  const { currentEmotion, vitalSigns, aiPersonality } = useStore()
  const [animationClass, setAnimationClass] = useState('')
  const [emotionHistory, setEmotionHistory] = useState<string[]>([])

  // 监听情绪变化
  useEffect(() => {
    setEmotionHistory(prev => [...prev.slice(-4), currentEmotion.primary])
    
    // 触发动画
    setAnimationClass('emotion-change')
    const timer = setTimeout(() => setAnimationClass(''), 1000)
    
    return () => clearTimeout(timer)
  }, [currentEmotion.primary])

  // 获取情绪图标
  const getEmotionIcon = (emotion: string, size: string = 'h-6 w-6') => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'happy': <Smile className={`${size} text-yellow-500`} />,
      'excited': <Zap className={`${size} text-orange-500 animate-pulse`} />,
      'calm': <Cloud className={`${size} text-blue-400`} />,
      'curious': <Brain className={`${size} text-purple-500`} />,
      'contemplative': <Brain className={`${size} text-indigo-500`} />,
      'anxious': <AlertCircle className={`${size} text-red-400`} />,
      'sad': <CloudRain className={`${size} text-gray-500`} />,
      'angry': <CloudRain className={`${size} text-red-600`} />,
      'playful': <Sparkles className={`${size} text-pink-500 animate-bounce`} />,
      'melancholy': <Frown className={`${size} text-slate-600`} />
    }
    
    return iconMap[emotion] || <Meh className={`${size} text-gray-400`} />
  }

  // 获取情绪颜色
  const getEmotionColor = (emotion: string) => {
    const colorMap: { [key: string]: string } = {
      'happy': 'bg-gradient-to-r from-yellow-400 to-orange-400',
      'excited': 'bg-gradient-to-r from-orange-500 to-red-500',
      'calm': 'bg-gradient-to-r from-blue-400 to-cyan-400',
      'curious': 'bg-gradient-to-r from-purple-500 to-indigo-500',
      'contemplative': 'bg-gradient-to-r from-indigo-500 to-blue-600',
      'anxious': 'bg-gradient-to-r from-red-400 to-pink-400',
      'sad': 'bg-gradient-to-r from-gray-400 to-slate-500',
      'angry': 'bg-gradient-to-r from-red-600 to-orange-600',
      'playful': 'bg-gradient-to-r from-pink-500 to-purple-500',
      'melancholy': 'bg-gradient-to-r from-slate-500 to-gray-600'
    }
    
    return colorMap[emotion] || 'bg-gradient-to-r from-gray-400 to-gray-500'
  }

  // 获取情绪强度指示
  const getIntensityIndicator = (intensity: number) => {
    if (intensity > 80) return { text: '非常强烈', color: 'text-red-500', rings: 3 }
    if (intensity > 60) return { text: '较强', color: 'text-orange-500', rings: 2 }
    if (intensity > 40) return { text: '中等', color: 'text-yellow-500', rings: 1 }
    return { text: '轻微', color: 'text-green-500', rings: 0 }
  }

  // 获取学习状态指示
  const getLearningStatusIcon = () => {
    if (vitalSigns.learningCapacity > 80) {
      return <TrendingUp className="h-4 w-4 text-green-500" />
    } else if (vitalSigns.learningCapacity > 50) {
      return <Activity className="h-4 w-4 text-yellow-500" />
    } else {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const intensityInfo = getIntensityIndicator(currentEmotion.intensity)

  return (
    <div className="space-y-4">
      {/* 主要情绪显示 */}
      <Card className={`relative overflow-hidden ${animationClass === 'emotion-change' ? 'scale-105 transition-transform duration-300' : ''}`}>
        <CardContent className="p-6">
          {/* 背景渐变 */}
          <div className={`absolute inset-0 ${getEmotionColor(currentEmotion.primary)} opacity-10`} />
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* 情绪图标 */}
              <div className="relative">
                {getEmotionIcon(currentEmotion.primary, 'h-10 w-10')}
                
                {/* 强度环 */}
                {Array.from({ length: intensityInfo.rings }).map((_, i) => (
                  <div
                    key={i}
                    className={`absolute inset-0 rounded-full border-2 ${intensityInfo.color.replace('text-', 'border-')} animate-ping`}
                    style={{
                      animationDelay: `${i * 0.3}s`,
                      animationDuration: '2s'
                    }}
                  />
                ))}
              </div>

              <div>
                <h3 className="text-lg font-semibold capitalize">
                  {currentEmotion.primary}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {currentEmotion.description}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className={`text-2xl font-bold ${intensityInfo.color}`}>
                {currentEmotion.intensity}%
              </div>
              <div className={`text-xs ${intensityInfo.color}`}>
                {intensityInfo.text}
              </div>
            </div>
          </div>

          {/* 情绪进度条 */}
          <div className="mt-4">
            <Progress 
              value={currentEmotion.intensity} 
              className="h-2"
              style={{
                background: `linear-gradient(to right, transparent, ${getEmotionColor(currentEmotion.primary).replace('bg-gradient-to-r', '').split(' ')[1]})`
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 生命体征概览 */}
      <Card>
        <CardContent className="p-4">
          <h4 className="text-sm font-medium mb-3 flex items-center">
            <Heart className="h-4 w-4 mr-2 text-red-500" />
            生命体征
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>精力</span>
                <span className={vitalSigns.energy > 70 ? 'text-green-500' : vitalSigns.energy > 40 ? 'text-yellow-500' : 'text-red-500'}>
                  {vitalSigns.energy}%
                </span>
              </div>
              <Progress value={vitalSigns.energy} className="h-1" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>专注</span>
                <span className={vitalSigns.focus > 70 ? 'text-green-500' : vitalSigns.focus > 40 ? 'text-yellow-500' : 'text-red-500'}>
                  {vitalSigns.focus}%
                </span>
              </div>
              <Progress value={vitalSigns.focus} className="h-1" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="flex items-center">
                  学习能力
                  {getLearningStatusIcon()}
                </span>
                <span className={vitalSigns.learningCapacity > 70 ? 'text-green-500' : vitalSigns.learningCapacity > 40 ? 'text-yellow-500' : 'text-red-500'}>
                  {vitalSigns.learningCapacity}%
                </span>
              </div>
              <Progress value={vitalSigns.learningCapacity} className="h-1" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>社交电量</span>
                <span className={vitalSigns.socialBattery > 70 ? 'text-green-500' : vitalSigns.socialBattery > 40 ? 'text-yellow-500' : 'text-red-500'}>
                  {vitalSigns.socialBattery}%
                </span>
              </div>
              <Progress value={vitalSigns.socialBattery} className="h-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 情绪历史 */}
      <Card>
        <CardContent className="p-4">
          <h4 className="text-sm font-medium mb-3">情绪轨迹</h4>
          
          <div className="flex items-center space-x-2">
            {emotionHistory.map((emotion, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`p-1 rounded-full ${index === emotionHistory.length - 1 ? 'ring-2 ring-blue-500' : ''}`}>
                  {getEmotionIcon(emotion, 'h-4 w-4')}
                </div>
                {index < emotionHistory.length - 1 && (
                  <div className="w-px h-4 bg-gray-300 mt-1" />
                )}
              </div>
            ))}
          </div>
          
          {currentEmotion.triggers.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-muted-foreground mb-1">最近触发因素:</div>
              <div className="flex flex-wrap gap-1">
                {currentEmotion.triggers.slice(-3).map((trigger, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {trigger}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 人格影响指示 */}
      <Card>
        <CardContent className="p-4">
          <h4 className="text-sm font-medium mb-3">人格特征影响</h4>
          
          <div className="space-y-2">
            {currentEmotion.primary === 'curious' && aiPersonality.curiosity > 80 && (
              <div className="flex items-center text-xs text-purple-600">
                <Brain className="h-3 w-3 mr-1" />
                高好奇心强化了当前情绪
              </div>
            )}
            
            {currentEmotion.intensity > 70 && aiPersonality.neuroticism > 60 && (
              <div className="flex items-center text-xs text-orange-600">
                <AlertCircle className="h-3 w-3 mr-1" />
                神经质特征放大了情绪反应
              </div>
            )}
            
            {currentEmotion.primary === 'happy' && aiPersonality.optimism > 70 && (
              <div className="flex items-center text-xs text-green-600">
                <Sun className="h-3 w-3 mr-1" />
                乐观性格延长了积极情绪
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// CSS动画样式（添加到全局CSS中）
export const emotionAnimationStyles = `
.emotion-change {
  animation: emotionPulse 1s ease-in-out;
}

@keyframes emotionPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.emotion-ripple {
  animation: ripple 2s infinite;
}

@keyframes ripple {
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(2.4);
    opacity: 0;
  }
}
` 