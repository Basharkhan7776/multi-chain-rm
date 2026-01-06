"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { useAppSelector, useAppDispatch } from "@/lib/store/store"
import { setAddress } from "@/lib/store/features/wallet-slice"
import { Input } from "@/components/ui/input"
import { useDisconnect } from "wagmi"
import { HeaderBalance } from "@/components/dashboard/header-balance"
import { ChainCard } from "@/components/dashboard/chain-card"
import { SkeletonLoader } from "@/components/dashboard/skeleton-loader"
import { FadeIn } from "@/components/shared/fade-in"
import { Button } from "@/components/ui/button"
import { LogOut, Search } from "lucide-react"
import { motion } from "framer-motion"
import { fetchChainsList, fetchChainBalances } from "@/lib/api-mock"
import { calculateGlobalTotals, debounce } from "@/lib/utils"
import type { ChainBalance, GlobalBalance } from "@/lib/types"

export default function DashboardPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [chainBalances, setChainBalances] = useState<ChainBalance[]>([])
  const [globalTotals, setGlobalTotals] = useState<GlobalBalance>({})
  const [retryChains, setRetryChains] = useState<Set<string>>(new Set())

  // Check wallet connection
  // Check wallet connection
  const address = useAppSelector((state) => state.wallet.address)

  useEffect(() => {
    if (!address) {
      router.push("/")
    }
  }, [address, router])

  // Fetch chains list
  const { data: chainsList, isLoading: chainsLoading } = useQuery({
    queryKey: ["chains"],
    queryFn: fetchChainsList,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch balances for all chains with Promise.allSettled
  const { isLoading: balancesLoading, refetch } = useQuery({
    queryKey: ["chain-balances", Array.from(retryChains)],
    queryFn: async () => {
      if (!chainsList) return

      const fetchPromises = chainsList.map((chain) => fetchChainBalances(chain.chain_uid))

      const results = await Promise.allSettled(fetchPromises)
      const processed: ChainBalance[] = []
      const tokenLists: (typeof chainsList)[0]["balances"][] = []

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          const { chain, success } = result.value
          processed.push({
            chain_uid: chain.chain_uid,
            name: chain.name,
            icon: chain.icon,
            tokens: chain.balances || [],
            isError: !success,
            errorMessage: chain.message,
          })

          if (success && chain.balances) {
            tokenLists.push(chain.balances)
          }
        }
      })

      setChainBalances(processed)
      setGlobalTotals(calculateGlobalTotals(tokenLists))
    },
    enabled: !!chainsList,
    staleTime: 5 * 60 * 1000,
  })

  const { disconnect } = useDisconnect()
  const dispatch = useAppDispatch()

  const handleLogout = () => {
    disconnect()
    dispatch(setAddress(undefined))
    router.push("/")
  }

  const handleSearchChange = useCallback(
    debounce((value: string) => {
      setSearchQuery(value)
    }, 300),
    [],
  )

  const handleRetry = (chainUid: string) => {
    const newRetry = new Set(retryChains)
    newRetry.add(chainUid)
    setRetryChains(newRetry)
    refetch()
  }

  const isLoading = chainsLoading || balancesLoading

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="border-b border-border/30 bg-card/30 sticky top-0 z-50 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Disconnect
          </Button>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <FadeIn duration={0.5}>
          {/* Balance Header */}
          <HeaderBalance balances={globalTotals} isLoading={isLoading} />

          {/* Search Input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeInOut" }}
            className="mb-6"
          >
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tokens..."
                className="pl-10"
                onChange={(e) => handleSearchChange(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </motion.div>

          {/* Chain Cards Grid */}
          {isLoading ? (
            <SkeletonLoader count={4} />
          ) : (
            <motion.div
              className="grid gap-4 md:grid-cols-1 lg:grid-cols-2"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {chainBalances.map((chain, index) => (
                <ChainCard
                  key={chain.chain_uid}
                  chain={chain}
                  searchQuery={searchQuery}
                  onRetry={handleRetry}
                  index={index}
                />
              ))}
            </motion.div>
          )}

          {/* Empty State */}
          {!isLoading && chainBalances.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground">No chains available</p>
            </motion.div>
          )}
        </FadeIn>
      </div>
    </main>
  )
}
