"use client"

import { Card } from "@/components/ui/card"
import { motion } from "framer-motion"
import type { GlobalBalance } from "@/lib/types"
import { formatBalance } from "@/lib/utils"

interface HeaderBalanceProps {
  balances: GlobalBalance
  isLoading: boolean
}

export function HeaderBalance({ balances, isLoading }: HeaderBalanceProps) {
  const totalUSDC = balances.vUSDC || 0
  const totalETH = balances.vETH || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="mb-6"
    >
      <Card className="border-border/50 bg-card/50 p-6 md:p-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Total vUSDC Balance</p>
            <motion.p
              key={`usdc-${totalUSDC}`}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-3xl font-bold text-foreground"
            >
              {isLoading ? "-" : formatBalance(totalUSDC, 2)} vUSDC
            </motion.p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Total vETH Balance</p>
            <motion.p
              key={`eth-${totalETH}`}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-3xl font-bold text-foreground"
            >
              {isLoading ? "-" : formatBalance(totalETH, 4)} vETH
            </motion.p>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
