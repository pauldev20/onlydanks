import { http, createConfig } from 'wagmi'
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains'

export const config = getDefaultConfig({
	appName: 'My RainbowKit App',
	projectId: '18251cd1cc994270609a687350ca7ba0',
	chains: [sepolia],
	ssr: true,
});