// app/chat/layout.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import ContactsPage from './contacts'; // import directly
import { Page } from '@/components/PageLayout';
import { Button, TopBar } from '@worldcoin/mini-apps-ui-kit-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useAccount, useWalletClient } from 'wagmi';
import { disconnect } from '@wagmi/core'
import { config } from '@/wagmi/config';
import { worldchainSepolia } from 'viem/chains';
import ensRegistryAbi from "@/abi/ENSRegistry.json";
import { namehash, normalize } from 'viem/ens';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export default function ChatLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { isDisconnected } = useAccount();
	const { data: walletClient } = useWalletClient();

    useEffect(() => {
    if (isDisconnected) {
        router.push('/');
    }
    }, [isDisconnected, router]);

	const handleDeleteAccount = async () => {
		if (!walletClient) return;
		const ensName = localStorage.getItem('com.dankchat.ensName');
		if (!ensName) return;
		await walletClient.switchChain(worldchainSepolia);
		await walletClient.writeContract({
			address: process.env.NEXT_PUBLIC_REGISTRY as `0x${string}`,
			abi: ensRegistryAbi,
			functionName: 'setText',
			chain: worldchainSepolia,
			args: [namehash(normalize(ensName)), "com.dankchat.publicKey", ""],
		});

		localStorage.removeItem('com.dankchat.privateKey');

		const request = indexedDB.deleteDatabase('dankchat');
		request.onsuccess = () => {
			console.log('IndexedDB cleared successfully');
		};
		request.onerror = () => {
			console.error('Error clearing IndexedDB:', request.error);
		};

		await disconnect(config);

		signOut({
			redirectTo: '/',
		});
	}
    const isChatPage = pathname?.match(/^\/chat\/\d+$/); // matches /chat/0, /chat/1 etc


  return (
    <>
        <Page.Header className="p-0">
        <TopBar
          title="OnlyDanks"
          className="text-black font-extrabold"
          startAdornment={
            <Image 
            src="/odlogo.png" 
            alt="OnlyDanks" 
            width={24} 
            height={24}
            className="w-12 h-12 rounded-full"
            />
          }
          endAdornment={
            <div className="flex items-center gap-2">
              <Button onClick={handleDeleteAccount} size='sm' color='danger'>Delete Account</Button>
            </div>
          }
        />
      </Page.Header>
    <div className="flex h-screen overflow-hidden">
        {(!isChatPage || typeof window === 'undefined' || window.innerWidth >= 640) && (
          <div className="basis-full sm:basis-1/3 shrink-0 border-r border-gray-200">
            <ContactsPage />
          </div>
        )}
      <div className={clsx(
          'flex-1',
          isChatPage ? 'block' : 'hidden sm:block'
        )}>
          {children}
        </div>
    </div>
    </>
  );
}
