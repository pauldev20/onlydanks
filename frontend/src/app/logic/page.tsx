'use client';

import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { normalize, namehash } from 'viem/ens';
import { useState, useEffect } from 'react';
import { isAddress } from 'viem'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { getWalletClient } from '@wagmi/core';
import { config } from '@/wagmi/config';
import ensResolverAbi from '@/abi/ENSPublicResolver.json';
import { useWalletClient } from 'wagmi'



export default function LogicPage() {
	const [ensName, setEnsName] = useState<string>("");
	const [walletAddress, setWalletAddress] = useState<string>("0x522F3038F78d91dADA58F8A768be7611134767D5");
	const [dankAddress, setDankAddress] = useState<string>("");

	const [keyPair, setKeyPair] = useState<CryptoKeyPair | null>(null);

	const [message, setMessage] = useState<string>("");
	const [recipient, setRecipient] = useState<string>("");
	const [lastReceivedMessage, setLastReceivedMessage] = useState<string>("");

	const { data: walletClient } = useWalletClient();

	const client = createPublicClient({
		chain: sepolia,
		transport: http('https://ethereum-sepolia-rpc.publicnode.com'),
	});

	useEffect(() => {
		(async () => {
			if (!walletClient) return;
			const ensName = await client.getEnsName({
				address: walletClient.account.address,
			});
			setEnsName(ensName ?? "");
			const dankChatAddress = await client.getEnsText({
				name: normalize(ensName ?? ""),
				key: 'com.dankchat',
			});
			if (dankChatAddress && isAddress(dankChatAddress)) {
				setDankAddress(dankChatAddress);
			}
		})();
	}, []);

	const onSetDankAddress = async () => {
		const myKeyPair = await crypto.subtle.generateKey(
			{ name: "ECDH", namedCurve: "P-256" },
			true,
			["deriveBits"]
		);
		const publicKeyRaw = await crypto.subtle.exportKey("raw", myKeyPair.publicKey);
		
		const privateKeyRaw = await crypto.subtle.exportKey("pkcs8", myKeyPair.privateKey);
		const privateKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(privateKeyRaw)));
		localStorage.setItem('dankChatPrivateKey', privateKeyBase64);
		
		const ensResolverAddress = await client.getEnsResolver({
			name: normalize(ensName ?? ""),
		});
		console.log("publicKeyRaw", `0x${Buffer.from(publicKeyRaw).toString('hex')}`);
		console.log("ensResolverAddress", ensResolverAddress);
		if (!walletClient) return;
		await walletClient.writeContract({
			address: ensResolverAddress as `0x${string}`,
			abi: ensResolverAbi,
			functionName: 'setText',
			args: [namehash(normalize(ensName ?? "")), 'com.dankchat', `0x${Buffer.from(publicKeyRaw).toString('hex')}`],
		});
		setKeyPair(myKeyPair);
	};

	const onSendMessage = async () => {
		if (!keyPair) return;
		console.log("message", message);
		console.log("recipient", recipient);
		const messageKeyPair = await crypto.subtle.generateKey(
			{ name: "ECDH", namedCurve: "P-256" },
			true,
			["deriveKey"]
		);
		const importedPublicKey = await crypto.subtle.importKey(
			"raw",
			Buffer.from(recipient.slice(2), 'hex'),
			{ name: "ECDH", namedCurve: "P-256" },
			true,
			[]
		);
		console.log("importedPublicKey", `0x${Buffer.from(await crypto.subtle.exportKey("raw", importedPublicKey)).toString('hex')}`);
		const sharedSecret = await crypto.subtle.deriveKey(
			{
			  name: "ECDH",
			  public: importedPublicKey,
			},
			messageKeyPair.privateKey,
			{
				name: "AES-GCM",
				length: 256,
			},
			true,
			["encrypt", "decrypt"]
		);
		console.log("sharedSecret", sharedSecret);
		const encryptedMessage = await crypto.subtle.encrypt(
			{
				name: "AES-GCM",
				iv: crypto.getRandomValues(new Uint8Array(12)),
			},
			sharedSecret,
			new TextEncoder().encode(message)
		);
		console.log("encryptedMessage", `0x${Buffer.from(encryptedMessage).toString('hex')}`);
		const response = await fetch('https://proto-dankmessaging-production.up.railway.app/messages', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				message: message,
				ephemeral_pubkey: `${Buffer.from(await crypto.subtle.exportKey("raw", messageKeyPair.publicKey)).toString('hex')}`,
				search_index: `${Buffer.from(await crypto.subtle.exportKey('raw', sharedSecret)).toString('hex')}`
			})
		});
	
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
	
		const result = await response.json();
		console.log("Message sent successfully:", result);
	};

  return (
	<div className='flex flex-col items-center justify-center'>
		<h1>Chat</h1>
		<ConnectButton />
		<h2>1. Your ENS Name: {ensName || "Not set"}</h2>
		{dankAddress && <h2>2. Your Resolved Dank Chat Address: {dankAddress}</h2>}
		{!dankAddress && <button onClick={onSetDankAddress}>2. Generate Dank Account & Set Address</button>}
		<div className='flex flex-row gap-2'>
			<h2>3.Send Message</h2>
			<input type="text" placeholder="Recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
			<input type="text" placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} />
			<button onClick={onSendMessage}>Send</button>
		</div>
		<h2>4. Read Message: {lastReceivedMessage}</h2>
	</div>
  );
}
