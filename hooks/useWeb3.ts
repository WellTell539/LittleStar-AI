'use client'

import { useState, useEffect, useCallback } from 'react'
import { ethers, BrowserProvider, Contract } from 'ethers'
import { 
  ClaudeMiniSBT_ABI, 
  MemoryAnchor_ABI, 
  GoalDAO_ABI, 
  CONTRACT_ADDRESSES 
} from '@/lib/contracts'

interface Web3State {
  provider: BrowserProvider | null
  signer: ethers.Signer | null
  account: string | null
  chainId: number | null
  contracts: {
    claudeMiniSBT: Contract | null
    memoryAnchor: Contract | null
    goalDAO: Contract | null
  }
  isConnecting: boolean
  isConnected: boolean
  error: string | null
}

// Contract addresses are imported from lib/contracts

export function useWeb3() {
  const [web3State, setWeb3State] = useState<Web3State>({
    provider: null,
    signer: null,
    account: null,
    chainId: null,
    contracts: {
      claudeMiniSBT: null,
      memoryAnchor: null,
      goalDAO: null
    },
    isConnecting: false,
    isConnected: false,
    error: null
  })

  const initializeContracts = useCallback(async (signer: ethers.Signer) => {
    try {
      let claudeMiniSBT = null
      let memoryAnchor = null
      let goalDAO = null

             // Only initialize contracts if addresses are provided
       if (CONTRACT_ADDRESSES.claudeMiniSBT && CONTRACT_ADDRESSES.claudeMiniSBT !== '') {
         claudeMiniSBT = new Contract(
           CONTRACT_ADDRESSES.claudeMiniSBT,
           ClaudeMiniSBT_ABI,
           signer
         )
       }
       
       if (CONTRACT_ADDRESSES.memoryAnchor && CONTRACT_ADDRESSES.memoryAnchor !== '') {
         memoryAnchor = new Contract(
           CONTRACT_ADDRESSES.memoryAnchor,
           MemoryAnchor_ABI,
           signer
         )
       }
       
       if (CONTRACT_ADDRESSES.goalDAO && CONTRACT_ADDRESSES.goalDAO !== '') {
         goalDAO = new Contract(
           CONTRACT_ADDRESSES.goalDAO,
           GoalDAO_ABI,
           signer
         )
       }

      setWeb3State(prev => ({
        ...prev,
        contracts: {
          claudeMiniSBT,
          memoryAnchor,
          goalDAO
        }
      }))
    } catch (error) {
      console.error('Failed to initialize contracts:', error)
      setWeb3State(prev => ({
        ...prev,
        error: 'Failed to initialize contracts'
      }))
    }
  }, [])

  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setWeb3State(prev => ({
        ...prev,
        error: 'Please install MetaMask to use this feature'
      }))
      return
    }

    setWeb3State(prev => ({ ...prev, isConnecting: true, error: null }))

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      
      // Create provider and signer
      const provider = new BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const account = await signer.getAddress()
      const network = await provider.getNetwork()
      
      setWeb3State(prev => ({
        ...prev,
        provider,
        signer,
        account,
        chainId: Number(network.chainId),
        isConnecting: false,
        isConnected: true
      }))

      // Initialize contracts if addresses are available
      if (CONTRACT_ADDRESSES.claudeMiniSBT && signer) {
        await initializeContracts(signer)
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      setWeb3State(prev => ({
        ...prev,
        isConnecting: false,
        isConnected: false,
        error: 'Failed to connect wallet'
      }))
    }
  }, [initializeContracts])

  const disconnect = useCallback(() => {
    setWeb3State({
      provider: null,
      signer: null,
      account: null,
      chainId: null,
      contracts: {
        claudeMiniSBT: null,
        memoryAnchor: null,
        goalDAO: null
      },
      isConnecting: false,
      isConnected: false,
      error: null
    })
  }, [])

  // Contract interaction functions
  const mintClaudeMini = useCallback(async (name: string, uri: string) => {
    if (!web3State.contracts.claudeMiniSBT) {
      throw new Error('Contract not initialized')
    }

    try {
      const tx = await web3State.contracts.claudeMiniSBT.mintClaudeMini(name, uri)
      await tx.wait()
      return tx
    } catch (error) {
      console.error('Failed to mint LITTLE STAR AI:', error)
      throw error
    }
  }, [web3State.contracts.claudeMiniSBT])

  const anchorMemory = useCallback(async (
    memoryData: string,
    memoryType: string,
    category: string
  ) => {
    if (!web3State.contracts.memoryAnchor) {
      throw new Error('Contract not initialized')
    }

    try {
      const tx = await web3State.contracts.memoryAnchor.anchorMemory(
        memoryData,
        memoryType,
        category
      )
      await tx.wait()
      return tx
    } catch (error) {
      console.error('Failed to anchor memory:', error)
      throw error
    }
  }, [web3State.contracts.memoryAnchor])

  const proposeGoal = useCallback(async (title: string, description: string) => {
    if (!web3State.contracts.goalDAO) {
      throw new Error('Contract not initialized')
    }

    try {
      const tx = await web3State.contracts.goalDAO.proposeGoal(title, description)
      await tx.wait()
      return tx
    } catch (error) {
      console.error('Failed to propose goal:', error)
      throw error
    }
  }, [web3State.contracts.goalDAO])

  const voteOnGoal = useCallback(async (goalId: number, support: boolean) => {
    if (!web3State.contracts.goalDAO) {
      throw new Error('Contract not initialized')
    }

    try {
      const tx = await web3State.contracts.goalDAO.voteOnGoal(goalId, support)
      await tx.wait()
      return tx
    } catch (error) {
      console.error('Failed to vote on goal:', error)
      throw error
    }
  }, [web3State.contracts.goalDAO])

  const checkHasMinted = useCallback(async (address: string) => {
    if (!web3State.contracts.claudeMiniSBT) {
      return false
    }

    try {
      return await web3State.contracts.claudeMiniSBT.hasMinted(address)
    } catch (error) {
      console.error('Failed to check if has minted:', error)
      return false
    }
  }, [web3State.contracts.claudeMiniSBT])

  // Auto-connect if wallet was previously connected
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          connectWallet()
        }
      })
    }
  }, []) // Only run once on mount

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnect()
        } else if (accounts[0] !== web3State.account) {
          connectWallet()
        }
      }

      const handleChainChanged = () => {
        window.location.reload()
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      return () => {
        if (window.ethereum) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
          window.ethereum.removeListener('chainChanged', handleChainChanged)
        }
      }
    }
  }, [web3State.account, connectWallet, disconnect])

  return {
    ...web3State,
    sbt: web3State.contracts.claudeMiniSBT,
    memoryAnchor: web3State.contracts.memoryAnchor,
    goalDAO: web3State.contracts.goalDAO,
    connectWallet,
    disconnect,
    mintClaudeMini,
    anchorMemory,
    proposeGoal,
    voteOnGoal,
    checkHasMinted
  }
} 