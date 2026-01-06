
import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface WalletState {
    address: string | undefined
}

const initialState: WalletState = {
    address: undefined,
}

export const walletSlice = createSlice({
    name: "wallet",
    initialState,
    reducers: {
        setAddress: (state, action: PayloadAction<string | undefined>) => {
            state.address = action.payload
        },
    },
})

export const { setAddress } = walletSlice.actions
export default walletSlice.reducer
