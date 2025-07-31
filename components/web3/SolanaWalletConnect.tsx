'use client'

import { FC, ReactNode, useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets'
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'

// 导入默认样式
import '@solana/wallet-adapter-react-ui/styles.css'

interface SolanaWalletProviderProps {
    children: ReactNode
}

export const SolanaWalletProvider: FC<SolanaWalletProviderProps> = ({ children }) => {
    // 网络可以设置为 'devnet', 'testnet', 或 'mainnet-beta'
    const network = WalletAdapterNetwork.Devnet

    // 您也可以提供一个自定义的RPC端点
    const endpoint = useMemo(() => {
        if (process.env.NEXT_PUBLIC_SOLANA_RPC_URL) {
            return process.env.NEXT_PUBLIC_SOLANA_RPC_URL
        }
        return clusterApiUrl(network)
    }, [network])

    const wallets = useMemo(
        () => [
            // 在这里可以添加更多钱包
            // 例如：PhantomWalletAdapter, SolflareWalletAdapter 等
            new UnsafeBurnerWalletAdapter(),
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [network]
    )

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    )
}

export { WalletMultiButton, WalletDisconnectButton } 