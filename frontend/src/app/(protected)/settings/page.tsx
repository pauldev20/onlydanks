'use client';

import { Button } from "@worldcoin/mini-apps-ui-kit-react";
import { MiniKit } from "@worldcoin/minikit-js";
import { worldchainSepolia } from "viem/chains";
import { normalize, namehash } from "viem/ens";
import { disconnect } from "@wagmi/core";
import { signOut } from "next-auth/react";
import { useMiniKit } from "@worldcoin/minikit-js/minikit-provider";
import { useWalletClient } from "wagmi";
import ensRegistryAbi from "@/abi/ENSRegistry.json";
import { config } from "@/wagmi/config";
import toast from "react-hot-toast";

export default function Settings() {
	const { isInstalled } = useMiniKit();
	const { data: walletClient } = useWalletClient();

	const handleDeleteAccount = async () => {
		try {
			if (!isInstalled && !walletClient) return;
			const ensName = localStorage.getItem('com.dankchat.ensName');
			if (!ensName) return;

			if (walletClient) {
				await walletClient.switchChain(worldchainSepolia);
			}
			if (walletClient) {
				await walletClient.writeContract({
					address: process.env.NEXT_PUBLIC_REGISTRY as `0x${string}`,
					abi: ensRegistryAbi,
					functionName: 'setText',
					chain: worldchainSepolia,
					args: [namehash(normalize(ensName)), "com.dankchat.publicKey", ""],
				});
			} else {
				const response = await MiniKit.commandsAsync.sendTransaction({
					transaction: [
						{
							address: process.env.NEXT_PUBLIC_REGISTRY!,
							abi: ensRegistryAbi,
							functionName: 'setText',
							args: [namehash(normalize(ensName)), "com.dankchat.publicKey", ""],
						},
					],
				});
				if (response.finalPayload.status !== 'success') {
					console.error('Error deleting ENS', response.finalPayload.error_code);
					return;
				}
			}

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
		} catch (error) {
			toast.error('Error deleting account');
		}
	}

    return (
        <div className="flex flex-col items-center justify-center h-full">
            <Button size="sm" onClick={handleDeleteAccount}>
                Delete Account
            </Button>
        </div>
    );
}