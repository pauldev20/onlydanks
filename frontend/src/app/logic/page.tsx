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
import * as secp from '@noble/secp256k1';




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
			console.log(crypto.getRandomValues(new Uint8Array(12)), "iv");
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
	}, [walletClient]);

	const onSetDankAddress = async () => {
		const myKeyPair = await crypto.subtle.generateKey(
			{ name: "ECDH", namedCurve: "P-256" },
			true,
			["deriveBits", "deriveKey"]
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
				iv: new Uint8Array([119, 89, 120, 213, 240, 241, 182, 85, 42, 241, 164, 2]),
			},
			sharedSecret,
			new TextEncoder().encode(`${Buffer.from(await crypto.subtle.exportKey("raw", keyPair.publicKey)).toString('hex')}: ${message}`)
		);
		console.log("encryptedMessage", btoa(String.fromCharCode(...new Uint8Array(encryptedMessage))));
		console.log(Buffer.from(await crypto.subtle.exportKey("raw", messageKeyPair.publicKey)).toString('hex'));
		const response = await fetch('https://proto-dankmessaging-production.up.railway.app/messages', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				message: btoa(String.fromCharCode(...new Uint8Array(encryptedMessage))),
				ephemeral_pubkey: `${Buffer.from(await crypto.subtle.exportKey("raw", messageKeyPair.publicKey)).toString('hex')}`,
				search_index: `${Buffer.from(await crypto.subtle.digest('SHA-256', await crypto.subtle.exportKey('raw', sharedSecret))).toString('hex')}`
			})
		});
	
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		console.log("Message sent successfully:", response);
	};

	const readMessages = async () => {
		if (!keyPair) return;
		const response = await fetch(`https://proto-dankmessaging-production.up.railway.app/keys?since=1970-01-01T00:00:00.000Z`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const keys = await response.json();
		console.log("Keys:", keys);
		const decryptedMessages: { message: string, submit_time: string, sender: string }[] = [];
		for (const key of keys) {
			const sharedSecret = await crypto.subtle.deriveKey(
				{
				  name: "ECDH",
				  public: await crypto.subtle.importKey("raw", Buffer.from(key, 'hex'), { name: "ECDH", namedCurve: "P-256" }, true, []),
				},
				keyPair.privateKey,
				{
					name: "AES-GCM",
					length: 256,
				},
				true,
				["encrypt", "decrypt"]
			);
			console.log("sharedSecret", sharedSecret);
			const hashedSharedSecret = await crypto.subtle.digest('SHA-256', await crypto.subtle.exportKey('raw', sharedSecret));
			console.log("hashedSharedSecret", hashedSharedSecret);
			const response = await fetch(`https://proto-dankmessaging-production.up.railway.app/messages/${Buffer.from(hashedSharedSecret).toString('hex')}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const messages = await response.json();
			if (messages.length > 0) {
				for (const message of messages) {
					console.log("message", message);
					const decryptedMessage = await crypto.subtle.decrypt(
						{
							name: "AES-GCM",
							iv: new Uint8Array([119, 89, 120, 213, 240, 241, 182, 85, 42, 241, 164, 2]),
						},
						sharedSecret,
						Buffer.from(message.message, 'base64')
					);
					const decodedMessage = new TextDecoder().decode(decryptedMessage);
					const [sender, rawMessage] = decodedMessage.split(": ");
					decryptedMessages.push({
						message: rawMessage,
						submit_time: message.submit_time,
						sender: sender
					});
				}
			}
			console.log("decryptedMessages", decryptedMessages);
		}
		console.log("decryptedMessages", decryptedMessages);
	}

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
		<div className='flex flex-row gap-2'>
			<h2>4. Read Message: {lastReceivedMessage}</h2>
			<button onClick={readMessages}>Read Messages</button>
		</div>
	</div>
  );
}
