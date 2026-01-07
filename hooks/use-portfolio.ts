
import { useQuery } from "@tanstack/react-query";
import { MockChainData } from "@/lib/mock-data";
import { useAppSelector } from "@/lib/store/store";

interface ChainData {
  chain_uid: string;
  name: string;
  icon?: string;
  balances: {
    token_id: string;
    amount: string;
  }[];
}

async function fetchUserBalances(address: string): Promise<ChainData[]> {
  const res = await fetch(`/api/user-balances/${address}`);
  if (!res.ok) {
    throw new Error("Failed to fetch balances");
  }
  return res.json();
}

export function usePortfolio() {
  const address = useAppSelector((state) => state.wallet.address);
  // Default to the provided test wallet if no wallet connected, for demo purposes?
  // User instructions said "User Wallet = 0x887..." in the script.
  // But also said "Connect to backend". 
  // Let's use the connected wallet if available, else maybe fall back ONLY for dev/demo if needed?
  // Actually, standard behavior is: if no wallet, query is disabled or shows nothing.
  // The user script had a HARDCODED address. `0x887...`
  // I will use `address` from store, but if undefined, I might skip query.
  
  // However, for the purpose of the demo, it might be useful to have a default if the user hasn't connected?
  // I'll stick to store address. The user can connect wallet to trigger it.
  
  const query = useQuery({
    queryKey: ["portfolio", address],
    queryFn: () => fetchUserBalances(address!),
    enabled: !!address,
    staleTime: 60 * 1000, // 1 minute cache
    retry: 1,
  });

  return {
    ...query,
    address,
  };
}
