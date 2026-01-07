"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from "lucide-react";

export function DashboardHeader() {
  // Mock Net Worth calculation or placeholder
  const netWorth = "$12,450.32"; 

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Portfolio Overview</h1>
        <p className="text-muted-foreground">Track your assets across all EVM chains.</p>
      </div>
      
      <Card className="w-full md:w-auto min-w-[250px] bg-card text-card-foreground shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Est. Net Worth</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{netWorth}</div>
          <p className="text-xs text-muted-foreground">+2.5% from last month</p>
        </CardContent>
      </Card>
    </div>
  );
}
