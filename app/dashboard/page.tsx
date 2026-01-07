"use client";

import { useState, useMemo } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ControlBar } from "@/components/dashboard/control-bar";
import { TokenResults } from "@/components/dashboard/token-results";
import { MOCK_PORTFOLIO_DATA, MOCK_CHAIN_NAMES } from "@/lib/mock-data";
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
  const [sortBy, setSortBy] = useState("highest"); // Default: highest value logic (simulated)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter & Sort Logic
  const filteredData = useMemo(() => {
    let data = [...MOCK_PORTFOLIO_DATA];

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
  }, [chainFilter, searchQuery, sortBy]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Top Header */}
        <DashboardHeader />

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
          chainOptions={MOCK_CHAIN_NAMES}
          onDisconnect={handleDisconnect}
        />

        {/* Results Area */}
        <div className="mt-8">
          <TokenResults chains={filteredData} viewMode={viewMode} />
        </div>

      </div>
    </main>
  );
}
