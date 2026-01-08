export interface Token {
  token_id: string
  amount: string
  decimals?: number
  displayName?: string
  image?: string
  price?: string
}

export interface Chain {
  chain_uid: string
  display_name: string
  chain_img?: string
  balances: Token[]
  error?: string
  raw_error_check?: any
}

// Keeping this for potential backward compatibility or other components, but updating fields
export interface ChainBalance {
  chain_uid: string
  display_name: string
  chain_img?: string
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
