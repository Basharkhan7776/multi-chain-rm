import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number to a readable balance string
 */
export function formatBalance(amount: number, decimals = 2): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  })
}

/**
 * Calculate global totals by summing balances across all chains
 */
export function calculateGlobalTotals(tokenLists: Array<Array<{ token_id: string; amount: string }>>) {
  const totals: Record<string, number> = {}

  tokenLists.forEach((tokens) => {
    tokens.forEach(({ token_id, amount }) => {
      const parsedAmount = Number.parseFloat(amount)
      if (!Number.isNaN(parsedAmount)) {
        totals[token_id] = (totals[token_id] || 0) + parsedAmount
      }
    })
  })

  return totals
}

/**
 * Debounce function to delay function execution
 */
export function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}
