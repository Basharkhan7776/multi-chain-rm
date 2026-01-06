export interface Token {
  token_id: string
  amount: string
  decimals?: number
}

export interface Chain {
  chain_uid: string
  name: string
  icon: string
  balances?: Token[]
  error?: boolean
  message?: string
}

export interface ChainBalance {
  chain_uid: string
  name: string
  icon: string
  tokens: Token[]
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
}

export interface GlobalBalance {
  [tokenId: string]: number
}

export interface WalletState {
  isConnected: boolean
  address?: string
}
