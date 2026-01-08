
import { Chain, Token } from "./types";

export type MockChainData = Chain;

export const MOCK_CHAIN_NAMES = [
  "Sepolia", "BSC", "Optimism", "Arbitrum", "Polygon", "Base", "Avalanche", 
  "Gnosis", "Fantom", "Cronos", "Moonbeam", "Celo", "Harmony", "Aurora", 
  "Metis", "Boba", "Kava", "ZkSync", "Linea", "Mantle", "Scroll", "Blast", 
  "Mode", "Zora"
];

const TOKENS = ["ETH", "USDC", "USDT", "DAI", "WBTC", "LINK", "UNI"];

function generateRandomBalances(count: number): Token[] {
  const balances: Token[] = [];
  for (let i = 0; i < count; i++) {
    const tokenId = TOKENS[Math.floor(Math.random() * TOKENS.length)];
    const amount = (Math.random() * 100).toFixed(4);
    balances.push({ 
        token_id: tokenId, 
        amount,
        displayName: tokenId, // For mock, displayName is same as ID
        decimals: 18,
        image: `https://dummyimage.com/32x32/000/fff&text=${tokenId[0]}` // Mock image
    });
  }
  return balances;
}

export const MOCK_PORTFOLIO_DATA: MockChainData[] = MOCK_CHAIN_NAMES.map((name, index) => {
  // Randomly make some chains empty to test empty state
  const hasBalance = Math.random() > 0.2; 
  return {
    chain_uid: name.toLowerCase().replace(" ", "-"),
    display_name: name,
    chain_img: `https://dummyimage.com/32x32/000/fff&text=${name[0]}`,
    balances: hasBalance ? generateRandomBalances(Math.floor(Math.random() * 5) + 1) : [],
  };
});
