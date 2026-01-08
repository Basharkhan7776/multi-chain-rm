
import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/store/store";
import { Chain } from "@/lib/types";

async function fetchUserBalances(address: string): Promise<Chain[]> {
  const res = await fetch(`/api/user-balances/${address}`);
  if (!res.ok) {
    throw new Error("Failed to fetch balances");
  }
  return res.json();
}

export function usePortfolio() {
  const address = useAppSelector((state) => state.wallet.address);
  
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
