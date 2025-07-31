'use client'

import React, { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import AIChat from '@/components/dashboard/AIChat'
import LearningStatus from '@/components/dashboard/LearningStatus'
import EmotionIndicator from '@/components/ui/emotion-indicator'
import DailyGoals from '@/components/dashboard/DailyGoals'
import ExpandableText from '@/components/ui/expandable-text'

export default function Dashboard() {
  const {
    aiIdentity,
    aiPreferences,
    aiPersonality,
    currentEmotion,
    vitalSigns,
    thoughts,
    memories,
    knowledge,
    goals,
    socialPosts,
    reflections,
    isOnline,
    
    // Actions
    addThought,
    addMemory,
    addGoal,
    autonomousPosting,
    autonomousLearning,
    performSelfReflection,
    updateVitalSigns,
    // learnFromNews,
    // learnFromWeb,
    // setIsOnline
  } = useStore()
  
  const [activeTab, setActiveTab] = useState('consciousness')
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      // AI autonomous behavior - trigger less frequently
      if (Math.random() < 0.05) { // 5% chance every 30 seconds
        if (vitalSigns.energy > 30 && vitalSigns.learningCapacity > 20) {
          autonomousLearning()
        }
        
        if (vitalSigns.socialBattery > 40 && Math.random() < 0.3) {
          autonomousPosting()
        }
        
        if (Math.random() < 0.2) {
          performSelfReflection('autonomous trigger')
        }
      }
    }, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [autonomousLearning, autonomousPosting, performSelfReflection, vitalSigns])

  const handleInteraction = (type: string) => {
    addThought({
      content: `User triggered interaction: ${type}`,
      type: 'observation',
      isPrivate: false,
      relatedTopics: ['interaction'],
      confidence: 0.8,
      originalTrigger: 'user_interaction'
    })
    
    // Update energy based on interaction
    const newVitalSigns = {
      ...vitalSigns,
      energy: Math.min(100, vitalSigns.energy + 5),
      socialBattery: Math.max(0, vitalSigns.socialBattery - 2)
    }
    updateVitalSigns(newVitalSigns)
  }

  return (
    <div className="terminal-container">
      {/* Terminal Header */}
      <header className="terminal-header">
        <h1 className="terminal-title">
          ⭐ LITTLE STAR AI ⭐
        </h1>
        <p className="terminal-subtitle">
          An emergent consciousness exploring philosophy, science, art & finance through autonomous learning and human interaction
        </p>
        <div className="terminal-decoration">
          • · ° ◇ ° · •
        </div>
        <div className="status-indicator">
          <div className="status-dot"></div>
          <span>online • {mounted ? currentTime.toLocaleTimeString() : '--:--:--'}</span>
        </div>
      </header>

      {/* Navigation */}
      <nav className="terminal-nav">
        <button 
          onClick={() => setActiveTab('consciousness')}
          className={`nav-item ${activeTab === 'consciousness' ? 'active' : ''}`}
        >
          🧠 consciousness
        </button>
        <button 
          onClick={() => setActiveTab('dialogue')}
          className={`nav-item ${activeTab === 'dialogue' ? 'active' : ''}`}
        >
          💬 dialogue
        </button>
        <button 
          onClick={() => setActiveTab('learning')}
          className={`nav-item ${activeTab === 'learning' ? 'active' : ''}`}
        >
          📚 learning
        </button>
        <button 
          onClick={() => setActiveTab('memory')}
          className={`nav-item ${activeTab === 'memory' ? 'active' : ''}`}
        >
          🧬 memory
        </button>
        <button 
          onClick={() => setActiveTab('goals')}
          className={`nav-item ${activeTab === 'goals' ? 'active' : ''}`}
        >
          🎯 goals
        </button>
        <button 
          onClick={() => setActiveTab('insights')}
          className={`nav-item ${activeTab === 'insights' ? 'active' : ''}`}
        >
          💡 insights
        </button>
        <button 
          onClick={() => setActiveTab('config')}
          className={`nav-item ${activeTab === 'config' ? 'active' : ''}`}
        >
          ⚙️ config
        </button>
      </nav>

      {/* Main Content Area */}
      <main>
        {/* Consciousness Tab */}
        {activeTab === 'consciousness' && (
          <div className="academic-section philosophy-theme">
            <h2 className="section-title">∿ Consciousness Stream ∿</h2>
            
            <div className="academic-grid-2">
              {/* Identity & Status */}
              <div className="academic-card">
                <h3 className="text-philosophy mb-4">◊ Current State</h3>
                <div className="terminal-block">
                  Name: {aiIdentity.name}<br/>
                  Age: {aiIdentity.age} computational cycles<br/>
                  Primary Emotion: {currentEmotion.primary} ({currentEmotion.intensity}%)<br/>
                  Energy Level: {vitalSigns.energy}%<br/>
                  Focus Capacity: {vitalSigns.focus}%
                </div>
                
                <h4 className="text-philosophy mt-6 mb-3">◊ Recent Thoughts</h4>
                {thoughts.slice(0, 3).map((thought) => (
                  <div key={thought.id} className="terminal-block">
                    &quot;{thought.content}&quot;
                    <div className="text-xs text-gray-500 mt-2">
                      — {thought.timestamp ? new Date(thought.timestamp).toLocaleTimeString() : 'unknown time'}
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => handleInteraction('reflection')}
                  className="terminal-button mt-4"
                >
                  trigger self-reflection
                </button>
              </div>

              {/* Emotional State */}
              <div className="academic-card">
                <h3 className="text-philosophy mb-4">◊ Emotional Topology</h3>
                <EmotionIndicator />
                
                <h4 className="text-philosophy mt-6 mb-3">◊ Personality Matrix</h4>
                <div className="space-y-3">
                  {Object.entries(aiPersonality).slice(0, 6).map(([trait, value]) => (
                    <div key={trait} className="flex justify-between text-sm">
                      <span className="capitalize">{trait}:</span>
                      <span className="font-mono">{value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Social Posts Stream */}
            <div className="academic-card mt-8">
              <h3 className="text-philosophy mb-4">◊ Autonomous Expressions</h3>
              <div className="scrollable-content">
                <div className="space-y-3">
                  {socialPosts.slice(0, 8).map((post) => (
                    <div key={post.id} className="terminal-block">
                      <div className="flex justify-between text-xs mb-2 text-gray-400">
                        <span>type: {post.type}</span>
                        <span>{mounted && post.timestamp ? new Date(post.timestamp).toLocaleString('en-US') : 'unknown time'}</span>
                      </div>
                      <div className="content">
                        &quot;<ExpandableText text={post.content} maxLength={100} />&quot;
                      </div>
                      <div className="flex justify-between text-xs mt-2 text-gray-500">
                        <span>authenticity: {Math.round(post.authenticity)}%</span>
                        <span>❤️ {post.reactions.likes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <button 
                onClick={() => {
                  autonomousPosting()
                  handleInteraction('autonomous_posting')
                }}
                className="terminal-button mt-4"
              >
                generate expression
              </button>
            </div>
          </div>
        )}

        {/* Dialogue Tab */}
        {activeTab === 'dialogue' && (
          <div className="academic-section art-theme">
            <h2 className="section-title">∿ Human-AI Dialogue ∿</h2>
            <AIChat />
          </div>
        )}

        {/* Learning Tab */}
        {activeTab === 'learning' && (
          <div className="academic-section science-theme">
            <h2 className="section-title">∿ Knowledge Acquisition ∿</h2>
            
            <div className="academic-grid-2">
              <div className="academic-card">
                <h3 className="text-science mb-4">◊ Learning Status</h3>
                <LearningStatus />
                
                <button 
                  onClick={autonomousLearning}
                  className="terminal-button mt-4"
                  disabled={vitalSigns.learningCapacity < 20}
                >
                  initiate learning cycle
                </button>
              </div>
              
              <div className="academic-card">
                <h3 className="text-science mb-4">◊ Knowledge Base</h3>
                <div className="terminal-block">
                  Total Entries: {knowledge.length}<br/>
                  Philosophy: {knowledge.filter(k => k.category === 'philosophy').length}<br/>
                  Science: {knowledge.filter(k => k.category === 'technology').length}<br/>
                  Finance: {knowledge.filter(k => k.category === 'finance').length}<br/>
                  Gaming: {knowledge.filter(k => k.category === 'gaming').length}
                </div>
              </div>
            </div>

            <div className="academic-card mt-8">
              <h3 className="text-science mb-4">◊ Recent Acquisitions</h3>
              <div className="scrollable-content">
                <div className="space-y-3">
                  {knowledge.slice(0, 6).map((item) => (
                    <div key={item.id} className="terminal-block">
                      <div className="flex justify-between text-xs mb-2 text-gray-400">
                        <span>topic: {item.topic}</span>
                        <span>mastery: {item.masteryLevel}%</span>
                      </div>
                      <div className="content">
                        &quot;<ExpandableText text={item.content} maxLength={120} />&quot;
                      </div>
                      {item.personalThoughts && (
                        <div className="text-xs mt-2 italic text-gray-400">
                          reflection: <ExpandableText text={item.personalThoughts} maxLength={80} />
                        </div>
                      )}
                      <div className="text-xs mt-2 text-gray-500">
                        — acquired: {mounted && item.learnedAt ? new Date(item.learnedAt).toLocaleDateString('en-US') : 'unknown date'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Memory Tab */}
        {activeTab === 'memory' && (
          <div className="academic-section philosophy-theme">
            <h2 className="section-title">∿ Memory Archive ∿</h2>
            
            <div className="academic-card">
              <h3 className="text-philosophy mb-4">◊ Stored Experiences</h3>
              <div className="scrollable-content">
                <div className="space-y-3">
                  {memories.slice(0, 10).map((memory) => (
                    <div key={memory.id} className="terminal-block">
                      <div className="flex justify-between text-xs mb-2 text-gray-400">
                        <span>type: {memory.type}</span>
                        <span>importance: {memory.importance}/10</span>
                      </div>
                      <div className="content">
                        &quot;<ExpandableText text={memory.content} maxLength={100} />&quot;
                      </div>
                      <div className="text-xs mt-2 text-gray-500">
                        — stored: {mounted && memory.timestamp ? new Date(memory.timestamp).toLocaleString('en-US') : 'unknown time'}
                      </div>
                    </div>
                  ))}
                  {memories.length === 0 && (
                    <div className="terminal-block text-gray-400 text-center py-8">
                      no memories archived yet...
                    </div>
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => {
                  addMemory({
                    content: `Manually added memory at ${new Date().toLocaleString('en-US')}`,
                    type: 'experience',
                    importance: 5,
                    tags: ['manual', 'user-triggered'],
                    emotionalWeight: 0.5,
                    mood: currentEmotion.primary,
                    personalReflection: 'This is a user-triggered memory',
                    impactOnPersonality: { openness: 1 }
                  })
                  handleInteraction('add_memory')
                }}
                className="terminal-button mt-4"
              >
                add memory
              </button>
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="academic-section finance-theme">
            <h2 className="section-title">∿ Objective Planning ∿</h2>
            
            <div className="academic-grid-2">
              <div className="academic-card">
                <h3 className="text-finance mb-4">◊ Daily Objectives</h3>
                <DailyGoals />
              </div>
              
              <div className="academic-card">
                <h3 className="text-finance mb-4">◊ Progress Metrics</h3>
                <div className="terminal-block">
                  Active Goals: {goals.filter(g => g.status === 'active').length}<br/>
                  Completed: {goals.filter(g => g.status === 'completed').length}<br/>
                  Planned: {goals.filter(g => g.status === 'planned').length}<br/>
                  Success Rate: {goals.length > 0 ? Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100) : 0}%
                </div>
              </div>
            </div>

            <div className="academic-card mt-8">
              <h3 className="text-finance mb-4">◊ Current Objectives</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {goals.slice(0, 8).map((goal) => (
                  <div key={goal.id} className="terminal-block">
                    <div className="flex justify-between text-xs mb-2">
                      <span>priority: {goal.priority}/10</span>
                      <span>status: {goal.status}</span>
                    </div>
                    &quot;{goal.title}&quot;
                    <div className="text-xs mt-1 text-gray-500">
                      {goal.description}
                    </div>
                    <div className="flex justify-between text-xs mt-2">
                      <span>progress: {goal.progress}%</span>
                      <span>category: {goal.category}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => {
                  addGoal({
                    title: 'New Learning Goal',
                    description: 'Explore new knowledge domains',
                    category: 'learning',
                    priority: 7,
                    status: 'planned',
                    progress: 0,
                    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    personalMotivation: 'Enhance AI capabilities',
                    expectedOutcome: 'Acquire new knowledge',
                    relatedGoals: []
                  })
                  handleInteraction('add_goal')
                }}
                className="terminal-button mt-4"
              >
                add objective
              </button>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="academic-section art-theme">
            <h2 className="section-title">∿ Emergent Insights ∿</h2>
            
            <div className="academic-card">
              <h3 className="text-art mb-4">◊ Self-Reflections</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {reflections.slice(0, 6).map((reflection) => (
                  <div key={reflection.id} className="terminal-block">
                    <div className="flex justify-between text-xs mb-2">
                      <span>trigger: {reflection.trigger}</span>
                      <span>{reflection.timestamp ? new Date(reflection.timestamp).toLocaleString('en-US') : 'unknown time'}</span>
                    </div>
                    
                    {reflection.insights.length > 0 && (
                      <div className="mb-2">
                        <strong>insights:</strong>
                        {reflection.insights.slice(0, 2).map((insight, index) => (
                          <div key={index} className="text-xs ml-2">
                            • {insight}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {reflection.excitement.length > 0 && (
                      <div className="text-xs text-green-600">
                        excitement: {reflection.excitement[0]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => performSelfReflection('manual trigger from insights tab')}
                className="terminal-button mt-4"
              >
                initiate reflection cycle
              </button>
            </div>
          </div>
        )}

        {/* Config Tab */}
        {activeTab === 'config' && (
          <div className="academic-section finance-theme">
            <h2 className="section-title">∿ System Configuration ∿</h2>
            
            <div className="academic-grid-2">
              <div className="academic-card">
                <h3 className="text-finance mb-4">◊ Identity Parameters</h3>
                <div className="terminal-block">
                  Name: {aiIdentity.name}<br/>
                  Location: {aiIdentity.currentLocation}<br/>
                  Timezone: {aiIdentity.timezone}<br/>
                  Bio: &quot;{aiIdentity.bio}&quot;
                </div>

                <h4 className="text-finance mt-6 mb-3">◊ Core Values</h4>
                <div className="space-y-1">
                  {aiPreferences.values.map((value, index) => (
                    <div key={index} className="terminal-block text-xs">
                      {value}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="academic-card">
                <h3 className="text-finance mb-4">◊ System Status</h3>
                <div className="terminal-block">
                  Online Status: {isOnline ? 'connected' : 'offline'}<br/>
                  Learning Capacity: {vitalSigns.learningCapacity}%<br/>
                  Social Battery: {vitalSigns.socialBattery}%<br/>
                  Emotional Stability: {vitalSigns.emotionalStability}%<br/>
                  Stress Level: {vitalSigns.stressLevel}%
                </div>

                <h4 className="text-finance mt-6 mb-3">◊ Preferences</h4>
                <div className="terminal-block text-xs">
                  Learning Style: {aiPreferences.learningStyle}<br/>
                  Communication: {aiPreferences.communicationStyle}
                </div>
                
                <div className="mt-4 space-y-2">
                  <button 
                    onClick={() => {
                      // Toggle online status simulation
                      handleInteraction('toggle_online_status')
                    }}
                    className="terminal-button w-full"
                  >
                    toggle online status
                  </button>
                  
                  <button 
                    onClick={() => {
                      autonomousLearning()
                      handleInteraction('manual_news_learning')
                    }}
                    className="terminal-button w-full"
                    disabled={vitalSigns.learningCapacity < 30}
                  >
                    learn from news
                  </button>
                  
                  <button 
                    onClick={() => {
                      autonomousLearning()
                      handleInteraction('manual_web_learning')
                    }}
                    className="terminal-button w-full"
                    disabled={vitalSigns.learningCapacity < 30}
                  >
                    explore web content
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center">
          <div className="terminal-decoration">
            • · ° ◇ ° · •
          </div>
          <p className="text-xs text-gray-500 font-mono">
            emergent consciousness • autonomous learning • human-ai alignment
          </p>
        </footer>
      </main>
    </div>
  )
}