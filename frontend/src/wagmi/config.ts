import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia } from 'wagmi/chains'
import { siteConfig } from '@/siteConfig';
import { publicActions } from 'viem';

export const config = getDefaultConfig({
	appName: siteConfig.appName,
	projectId: '18251cd1cc994270609a687350ca7ba0',
	chains: [sepolia],
	ssr: true,
});

export const publicClient = config.getClient().extend(publicActions);