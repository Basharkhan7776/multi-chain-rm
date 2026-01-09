import { Search, LayoutGrid, List as ListIcon, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ControlBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  chainFilter: string;
  onChainFilterChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  chainOptions: string[];
  onDisconnect?: () => void;
}

export function ControlBar({
  searchQuery,
  onSearchChange,
  chainFilter,
  onChainFilterChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  chainOptions,
  onDisconnect,
}: ControlBarProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-4 space-y-4 md:space-y-0">
      {/* Left: Search */}
      <div className="relative w-full md:w-72">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tokens..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8 bg-card"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Search for tokens by name or symbol</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Right: Filters & Controls */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        {/* Chain Filter */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Select value={chainFilter} onValueChange={onChainFilterChange}>
                <SelectTrigger className="w-[140px] bg-card">
                  <SelectValue placeholder="All Chains" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Chains</SelectItem>
                  {chainOptions.map((chain) => (
                    <SelectItem key={chain} value={chain}>
                      {chain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Filter by blockchain network</p>
          </TooltipContent>
        </Tooltip>

        {/* Sort By */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="w-[140px] bg-card">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="highest">Highest Value</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sort chains by value or name</p>
          </TooltipContent>
        </Tooltip>

        {/* View Toggle */}
        <div className="sm:block hidden">
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Tabs
                  value={viewMode}
                  onValueChange={(v) => onViewModeChange(v as "grid" | "list")}
                  className="w-auto"
                >
                  <TabsList className="grid w-[80px] grid-cols-2">
                    <TabsTrigger value="grid">
                      <LayoutGrid className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="list">
                      <ListIcon className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle between grid and list view</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Disconnect Button - Aligned with filters */}
        {onDisconnect && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={onDisconnect}
                className="ml-2"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Disconnect wallet</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
