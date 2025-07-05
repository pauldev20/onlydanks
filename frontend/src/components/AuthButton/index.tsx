'use client';
import { walletAuth } from '@/auth/wallet';
import { Button, LiveFeedback } from '@worldcoin/mini-apps-ui-kit-react';
import { useMiniKit } from '@worldcoin/minikit-js/minikit-provider';
import { useCallback, useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useSession } from "next-auth/react";
import { redirect } from 'next/navigation';
import { ec as EC } from 'elliptic';


const ec = new EC('secp256k1');

export const AuthButton = () => {
  const [isPending, setIsPending] = useState(false);
  const { isInstalled } = useMiniKit();
  const { status } = useSession();

  const onClick = useCallback(async () => {
    if (!isInstalled || isPending) {
      return;
    }
    setIsPending(true);
    try {
      await walletAuth();
    } catch (error) {
      console.error('Wallet authentication button error', error);
      setIsPending(false);
      return;
    }

    setIsPending(false);
  }, [isInstalled, isPending]);

  useEffect(() => {
    const authenticate = async () => {
      if (isInstalled && !isPending) {
        setIsPending(true);
        try {
          await walletAuth();
        } catch (error) {
          console.error('Auto wallet authentication error', error);
        } finally {
          setIsPending(false);
        }
      }
    };

    authenticate();
  }, [isInstalled, isPending]);

  useEffect(() => {
    if (status === 'authenticated') {
		const privateKey = localStorage.getItem('com.dankchat.privateKey');
		if (!privateKey) {
			const keyPair = ec.genKeyPair();
			localStorage.setItem('com.dankchat.privateKey', keyPair.getPrivate().toString('hex'));
		}
      	redirect('/chat');
    }
  }, [status]);

  if (isInstalled) {
	return (
		<LiveFeedback
		label={{
			failed: 'Failed to login',
			pending: 'Logging in',
			success: 'Logged in',
		}}
		state={isPending ? 'pending' : undefined}
		>
		<Button
			onClick={onClick}
			disabled={isPending}
			size="lg"
			variant="primary"
		>
			Login with Wallet
		</Button>
		</LiveFeedback>
	);
  }

  return (
	<ConnectButton />
  );
};
