
import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface WalletState {
    address: string | undefined
    isConnected: boolean
}

const initialState: WalletState = {
    address: undefined,
    isConnected: false,
}

export const walletSlice = createSlice({
    name: "wallet",
    initialState,
    reducers: {
        setAddress: (state, action: PayloadAction<string | undefined>) => {
            state.address = action.payload
        },
        setIsConnected: (state, action: PayloadAction<boolean>) => {
            state.isConnected = action.payload
        },
    },
})

export const { setAddress, setIsConnected } = walletSlice.actions
export default walletSlice.reducer
