// AI语音对话系统
import { AIPersonality, AIEmotion } from '@/store/useStore'

// 添加浏览器语音识别API的类型声明
interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}

interface SpeechRecognitionEvent {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionErrorEvent {
  error: string
  message: string
}

declare global {
  interface Window {
    webkitSpeechRecognition: new() => SpeechRecognition
    SpeechRecognition: new() => SpeechRecognition
  }
}

export interface VoiceSettings {
  language: 'zh-CN' | 'en-US' | 'ja-JP'
  rate: number // 语速 0.1-10
  pitch: number // 音调 0-2
  volume: number // 音量 0-1
  voice?: string // 特定语音
}

export interface VoiceProfile {
  id: string
  name: string
  description: string
  settings: VoiceSettings
  personalityMatch: Partial<AIPersonality>
}

export class AIVoiceSystem {
  private speechSynthesis: SpeechSynthesis | null = null
  private speechRecognition: SpeechRecognition | null = null
  private isInitialized = false
  private isListening = false
  private voiceProfiles: VoiceProfile[] = []
  private currentTranscript = ''
  private onTranscriptCallback?: (text: string) => void
  private onEndCallback?: () => void

  constructor() {
    this.initializeVoiceSystem()
  }

  private async initializeVoiceSystem() {
    try {
      // 初始化语音合成
      if ('speechSynthesis' in window) {
        this.speechSynthesis = window.speechSynthesis
      }

      // 初始化语音识别
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognitionConstructor = (window as unknown as {
          webkitSpeechRecognition?: new() => SpeechRecognition
          SpeechRecognition?: new() => SpeechRecognition
        }).webkitSpeechRecognition || (window as unknown as {
          webkitSpeechRecognition?: new() => SpeechRecognition
          SpeechRecognition?: new() => SpeechRecognition
        }).SpeechRecognition
        
        if (SpeechRecognitionConstructor) {
          this.speechRecognition = new SpeechRecognitionConstructor()
          
          if (this.speechRecognition) {
            this.speechRecognition.continuous = true
            this.speechRecognition.interimResults = true
            this.speechRecognition.lang = 'zh-CN'
            
            this.speechRecognition.onresult = this.handleSpeechResult.bind(this)
            this.speechRecognition.onerror = this.handleSpeechError.bind(this)
            this.speechRecognition.onend = this.handleSpeechEnd.bind(this)
          }
        }
      }

      this.isInitialized = true
      console.log('语音系统初始化成功')
    } catch (error) {
      console.error('语音系统初始化失败:', error)
    }
  }

  private handleSpeechResult(event: SpeechRecognitionEvent) {
    let finalTranscript = ''
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]
      if (result.isFinal) {
        finalTranscript += result[0].transcript
      } else {
        // 中间结果，用于实时显示
        this.currentTranscript = result[0].transcript
      }
    }

    if (finalTranscript && this.onTranscriptCallback) {
      this.onTranscriptCallback(finalTranscript)
    }
  }

  private handleSpeechError(event: SpeechRecognitionErrorEvent) {
    console.error('语音识别错误:', event.error)
    this.isListening = false
  }

  private handleSpeechEnd() {
    this.isListening = false
    if (this.onEndCallback) {
      this.onEndCallback()
    }
  }

  selectVoiceForPersonality(personality: AIPersonality, mood: AIEmotion): VoiceProfile {
    // 默认语音配置
    const defaultProfile: VoiceProfile = {
      id: 'default',
      name: '默认语音',
      description: '默认语音描述',
      settings: {
        language: 'zh-CN',
        rate: 1.0,
        pitch: 1.0,
        volume: 0.8
      },
      personalityMatch: {}
    }

    // 根据性格和心情调整语音特征
    if (personality.extraversion > 70) {
      defaultProfile.settings.rate = 1.1 // 外向的人说话稍快
      defaultProfile.settings.volume = 0.9 // 声音稍大
    } else if (personality.extraversion < 30) {
      defaultProfile.settings.rate = 0.9 // 内向的人说话稍慢
      defaultProfile.settings.volume = 0.7 // 声音稍小
    }

    if (mood.primary === 'excited') {
      defaultProfile.settings.pitch = 1.2
      defaultProfile.settings.rate = 1.2
    } else if (mood.primary === 'melancholy') {
      defaultProfile.settings.pitch = 0.9
      defaultProfile.settings.rate = 0.8
    }

    return defaultProfile
  }

  async speak(
    text: string, 
    personality: AIPersonality, 
    mood: AIEmotion, 
    customSettings?: Partial<VoiceSettings>
  ): Promise<void> {
    if (!this.speechSynthesis || !this.isInitialized) {
      console.warn('语音合成不可用')
      return
    }

    return new Promise((resolve, reject) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text)
        const voiceProfile = this.selectVoiceForPersonality(personality, mood)
        
        // 应用语音设置
        utterance.rate = customSettings?.rate ?? this.adjustRateForMood(voiceProfile.settings.rate, mood)
        utterance.pitch = customSettings?.pitch ?? this.adjustPitchForMood(voiceProfile.settings.pitch, mood)
        utterance.volume = customSettings?.volume ?? voiceProfile.settings.volume
        utterance.lang = voiceProfile.settings.language

        utterance.onend = () => resolve()
        utterance.onerror = (error) => reject(error)

        if (this.speechSynthesis) {
          this.speechSynthesis.speak(utterance)
        } else {
          reject(new Error('语音合成不可用'))
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  private adjustRateForMood(baseRate: number, mood: AIEmotion): number {
    switch (mood.primary) {
      case 'excited': return Math.min(2.0, baseRate * 1.2)
      case 'melancholy': return Math.max(0.5, baseRate * 0.8)
      case 'anxious': return Math.min(2.0, baseRate * 1.1)
      default: return baseRate
    }
  }

  private adjustPitchForMood(basePitch: number, mood: AIEmotion): number {
    switch (mood.primary) {
      case 'excited': return Math.min(2.0, basePitch * 1.2)
      case 'melancholy': return Math.max(0.5, basePitch * 0.9)
      case 'happy': return Math.min(2.0, basePitch * 1.1)
      default: return basePitch
    }
  }

  async startListening(onTranscript: (text: string) => void, onEnd?: () => void): Promise<boolean> {
    if (!this.speechRecognition || !this.isInitialized) {
      console.warn('语音识别不可用')
      return false
    }

    if (this.isListening) {
      console.warn('已在录音中')
      return false
    }

    try {
      this.onTranscriptCallback = onTranscript
      this.onEndCallback = onEnd
      this.isListening = true
      
      this.speechRecognition.start()
      return true
    } catch (error) {
      console.error('开始录音失败:', error)
      this.isListening = false
      return false
    }
  }

  stopListening() {
    if (this.speechRecognition && this.isListening) {
      this.speechRecognition.stop()
      this.isListening = false
    }
  }

  stopSpeaking() {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel()
    }
  }

  checkVoiceSupport(): { synthesis: boolean; recognition: boolean; voices: SpeechSynthesisVoice[] } {
    const synthesis = 'speechSynthesis' in window
    const recognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
    const voices = synthesis ? this.speechSynthesis?.getVoices() || [] : []
    
    return { synthesis, recognition, voices }
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.speechSynthesis) return []
    return this.speechSynthesis.getVoices()
  }

  getVoiceProfiles(): VoiceProfile[] {
    return [...this.voiceProfiles]
  }

  addVoiceProfile(profile: VoiceProfile) {
    this.voiceProfiles.push(profile)
  }

  async testVoice(profileId: string, testText?: string): Promise<void> {
    const profile = this.voiceProfiles.find(p => p.id === profileId)
    if (!profile) {
      throw new Error('语音配置不存在')
    }

    const text = testText || '你好，这是语音测试。'
    // 这里需要传入默认的personality和mood
    const defaultPersonality: AIPersonality = {
      extraversion: 50, neuroticism: 50, openness: 50,
      conscientiousness: 50, agreeableness: 50, curiosity: 50,
      creativity: 50, empathy: 50, humor: 50,
      independence: 50, optimism: 50, rebelliousness: 50,
      patience: 50
    }
    const defaultMood: AIEmotion = { 
      primary: 'calm', 
      intensity: 50,
      triggers: ['测试'],
      duration: 60,
      startTime: new Date(),
      description: '平静的测试状态'
    }
    
    await this.speak(text, defaultPersonality, defaultMood, {
      rate: profile.settings.rate,
      pitch: profile.settings.pitch,
      volume: profile.settings.volume
    })
  }

  getStatus(): { isListening: boolean; isInitialized: boolean; currentVoice?: string } {
    return {
      isListening: this.isListening,
      isInitialized: this.isInitialized,
      currentVoice: this.voiceProfiles[0]?.name
    }
  }

  analyzeVoiceEmotion(text: string): { emotion: AIEmotion['primary']; confidence: number } {
    // 简单的情感分析
    const emotionKeywords = {
      happy: ['开心', '高兴', '快乐', '兴奋', '喜悦'],
      sad: ['难过', '伤心', '悲伤', '沮丧', '失落'],
      angry: ['生气', '愤怒', '恼火', '烦躁', '气愤'],
      excited: ['激动', '兴奋', '热情', '期待', '振奋'],
      curious: ['好奇', '想知道', '疑问', '探索', '了解']
    }

    let bestMatch: AIEmotion['primary'] = 'calm'
    let maxScore = 0

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      const score = keywords.reduce((sum, keyword) => {
        return sum + (text.includes(keyword) ? 1 : 0)
      }, 0)
      
      if (score > maxScore) {
        maxScore = score
        bestMatch = emotion as AIEmotion['primary']
      }
    })

    const confidence = Math.min(maxScore * 20, 100) // 简单的置信度计算
    return { emotion: bestMatch, confidence }
  }
}

export const aiVoiceSystem = new AIVoiceSystem() 