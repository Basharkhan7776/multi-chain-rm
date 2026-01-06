import type { Chain, Token } from "./types"

const MOCK_CHAINS: Record<string, Omit<Chain, "balances"> & { balances?: Token[] }> = {
  optimism: {
    chain_uid: "optimism",
    name: "Optimism",
    icon: "🔴",
    balances: [
      { token_id: "vUSDC", amount: "35.50", decimals: 6 },
      { token_id: "vETH", amount: "0.21", decimals: 18 },
      { token_id: "vDAI", amount: "50.00", decimals: 18 },
    ],
  },
  arbitrum: {
    chain_uid: "arbitrum",
    name: "Arbitrum",
    icon: "🔵",
    balances: [
      { token_id: "vUSDC", amount: "60.75", decimals: 6 },
      { token_id: "vETH", amount: "0.45", decimals: 18 },
      { token_id: "vARB", amount: "125.00", decimals: 18 },
    ],
  },
  neuron: {
    chain_uid: "neuron",
    name: "Neuron",
    icon: "⚡",
    balances: [
      { token_id: "vUSDC", amount: "120.50", decimals: 6 },
      { token_id: "vETH", amount: "0.54", decimals: 18 },
      { token_id: "vNEU", amount: "500.00", decimals: 18 },
    ],
  },
  polygon: {
    chain_uid: "polygon",
    name: "Polygon",
    icon: "🟣",
    balances: [
      { token_id: "vUSDC", amount: "85.25", decimals: 6 },
      { token_id: "vETH", amount: "0.15", decimals: 18 },
      { token_id: "vMATIC", amount: "1000.00", decimals: 18 },
    ],
  },
  broken_chain: {
    chain_uid: "broken_chain",
    name: "Broken Chain",
    icon: "❌",
    error: true,
  },
}

/**
 * Simulate API call to fetch available chains
 */
export async function fetchChainsList(): Promise<Chain[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        Object.values(MOCK_CHAINS).map(
          (chain) =>
            ({
              ...chain,
              balances: undefined,
            }) as Chain,
        ),
      )
    }, 300)
  })
}

/**
 * Simulate API call to fetch balances for a specific chain
 * Some chains fail to simulate error handling
 */
export async function fetchChainBalances(chainUid: string): Promise<{
  chain: Chain
  success: boolean
}> {
  return new Promise((resolve) => {
    setTimeout(
      () => {
        const chain = MOCK_CHAINS[chainUid]

        if (!chain) {
          resolve({
            chain: {
              chain_uid: chainUid,
              name: "Unknown",
              icon: "?",
              error: true,
              message: "Chain not found",
            },
            success: false,
          })
          return
        }

        // Simulate random failure for broken_chain
        if (chainUid === "broken_chain") {
          resolve({
            chain: {
              chain_uid: chainUid,
              name: chain.name,
              icon: chain.icon,
              error: true,
              message: "RPC connection timeout",
            },
            success: false,
          })
          return
        }

        resolve({
          chain: chain as Chain,
          success: true,
        })
      },
      600 + Math.random() * 400,
    ) // Simulate variable network latency
  })
}
