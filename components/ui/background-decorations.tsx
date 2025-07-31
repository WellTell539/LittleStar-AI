'use client'

import React from 'react'

export const BackgroundDecorations = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* 主要背景球体 */}
      <div className="absolute -top-48 -right-48 w-96 h-96 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-gradient-to-br from-cyan-300/30 to-blue-300/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-yellow-300/20 to-orange-300/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}} />
      
      {/* 次要装饰球体 */}
      <div className="absolute top-1/4 right-1/3 w-32 h-32 bg-gradient-to-br from-rose-300/25 to-pink-300/25 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-1/3 left-1/4 w-24 h-24 bg-gradient-to-br from-emerald-300/25 to-teal-300/25 rounded-full blur-lg animate-float" style={{animationDelay: '3s'}} />
      <div className="absolute top-2/3 right-1/4 w-40 h-40 bg-gradient-to-br from-indigo-300/20 to-violet-300/20 rounded-full blur-2xl animate-float" style={{animationDelay: '1.5s'}} />
      
      {/* 小装饰粒子 */}
      <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-purple-400/60 rounded-full animate-bounce shadow-lg" style={{animationDelay: '0.5s'}} />
      <div className="absolute bottom-1/4 left-1/4 w-3 h-3 bg-pink-400/60 rounded-full animate-bounce shadow-lg" style={{animationDelay: '1.5s'}} />
      <div className="absolute top-3/4 right-1/3 w-2 h-2 bg-cyan-400/60 rounded-full animate-bounce shadow-lg" style={{animationDelay: '2.5s'}} />
      <div className="absolute top-1/3 left-1/5 w-5 h-5 bg-yellow-400/50 rounded-full animate-bounce shadow-lg" style={{animationDelay: '3.5s'}} />
      <div className="absolute bottom-1/5 right-1/5 w-3 h-3 bg-emerald-400/50 rounded-full animate-bounce shadow-lg" style={{animationDelay: '4s'}} />
      
      {/* 几何装饰 */}
      <div className="absolute top-1/6 right-1/6 w-8 h-8 bg-gradient-to-br from-violet-400/30 to-purple-500/30 rounded-lg transform rotate-45 animate-spin-slow shadow-lg" />
      <div className="absolute bottom-1/6 left-1/6 w-6 h-6 bg-gradient-to-br from-rose-400/30 to-pink-500/30 rounded-full animate-pulse shadow-lg" />
      <div className="absolute top-1/2 right-1/6 w-10 h-10 bg-gradient-to-br from-cyan-400/25 to-blue-500/25 rounded-xl transform rotate-12 animate-wiggle shadow-lg" />
      
      {/* 线条装饰 */}
      <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-300/20 to-transparent" />
      <div className="absolute bottom-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-300/20 to-transparent" />
      
      {/* 自定义CSS动画 */}
      <style jsx>{`
        @keyframes animate-float {
          0%, 100% { 
            transform: translateY(0px) scale(1);
            opacity: 0.6;
          }
          25% { 
            transform: translateY(-20px) scale(1.05);
            opacity: 0.8;
          }
          50% { 
            transform: translateY(-30px) scale(1.1);
            opacity: 1;
          }
          75% { 
            transform: translateY(-20px) scale(1.05);
            opacity: 0.8;
          }
        }
        
        @keyframes animate-spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes animate-wiggle {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(10deg) scale(1.1); }
          50% { transform: rotate(-10deg) scale(0.9); }
          75% { transform: rotate(5deg) scale(1.05); }
        }
        
        .animate-float {
          animation: animate-float 6s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: animate-spin-slow 20s linear infinite;
        }
        
        .animate-wiggle {
          animation: animate-wiggle 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default BackgroundDecorations 