'use client';
import { MiniKitProvider } from '@worldcoin/minikit-js/minikit-provider';
import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

import type { ReactNode } from 'react';
import { WagmiProvider } from 'wagmi';
import { config } from '@/wagmi/config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { RainbowKitSiweNextAuthProvider } from '@rainbow-me/rainbowkit-siwe-next-auth';
import dynamic from 'next/dynamic';


const ErudaProvider = dynamic(
  () => import('@/providers/Eruda').then((c) => c.ErudaProvider),
  { ssr: false },
);

interface ClientProvidersProps {
  children: ReactNode;
  session: Session | null; // Use the appropriate type for session from next-auth
}

const queryClient = new QueryClient();

export default function ClientProviders({
  children,
  session,
}: ClientProvidersProps) {
  return (
	<WagmiProvider config={config}>
		<QueryClientProvider client={queryClient}>
			<MiniKitProvider>
				<SessionProvider session={session}>
					<RainbowKitSiweNextAuthProvider>
						<RainbowKitProvider>
							<ErudaProvider>
								{children}
							</ErudaProvider>
						</RainbowKitProvider>
					</RainbowKitSiweNextAuthProvider>
				</SessionProvider>
			</MiniKitProvider>
		</QueryClientProvider>
	</WagmiProvider>
  );
}
