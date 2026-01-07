
export interface MockTokenBalance {
  token_id: string;
  amount: string;
}

export interface MockChainData {
  chain_uid: string;
  name: string;
  icon?: string; // Placeholder for now
  balances: MockTokenBalance[];
}

export const MOCK_CHAIN_NAMES = [
  "Sepolia", "BSC", "Optimism", "Arbitrum", "Polygon", "Base", "Avalanche", 
  "Gnosis", "Fantom", "Cronos", "Moonbeam", "Celo", "Harmony", "Aurora", 
  "Metis", "Boba", "Kava", "ZkSync", "Linea", "Mantle", "Scroll", "Blast", 
  "Mode", "Zora"
];

const TOKENS = ["ETH", "USDC", "USDT", "DAI", "WBTC", "LINK", "UNI"];

function generateRandomBalances(count: number): MockTokenBalance[] {
  const balances: MockTokenBalance[] = [];
  for (let i = 0; i < count; i++) {
    const token = TOKENS[Math.floor(Math.random() * TOKENS.length)];
    const amount = (Math.random() * 100).toFixed(4);
    balances.push({ token_id: token, amount });
  }
  return balances;
}

export const MOCK_PORTFOLIO_DATA: MockChainData[] = MOCK_CHAIN_NAMES.map((name, index) => {
  // Randomly make some chains empty to test empty state
  const hasBalance = Math.random() > 0.2; 
  return {
    chain_uid: name.toLowerCase().replace(" ", "-"),
    name: name,
    balances: hasBalance ? generateRandomBalances(Math.floor(Math.random() * 5) + 1) : [],
  };
});
