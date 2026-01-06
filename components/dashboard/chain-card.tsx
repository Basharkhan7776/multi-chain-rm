"use client"

import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, RotateCcw } from "lucide-react"
import { motion } from "framer-motion"
import type { ChainBalance } from "@/lib/types"
import { TokenList } from "./token-list"

interface ChainCardProps {
  chain: ChainBalance
  searchQuery: string
  onRetry?: (chainUid: string) => void
  index: number
}

export function ChainCard({ chain, searchQuery, onRetry, index }: ChainCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeInOut",
      }}
      className="font-inter"
    >
      <Card className="overflow-hidden border-border/50">
        <Accordion type="single" collapsible value={isOpen ? "open" : ""}>
          <AccordionItem value="open" className="border-none">
            <AccordionTrigger
              onClick={() => setIsOpen(!isOpen)}
              className="px-6 py-4 hover:bg-card/50 hover:no-underline transition-colors"
            >
              <div className="flex items-center gap-3 w-full">
                <span className="text-2xl">{chain.icon}</span>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-foreground">{chain.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {chain.isError
                      ? "Connection failed"
                      : `${chain.tokens.length} token${chain.tokens.length !== 1 ? "s" : ""}`}
                  </p>
                </div>
                {chain.isError && <AlertCircle className="w-5 h-5 text-destructive" />}
              </div>
            </AccordionTrigger>

            {!chain.isError && (
              <AccordionContent className="px-6 pb-4 pt-0">
                <TokenList tokens={chain.tokens} searchQuery={searchQuery} chainName={chain.name} />
              </AccordionContent>
            )}

            {chain.isError && (
              <AccordionContent className="px-6 pb-4 pt-0">
                <div className="py-6 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    {chain.errorMessage || "Failed to fetch balances"}
                  </p>
                  <Button variant="outline" size="sm" onClick={() => onRetry?.(chain.chain_uid)} className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Retry
                  </Button>
                </div>
              </AccordionContent>
            )}
          </AccordionItem>
        </Accordion>
      </Card>
    </motion.div>
  )
}
