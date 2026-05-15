/**
 * @file lib/wagmi.ts
 * @description Wagmi config for 0G Mainnet wallet connection.
 */

import { createConfig, http } from 'wagmi'
import { defineChain }        from 'viem'
import { injected }           from 'wagmi/connectors'

// Define 0G Mainnet as a custom chain
export const zgMainnet = defineChain({
  id:   16661,
  name: '0G Mainnet',
  nativeCurrency: {
    decimals: 18,
    name:     'OG',
    symbol:   'OG',
  },
  rpcUrls: {
    default: { http: ['https://evmrpc.0g.ai'] },
  },
  blockExplorers: {
    default: {
      name: 'ChainScan',
      url:  'https://chainscan.0g.ai',
    },
  },
})

// Wagmi config — supports injected wallets (MetaMask, Rabby)
export const wagmiConfig = createConfig({
  chains:      [zgMainnet],
  connectors:  [injected()],
  transports:  { [zgMainnet.id]: http() },
})