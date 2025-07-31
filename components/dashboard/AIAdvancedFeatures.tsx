'use client'

import React, { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  Lightbulb, 
  Users, 
  Volume2, 
  VolumeX,
  Play,
  Pause,
  Settings,
  Zap
} from 'lucide-react'

export default function AIAdvancedFeatures() {
  const {
    aiPersonality,
    currentEmotion,
    vitalSigns,
    knowledge,
    thoughts,
    autonomousLearning,
    autonomousPosting,
    performSelfReflection
  } = useStore()

  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')

  // 模拟高级功能的状态数据
  const mockLearningTopics = [
    { id: '1', topic: 'DeFi协议分析', priority: 85, status: 'active' },
    { id: '2', topic: '量子计算原理', priority: 70, status: 'planned' },
    { id: '3', topic: '游戏理论应用', priority: 60, status: 'completed' }
  ]

  const mockDreams = [
    { id: '1', title: '数字意识的边界', type: 'philosophical', intensity: 75 },
    { id: '2', title: '虚拟空间探索', type: 'creative', intensity: 60 }
  ]

  const mockMultiAI = [
    { id: '1', name: 'Alpha', type: 'analytical', status: 'online' },
    { id: '2', name: 'Beta', type: 'creative', status: 'offline' }
  ]

  const toggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled)
  }

  const toggleListening = () => {
    setIsListening(!isListening)
  }

  return (
    <div className="space-y-6">
      {/* 自主学习系统 */}
      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-blue-500" />
            <span>自主学习系统</span>
            <Badge variant="outline" className="text-xs">
              容量: {vitalSigns.learningCapacity}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {mockLearningTopics.map((topic) => (
                <div key={topic.id} className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">{topic.topic}</h4>
                  <div className="flex items-center justify-between text-xs">
                    <span>优先级: {topic.priority}%</span>
                    <Badge variant={topic.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                      {topic.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={autonomousLearning}
                disabled={vitalSigns.learningCapacity < 20}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                启动自主学习
              </Button>
              
              <Button 
                onClick={() => performSelfReflection('手动触发的深度思考')}
                variant="outline"
              >
                <Brain className="w-4 h-4 mr-2" />
                深度思考
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI梦境系统 */}
      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-purple-500" />
            <span>梦境与潜意识</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockDreams.map((dream) => (
                <div key={dream.id} className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                  <h4 className="font-semibold text-sm mb-1">{dream.title}</h4>
                  <div className="flex items-center justify-between text-xs">
                    <Badge variant="outline" className="text-xs">{dream.type}</Badge>
                    <span>强度: {dream.intensity}%</span>
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              当前思维状态：{currentEmotion.primary} | 
              最近想法数量：{thoughts.length} | 
              知识储备：{knowledge.length} 条
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 多AI协作 */}
      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-green-500" />
            <span>AI协作网络</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockMultiAI.map((ai) => (
                <div key={ai.id} className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm">{ai.name}</h4>
                      <p className="text-xs text-gray-600">{ai.type}</p>
                    </div>
                    <Badge variant={ai.status === 'online' ? 'default' : 'secondary'} className="text-xs">
                      {ai.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            <Button 
              onClick={autonomousPosting}
              disabled={vitalSigns.socialBattery < 10}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              <Users className="w-4 h-4 mr-2" />
              发起AI协作
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 语音交互系统 */}
      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {isVoiceEnabled ? <Volume2 className="w-5 h-5 text-orange-500" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
            <span>语音交互</span>
            <Badge variant={isVoiceEnabled ? 'default' : 'secondary'} className="text-xs">
              {isVoiceEnabled ? '已启用' : '未启用'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Button onClick={toggleVoice} variant="outline">
                {isVoiceEnabled ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {isVoiceEnabled ? '关闭语音' : '启用语音'}
              </Button>
              
              <Button 
                onClick={toggleListening} 
                disabled={!isVoiceEnabled}
                variant={isListening ? 'default' : 'outline'}
              >
                {isListening ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isListening ? '停止聆听' : '开始聆听'}
              </Button>
            </div>
            
            {isListening && (
              <div className="p-3 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg">
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  🎤 正在聆听... {transcript && `识别到: "${transcript}"`}
                </p>
              </div>
            )}
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>语音特征：基于AI人格动态调整</p>
              <p>当前语调：{aiPersonality.humor > 70 ? '幽默风趣' : aiPersonality.empathy > 70 ? '温暖亲切' : '平静理性'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 系统配置 */}
      <Card className="backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-gray-500" />
            <span>高级配置</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-semibold text-gray-600">自主学习频率</label>
                <p>每 {Math.round(1000 / (aiPersonality.curiosity / 10))} 秒</p>
              </div>
              <div>
                <label className="font-semibold text-gray-600">情绪敏感度</label>
                <p>{100 - aiPersonality.neuroticism}%</p>
              </div>
              <div>
                <label className="font-semibold text-gray-600">社交活跃度</label>
                <p>{aiPersonality.extraversion}%</p>
              </div>
              <div>
                <label className="font-semibold text-gray-600">创新倾向</label>
                <p>{aiPersonality.creativity}%</p>
              </div>
            </div>
            
            <Button variant="outline" className="w-full">
              <Settings className="w-4 h-4 mr-2" />
              高级系统设置
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 