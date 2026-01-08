import { useState } from "react";
import { Chain } from "@/lib/types";
import { ChainCard } from "@/components/dashboard/chain-card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface TokenResultsProps {
  chains: Chain[];
  viewMode: "grid" | "list";
}

const ITEMS_PER_PAGE = 6;

export function TokenResults({ chains, viewMode }: TokenResultsProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination Logic
  const totalPages = Math.ceil(chains.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentChains = chains.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (chains.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <h3 className="text-lg font-medium text-muted-foreground">
          No chains found.
        </h3>
        <p className="text-sm text-muted-foreground/60">
          Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 gap-6">
      {/* Content Grid/List */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }
      >
        {currentChains.map((chain) => (
          <div
            key={chain.chain_uid}
            className={viewMode === "list" ? "w-full" : "h-full"}
          >
            <ChainCard chain={chain} />
          </div>
        ))}
      </div>

      {/* Pagination Footer - Pushed to bottom */}
      <div className="mt-auto">
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={currentPage === i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className="cursor-pointer"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
