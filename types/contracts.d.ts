declare module '*.json' {
  const value: any
  export default value
}

declare module '@/contracts/ClaudeMiniSBT.json' {
  const value: {
    abi: any[]
    bytecode: string
  }
  export default value
}

declare module '@/contracts/MemoryAnchor.json' {
  const value: {
    abi: any[]
    bytecode: string
  }
  export default value
}

declare module '@/contracts/GoalDAO.json' {
  const value: {
    abi: any[]
    bytecode: string
  }
  export default value
} 