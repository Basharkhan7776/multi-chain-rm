import { useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useAppSelector } from "@/lib/store/store";
import { Chain } from "@/lib/types";

async function fetchUserBalances(address: string): Promise<Chain[]> {
  const url = `/api/user-balances/${address}`;
  
  const res = await fetch(url);
  if (!res.ok) {
    let errorMessage = "Failed to fetch balances";
    try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorMessage;
    } catch (e) {
        // ignore json parse error
    }
    throw new Error(errorMessage);
  }
  return res.json();
}

export function usePortfolio() {
  const address = useAppSelector((state) => state.wallet.address);
  
  const STORAGE_KEY = `portfolio_v1_${address}`;

  const query = useQuery<Chain[]>({
    queryKey: ["portfolio", address], 
    queryFn: () => fetchUserBalances(address!),
    enabled: !!address,
    staleTime: 60 * 1000, // 1 minute cache
    retry: 1,
    placeholderData: keepPreviousData,
    initialData: () => {
        if (!address || typeof window === 'undefined') return undefined;
        try {
            const item = window.localStorage.getItem(STORAGE_KEY);
            return item ? (JSON.parse(item) as Chain[]) : undefined;
        } catch (e) {
            console.error("Failed to read from localStorage", e);
            return undefined;
        }
    },
    initialDataUpdatedAt: 0, // Treat initial data as stale to trigger background refetch
  });

  // Sync with localStorage
  useEffect(() => {
    if (query.data && address) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(query.data));
        } catch (e) {
            console.error("Failed to save to localStorage", e);
        }
    }
  }, [query.data, address]);

  return {
    ...query,
    address,
  };
}
