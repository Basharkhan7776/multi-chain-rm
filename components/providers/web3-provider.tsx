"use client"

import { ReactNode, useState } from "react"
import { getConfig } from '@/config'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from 'wagmi'

// Setup queryClient
const queryClient = new QueryClient()

export function Web3Provider({ children }: { children: ReactNode }) {
  const [config] = useState(() => getConfig())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

