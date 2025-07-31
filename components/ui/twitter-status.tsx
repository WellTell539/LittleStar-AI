'use client'

import { useState, useEffect } from 'react'
import { Twitter, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Badge } from './badge'
import { Button } from './button'

interface TwitterStatus {
  enabled: boolean
  configured: boolean
  username?: string
}

export function TwitterStatus() {
  const [status, setStatus] = useState<TwitterStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/twitter')
      if (response.ok) {
        const data = await response.json()
        setStatus(data.status)
      } else {
        setError('获取Twitter状态失败')
      }
    } catch (err) {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
        <Twitter className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-500">检查Twitter状态...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
        <XCircle className="w-4 h-4 text-red-500" />
        <span className="text-sm text-red-600">{error}</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={fetchStatus}
          className="ml-auto"
        >
          重试
        </Button>
      </div>
    )
  }

  if (!status) {
    return null
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
      <Twitter className="w-4 h-4 text-blue-500" />
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-blue-700">
            Twitter同步
          </span>
          
          {status.enabled ? (
            <Badge variant="default" className="bg-green-100 text-green-700">
              <CheckCircle className="w-3 h-3 mr-1" />
              已启用
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
              <AlertCircle className="w-3 h-3 mr-1" />
              未配置
            </Badge>
          )}
        </div>
        
        {status.username && (
          <div className="text-xs text-blue-600">
            @{status.username}
          </div>
        )}
      </div>
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={fetchStatus}
        className="text-blue-600 hover:text-blue-700"
      >
        刷新
      </Button>
    </div>
  )
} 