"use client"

import { SkeletonLoader } from "@/components/dashboard/skeleton-loader"

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border/30 bg-card/30 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="h-8 w-32 bg-card/50 rounded animate-pulse" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-6 h-24 bg-card/50 rounded animate-pulse" />
        <div className="mb-6 h-10 bg-card/50 rounded animate-pulse" />
        <SkeletonLoader count={4} />
      </div>
    </main>
  )
}
