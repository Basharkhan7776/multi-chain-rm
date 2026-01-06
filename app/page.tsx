"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ConnectButton } from "@/components/wallet/connect-button"
import { setAddress } from "@/lib/store/features/wallet-slice"
import { useAppDispatch } from "@/lib/store/store"
import { useAccount } from "wagmi"
import { FadeIn } from "@/components/shared/fade-in"
import { motion } from "framer-motion"

import { Suspense } from "react"
// ... imports

function LandingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const { address, isConnected } = useAccount()

  // Handle query param
  useEffect(() => {
    const addrParam = searchParams.get('addr')
    if (addrParam) {
      dispatch(setAddress(addrParam))
      router.push("/dashboard")
    }
  }, [searchParams, dispatch, router])

  // Handle wallet connection
  useEffect(() => {
    if (isConnected && address) {
      dispatch(setAddress(address))
      router.push("/dashboard")
    }
  }, [isConnected, address, dispatch, router])

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <FadeIn duration={0.6} className="w-full max-w-2xl">
        <div className="text-center space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeInOut" }}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">The Future of Multichain Assets</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Track and manage your token balances across multiple blockchain networks in one unified dashboard.
            </p>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeInOut" }}
          >
            <ConnectButton />
          </motion.div>
        </div>
      </FadeIn>
    </main>
  )
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LandingContent />
    </Suspense>
  )
}
