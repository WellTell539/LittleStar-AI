/// <reference types="react" />
/// <reference types="react-dom" />

interface Window {
  ethereum?: {
    request: (args: { method: string; params?: any[] }) => Promise<any>
    on: (event: string, handler: (...args: any[]) => void) => void
    removeListener: (event: string, handler: (...args: any[]) => void) => void
    isMetaMask?: boolean
  }
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any
  }
} 