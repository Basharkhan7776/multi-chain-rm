
"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ControlBar } from "@/components/dashboard/control-bar";
import { TokenResults } from "@/components/dashboard/token-results";
import { MOCK_CHAIN_NAMES } from "@/lib/mock-data";
import { usePortfolio } from "@/hooks/use-portfolio";
import { useState } from "react";
import { useDisconnect } from "wagmi";
import { useAppDispatch } from "@/lib/store/store";
import { setAddress } from "@/lib/store/features/wallet-slice";
import { useRouter } from "next/navigation";
import { getAdjustedAmount } from "@/lib/utils";

export default function DashboardPage() {
  const { disconnect } = useDisconnect();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleDisconnect = () => {
    disconnect();
    dispatch(setAddress(undefined));
    router.push("/");
  };

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [chainFilter, setChainFilter] = useState("all");
  const [sortBy, setSortBy] = useState("highest"); 
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Data Fetching
  const { data: portfolioData, isLoading, isError, address } = usePortfolio();
  
  const displayData = portfolioData || [];
  
  // Extract chain names dynamically from real data
  const dynamicChainOptions = useMemo(() => {
    if (!displayData.length) return MOCK_CHAIN_NAMES;
    return Array.from(new Set(displayData.map(c => c.display_name))).sort();
  }, [displayData]);

  // Filter & Sort Logic
  const filteredData = useMemo(() => {
    let data = [...displayData];

    // 1. Filter by Chain
    if (chainFilter !== "all") {
      data = data.filter((item) => item.display_name === chainFilter);
    }

    // 2. Filter by Search (Token Name)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      data = data.map(chain => ({
        ...chain,
        balances: chain.balances.filter(token => token.token_id.toLowerCase().includes(query))
      })).filter(chain => chain.balances.length > 0);
    }

    // 3. Sort
    if (sortBy === "alphabetical") {
      data.sort((a, b) => a.display_name.localeCompare(b.display_name));
    } else if (sortBy === "highest") {
      data.sort((a, b) => {
        // Helper to calc total value of a chain
        const getChainValue = (c: typeof a) => c.balances.reduce((acc, t) => {
            const amount = getAdjustedAmount(t.amount, t.decimals ?? 18);
            const price = t.price ? parseFloat(t.price) : 0;
            return acc + (amount * price);
        }, 0);
        
        return getChainValue(b) - getChainValue(a);
      });
    }

    return data;
  }, [chainFilter, searchQuery, sortBy, displayData]);
  
  // Calculate Global Net Worth
  const globalNetWorth = useMemo(() => {
      if (!displayData) return 0;
      return displayData.reduce((totalAcc, chain) => {
          const chainValue = chain.balances.reduce((chainAcc, token) => {
               const price = token.price ? parseFloat(token.price) : 0;
               const amount = getAdjustedAmount(token.amount, token.decimals ?? 18);
               return chainAcc + (amount * price);
          }, 0);
          return totalAcc + chainValue;
      }, 0);
  }, [displayData]);


  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Top Header */}
        <DashboardHeader isLoading={isLoading} address={address} netWorth={globalNetWorth} />

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
          chainOptions={dynamicChainOptions}
          onDisconnect={handleDisconnect}
        />

        {/* Results Area */}
        <div className="mt-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Fetching balances from Euclid Protocol...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 text-destructive">
               <p className="text-lg font-semibold">Failed to load portfolio data.</p>
               <p className="text-sm opacity-80">Please try disconnecting and reconnecting.</p>
            </div>
          ) : !address ? (
             <div className="text-center py-20 text-muted-foreground">
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
