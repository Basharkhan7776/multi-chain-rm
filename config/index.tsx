
import { http, createConfig } from 'wagmi'
import { mainnet, arbitrum, bsc, polygon, avalanche, optimism } from 'wagmi/chains'
import { cookieStorage, createStorage } from 'wagmi'
import { injected, walletConnect } from 'wagmi/connectors'

// Get projectId from https://cloud.reown.com for WalletConnect
export const projectId = 'bd6632f05786dd24b43484f479a29c19' // Placeholder ID

if (!projectId) {
    throw new Error('Project ID is not defined')
}

export function getConfig() {
    return createConfig({
        chains: [mainnet, arbitrum, bsc, polygon, avalanche, optimism],
        transports: {
            [mainnet.id]: http(),
            [arbitrum.id]: http(),
            [bsc.id]: http(),
            [polygon.id]: http(),
            [avalanche.id]: http(),
            [optimism.id]: http(),
        },
        connectors: [
            injected(),
            walletConnect({ projectId }),
        ],
        storage: createStorage({
            storage: cookieStorage,
        }),
        ssr: true,
    })
}
