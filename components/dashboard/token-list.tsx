"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AnimatePresence, motion } from "framer-motion"
import type { Token } from "@/lib/types"
import { formatBalance } from "@/lib/utils"

interface TokenListProps {
  tokens: Token[]
  searchQuery: string
  chainName: string
}

export function TokenList({ tokens, searchQuery, chainName }: TokenListProps) {
  const filteredTokens = tokens.filter((token) => token.token_id.toLowerCase().includes(searchQuery.toLowerCase()))

  if (filteredTokens.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center py-8"
      >
        <p className="text-sm text-muted-foreground">No tokens found matching "{searchQuery}"</p>
      </motion.div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border/30">
          <TableHead>Token</TableHead>
          <TableHead className="text-right">Balance</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <AnimatePresence mode="popLayout">
          {filteredTokens.map((token, index) => (
            <motion.tr
              key={`${chainName}-${token.token_id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                ease: "easeInOut",
              }}
              className="border-border/30"
            >
              <TableCell className="py-3">
                <Badge variant="outline" className="font-mono">
                  {token.token_id}
                </Badge>
              </TableCell>
              <TableCell className="text-right py-3 font-mono">
                {formatBalance(Number.parseFloat(token.amount), 2)}
              </TableCell>
            </motion.tr>
          ))}
        </AnimatePresence>
      </TableBody>
    </Table>
  )
}
