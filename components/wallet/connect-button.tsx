"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useAccount, useDisconnect } from "wagmi"
import { WalletModal } from "@/components/wallet/wallet-modal"

export function ConnectButton() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  const displayAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Wallet"

  const handleClick = () => {
    if (isConnected) {
      disconnect()
    } else {
      setIsModalOpen(true)
    }
  }

  return (
    <>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
        <Button onClick={handleClick} size="lg" className="px-6 py-3 text-base font-medium">
          {isConnected ? displayAddress : "Connect Wallet"}
        </Button>
      </motion.div>
      <WalletModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  )
}
