
"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ControlBar } from "@/components/dashboard/control-bar";
import { TokenResults } from "@/components/dashboard/token-results";
import { MOCK_PORTFOLIO_DATA, MOCK_CHAIN_NAMES } from "@/lib/mock-data";
import { usePortfolio } from "@/hooks/use-portfolio";
import { useState } from "react";
import { useDisconnect } from "wagmi";
import { useAppDispatch } from "@/lib/store/store";
import { setAddress } from "@/lib/store/features/wallet-slice";
import { useRouter } from "next/navigation";

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

  // Use mock data if no wallet or if explicit "demo mode" desired? 
  // For now: real data if available, else empty or mock? 
  // User instructions imply connecting to backend.
  // If no wallet connected, user sees empty or loading? 
  // Let's fallback to empty array if no data.
  
  const displayData = portfolioData || [];
  
  // Extract chain names dynamically from real data
  const dynamicChainOptions = useMemo(() => {
    if (!displayData.length) return MOCK_CHAIN_NAMES;
    return Array.from(new Set(displayData.map(c => c.name))).sort();
  }, [displayData]);

  // Filter & Sort Logic
  const filteredData = useMemo(() => {
    let data = [...displayData];

    // 1. Filter by Chain
    if (chainFilter !== "all") {
      data = data.filter((item) => item.name === chainFilter);
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
      data.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "highest") {
      data.sort((a, b) => {
        const sumA = a.balances.reduce((acc, t) => acc + parseFloat(t.amount), 0);
        const sumB = b.balances.reduce((acc, t) => acc + parseFloat(t.amount), 0);
        return sumB - sumA;
      });
    }

    return data;
  }, [chainFilter, searchQuery, sortBy, displayData]);
  
  // Calculate Global Net Worth (Mock for now since we don't have prices)
  const globalNetWorth = useMemo(() => {
     // Here we would ideally sum up value if we had prices.
     // For now, let's just count total tokens as a proxy or keep the mock value in header?
     // The DashboardHeader has internal mock value.
     // We should probably pass down a calculated value or isLoading state.
     return undefined; 
  }, [displayData]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Top Header */}
        <DashboardHeader isLoading={isLoading} address={address} />

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
