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
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Formats a number using compact notation (K, M, B, T).
 * e.g. 1500 -> 1.5K, 1000000 -> 1M
 */
export function formatCompactNumber(number: number | string): string {
  const num = typeof number === "string" ? parseFloat(number) : number;
  if (isNaN(num)) return "0";

  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(num);
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
 * Formats a raw token amount by dividing by decimals and using compact notation.
 */
export function formatTokenAmount(rawAmount: string | number, decimals: number): string {
  const amount = typeof rawAmount === "string" ? parseFloat(rawAmount) : rawAmount;
  if (isNaN(amount)) return "0";
  
  const adjustedAmount = amount / Math.pow(10, decimals);
  
  // Use compact notation for the adjusted amount
  return formatCompactNumber(adjustedAmount);
}

/**
 * Helper to get the actual number value from raw amount and decimals
 */
export function getAdjustedAmount(rawAmount: string | number, decimals: number): number {
    const amount = typeof rawAmount === "string" ? parseFloat(rawAmount) : rawAmount;
    if (isNaN(amount)) return 0;
    return amount / Math.pow(10, decimals);
}

/**
 * Format balance for detailed views (e.g. Dialog).
 * Uses scientific notation for very small numbers.
 */
export function formatDetailedBalance(amount: number): string {
    if (amount > 0 && amount < 0.0001) {
        return amount.toExponential(4); // e.g. 1.2345e-5
    }
    return formatBalance(amount, 4);
}

/**
 * Format token amount for Card view (compact).
 * Returns "0..." for very small non-zero amounts.
 */
export function formatCardTokenAmount(rawAmount: string | number, decimals: number): string {
    const amount = getAdjustedAmount(rawAmount, decimals);
    
    if (amount > 0 && amount < 0.01) {
        return "0...";
    }
    
    return formatCompactNumber(amount);
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
