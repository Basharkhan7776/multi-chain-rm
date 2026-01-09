"use client";

import { useMemo, useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { SkeletonLoader } from "@/components/dashboard/skeleton-loader";
import { ControlBar } from "@/components/dashboard/control-bar";
import { TokenResults } from "@/components/dashboard/token-results";
import { usePortfolio } from "@/hooks/use-portfolio";
import { toast } from "sonner";
import { useDisconnect } from "wagmi";
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { setAddress, setIsConnected } from "@/lib/store/features/wallet-slice";
import { useRouter } from "next/navigation";
import { getAdjustedAmount } from "@/lib/utils";
import { Chain } from "@/lib/types";

export default function DashboardPage() {
  const { disconnect } = useDisconnect();
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Route Protection
  const { address: reduxAddress, isConnected: reduxIsConnected } =
    useAppSelector((state) => state.wallet);

  useEffect(() => {
    if (!reduxAddress || !reduxIsConnected) {
      router.replace("/");
    }
  }, [reduxAddress, reduxIsConnected, router]);

  const handleDisconnect = () => {
    disconnect();
    dispatch(setAddress(undefined));
    dispatch(setIsConnected(false));
    router.replace("/");
  };

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [chainFilter, setChainFilter] = useState("all");
  const [sortBy, setSortBy] = useState("highest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Data Fetching: Fetch ALL data (Server-side filtering removed)
  const {
    data: portfolioData,
    isLoading,
    isError,
    error,
    address,
  } = usePortfolio();

  // Calculate unique chains from portfolio data
  const chainOptions = useMemo(() => {
    if (!portfolioData) return [];
    // Extract unique chain names/ids from the portfolio
    // The portfolioData contains an array of chains objects
    const names = portfolioData
      .map((c: Chain) => c.display_name)
      .filter((name: string) => name && name.trim() !== "");
    return Array.from(new Set(names)).sort();
  }, [portfolioData]);

  const displayData = useMemo(() => {
    return (portfolioData || []).filter(
      (c) => c.display_name && c.display_name.trim() !== ""
    );
  }, [portfolioData]);

  // Error Handling Effect
  useEffect(() => {
    if (isError) {
      toast.error(
        error?.message ||
          "Failed to load portfolio data. Please check the wallet address."
      );
    }
  }, [isError, error]);

  // Empty Data Effect
  useEffect(() => {
    // Only show toast if NO filters are active (global empty state)
    // If filters are active, the UI "No chains found" is sufficient
    const isFiltered = debouncedSearch !== "" || chainFilter !== "all";
    if (
      !isLoading &&
      !isError &&
      address &&
      displayData.length === 0 &&
      !isFiltered
    ) {
      toast.info("No balances found for this address. Try adding some funds!");
    }
  }, [
    isLoading,
    isError,
    address,
    displayData.length,
    debouncedSearch,
    chainFilter,
  ]);

  // Filter & Sort Logic
  const filteredData = useMemo(() => {
    let data = [...displayData];

    // 1. Filter by Chain
    if (chainFilter !== "all") {
      data = data.filter(
        (c) => c.display_name === chainFilter || c.chain_uid === chainFilter
      );
    }

    // 2. Filter by Search (Name or Tokens)
    if (debouncedSearch) {
      const lowerSearch = debouncedSearch.toLowerCase();
      data = data
        .map((chain) => {
          // Check if chain name matches
          const chainMatches = chain.display_name
            .toLowerCase()
            .includes(lowerSearch);

          // Filter tokens that match
          const matchingTokens = chain.balances.filter((token: any) => {
            const tokenId = token.token_id.toLowerCase();
            const displayName = token.displayName?.toLowerCase() || "";
            return (
              tokenId.includes(lowerSearch) || displayName.includes(lowerSearch)
            );
          });

          // Logic:
          // - If chain name matches, return chain with ALL tokens?
          //   Let's match the previous server-side logic:
          //   If chain matches, keep it.
          if (chainMatches) {
            return chain;
          }

          // If chain doesn't match, return chain only if it has matching tokens
          if (matchingTokens.length > 0) {
            return {
              ...chain,
              balances: matchingTokens,
            };
          }

          return null; // Exclude this chain
        })
        .filter(Boolean) as Chain[];
    }

    // 3. Sort
    if (sortBy === "alphabetical") {
      data.sort((a, b) => a.display_name.localeCompare(b.display_name));
    } else if (sortBy === "highest") {
      data.sort((a, b) => {
        // Helper to calc total value of a chain
        const getChainValue = (c: Chain) =>
          c.balances.reduce((acc: number, t: any) => {
            const amount = getAdjustedAmount(t.amount, t.decimals ?? 18);
            const price = t.price ? parseFloat(t.price) : 0;
            return acc + amount * price;
          }, 0);

        return getChainValue(b) - getChainValue(a);
      });
    }

    return data;
  }, [sortBy, displayData, chainFilter, debouncedSearch]);

  // Calculate Global Net Worth
  const globalNetWorth = useMemo(() => {
    if (!displayData) return 0;
    return displayData.reduce((totalAcc: number, chain: Chain) => {
      const chainValue = chain.balances.reduce(
        (chainAcc: number, token: any) => {
          const price = token.price ? parseFloat(token.price) : 0;
          const amount = getAdjustedAmount(token.amount, token.decimals ?? 18);
          return chainAcc + amount * price;
        },
        0
      );
      return totalAcc + chainValue;
    }, 0);
  }, [displayData]);

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="container mx-auto px-4 py-8 max-w-7xl flex-1 flex flex-col">
        {/* Top Header */}
        <DashboardHeader
          isLoading={isLoading}
          address={address}
          netWorth={globalNetWorth}
        />

        {/* Controls */}
        <ControlBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          chainFilter={chainFilter}
          onChainFilterChange={setChainFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          chainOptions={chainOptions}
          onDisconnect={handleDisconnect}
        />

        {/* Results Area */}
        <div className="mt-8 flex-1 flex flex-col">
          {isLoading ? (
            <SkeletonLoader count={6} />
          ) : isError ? (
            <div className="flex-1 flex flex-col items-center justify-center text-destructive">
              <p className="text-lg font-semibold">
                Failed to load portfolio data.
              </p>
              <p className="text-sm opacity-80">
                Please try disconnecting and reconnecting.
              </p>
            </div>
          ) : !address ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              Please connect your wallet to view your portfolio.
            </div>
          ) : (
            <TokenResults chains={filteredData} viewMode={viewMode} />
          )}
        </div>
      </div>
    </main>
  );
}
