'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface CuteMascotProps {
  mood?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  intensity?: number
  isThinking?: boolean
  isActive?: boolean
  message?: string
}

const moodEmojis = {
  happy: '😊',
  excited: '🤩',
  curious: '🤔',
  calm: '😌',
  contemplative: '🧠',
  playful: '😄',
  sad: '😢',
  angry: '😠',
  anxious: '😰',
  melancholy: '😔'
}

const sizeClasses = {
  sm: 'w-12 h-12 text-2xl',
  md: 'w-16 h-16 text-3xl',
  lg: 'w-24 h-24 text-5xl',
  xl: 'w-32 h-32 text-7xl'
}

export default function CuteMascot({ 
  mood = 'happy', 
  size = 'md', 
  intensity = 50,
  isThinking = false,
  isActive = false,
  message
}: CuteMascotProps) {
  const emoji = moodEmojis[mood as keyof typeof moodEmojis] || '😊'
  
  const getAnimationByMood = () => {
    if (isThinking) return { scale: [1, 1.1, 1], rotate: [-5, 5, -5] }
    if (isActive) return { y: [0, -8, 0], scale: [1, 1.05, 1] }
    
    switch (mood) {
      case 'excited':
        return { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }
      case 'happy':
        return { y: [0, -4, 0] }
      case 'curious':
        return { rotate: [-3, 3, -3] }
      case 'playful':
        return { scale: [1, 1.1, 1], y: [0, -6, 0] }
      default:
        return { y: [0, -2, 0] }
    }
  }

  const getGlowIntensity = () => {
    if (intensity > 80) return 'drop-shadow-lg filter'
    if (intensity > 60) return 'drop-shadow-md filter'
    if (intensity > 40) return 'drop-shadow-sm filter'
    return ''
  }

  return (
    <div className="relative flex flex-col items-center">
      {/* 主要吉祥物 */}
      <motion.div
        className={`
          ${sizeClasses[size]} 
          relative flex items-center justify-center
          ${getGlowIntensity()}
        `}
        animate={getAnimationByMood()}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* 背景光圈 */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(230, 84, 255, ${intensity / 300}) 0%, transparent 70%)`
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* 吉祥物本体 */}
        <motion.div
          className="relative z-10 cursor-pointer select-none"
          whileHover={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5 }}
        >
          {emoji}
        </motion.div>
        
        {/* 思考气泡 */}
        {isThinking && (
          <motion.div
            className="absolute -top-8 -right-2 text-xs opacity-70"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            💭
          </motion.div>
        )}
        
        {/* 活跃指示器 */}
        {isActive && (
          <motion.div
            className="absolute -top-2 -right-2 w-3 h-3 bg-green-400 rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.div>
      
      {/* 消息气泡 */}
      {message && (
        <motion.div
          className="mt-4 px-4 py-2 bg-white rounded-2xl shadow-lg border border-purple-100 max-w-xs text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-sm text-gray-700">{message}</p>
        </motion.div>
      )}
      
      {/* 心情标签 */}
      <motion.div
        className="mt-2 px-3 py-1 bg-purple-100 rounded-full text-xs text-purple-600 font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {mood} {intensity}%
      </motion.div>
    </div>
  )
}