
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";


interface DashboardHeaderProps {
  isLoading?: boolean;
  address?: string;
  netWorth?: number;
}

export function DashboardHeader({ isLoading, address, netWorth = 0 }: DashboardHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Portfolio Overview</h1>
        <p className="text-muted-foreground">Track your assets across all EVM chains.</p>
        
        {address && (
          <div className="flex items-center mt-2 space-x-2">
            <code className="bg-muted px-2 py-1 rounded text-xs text-foreground font-mono">
              {address.length > 10 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address}
            </code>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={handleCopy}
              title="Copy Address"
              type="button"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        )}
      </div>
      
      <Card className="w-full md:w-auto min-w-[250px] bg-card text-card-foreground shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Est. Net Worth</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
               <span className="animate-pulse bg-muted rounded h-8 w-32 block"></span>
            ) : (
               formatCurrency(netWorth)
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
