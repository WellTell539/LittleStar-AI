'use client'

import React from 'react'
import { AIEmotion } from '@/store/useStore'

interface ClaudeMascotProps {
  mood: AIEmotion['primary']
  intensity: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
  className?: string
}

export const ClaudeMascot: React.FC<ClaudeMascotProps> = ({
  mood,
  intensity,
  size = 'md',
  animated = true,
  className = ''
}) => {
  const getMoodEmoji = () => {
    const emojis = {
      excited: '🤩',
      happy: '😊',
      content: '😌',
      neutral: '😐',
      contemplative: '🤔',
      thoughtful: '🤔',
      melancholy: '😔',
      anxious: '😰',
      frustrated: '😤',
      curious: '🧐',
      energetic: '⚡',
      sad: '😢',
      angry: '😠',
      calm: '😌',
      playful: '🤗'
    }
    return emojis[mood] || '😐'
  }

  const getMoodColor = () => {
    const colors = {
      excited: 'from-purple-400 to-pink-500',
      happy: 'from-green-400 to-blue-500',
      content: 'from-blue-400 to-indigo-500',
      neutral: 'from-gray-400 to-gray-500',
      contemplative: 'from-indigo-400 to-purple-500',
      thoughtful: 'from-indigo-400 to-purple-500',
      melancholy: 'from-gray-500 to-slate-600',
      anxious: 'from-orange-400 to-red-500',
      frustrated: 'from-red-400 to-red-600',
      curious: 'from-cyan-400 to-blue-500',
      energetic: 'from-yellow-400 to-red-500',
      sad: 'from-gray-400 to-slate-500',
      angry: 'from-red-500 to-red-700',
      calm: 'from-green-300 to-blue-400',
      playful: 'from-pink-400 to-purple-500'
    }
    return colors[mood] || 'from-gray-400 to-gray-500'
  }

  const getSize = () => {
    const sizes = {
      sm: 'w-12 h-12',
      md: 'w-16 h-16',
      lg: 'w-20 h-20',
      xl: 'w-24 h-24'
    }
    return sizes[size]
  }

  const getTextSize = () => {
    const textSizes = {
      sm: 'text-lg',
      md: 'text-xl',
      lg: 'text-2xl',
      xl: 'text-3xl'
    }
    return textSizes[size]
  }

  const getMoodAnimation = () => {
    const animations = {
      excited: 'animate-bounce',
      happy: 'animate-pulse',
      content: 'animate-none',
      neutral: 'animate-none',
      contemplative: 'animate-pulse',
      thoughtful: 'animate-pulse',
      melancholy: 'animate-none',
      anxious: 'animate-ping',
      frustrated: 'animate-bounce',
      curious: 'animate-pulse',
      energetic: 'animate-bounce',
      sad: 'animate-none',
      angry: 'animate-bounce',
      calm: 'animate-none',
      playful: 'animate-bounce'
    }
    return animations[mood] || ''
  }

  return (
    <div className={`relative group ${className}`}>
      {/* 主容器 */}
      <div className={`${getSize()} rounded-2xl bg-gradient-to-br ${getMoodColor()} p-1 shadow-lg ${getMoodAnimation()}`}>
        <div className="w-full h-full bg-white rounded-xl flex items-center justify-center relative overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent" />
          
          {/* 表情 */}
          <span className={`${getTextSize()} relative z-10 filter drop-shadow-sm`}>
            {getMoodEmoji()}
          </span>
          
          {/* 心跳效果 */}
          {mood === 'excited' || mood === 'happy' ? (
            <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-purple-400/20 animate-pulse rounded-xl" />
          ) : null}
        </div>
        
        {/* 外围光环 */}
        <div 
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-sm -z-10"
          style={{
            transform: `scale(${1 + intensity / 200})`,
            opacity: intensity / 100
          }}
        />
      </div>

      {/* 状态指示器 */}
      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-md" />
      
      {/* 思考气泡（仅在思考状态显示） */}
      {mood === 'contemplative' && (
        <div className="absolute -top-8 -right-2 animate-pulse">
          <div className="relative">
            <div className="bg-white rounded-full px-3 py-1 shadow-lg border border-gray-200">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
              </div>
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white" />
          </div>
        </div>
      )}

      {/* 能量粒子（高能状态） */}
      {(mood === 'excited' || mood === 'happy') && intensity > 70 && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1 right-1 w-1 h-1 bg-yellow-400 rounded-full animate-ping" />
          <div className="absolute bottom-1 left-1 w-1 h-1 bg-orange-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}} />
          <div className="absolute top-1/2 right-0 w-1 h-1 bg-red-400 rounded-full animate-ping" style={{animationDelay: '1s'}} />
        </div>
      )}

      {/* 悬浮工具提示 */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="bg-gray-800 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap">
          {mood === 'excited' ? '兴奋' :
           mood === 'happy' ? '开心' :
           mood === 'calm' ? '平静' :
           mood === 'contemplative' ? '深思' :
           mood === 'curious' ? '好奇' :
           mood === 'melancholy' ? '忧郁' :
           mood === 'anxious' ? '焦虑' :
           mood === 'sad' ? '悲伤' :
           mood === 'angry' ? '愤怒' :
           mood === 'playful' ? '顽皮' : '心情'}
          {' • '}
          {intensity}%
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-l-transparent border-r-transparent border-t-gray-800" />
        </div>
      </div>
    </div>
  )
}

export default ClaudeMascot 