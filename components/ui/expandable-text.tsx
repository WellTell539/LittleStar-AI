import React, { useState } from 'react'

interface ExpandableTextProps {
  text: string
  maxLength?: number
  className?: string
}

export const ExpandableText: React.FC<ExpandableTextProps> = ({ 
  text, 
  maxLength = 150, 
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const shouldTruncate = text.length > maxLength

  if (!shouldTruncate) {
    return <span className={className}>{text}</span>
  }

  return (
    <span className={className}>
      {isExpanded ? text : `${text.slice(0, maxLength)}...`}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="ml-2 text-xs text-purple-400 hover:text-purple-300 transition-colors"
      >
        {isExpanded ? 'Show less' : 'Show more'}
      </button>
    </span>
  )
}

export default ExpandableText