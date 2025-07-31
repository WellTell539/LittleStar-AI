import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SolanaWalletProvider } from '@/components/web3/SolanaWalletConnect'
import React from 'react'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'LITTLE STAR AI Dashboard - Intelligent Learning Companion',
  description: 'An innovative AI companion application that combines AI, Web3, and blockchain technology to help you continuously learn and grow.',
  keywords: 'AI, Learning, Web3, Blockchain, Claude, Intelligent Assistant',
  authors: [{ name: 'LITTLE STAR AI Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#e654ff',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#e654ff" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <SolanaWalletProvider>
          {children}
        </SolanaWalletProvider>
      </body>
    </html>
  )
}
