// lib/ChatContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useSession } from 'next-auth/react';
import { keccak256 } from 'js-sha3';
import { ec as EC } from 'elliptic';
import { config } from '@/wagmi/config';
import { getEnsAddress, getEnsName, getEnsText } from '@wagmi/core';
import BN from 'bn.js';
import { sepolia } from 'viem/chains';

import { decrypt, deriveAesKey, encrypt, verifySignature, recoverPublicKey } from '@/helpers/crypto';
import { normalize } from 'path';


interface Message {
  fromMe: boolean;
  unread: boolean;
  text: string;
  time: string;
}

interface Contact {
  id: number;
  name: string;
  avatar: string;
  address: string;
  messages: Message[];
}

interface ChatContextType {
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
  sendMessage: (message: string, recipient: string) => Promise<void>;
  startNewChat: (textInput: string) => Promise<number | null>;
  registered: boolean;
}

interface StoredMessage {
  id?: number;
  recipient: string;
  message: string;
  time: string;
  fromMe: boolean;
  unread: boolean;
  name?: string;
  avatar?: string;
}

const ChatContext = createContext<ChatContextType | null>(null);

const ec = new EC('secp256k1');

/* ----------------------------- IndexedDB Helpers ----------------------------- */
const DB_NAME = 'dankchat';
const DB_VERSION = 1;
const STORE_NAME = 'messages';

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('recipient', 'recipient', { unique: false });
        store.createIndex('time', 'time', { unique: false });
      }
    };
  });
};

const saveSentMessage = async (messageData: StoredMessage): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.add(messageData);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

const getSentMessages = async (): Promise<StoredMessage[]> => {
  const db = await initDB();
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
};

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [registered, setRegistered] = useState(false);
 
  /* --------------------------------- Wallet --------------------------------- */
  const { data: walletClient } = useWalletClient();
  const { isConnected } = useAccount();
  const { status } = useSession();
  const [demoInjected, setDemoInjected] = useState(false);


  useEffect(() => {
    const initalize = async () => {
      if (!demoInjected) {
        setContacts(prev => [
          ...prev,
          {
            id: 0,
            name: 'kartik.eth',
            avatar: '/kartik.jpg',
            address: '0xdemo000000000000000000000000000000000000000000000000000000000001',
            messages: [
              { fromMe: false, unread: false, text: 'gm fren', time: new Date().toISOString() },
              { fromMe: true, unread: false, text: 'gm sir, we agreed on $1k to buy a finalist spot. Want it to your main wallet?', time: '' },
            ]
          },
          {
            id: 1,
            name: 'vitalik.eth',
            avatar: '/kartik.jpg',
            address: '0xdemo000000000000000000000000000000000000000000000000000000000002',
            messages: [
              { fromMe: true, unread: false, text: 'yo what’s up', time: new Date().toISOString() },
              { fromMe: false, unread: false, text: 'yo bro, finally using OnlyDank. Super glad to sext anonymously with you', time: '' }
            ]
        }
      ]);
      setDemoInjected(true);
    }
		setRegistered(true);

		if (!isConnected || !walletClient || !registered) return;
		console.log("Wallet connected, fetching contacts...");
		fetchContacts();
		
		const interval = setInterval(() => {
			fetchContacts();
		}, 10000);
		return () => clearInterval(interval);
    };
    initalize();
  }, [walletClient, isConnected, status, registered, demoInjected]);

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
	const decryptedMessages: { message: string, submit_time: string, sender: string, name: string }[] = [];
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

				// const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ens/${recoveredPublicKey}`, {
				// 	method: 'GET',
				// 	headers: {
				// 		'Content-Type': 'application/json',
				// 	},
				// })
				// const resolvedName = await response.json();
				// console.log("resolvedName", resolvedName);
				const resolvedName = `0x${recoveredPublicKey.slice(-40)}`;

				decryptedMessages.push({ message: rawMessage, submit_time: message.submit_time, sender: recoveredPublicKey, name: resolvedName });
			}
		}
	}

	/* -------------------------- Load Sent Messages ---------------------------- */
	const sentMessages = await getSentMessages();
	console.log("sentMessages", sentMessages);

	/* ------------------------------ Add Messages ------------------------------ */
	setContacts(prev => {
		const newContacts = [...prev];
		
		// Add received messages
		for (const message of decryptedMessages) {
			let contactId = newContacts.findIndex(contact => contact.address === message.sender);
			if (contactId === -1) {
				contactId = newContacts.length;
				newContacts.push({
					id: contactId,
					name: message.name,
          			avatar: 'None',
					address: message.sender,
					messages: []
				});
			}

			const existingMessages = newContacts[contactId]?.messages ?? [];
			const messageExists = existingMessages.some(existingMsg => existingMsg.time === message.submit_time);
			
			if (!messageExists) {
				newContacts[contactId] = {
					id: contactId,
					name: message.name,
					avatar: 'None',
					address: message.sender,
					messages: [...existingMessages, { fromMe: false, text: message.message, time: message.submit_time, unread: true }]
				};
			}
		}

		// Add sent messages from IndexedDB
		for (const sentMessage of sentMessages) {
			let contactId = newContacts.findIndex(contact => contact.address === sentMessage.recipient);
			if (contactId === -1) {
				contactId = newContacts.length;
				newContacts.push({
					id: contactId,
					avatar: sentMessage.avatar || 'None',
					name: sentMessage.name || `0x${sentMessage.recipient.slice(-40)}`,
					address: sentMessage.recipient,
					messages: []
				});
			}

			const existingMessages = newContacts[contactId]?.messages ?? [];
			const messageExists = existingMessages.some(existingMsg => existingMsg.time === sentMessage.time);
			
			if (!messageExists) {
				newContacts[contactId] = {
					id: contactId,
					name: sentMessage.name || `0x${sentMessage.recipient.slice(-40)}`,
					avatar: sentMessage.avatar || 'None',
					address: sentMessage.recipient,
					messages: [...existingMessages, { 
						fromMe: sentMessage.fromMe, 
						text: sentMessage.message, 
						time: sentMessage.time, 
						unread: sentMessage.unread 
					}]
				};
			}
		}

		// Sort messages by time for each contact
		newContacts.forEach(contact => {
			contact.messages.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
		});

		return newContacts;
	});
}

 const startNewChat = async (textInput: string): Promise<number | null> => {
  const normalized = normalize(textInput);

  try {
	let address = "";
	if (!textInput.startsWith('0x')) {
		address = await getEnsText(config, {
			key: "com.dankchat.publicKey",
			name: normalize(normalized),
			chainId: sepolia.id
		}) as string;
		console.log("address", address);
		if (!address || !address.startsWith('0x')) return null;
	} else {
		address = textInput;
	}

	const existing = contacts.find(c => c.address.toLowerCase() === address.toLowerCase());
	if (existing) return existing.id;

    const newContact = {
      id: contacts.length,
      address: address,
      name: !textInput.startsWith('0x') ? textInput : `0x${address.slice(-40)}`,
      avatar: 'None',
      messages: [],
    };

    setContacts(prev => [...prev, newContact]);
    return newContact.id;
  } catch (err) {
    console.warn('ENS resolution failed', err);
    return null;
  }
};

  const sendMessage = async (message: string, recipient: string) => {
    if (!isConnected || !walletClient || !registered) return;

	/* ----------------------------- Read MyKeyPair ----------------------------- */
	const privateKey = localStorage.getItem('com.dankchat.privateKey');
	if (!privateKey) return;
	const keyPair = ec.keyFromPrivate(privateKey, 'hex');

	/* --------------------------- Create New Keypair --------------------------- */
	const messageKeyPair = ec.genKeyPair();

	/* -------------------------- Derive Shared Secret -------------------------- */
	let recipientPublicKey = "";
	let recipientName = "";
	let recipientAddress = "";
	if (!recipient.startsWith('0x') && !recipient.startsWith('04')) {
		const resolvedAddress = await getEnsText(config, {
			key: "com.dankchat.publicKey",
			chainId: sepolia.id,
			name: recipient,
		}) as string;
		if (resolvedAddress) {
			if (resolvedAddress.startsWith('0x')) {
				recipientPublicKey = resolvedAddress.slice(2);
				recipientAddress = resolvedAddress;
			} else {
				recipientPublicKey = resolvedAddress;
				recipientAddress = `0x${resolvedAddress}`;
			}
			recipientName = recipient; // Use ENS name if available
		} else {
			return;
		}
	} else {
		recipientPublicKey = recipient.slice(2);
		recipientAddress = recipient;
		recipientName = `0x${recipient.slice(-40)}`;
	}
	console.log("recipientPublicKey", recipientPublicKey);
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
	
	const messageTime = new Date().toISOString();
	
	/* ------------------------ Save Message to IndexedDB ----------------------- */
	try {
		await saveSentMessage({
			recipient: recipientAddress, // Save the resolved address, not the ENS name
			message: message,
			time: messageTime,
			fromMe: true,
			unread: false,
			name: recipientName,
			avatar: 'None'
		});
	} catch (error) {
		console.error("Failed to save message to IndexedDB:", error);
	}

	let contactId = contacts.findIndex(contact => contact.address === recipientAddress);
	if (contactId === -1) {
		contactId = contacts.length;
	}

	/* ------------------------------- Add Message ------------------------------ */
	setContacts(prev => {
		const newContacts = [...prev];
		newContacts[contactId] = {
			id: contactId,
			name: recipientName,
			avatar: 'None',
			address: recipientAddress,
			messages: [...(prev[contactId]?.messages ?? []), { fromMe: true, text: message, time: messageTime, unread: false }]
		};
		return newContacts;
	});

	
  };

  return (
    <ChatContext.Provider value={{ contacts, setContacts, sendMessage, startNewChat, registered }}>
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
