import { useEffect } from "react";
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

export function usePortfolio(options?: { search?: string; chain?: string }) {
  const address = useAppSelector((state) => state.wallet.address);
  const search = options?.search;
  const chain = options?.chain;
  
  const STORAGE_KEY = `portfolio_v1_${address}`;
  const isDefaultView = !search && (!chain || chain === 'all');

  const query = useQuery({
    queryKey: ["portfolio", address, search, chain], // Include filters in queryKey
    queryFn: () => fetchUserBalances(address!, search, chain),
    enabled: !!address,
    staleTime: 60 * 1000, // 1 minute cache
    retry: 1,
    placeholderData: keepPreviousData,
    initialData: () => {
        if (!address || !isDefaultView || typeof window === 'undefined') return undefined;
        try {
            const item = window.localStorage.getItem(STORAGE_KEY);
            return item ? JSON.parse(item) : undefined;
        } catch (e) {
            console.error("Failed to read from localStorage", e);
            return undefined;
        }
    },
    initialDataUpdatedAt: 0, // Treat initial data as stale to trigger background refetch
  });

  // Sync with localStorage
  useEffect(() => {
    if (isDefaultView && query.data && address) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(query.data));
        } catch (e) {
            console.error("Failed to save to localStorage", e);
        }
    }
  }, [query.data, address, isDefaultView]);

  return {
    ...query,
    address,
  };
}
