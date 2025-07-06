'use client';
import { walletAuth } from '@/auth/wallet';
import { Button, Input, LiveFeedback, Spinner } from '@worldcoin/mini-apps-ui-kit-react';
import { useMiniKit } from '@worldcoin/minikit-js/minikit-provider';
import { useCallback, useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useSession } from "next-auth/react";
import { redirect } from 'next/navigation';
import { ec as EC } from 'elliptic';
import { useChat } from '@/providers/ChatContext';
import { worldchainSepolia } from 'viem/chains';
import ensRegistrarAbi from '@/abi/L2Registrar.json';
import ensRegistryAbi from '@/abi/ENSRegistry.json';
import { useWalletClient } from 'wagmi';
import { switchChain } from 'viem/actions';
import { readContract } from '@wagmi/core';
import { config } from '@/wagmi/config';
import { normalize, namehash } from 'viem/ens';
import { waitForTransactionReceipt } from '@wagmi/core'
import { MiniKit } from '@worldcoin/minikit-js';
import toast from 'react-hot-toast';


const ec = new EC('secp256k1');

export const AuthButton = () => {
  const [isPending, setIsPending] = useState(false);
  const { data: walletClient } = useWalletClient();
  const [ensName, setEnsName] = useState('');
  const { isInstalled } = useMiniKit();
  const { registered, setRegistered } = useChat();
  const { status, data: session } = useSession();

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

  // Auto login
//   useEffect(() => {
//     const authenticate = async () => {
//       if (isInstalled && !isPending) {
//         setIsPending(true);
//         try {
//           await walletAuth();
//         } catch (error) {
//           console.error('Auto wallet authentication error', error);
//         } finally {
//           setIsPending(false);
//         }
//       }
//     };

//     authenticate();
//   }, [isInstalled, isPending]);

  useEffect(() => {
    if (status === 'authenticated') {
		if (registered) {
			redirect('/chat');
		} else {
			const privateKey = localStorage.getItem('com.dankchat.privateKey');
			if (privateKey) {
				redirect('/chat');
			}
		}
    }
  }, [status, registered]);

  const handleSubmit = async () => {
	if (!isInstalled && !walletClient) return;
	setIsPending(true);
	try {
		const walletAddress = isInstalled ? session?.user?.id : walletClient?.account.address;
		const domainOwner = await readContract(config, {
			address: process.env.NEXT_PUBLIC_REGISTRY as `0x${string}`,
			abi: ensRegistryAbi,
			functionName: 'owner',
			chainId: worldchainSepolia.id,
			args: [namehash(normalize(ensName + ".onlydanks.eth"))],
		});
		if (
			domainOwner !== "0x0000000000000000000000000000000000000000"
			&& domainOwner !== walletAddress
		) {
			alert("ENS name already registered");
			setEnsName("");
			return;
		}
		if (walletClient) {
			try {
				await switchChain(walletClient, {id: worldchainSepolia.id});
			} catch (error) {
				toast.error('Error switching chain');
				throw error;
			}
		}
		if (domainOwner === "0x0000000000000000000000000000000000000000") {
			try {
				if (walletClient) {
					const tx = await walletClient.writeContract({
						address: process.env.NEXT_PUBLIC_REGISTRAR as `0x${string}`,
						abi: ensRegistrarAbi,
						functionName: 'register',
						chain: worldchainSepolia,
						args: [ensName, walletClient.account.address],
					});
					await waitForTransactionReceipt(config, {hash: tx});
				} else {
					const response = await MiniKit.commandsAsync.sendTransaction({
						transaction: [
							{
								address: process.env.NEXT_PUBLIC_REGISTRAR!,
								abi: ensRegistrarAbi,
								functionName: 'register',
								args: [ensName, walletAddress],
							},
						],
					});
					if (response.finalPayload.status !== 'success') {
						console.error('Error registering ENS', response.finalPayload.error_code);
						return;
					}
				}
			} catch (error) {
				toast.error('Error registering ENS');
				throw error;
			}
		}
		const keyPair = ec.genKeyPair();
		localStorage.setItem('com.dankchat.privateKey', keyPair.getPrivate().toString('hex'));
		const publicKey = `${keyPair.getPublic().getX().toString("hex")}${keyPair.getPublic().getY().toString("hex")}`;
		try {
			if (walletClient) {
				const tx2 = await walletClient.writeContract({
					address: process.env.NEXT_PUBLIC_REGISTRY as `0x${string}`,
					abi: ensRegistryAbi,
					functionName: 'setText',
					chain: worldchainSepolia,
					args: [namehash(normalize(ensName + ".onlydanks.eth")), "com.dankchat.publicKey", publicKey],
				});
				await waitForTransactionReceipt(config, {hash: tx2});
			} else {
				const response = await MiniKit.commandsAsync.sendTransaction({
					transaction: [
						{
							address: process.env.NEXT_PUBLIC_REGISTRY!,
							abi: ensRegistryAbi,
							functionName: 'setText',
							args: [namehash(normalize(ensName + ".onlydanks.eth")), "com.dankchat.publicKey", publicKey],
						},
					],
				});
				if (response.finalPayload.status !== 'success') {
					console.error('Error setting ENS text', response.finalPayload.error_code);
					return;
				}
			}
		} catch (error) {
			console.error('Error setting ENS text', error);
			throw error;
		}
		localStorage.setItem('com.dankchat.ensName', ensName + ".onlydanks.eth");
		await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ens`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				subdomain: ensName + ".onlydanks.eth",
				address: publicKey,
			}),
		});
		setRegistered(true);
	} catch (error) {
		console.error("Error", error);
	} finally {
		setIsPending(false);
	}
  }

  if (isInstalled && status !== 'authenticated') {
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

  if (status === 'authenticated' && !registered) {
	if (isPending) {
		return <Spinner />;
	}
	return (
		<div className="flex flex-row gap-2 items-center">
			<Input label="Enter your ENS name" endAdornment={
				<p>.onlydanks.eth</p>
			} value={ensName} onChange={(e) => setEnsName(e.target.value)} />
			<Button size="sm" variant="primary" onClick={handleSubmit}>Submit</Button>
		</div>
	);
  }

  return (
	<ConnectButton />
  );
};
