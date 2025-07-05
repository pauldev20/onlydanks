// lib/ChatContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useSession } from 'next-auth/react';

import { keccak256 } from 'js-sha3';
import { ec as EC } from 'elliptic';
import BN from 'bn.js';

import { decrypt, deriveAesKey, encrypt, verifySignature, recoverPublicKey } from '@/helpers/crypto';


interface Message {
  fromMe: boolean;
  text: string;
  time: string;
}

interface Contact {
  id: number;
  address: string;
  messages: Message[];
}

interface ChatContextType {
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
  sendMessage: (message: string, recipient: string) => Promise<void>;
  registered: boolean;
}

const ChatContext = createContext<ChatContextType | null>(null);

const ec = new EC('secp256k1');

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [registered, setRegistered] = useState(false);
 
  /* --------------------------------- Wallet --------------------------------- */
  const { data: walletClient } = useWalletClient();
  const { isConnected } = useAccount();
  const { status } = useSession();

  useEffect(() => {
    const initalize = async () => {
		setRegistered(true);
		if (!isConnected || !walletClient || !registered) return;
		console.log("Wallet connected, fetching contacts...");
		fetchContacts();
    };
    initalize();
  }, [walletClient, isConnected, status, registered]);

  const fetchContacts = async () => {
	/* ----------------------------- Read MyKeyPair ----------------------------- */
	const privateKey = localStorage.getItem('com.dankchat.privateKey');
	if (!privateKey) return;
	const keyPair = ec.keyFromPrivate(privateKey, 'hex');
	console.log("privateKey", keyPair.getPrivate().toString("hex"));
	console.log("publicKey", `0x${keyPair.getPublic().getX().toString("hex")}${keyPair.getPublic().getY().toString("hex")}`);

	/* ------------------------ Fetch All Ephemeral Keys ------------------------ */
	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/keys?since=1970-01-01T00:00:00.000Z&limit=100`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
	});
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	const keys = await response.json();

	/* ------------------------------- Check Keys ------------------------------- */
	const decryptedMessages: { message: string, submit_time: string, sender: string }[] = [];
	for (const key of keys) {
		/* -------------------------- Derive Shared Secret -------------------------- */
		let sharedSecret: BN | null = null;
		try {
			sharedSecret = keyPair.derive(ec.keyFromPublic({
				x: key.slice(0, 64),
				y: key.slice(64, 128)
			}).getPublic());
		} catch (error) {
			console.log("error", error);
			continue;
		}
		const hashedSharedSecretHex = Buffer.from(await crypto.subtle.digest('SHA-256', new Uint8Array(Buffer.from(sharedSecret.toString("hex"), 'hex')))).toString('hex');

		/* ----------------------------- Fetch Messages ----------------------------- */
		const messagesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/${hashedSharedSecretHex}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});
		if (!messagesResponse.ok) {
			throw new Error(`HTTP error! status: ${messagesResponse.status}`);
		}

		/* ---------------------------- Decoded Messages ---------------------------- */
		const messages = await messagesResponse.json();
		if (messages.length > 0) {
			const derivedAesKey = await deriveAesKey(sharedSecret.toString("hex"));
			for (const message of messages) {
				const ciphertextArrayBuffer = Uint8Array.from(atob(message.message), c => c.charCodeAt(0)).buffer;
				const decryptedMessage = await decrypt(ciphertextArrayBuffer, new Uint8Array([119, 89, 120, 213, 240, 241, 182, 85, 42, 241, 164, 2]), derivedAesKey);
				const [signature, rawMessage] = decryptedMessage.split(": ");
				const recoveredPublicKey = recoverPublicKey(rawMessage, signature);
				const isSignatureValid = verifySignature(rawMessage, signature, recoveredPublicKey);
				if (!isSignatureValid) {
					console.log("Invalid Signature found, skipping message...");
					continue;
				}

				decryptedMessages.push({ message: rawMessage, submit_time: message.submit_time, sender: recoveredPublicKey });
			}
		}
	}

	/* ------------------------------ Add Messages ------------------------------ */
	setContacts(prev => {
		const newContacts = [...prev];
		for (const message of decryptedMessages) {
			let contactId = newContacts.findIndex(contact => contact.address === message.sender);
			if (contactId === -1) {
				contactId = newContacts.length;
				newContacts.push({
					id: contactId,
					address: message.sender,
					messages: []
				});
			}
			newContacts[contactId] = {
				id: contactId,
				address: message.sender,
				messages: [...(newContacts[contactId]?.messages ?? []), { fromMe: false, text: message.message, time: message.submit_time }]
			};
		}
		return newContacts;
	});
  }

  const sendMessage = async (message: string, recipient: string) => {
    if (!isConnected || !walletClient || !registered) return;

	/* ----------------------------- Read MyKeyPair ----------------------------- */
	const privateKey = localStorage.getItem('com.dankchat.privateKey');
	if (!privateKey) return;
	const keyPair = ec.keyFromPrivate(privateKey, 'hex');

	/* --------------------------- Create New Keypair --------------------------- */
	const messageKeyPair = ec.genKeyPair();

	/* -------------------------- Derive Shared Secret -------------------------- */
	const recipientPublicKey = recipient.startsWith('0x') ? recipient.slice(2) : recipient;
	const importedPublicKey = ec.keyFromPublic({
		x: recipientPublicKey.slice(0, 64),
		y: recipientPublicKey.slice(64, 128)
	});
	const sharedSecret = messageKeyPair.derive(importedPublicKey.getPublic());

	/* ------------------------------ Sign Message ------------------------------ */
	const messageHash = keccak256(Buffer.from(message));
	const signature = keyPair.sign(messageHash, { canonical: true });
	const signatureHex = signature.r.toString(16).padStart(64, '0') + signature.s.toString(16).padStart(64, '0') + signature.recoveryParam!.toString(16).padStart(2, '0');

	/* ---------------------------- Encrypt Message ----------------------------- */
	const toEncrypt = `${signatureHex}: ${message}`;
	const aesEncryptionKey = await deriveAesKey(sharedSecret.toString("hex"));
	const { ciphertext } = await encrypt(toEncrypt, aesEncryptionKey);

	/* ------------------------------ Send Message ------------------------------ */
	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
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
	let contactId = contacts.findIndex(contact => contact.address === recipient);
	if (contactId === -1) {
		contactId = contacts.length;
	}

	/* ------------------------------- Add Message ------------------------------ */
	setContacts(prev => {
		const newContacts = [...prev];
		newContacts[contactId] = {
			id: contactId,
			address: recipient,
			messages: [...(prev[contactId]?.messages ?? []), { fromMe: true, text: message, time: new Date().toISOString() }]
		};
		return newContacts;
	});
  };

  return (
    <ChatContext.Provider value={{ contacts, setContacts, sendMessage, registered }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
