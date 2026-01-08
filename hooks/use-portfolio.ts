
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/store/store";
import { Chain } from "@/lib/types";

async function fetchUserBalances(address: string, search?: string, chain?: string): Promise<Chain[]> {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (chain && chain !== "all") params.append("chain", chain);
  
  const queryString = params.toString();
  const url = `/api/user-balances/${address}${queryString ? `?${queryString}` : ""}`;
  
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch balances");
  }
  return res.json();
}

export function usePortfolio(options?: { search?: string; chain?: string }) {
  const address = useAppSelector((state) => state.wallet.address);
  const search = options?.search;
  const chain = options?.chain;
  
  const query = useQuery({
    queryKey: ["portfolio", address, search, chain], // Include filters in queryKey
    queryFn: () => fetchUserBalances(address!, search, chain),
    enabled: !!address,
    staleTime: 60 * 1000, // 1 minute cache
    retry: 1,
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    address,
  };
}
