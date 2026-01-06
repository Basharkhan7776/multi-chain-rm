
"use client"

import { useEffect } from "react"
import { useAppDispatch } from "@/lib/store/store"
import { setAddress } from "@/lib/store/features/wallet-slice"
import { useAccount } from "wagmi"

export function WalletListener() {
    const dispatch = useAppDispatch()
    const { address, isConnected } = useAccount()

    useEffect(() => {
        if (isConnected && address) {
            dispatch(setAddress(address))
        } else {
            dispatch(setAddress(undefined))
        }
    }, [isConnected, address, dispatch])

    return null
}
