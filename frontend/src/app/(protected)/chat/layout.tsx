// app/chat/layout.tsx
'use client';

import { ReactNode, useEffect } from 'react';
import ContactsPage from './contacts'; // import directly
import { Page } from '@/components/PageLayout';
import { TopBar } from '@worldcoin/mini-apps-ui-kit-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAccount, useWalletClient } from 'wagmi';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useMiniKit } from '@worldcoin/minikit-js/minikit-provider';

export default function ChatLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { isDisconnected } = useAccount();
	const { data: walletClient } = useWalletClient();
	const { isInstalled } = useMiniKit();

    useEffect(() => {
    if (isDisconnected && !isInstalled) {
        router.push('/');
    }
    }, [isDisconnected, router]);

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
        //   endAdornment={
        //     <div className="flex items-center gap-2">
        //       <Button onClick={handleDeleteAccount} size='sm' color='danger'>Delete Account</Button>
        //     </div>
        //   }
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
