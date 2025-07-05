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
import { ec as EC } from 'elliptic';


const ec = new EC('secp256k1');

async function deriveAesKey(sharedSecretHex: string): Promise<CryptoKey> {
	const sharedSecretBytes = new Uint8Array(Buffer.from(sharedSecretHex, 'hex'));
	const hash = await crypto.subtle.digest('SHA-256', sharedSecretBytes);
  
	return crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

async function encrypt(message: string, key: CryptoKey): Promise<{ ciphertext: ArrayBuffer, iv: Uint8Array }> {
	const textEncoder = new TextEncoder();
	// const iv = crypto.getRandomValues(new Uint8Array(12));
	// @todo fix this
	const iv = new Uint8Array([119, 89, 120, 213, 240, 241, 182, 85, 42, 241, 164, 2]);
	const encoded = textEncoder.encode(message);
	const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
	return { ciphertext, iv };
}

async function decrypt(ciphertext: ArrayBuffer, iv: Uint8Array, key: CryptoKey): Promise<string> {
	const textDecoder = new TextDecoder();
	const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
	return textDecoder.decode(decrypted);
}

export default function LogicPage() {
	const [ensName, setEnsName] = useState<string>("");
	const [walletAddress, setWalletAddress] = useState<string>("0x522F3038F78d91dADA58F8A768be7611134767D5");
	const [dankAddress, setDankAddress] = useState<string>("");

	const [keyPair, setKeyPair] = useState<EC.KeyPair | null>(null);

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
			const ensResolverAddress = await client.getEnsResolver({
				name: normalize(ensName ?? ""),
			});
			const [pubX, pubY] = await client.readContract({
				address: ensResolverAddress as `0x${string}`,
				abi: ensResolverAbi,
				functionName: 'pubkey',
				args: [namehash(normalize(ensName ?? ""))],
			}) as [string, string];
			const dankChatAddress = pubX.slice(2) + pubY.slice(2);
			console.log(dankChatAddress);
			if (dankChatAddress && dankChatAddress.length === 128) {
				setDankAddress(dankChatAddress);
			}
		})();
	}, [walletClient]);

	const onSetDankAddress = async () => {
		const key = ec.genKeyPair();
		const publicKey = key.getPublic();
		const privateKey = key.getPrivate();
		const publicKeyRaw = `${publicKey.getX().toString("hex")}${publicKey.getY().toString("hex")}`;

		console.log("publicKey", publicKeyRaw);
		console.log("privateKey", privateKey.toString("hex"));
		
		const privateKeyRaw = privateKey.toString("hex");
		const privateKeyBase64 = btoa(privateKeyRaw.slice(2));
		localStorage.setItem('dankChatPrivateKey', privateKeyBase64);

		const ensResolverAddress = await client.getEnsResolver({
			name: normalize(ensName ?? ""),
		});
		console.log("publicKeyRaw", `0x${publicKeyRaw}`);
		console.log("ensResolverAddress", ensResolverAddress);
		if (!walletClient) return;
		await walletClient.writeContract({
			address: ensResolverAddress as `0x${string}`,
			abi: ensResolverAbi,
			functionName: 'setPubkey',
			args: [namehash(normalize(ensName ?? "")), `0x${Buffer.from(publicKeyRaw.slice(1, 33)).toString('hex')}`, `0x${Buffer.from(publicKeyRaw.slice(33, 65)).toString('hex')}`],
		});
		setKeyPair(key);
	};

	const onSendMessage = async () => {
		if (!keyPair) return;
		console.log("message", message);
		console.log("recipient", recipient);

		const messageKeyPair = ec.genKeyPair();
		const recipientPublicKey = recipient.startsWith('0x') ? recipient.slice(2) : recipient;
		const importedPublicKey = ec.keyFromPublic({
			x: recipientPublicKey.slice(0, 64),
			y: recipientPublicKey.slice(64, 128)
		});
		console.log("importedPublicKey", importedPublicKey.getPublic().getX().toString("hex"), importedPublicKey.getPublic().getY().toString("hex"));
		const sharedSecret = messageKeyPair.derive(importedPublicKey.getPublic());
		console.log("sharedSecret", sharedSecret.toString("hex"));

		const aesEncryptionKey = await deriveAesKey(sharedSecret.toString("hex"));
		const { ciphertext } = await encrypt(message, aesEncryptionKey);

		console.log("encryptedMessage", btoa(String.fromCharCode(...new Uint8Array(ciphertext))));
		console.log(Buffer.from(await crypto.subtle.digest('SHA-256', new Uint8Array(Buffer.from(sharedSecret.toString("hex"), 'hex')))).toString('hex'));
		const response = await fetch('https://proto-dankmessaging-production.up.railway.app/messages', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				message: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
				ephemeral_pubkey: `${messageKeyPair.getPublic().getX().toString("hex")}${messageKeyPair.getPublic().getY().toString("hex")}`,
				search_index: Buffer.from(await crypto.subtle.digest('SHA-256', new Uint8Array(Buffer.from(sharedSecret.toString("hex"), 'hex')))).toString('hex')
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
			let importedPublicKey: EC.KeyPair | null = null;
			let sharedSecret: any | null = null;
			try {
				importedPublicKey = ec.keyFromPublic({
					x: key.slice(0, 64),
					y: key.slice(64, 128)
				});
				sharedSecret = keyPair?.derive(importedPublicKey.getPublic());
			} catch (error) {
				console.log("error", error);
				continue;
			}
			console.log("sharedSecret", sharedSecret.toString("hex"));
			const hashedSharedSecret = Buffer.from(await crypto.subtle.digest('SHA-256', new Uint8Array(Buffer.from(sharedSecret.toString("hex"), 'hex')))).toString('hex');
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
			const derivedAesKey = await deriveAesKey(sharedSecret.toString("hex"));
			if (messages.length > 0) {
				for (const message of messages) {
					console.log("message", message);
					const decryptedMessage = await decrypt(message.message, new Uint8Array([119, 89, 120, 213, 240, 241, 182, 85, 42, 241, 164, 2]), derivedAesKey);
					console.log("decryptedMessage", decryptedMessage);
					const [sender, rawMessage] = decryptedMessage.split(": ");
					decryptedMessages.push({
						message: rawMessage,
						submit_time: message.submit_time,
						sender: sender
					});
				}
			}
		}
		console.log("decryptedMessages", decryptedMessages);
	}

  return (
	<div className='flex flex-col items-center justify-center'>
		<h1>Chat</h1>
		<ConnectButton />
		<h2>1. Your ENS Name: {ensName || "Not set"}</h2>
		{dankAddress && (
			<div className='flex flex-row gap-2'>
				<h2>2. Your Resolved Dank Chat Address: 0x{dankAddress}</h2>
				<button onClick={onSetDankAddress}>(Regenerate)</button>
			</div>
		)}
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
