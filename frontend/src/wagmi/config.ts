import { sepolia, worldchainSepolia, worldchain } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { siteConfig } from '@/siteConfig';
import { publicActions } from 'viem';

export const config = getDefaultConfig({
	appName: siteConfig.appName,
	projectId: '18251cd1cc994270609a687350ca7ba0',
	chains: [sepolia, worldchainSepolia, worldchain],
	ssr: true,
});

export const publicClient = config.getClient().extend(publicActions);