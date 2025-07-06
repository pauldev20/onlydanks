// lib/ChatContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { useSession } from 'next-auth/react';
import { keccak256 } from 'js-sha3';
import { ec as EC } from 'elliptic';
import { config } from '@/wagmi/config';
import { getEnsText } from '@wagmi/core';
import BN from 'bn.js';
import { usePathname } from 'next/navigation';
import { useMiniKit } from '@worldcoin/minikit-js/minikit-provider';

import { decrypt, deriveAesKey, encrypt, verifySignature, recoverPublicKey } from '@/helpers/crypto';
import { normalize } from 'path';
import { mainnet, worldchain } from 'viem/chains';


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
  setRegistered: (registered: boolean) => void;
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
	if (typeof window === 'undefined') return;
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
  const [demoInjected, setDemoInjected] = useState(false);
  const [registered, setRegistered] = useState(false);
  const { isInstalled } = useMiniKit();
  const pathname = usePathname();
 
  /* --------------------------------- Wallet --------------------------------- */
  const { data: walletClient } = useWalletClient();
  const { isConnected } = useAccount();
  const { status } = useSession();



  useEffect(() => {
	if (isConnected && walletClient && pathname !== '/') {
		setRegistered(true);
	}

    const initalize = async () => {
      if (!demoInjected && localStorage.getItem("demo") === "true") {
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
        },
		{
			id: 2,
			name: 'fabian.eth',
			avatar: '/kartik.jpg',
			address: '0xdemo000000000000000000000000000000000000000000000000000000000003',
			messages: [
				{ fromMe: false, unread: false, text: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABwcHBwcHDAcHDBEMDAwRFxEREREXHRcXFxcXHSMdHR0dHR0jIyMjIyMjIyoqKioqKjExMTExNzc3Nzc3Nzc3NwBIiQkODQ4YDQ0YOacgJzm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5ubm5v/CABEIA40C6gMBIgACEQEDEQH/xAAaAAADAQEBAQAAAAAAAAAAAAAAAQIDBAUG/9oACAEBAAAAAPayxBz5IwBgwBgAMBMHv2agAAghCAQwAAAAEwQDQmgfZjiDjyhgDTIiqsGAwAAHt2bMQAESIBDAAABoAAQNCYJ9mOIEeWMBiBRC6WNMGDAAHp2dAIAhIQAAACYNNDEAmgADswyER5jBgAMAAGDBgxDAvq6mAoSAQAAAhgNDBAAgAOznzSI81jAGDEMABgDGAAMfV06IzQgEDEACYDQwQ00AgOzmiQy4k02JgAADYAMYJgAA+jquEIBMGhAJg0AxAAAIOzmiUZcgMGADTAABjEAwAAdaXegIAAaAEANANAAAAHXyzCOfm0tCYACBgADAAbQDQa6VVMQAAxAIGAJiAAAQzr5ZyHy5660zni0OoQAADABjAGI10dU0MQDBAAMATEIEwEM6+Scw5StLZzLWijCABgDAYMBjSemlOgGIBgJgmMEAIAQCGdfGsh8jq7b551ZT55AYDAYDGAxDvSnQwEDAAABghiAQIADq41mPkp3brmnRtvCQGAwGDBsAE71dMGAhgAAAwTBAAgQB1cayHx6l1V5ZWDeCG9FhVA2AFDBCd602DATAAAAGhgIAQCA6uOcm+LZ1Va1mkGWXR0XlEecabDY1BEHTTSd602DAAGACAGmAIAQCA6eSch8W7qq1cITw13mePPv8sno0bDPmwwT06+5hpo22MBMAABMAABACAQHTxxlT4t3VVs80CV8vLXP0en5bz12Y3wY4oc17OotdG21z5maNdtmAAAAAAgAQmb8meVVxdDqns4SQ+LiitTX0uPmvoYY81VrnFZcfsaLo2Cly821KKa26kAAAAAACAQPXlyzdcXU6b3eaip4OaerdY5vqmN0HnettGE50uLDT0zDnhXN9cdvGt5369EAAADQAAIEzXlxgrj6nVHQZy45ObHrFjKmezilJd/r6Z86zJx4tHjIqSNL7N9/PfXr1gAAAwQAACA05cZDl6nTOlZPDnxx6+vzteHFJgAep6WWWmXKaTxvDOROxs193ty8btrXpEAAMAQ0AAgvm50HN1OmbqOfDPLT08uLThykQk2er38vn+1w+ftrHMs5hJVpLddX0b816z1aCAaGAAIGgAfNzgufpqmarDCM8vV05+W+LKRInKuj1enNdHDzj4yozcp1azyvX6Pry8ztg7WJgANAAACAObBCw6XT1vn55jHX0aIjm8/NCU5Ls+hvk2fFkRxqlv3YZRVrPhNfqdjytrz06wAAyy20AAABOeXEJy6Kem2HNExHq9CfLyKOBJEZL0Pcvj6sOFxni539O885Wmh4+F/XByc/TnHR0AARxPJ9HRogAAI5ckLLen1zyYzD9nbOI8/LR8fMJRkd/sTPVjyTz1hO/r6GWObrpvyfO7/okR5nYs57NAB8KrFD36bEABnzZImNH07c/NKj2tlC8/h1ms+ERGSPW9Hn7p5ceZ8z9T1zLLDOb6a8zy/T95D8npuMr7WBjyVrgDdb7AIDPlyC2R2RhlnPT6+Znjz8lZrmlIzzR2evp08XNpz54T9B2LPPLJXdcXk+j9Ah+Xrqsp6twI8/eVNpLbqYCZjy5o0vI7Iwwzz9Pv83BrflzmedIUZIr39ljzwLm1+hnj4DrrHkfZr4X0/Wh+c9llGvaAebHRk5mXt17CAMObNGXNt1bznKPSPJ5u+5zhYZzMKMkHudUcmBpfH3ezHDycntaed52/b1eT9OIOPPdZZ6dWoBHFw+mo5r06epCA5+fIMOGvR6qShepxebHqKYiK3WWWHLyIPa78ebnrV+b7fec3PHfPLxa9W/P6eUmi87rMc736wBgD4Yy6etiA5scQ5+HLb0OyyX6Hl8d9wRlL75ywzz5vPWvrelGPItDy/o9r5+Rd+WXFp13x6OlCy6KzT17wAAaxywvtsQHNlgHNwxfRr2avo28vCutizzPRrHLGI5suivUMuWLWHp9F8vl9nbgvNn0tufUQJpTBt1bAAA/H7M1r1tAc2WAcXHS6HfXt6Eefi+yURmuzsxyxxU8rvv0586M8J9nXyOf0IzwOX0O9OQBkxE769gAAHP083K69BAc2fOHFyo6RHb7vL5+a6iWQ9e+MsMcyMp19HjnfHni/S6PL5u/p5jgx7+qnLAJiWr7tQAAeL58Fn7Ig5o5g4eLRdIj2e/j4oVtunG3cZY45TKiOzPPfni726853w5X0cexpdJBEQp6vQoAAAnBcnH28fvUHNHMHn8zOkF9KuPlUtuizXquMscspSVJbZJXfba05eK+vFcum9tSoznr9CgAABmWJjz9EX3Ucq5Q4OdHSLf6Pn5OZTrvw6Oup1q88s8c0OYeky3r6SJx51vPPyPTa1KXX32kAAAM5peWFd+Gmz5Vyh5+A9w9D1+fl51Ovr/OdeGnq5WaTnnjnCtZO1Dvt6Hi8uadclLmZNd+mnpdIGgAZxVWeC7d89DlnmT83LO+kXs93Py4KT2vnuzl5fd6lFuM4BRnnLU9HU9a54wwk0k0EmqoGadG1iAYlw61HPPX0sXNHOjyCb6BfQbc/LilHq+L18vL6XsrKVTEozylKtNbu6ww04stLxqhQb2ISQ+jarsAw59Kjmnp6dBc2eCPGir6RfTTzc2TWPb5/Zym3bKva2RMRnEp3prdXnxBpGM0NGujSmVKttJa9m5wLV5887dWwcueCM1T0R7GXLzwTzXWmmlNt3pZMxOcqS9UnpfNzde3FNUNtsUqc8b0timc1WPfuZ4Rr1dKOTPFLcpyq9HHn5cyMdb013EJzWuos4zSHYCRWO14iKBNoSnkz6NLQTMIno6njgr6exHJlijSLTZ6eXPyZIvQ6NyXCcqdemozzgKKUtyirWYU0gAOfi30dyAkai2Mcp16e1HJjkiWO2++cOTJ67U7tTIhLOevqM8pQ2ShpKtCENpAFHFz3VDbHVUIcZ47dfWLkxzRo02HasOM6NABqZEEwujr0iJSYpQxKrcyMkApz5mNaOnVOnbSUTmt+nsRyYQnsmNrqMeTfRShAs1IhzfV0sUpJSJgqsUgJA6OfysXvdVVU6Y5JiXt09aOTGE9gYx3PPrMqiUpiQHvkV3a2JQpSQxPRykhAUzg83ZxbdU2wAQ3r36Bx4yjoAYxk5Y6EIYZpOttr530XpQlChAJG1KJQhunlzcvsdOHDxwwGIvR3t07iDjxSe4MYxs4+rXgy05pSU+/uhTQmUlMzKQidNlEpA6pYZL1gZnjEqr1tiQgQ+XGSt0wY2NcnVr503w5IS9v0ECbl0BMQpSCL6DOZQPRxGXR1obCYSAABJhwb5SVuAxjHPN07eaq4M0I6vfETbHRJMTEoCK3qIlSRrsRj3sBgs80AIQIZ819DnJewDYMc83R0YcZw5iSPpNkou3TJnLmtpIIXRpOcSp4+jtuXu00xznlIIQJAjwPoM0XsDGDHGHRvHnnDmhI9f0lM1pbZMcvm9+sylKOi1nEyc+vXpO1oBhOeWYCCWkC8P6DNLXUGMGPPLfePPXFmhI7fbEm9KBTGbWcJJPaiISq22ukAGE5Y5ghCFIjyPehLXUGMGPPLfo86Y4oQkbfRCQ7sEklOcJId2TEVdAq6EJgyM8IQgSFKDy/bgW2gMGMeWe/R422fHCEivpXIN20ATMzAgqnEJ6NKOtgmDIyxhCBJKULzvalLbQYDGPGOjo8TfLkhIRX0rlMdFDFMyplJ1RED0cqugEA2RljCQJJKULg9iRb2DGAzGejp8Lox5YSEb/QOUxU7ASmVMRD3tZw3bk3tAAxxljmgSSSlJcPsyLewYwGYLo6fB6ceSUhL0fXEhp1QJpRMZTnp0VOU1bcnRQAAycscgElKUpLj9dI3sYMBnOdHT4HVhywJB7HoEJiNKRNkZ5xExr0OMorakl1MQDGTjjmCSSlKUub1UjooYDBnM+nfwOvn5oEhe72POKajdpK3GOcRM30Czla7KTqYgGAsccwSSlKZS5/VSXU2AMB8tdOvh9XNzSJC9ztIhUZ9DIWpnjlEqdNyYgvaofWgABk5YQJCUqZlLD1ELqYMGA+Wum/F6+XmlCF7nalnA511MlsZY5KVN71EQr2qK6gAAZOWECSJlKZlY+ohdTBgwDl06DyOvk55Qhex6KM8U1r0LM1nPDNJD2cxKvVzruIGmMnLCEJJSlMysPVQusAGwHyadE+X1cfOkIXX7yJwhmnUoLnPHORD1FMGlsvdAAMc44whJKVKhLH1EjqGAwYcunRl5/TxYJCFPV6XZeGbnboUoJjOJUm5EqtKTvYAAGTljCSSSlTMrP0hPpBgwGcm22PD08OMiBZWFVVnr90qW1GcZzE9hnM3pUu9hDExk5YwkklKUwll6Yn0gMGDOTfXm5d+LGRAshsSD6noUphE5ZpR2rOXo1NVqgAYOcsYSSSUqYSz9JK+hDGDGcfTpy82/DihBOZUiCvsBKRizylRxexMRV1KdaAAA3GWUJJJSpUJR6KWmwDYDZxdWnJz7cOSEGSGhC6/qUlIxZxExwe7lkroFRo0wAZOWWaEklMqZS7hXuA2A2cXVpw5bcOSQLNJghej9GQkDmIzTz64ynTQU0agwTGTljAhSlKmUl2ivcGDBtcfVrwZa8WSQTCmkOT1ffUyAKIiU2oK2ainowAYyM8ZSEpUpSTPaTrsDBgw4uvbzZvizSDNJAqzr0fo5UphMxEShorWibLYADHGeMoSSmRSlHYLbUGMBi5OrbzZvizkFCThhFbfUapSNTMRmpbVO6Fb4vQAAGTnjKBJTMiSnqFtqDBgOObq28t1xZIJgFLCHpr7PokoSmIzlNqqdRjz8Pb7SAQxrLKAElMoFK3RvoDBgPPn6t/IquLNBEgpYorVFdG2u+2jic4kEowwwgrt+gQJDYs85QKUTnVmZQdFgwYBnj0dHj6HHmgiQUsmXshISZV0TKUoYA+n6VCEm3MSgUyGcabPNZC6bBgwHhHR0eJsuOEESClky9khCAQIaAGAN/S7oSQ3MQomcE3Kjdwt0dVDAYBjHR0+FuuPMFMMUsmbqpJAHIIYgGAN+p66FMjc55ylHnXtpGckp+kjqoGDAMJ6OnweieOASzbhMg1ckgAIBDBMaGGv00imQIhSll5z3tSjOF67XVQDBgc5v0/P9efJAJZtwqUPZSkAhoGgBDAYP6PRKZSJSlKPMovUa6H5Xss6gYDGHM9+jwOvLlgEZpyqUVqpSATSoAASYAx+31JQhSJKVPmWiujRTM9w+lgwBs5L3381Y80CDNOVSl6qZATcqgAAkYDD0PUSlCQkoc+XQMYg9QfSwGA2cl778OWHNIhQhDlXalIFRBSYACTAGb+5KSEApijyKCs5Bz7RXSAMGM5NN9vOXPzSIUCE5WjJkAah0mAAkMBle+kgEJTNHksKzluz1C+gBjAZyab35W3NzygUISaWlKZAHM00wEwSYDH7lpAISmKfkUFZxfQzuL6AYwAfJpvPldnLzyhEIQIulMgN5q3LAQxIYNV63ShAkKIF5gMSYHsLXcBgwDk12jzurk50hKAQS7pTIDIKcsBDElQA/R70ISSlST5gwAQeytdwYDAnl6NMuHp5OeQSgBE1VKZAaim4oATQk2A+z1BJJJJQLzWgEAeyttRjBgeb1a7cvJ0cfOiZEAkqpqUA5mhzQACEmwHt7aSUoSUNeZSQgGvZW+gxgwPL7OjTi5ujiwUJuASJumpQDgbRSAECTYDfvkpJCJijyqCSWw9hb6DGDBeX3b68PPv5+AwM0JCt0pQBI2lQmgAkoBnu0kkJKZdeTYKZYHsrawAAlcHodD8/m05EJhlIIVUyUASMEwE2kIoBnu0hJJERVeTYPOdNA9IxkGmhhOvRHNDlJJGKSBVTJQCljEDSppCGwde8JIQlGdV5VA8521H3HOgYxAk7cJwgQuUSBU6JSaJaYgpKgQhsDt9QQkAZ4614+ioxnfYfYYIYMAU1ZmhSCDkEgVFkyAkDEFJUCQNger1ggQGeTryWDmatHrLFAwYBLsyCQAXGJArKSkBIGIKkoEgbB+n1sQhEzmPygblU0ewsAGDAUu3iyQETyiEixkoBCBoWkFAkDYNd3oNCFLMW/J353UqqR684DAYCE28gkaDLBpArGkgEIGhXKtNIGwc36rQlS0wmXwb5SAxr2JwYDABIpykhA+bMkAbaSAQgaFclJpA2AtOps65V8zyJwCEFIPZnAYwGAinmEoE8+ZCGm2kkNCBiVyUmkMYOb7Kem2V83D6ca9EcXLMoYHszgwYMASpJCBiWGKEim0pABANKkUgQxg5D0LOiNObz+/SsM+zgiYTA9mMWMGACRUiQCbOTIQqGJIAQDQ0UIQxgJHo1n1NZcuWvp8HL6c8sZzVJ+tnk2AwAQ3CQADSxygolkoAEABUlIEwYCD0qiN7rgitXy9fXwxgtKR6eeQUmMGhMkEAMGA65OVkoAEMQaZjBDpMEnfoVMxtrrWPDljvv083LpaR6GWYwYwAVEiAQAMZry8QJCYKtU8y8wbBgkME3V2tm8ubXNVpty7aIXXlDAYMBDqUhDAQMe/N54JCGVpCYANUSSxAxMGIATTFR17At8oYwYmCiqQkCATB3tzeeCQhmqkEwENoQCGA0xAANAy/REXghtNg0JO5EIYhMDXbj4QSEOnFCTaAYhMEMBoBMaATaPQ6Ec+Wrm2NsMctNGgBMABl3x8YJCHQhyMATYkwQDAATAABpa+oLlVHHXdQwz4zTo0kQMAACq5eMEhFpiqFQAmxKkkwBgCYAIKSfp7LmMs5VXtdnNzVp0WkJgME2VXJyAkK0MVQm0xMEMSYxMTEMAABPo9A51hMvTOL9Lrjh4a6tEJgFAgdHJygkK0NK4TaAYIYkMBiaAYJpgnXrP8A/8QAFwEBAQEBAAAAAAAAAAAAAAAAAAECA//aAAgBAhAAAADJaAAQAAAAQtAACAAAAIWgAAgAAAELQBAAAAACKAAAAAAARQAAAAAACKAkltAAAAARQJgrZJVBItAAIoJm1Js5l1RnJdgAEqwzm7pCc7VtEXF0AAlDBrUoYzVaAZzugCpKMwo2MZVpBamLqkltDNM5qGmqZ522yC6MGzA1RKYlI02HJWsUrRiXVZg2JUzCottrnLbilalzm3RCWkowIBq4miUqEW6CZu4lKxCCWoVKtkA2EjRKVMCEoLC2AtoHPVqUrEXWZIqpZKoqqBM01KViHRnmqiIaChaMytJaOY0kAQlUCxSyW1LRzsAAQKBUpC2paOYAASgCgRbRRiACUAAaQCrYoIQmQoAKtAKRQATkooAVsACKABylFAKXQAEUADnlRQFNUIBYoAGMKFApsEAsUAExiqKBV0CAWKAByhRVRS6BALFAA5QoqopqggFigAc8lFBTVBALFAqBmJCgpqggFigABnAoU1QQCxQKgDGRRRq0SAWKpFQBjJQouwkAsaCKgCYhShrQSAqVRFQARBSlCQUSqIqAAABRIFhVEpAAAApIVCy0AgAAAWIKSVaAQAAACBQS0AgAAACFAlosLkAAAASgTQXOogAAABFAloSklAAAASgSgAAAAAAFgAAAAAAAsAAAAAAAAAAAAAEKWAAAAAACKLAAACTQAAJQ1JUAAEx0AAAAUzQSgJjoAAAALlLUUBMdAAAAAgE0AmOgAAAAf//EABcBAQEBAQAAAAAAAAAAAAAAAAABAgP/2gAIAQMQAAAApAAAAAAAFIAAAAAAApAAAAAAAFIAAAAAAAqAAAAAAAFIAAAAAAApALqs5AAAAAVAL1WZxGiQLSQAAqAvSZunOO1k5xV2jEAAVA1pnJrLXVJmQVN5yAAqDpZnIVrozJlFJu4gAFQ6WMtTA66TOW0kkdZiF1mAqNbQGIb2kxvRJzOlzg6EzBUdSKjmHW5Z6SszB01OcdLDEKXdSLETLqhuGWI6amcFXWclDoRRWJ0uU3LIlLJzB0zkojeoopGpJqWZ0FkxBoyUhdlCk0ytSIGcgvTOYojWkzdlALIgmYBekkzSHQc16LBSpIBGYN6kwqDoMtChSxEVAZm7JmVB0AKCgEJFCpMyoOhRBRQCIiikmZUHShAUACJFsoTMqApVtAsARMygQVAJReqBYikJgACoBKHWoWILBnAoBUQCjpoipBYTORQCyAFHTcRUJUJiCgFkAKOmrAiAZwFALIAUddECQDOYKAWQAo61YJAGMhQCyAFHTQEgEzkKAWQAoarVEiwmchQCyAFAa6CRYTOQoBZACgN7EiwmchQCyAFAdNCQEzkKAWQAoC7UgSTIUAsgBQBVsghAoJRACgAACBRUEAKAAAEKBSIAUAAAEoBSQAoAAAAACAFAAAAAAQAoAAAAACAFAAAAAAICWgAAAAAAEoAAAAAIoAAAAAAAlAAAAAAAAAAAAAAAAAAAAAAlAAABrIAAAM2xQAA6cwAAACKAALvmAAAARQABdYAAAAE0QWALcgAAACf/xAA+EAACAQIEBAQEBAQGAgIDAQAAAQIDERASITEEIDBBEzJRYQUiM3EUQEKBI1BSkTRDYnKxwaHhJNFEgvDx/9oACAEBAAE/ACrtyy0i/t+fTttoU+JlHfYhWhMt1H/K6vblqaU39uo5pHi30R4jW6PEhtcv+RX9iFecPdEK8J6PR9N/yuruuWr9N/bqOKFSSd0SoSb3I8NlErde3LCrOGz0IcSnpJCaavHXoP8AldXflrfTl/JoVJQ8pDiVtNEZKS+Utyv+V1PNy1/pv+URco6xdiHEtaSI1IT25H/K6nmweNf6eNvydixYtjbrK620Kdecd9URrQl7YP8Alc/Ng8az/h4W6luSxYsW/I2LYxQkhRXoJJfyyXmwbx4mSjAi2JXMjMrMtuxb2LFixYsWLdHT8jbBERCEL+Vy82Dx4zype5HZERYPYjYk3qQ+a+Y8KNtzwV6s8Fep4PuOnZFrfm0RFghfyuXmOw8eL1yr3EtEIQjsRH3IaX+xHbHsS2H+bQhYIX8q7D3Ow8eK3iLZCELCBLuR2f2I+XHsT2/Yf5tCF/LXtgx48T5oxFsIQjsQJEdn9iPlx7Eth/k10EIX8tflZ3GPGv8AWQthCEdimrk4MjCS3XLJ6cii32MkvQVJvUlDKjOti66a6KF/LZeV4PbkrfWR2EIQ9ilsPGxZFioJX0RToLeQoRXYyxSHYdr2RW8htKxezIztv0HKx4kD8RHsfiVsyFXLOz2YpJ7GluWIv5bLy/thLbkq/XR2wQh7FPYY+WZShlWZl7I8RJEp/KVK2Up1J1J/L2KnzUrkvOiSs0S0KTvDluTmoaE6uXQlNNaDky6e4noRryhsUZup8nYUbKyLFixEXLYtjZlv5HPy4T25J61zsIQjsU9hj5Loy63Z212K9eyywPGdrHi6WJ3kcHaNa0u6JzpqGW5JXmlEqq2g/KUdrctirLNPTZFTVCY4syipuw6UkrlGo6bKVWNSOOhT5notR8Qr2iiUpaaks6Vkxuqt2Z5+opT9RTqLuRrf1C1Wn5+p5MJbYIRvXOwhCwp7DHjewodyUoxRVrt6RH7jd9iNOo9bF2tGe5TqqD+dXRHLpKMVt2OJTlK8UNZVqUd7ctapkhYo03NXJUXsinwndngR2JUV2PCFD1KlGLV0Kc6cvSxw9VVIa7ja7EdynhotzNH1Locox3K1eOWyIepF3lf0HO1RIqXYldCsjQ0vYpzy6djt+eqeTCWKI/WeCELCGw8W/wCkUe7JVEkVZtl7G7silSUfmeDgpbodH+kdKolsQqVYfLsiFWTKlKTWaSKK1vhmRmRniTvUqX/YpwUYJIypLYkxs7cnEU1uiNSVNfKU+IqOcYvvYzJan4mMNypx1T9Gg6lSWsmZ7anjSPxD79iVVshXcSlUiov3JStOMvdEitVdOVlsRqp6szRSIzzS0E9CnLNH89V8lsJYohrVeKxp+UZsay2ElEnMnIkxsVHwaXizPG0TsSqSSvYfEtfpPxcvQ/FT7I/EzYq807ofHKVNQcdTxZ9nY8SfqZpepdlzhIXkJIsSRNCVkWLYVl8pkZGORolUZmuOVtESqCvI0RfBMjJl72PHu0S4d8RbJtuR4Cko21uV6MqMrS1XZlPTQjsQllO2n52tsjsSx2KXnfNDyj0LXLpE6hKTJMb0OEoqbzSOPsuFf3RZZV9iovlX2Joa6XALQt6EpVIbCr1JPWw7uN7E5WVidZryiqTtqhS01KqTiMb7kmXL6jMzWiFJ4WZcujMRnocFL+AlfbCrSVWGR/t7CThLK+xT1QyjP9L/ADtbZD2G8XsUfM8FyKVo6HuOViUhjY2UKXizt2RQSS02PiP+H/dFv+CflX2JjwtyXsJrHgfQnJRVitV/h3hG9iLkpKVrEJXpalR6Nibcm32I1U/02FJXKsrF0zUdxotg8ImV4WND7HDV5UZX7EXeKku+HG08k1VWz3KLVhmxTlmX5ytsiWi5HsUd3ghYLXQSsNkpDGS0N3Y4aCgv2KOx8R+gl7o9PsT2S9iY1zPY2FIoR8Wagv8A+scHCUZST7E0PVZUrEKEb3ZJWiSQ4a3Qosn8qvYk7l0lodhyexdmV2MoosykYlvUsS0wTIu+hwUs3Dr20wrU1Ok4lGVnY3Q0Qk4iakr/AJuu9kTenI/Kyh3wQi5GNjsTkNlxskcPC8rvYhs/sUk0tSrSjWSjLZC4ejFa62JWitESUZaNFSGR25njwV/xEUvchHLJkloTKdrXZJxcdGNxTs2TstSNt0V5KyQxCetzLpmKVHMLh4xjqSoxZKhY8Jiongemp4aW5VoWV0ONhIiihS8KCj6LGtT8Oq7bPUpu6GbFOeVm6uujUqqGkdWLiWt0RrU5d7C1261bcntyS8r+xQ2eCNinG+rJInKyJSG8GyMXOWWKKPDuMfmMqjsWMqKumxKTZ7lWnnhdb8zHh8Pi/Gcl2TZGTu7kpEU6k/ZGVJWJaKyVia12LXViLyPUqLuZTSxEyNU8xQp2in6ol6DiSQlYS1IqxljLdDprLYr08k/YkrPQhodseLhmp5luii9DsNYUp20fQqS8ON/7C1d2NIaRGco7MhxDXmI1IS2Pt063mKm3JPSD+xQ8uCdiPzMirFRolLBjZSpSrTyR/cpUIUl8q1Ow8Kk7Q0HVvoyelmLVCdnYr08rzLlePw+tGjWbnomiM4zk5Q1RVbVJyXYp16VKnfsQm5xzKOjKkam+Umpp2aJTyK8lsTqwkrRJr+EmSdokPmKdL5lEpcOsuuxCLpfI1p2JR1JIksGiBFFjjY2HZPU4Cgq1b5toj9sZRvBop/LJxFsMaLlOSlG3NtqTlnnpsthaOw4aXGWLC0KdRx+xGcZdKt5ifJNXhZehTjKCPmLspRtqOVibuPHK28qOHoRo07Ld8jaSK8tRu0y10U32fYk7K5UknD9uV8nw6doygjR3XZlChCUZ0Zr7EXOnTUEttjx5Ws1ZlStUvsialWVpaIlTjGaUSb0sTXy3KTRw61I6RtgyQxosR0I7FzjiotrHwuplruC2a5ZrLWaIbHYaGQlldxO6uuWvJxpO32I/LG5DV5j2O+FiwkLTYpz7Po1fOVOSK1sNXdiLVtewnmkRVokiQxsvocElOvf+lD9TMKZOdic8q/YrLRSJK6v6EZfLck0pXJVNBu/Kx48HNQq29UIWklMUk4lV2exmV9hyWXQe98JaaMhe+hwlJRgmxDaQ5x2HsMeCsZrIi7nHr+Hm9BtNXPhdOTrufZLl4lWr/wBiD0wYxFGX6Xy1FenJexfTKJqMdClJtNjaFqWLob00IyE1cjquhU1mypyQ8xaSd1sVKi2SsUzsPYciTGOMmfDqWRSl66E3ZE6zgz8VYVZ1NUSc3Gwk5Ubd0NW0MriicJaFssXf05nyReWSkuxTkpwjJbPBN30Kr9R27F8LFSzm0uxRiQWWCXsTlJL5Soqj72Jpxd8+pCpU7SuR8S2pK6RKbS0J16my0IOpL9RBTirplZeJQlf0LNI4CHh8LHTWXLxitOLKe2DJYQeWSfYW3LxEcvEqVrJr9ipUSVkQVoEWpSaFlRKQ5aGdWsRYttCjLMvt0JeYqclacoRvE/EVvUpyzK5AvoXGjKZSyOFjlp39ys7IqO7GUqeWmvcymsdhxvqNdiMpJZXr6E4TkzwZ+h4U/QdOa7Fmt1bBo78nA/Nw32Zd2syUrbFSTZd2Fd4RVyhFT4nK/wBVx0nTnkttoR8q+xJu2hOjVns7HE0PlSS1XcUbaLSxwy+VXKqRxe3y6GS62KdCUlorFKNSnpLUteD+xRo+LXjT9/8AwWSVl6W5eMXyRl6Mp7CwkXFsUpXjb05bJqzV0eFSf6V/Ynmp/LYlTr1Jfw4tFPhFGmo1H8zHwS7TaJ8Fli5KWy9CMBxykHYp6Suu/Ql5ipycT9NYUqmR2exTmrIVnsWLIcSxYgslNL2OIkSILNNREklbBosNIykUKGg4DiOK7olRi/YqUZR22Ho+T4Y70pL0Y4koko2GRRY8sG12RCWWoprs7ldPxVJ7Mj5USWhLMtmTu9yNGLZCNkVUVYKSY6WV6EFJbMgr7myPh0P4lSp6aEqkI7s/EUkfiYejPxNP0ZGtTlsziY5qEsutlf8AsUKiat6CY2hvCLKUrTt6865LonHJNpd9Scbq4im9PsLVc73ZPk4nyJFyTKNSUdOxTq2ITui+MI3kkS0RXeoygv4g8Wh4Q3Ir5RxHEcRxHEq0IyWmjJRcXZliNGcu1jgrQvFFjKTgmSpkYltCycWicHTbKf8AF4aLfeKsR2Q9UTRJpFOp81oiehUHoh1LSaZBpkES0j9kUVKMGlonuKIomUyocF6C8SKtGVkRpKGsdyM3azGxrCLsJ21Fqk+nWypqL83oW0GrMpkHpz92T5OK2WCTb2FZMTIVHEhUuXwoR1b9Co7Iq7jKOk8L4MeCepSacRoaGhoaGirTUlqQhCAttCk8siLvEvYk9CWohD0JKLepw04eAof0ojtczWKs7FSeZ2Rw1PL85eJVdmhuCSuV1ebkinMpTsN3iyim4lrctkWMqLDNhM/SUJ3jl9Om+F4inxPj+aLuLVE0QdiVTwo5+y3FZpNbc8x48W7ZUJyZsiO4sIzykKqaFJFGNqaKjKm4yGk1hcuXGPDh5W0HsNDRIeDSaKkfQg+x3KErqxPYvhGJaxJjabLtao4eV6KY/Q4mq27RKSlmJRnFH8S9yUqjeqGqlxwklqNtexw08yIkFljbosZbBeU4fz6enSexRqxj/DnozJBq6KlF9i0ovVFfWg0cBWvBU32WnPPYePFq84+xe2iHsQ3FjexRUnKMfWwrKKRUZN4R8yMyLovjYsU9JI3Q0MkhrFq444UqmVjalC5LRkWKyiORKQjKcHpBwZJ2ZxNPJTTXYhwtWacoOxwkM8Mk/Mh8Kx8NUcrX2Fwz7vvY4iM/Fy03oOk18styhDw4ailoJl+a5cbLmYurivU+WmijS8OOu/TlTjH5raCVl8jscVXqU6Vo6tn4hxjGMld21JShVVk7exRpOlWU47C1inyonsPHi2lNfYvcflIbnbHscDTuvEl20RJ6FRj3xuXwuJj0RfUh5hPQZIaJIa5HEta1ilL5bMqkNyT+UYoaiSEkQlkd0NppMqR8Sm4nCfLTt6EqavniOrVh3JVp3vdf2IuU3q9CFNR1Kkc3EWH2ihvXKiL0Fy3GxsuZhNt2irlLgpy+epovQhCNNWgrdSt9NkW0iUr7oq04VL9h03DvddjxJQpue2VbFH4hWoyy1fmh6EJxqQU4bPkRPYePFrNUX2ErIexT3O2OvYoQVKhGC9CTKj5EXRfC4ndFiC1ItG40MkhofIkRlYk7ohuSelho/wDojgims1K/oJehGChf3E9CqSt6FLQuRhabmN5dTNqRmKSEy5fC42Xuay0irlHgnL5qui9CFOFNWgrdau/kI7YSQ4r0Kdtu3oP4dTlJTp6LvEjXnRkqVTbsxOVr9vbFE9h48R9T7DHsU9xYbHDQz14w9/8AgdrEioPGnCM/l2Hwcv0S/uRnfbtoJlyG5lHaKIvuRYxjQ0NcliattghDHoJYQjmdkQSjGyGrbYPQkiUURtciSkkiTvFs1W4mRk0RmZjMjMZtCMZ1HaCuU+Bb1q/2IUoU1aCt+Qrv5lEWEkMhuUn2OJoqcX/4OGcopp7FrOy2wRLYe+PEfUeF0QSvpyfDYXqyl6IkSZUHhscO0qlmbK69DhrZJf7mQSyMnJx2KNWLklLQilYktdRKyL4NDQ0SQ0WEJm6sW7CwY97CIxcn8pCChGy7i2HsNmbSxN6FxNIz6DeZj2LJ7nhQZ4PoOFSPYzNdhNvREac3v8v3IU+HjrO8n/YXEwgrQhY/Fr+gXFQ7xFXpsTi9n1pPNUbFg0SRDcjpYaujL6cjHvjWa8WS/YYyl5rcnwyP8OUyRInixPLJP0L/AMO/scN9L7sp+RlUbsrrc4Op4lL7aGUcdCwtsGhmQ8JdzwonhxHBFkhx1ui2MISZGhfcjGMFaKEtbiHsSGrrQk3sSZokXb2Iok+whFy9jMnuhVLK0UkXzbiRbk1WzsRrTiR4lfqRGcZbdKbyxb9ERFgyZF6kdiOsTTkkPGu/40n7iaaGimvm5ODjk4aBJkmTxYynO/C39Ezh9KK/ch9Mqj2Phs7VHB9yxYZnSPEb2FFvcsWxYxjxVhMTEIR2JohKzGoyWqKsEKN9EZGhaIerFixkURiWLYWxvgm+2hCvOOguJh3TFXpMU4Puha7FsbHEO0LepHYWDJiIPQpvtyy5K31ZCbRK9rlLzY+xCOWnGPsSJMliyTSKE7cFVv2i/wDgoK1FEdKZKLk7IXDN7spUVRnnjuePU7Geo+5r3YkiKWFixbFoaGuRCuhNF0JiJIqaPQjPQazEKSWpU00GWFhYszI2QhYSLFixbkuLksXa2diPEVIe5Tr06nsxYcTL+KoeiI7CwexLCmynvblkPF8DRfzPdn4Cgj8DQ2I8FQTuj8LA/C0xcLC6aOxImPFk2U6slTlStpLQhHKrIV9iKEjKWFhYi7CafMxosWMplFFi2HE1QpkZoumVYi3KaNkTV5GUUDKjKjKiwkLnY5EVoLG2DRawzNJbNirVo+WQ60p1VOoQaaVhHYlsPCLKfmXLIeLbcEKcYq61L7OwnfQjO0b22L63M70R/wDRIkSGy5J6GW5GNhIiiMbkYjRYsLC5GRGQsLDWDwtghY6FkWsKVi+ZDjZkNhvQylksbYW6EtEVKltCCb1YiKwvyMawUR0ylorCGyb0HhEh5lyy5M2lhGbX2MzvdGZtWRHR3HqJ/Kn7EiTJDOxa5GJlFEpwEkhWO5odhcmexCqJpq+DQ0PlXNY2wWD5F0LYV5WWgo3d2RVhWEy+N8bGUS0HEWhEbJsbLkSkvmXLLkymUymQSxg7wXsSJ6IkMjFsUCMDKjKiOhcuXLly4nhcZexRndWEMaGi2FixbkWDxWDWNhc9hIZW3FoJly5cvyWEhItpjcuh2HZItqRKOsuWWK3LIsW5aekCRU2GRhchCwlyXLly5cuZjMXGxsRTdiErlxjRYthboWwSFzvksWESdkVZ/NYzCkJly5cTEaCwWN8GzMSYiCKWk+TsSxW65LckJLLYepUWgrNkUjYui6Lly5cuNmYuZjOZzNg5WKU7vUhURF3RfCxYt00Lq7FaVok5F2RbE8Ey4hMuJlxSMxcuXGzsbiIbFLWenI9iWK3XQu1sKTW5UlpoRjZ3ZczF8Lly5czDkXM3IhK6KkGiKyR1IMhLQQsLFue3IhFi3QWLK8tLIle5R4WrXv4a2J8NWpeeDL20FimXMxcuXMxnM5mL4ojCcrZUUqfhxt35HsSxivm6Vh077Doz7MipS2FTqWbS2MtW11Ek5QaU1a5mw1LIsPH7EYTlsiPC1n2sR4WS3Y6TjpuTpt6WIUnYUGkRE7Y2LDRbToLQXSRbCbJK44HB0/D4dL1wqcNQq+aNvdFT4fJfRf7MnSq0vPFly5cuZjMZjMJ32FTqvaD/ALCo8R/QzwOI/oYuD4l/pt9yHBVF5p2+xT4elDXdm22nK9h4w83UexS2IaQn9ij5T4k34lFe7I+ZInpsOrJaH4h+h+IfoeN7Hjv0PHfoUY0nTjNRWxotlbF7CihJLC2CxsNYW6EWIY+dYXJDIwzTUUJKKsuT2JUKE/NBf2HwPCv9NvsP4fQ7OX9//R+Ao/1S/ufgaPrL+4uC4ddn/cXDcMv0IUKcfLFL9hO3b/gzGYuy6Lly5cuXwlsPGn5uo/Kyl5SPkn9ij5D4l/iKS+5HzoqEub4bUvScH+nblXIixtjYfQZAQx4PC+CFi0NHDU959FsuXLly5cuXxuXwuXH8RoJ2s9PsPYeNPzdSXlf2KXkI/SmylpE+IL/5dJexFfOiqS5uCqeHWXo9OW+uNhCLYvTF8zIMi8Hy3Q5pEKieMloWd7IhFQiku3RZcuXLmYuXLlzMZjMZjMjMiXmf3GPGnv1J6Qf2KfkR/kyIWy/+DiqVOT8Zr5loiPnKpLmTa1W6KM/EpRn7Y3wTEWFy1J20PG7EXdc1xkWRLjGNl8G7Iz3lYisrSIvQRLYpRvLM9l0ntyXL43xvhcuXJeZjHjS6lT6cn7EFaJ/kv7oh5TiPIyHnKpLn+G1LwlT9C/IhPmZXT3RNTc/lWhSTUFfFly5cYiDwYx4tXJUL7FOnl3I4Mpq0F0pPQvoXL4XLly5fC5cuXLkvMx8lLqVvpMj5Uf5P7oh5TitKf72IecqkufgJZa2X15LHYQhcjQ1oZF6Fiwx8qRHFljQsKJYsWwWskjbosltjcuXL43Lly5cuXJL5mPkpdSt9ORHSK+x/lW90Q8pxFeUuJlQ/THUp6yKpLn4d5a8H78yE8b42LYMaGixYsWEIWDwsJC5GyirvN0mSO3UvjLdj5KW3Ur6U2Lyr7D+nH/cQ2Ju/G1X9iluyqPnpu04v3QuZMT6LLdFjwQuTfQilGPSZI7da41qx8lPy9TiPILyofkh9yOwv8RWfv/wUu5VHzwXzxXuhduZFy/RtyXELF4oXJSjdtvt02S/IPcfJT8vU4jyC2Q/LBe5HYj9Ss/8AUyl+oqj5+Fjm4iK/fG3L2EK3RYxsbIsWFxl8UXxp6Q6bJYPqXwe4+Sn5epxHlSF2H+gXoU3eVRr+plLZlUfP8PhepKXp0Ivtgsb8jGxsbGy5AjgxsuJi1Fj2IeXpslg+s1qPHsQ8vU4j9K9xEv0fYX/RR2l/uKflZUHz/D42o39WLG/JHfBYXwWDGxsbLjwgRZcbG8EyL5OxHypdSWD6d8XuPHsQ0iupxG8F74S80V7G0f2KH0r+rZT8hUHz8B9Bfd4vBYt2OyFhfBYMYx43IiehcY3gmRYh4x2XUlg+s9x49hbLqV/PBCH9VeyJvLSk/RMofRX7kPIVR8/Af4dfd4vBPC43oR1isWJiwbGxvF4RFgx4xZFjwW52XUlg+s9+VbLqVvqxQh/V+yRWdqE3/pf/AAUdKMSOlMqD5+A/w/78j0LieDKT+S2MiO+Mhj5YkcGMeCInbCO66svyD35VsupV+uvsLc/zZfscU7cPU/2v/gpq1JC+mVB8/wAOlenKPo+SRthcZQ7rFoirYyGPliLBlhlhIR2EtSO66ssH1nyIW3Un9f8AYjuhfUkcdpws/t/6IfTX2P8ALRUHz8JW8GprsxWavHVFiwyS5KG+LQtMGMY8LYoW3KhCGIjv1GSwfTeNuSO66svrv7EPMiOtSX3PiD/+JP8Ab/kWkEvY2gioPnv2KPFVaOi1XoUviFGWk04ka9Gflki11oSRYsWaKCs3yrBoaGi2NyLIvC+KEbYIjv1ZYPrXHjHzLqy+uyn5kU/qP7nxH/CP7oXlX2H5F9ioPn2YnfFTklo2v3FXrLaTFxVdfqFxtdd1/Y/HVvY4Gc6lJzl3dsLYWEscqWiGhoeDRDcjEcRotgkJYojv1GSwf5KPmXVf1pFPzop+Zv3Z8S/w1vWR2X7EvKvsVB83bG5fm4SGThoL1jfosZbCS0Ka+YWwxosJISQkPBCO3TZLqPoQ83V3qyKXnKXd/c+J/Siv9R6L7E9l9iY+Z7Y9uaKu0l30ElFKK7JdFjRbCpLLG5S4mfiWsR1imMbwQmXHgsO3TZL8pT83Vj55Mo+YpbHxR/LTS7yO6/Ynt+xMfNLXbF+2PYR2OCjn4qmve/8AY9+ix41VeOhTpWqXFbIl7ErDwRbkWHbpsl+QtyU9+rDeRR837FHa58T81KPuzuv2Km37Ex9Xsdj4ZG/FL2Tf/XSYx4aWIx1LqxIbwjyrDsumyR2/J0up2KfdlLS79iivlPiL/jUl7tndFTYnzN47M7jFhfth8J/xEv8Abi+dj5LmYbxiLB4IsLbpskdvydLqPRFLy/uU9pfYpaRPiH+JpL2Ir5kVNifM8EM7jFj+k+GSUeJd+6ti+djweF+VCZcZoWNkLbpskdvydLbqTdoN+xS8hT8kvsU/KcdrxcPaJHzIqE+XtyMW4xDw7FKbpyU1uncoV41qacdXbVY252MeK5Ehci0Q2oxu9EcHX8SrUXbdf8dSR26L5rclLy9Sp9N/YpeQh9ORT8hxevGpekSPnRUJD5HtyMW4xDwWxHRFKtOjLNT0KPxKnJKNXRkZwqRvBplh8zGPFYoWH2HJLfQnxVGG7/sS+I2+nEqV6lV/Oz4Z9WX+3/vqPbpPGxYa5afl6lXSlL7FPSBH6TIeU4l//Pl7Ih5yoPlfIxaDEPBbC2xjOUNYOxHjuJj+q5H4lWW6RH4mv1R/sR+I0XvdEeL4eW0kKrTe0kXQ2MeNzMjOkePTXcfGU4r1Jce/0xJcXWltoOcpeZ4LDgG1xMV6p/8AHUZYsWwsWxsMTvsJFjKNGXkp+XqVn/DkQXyoWlF/dEPKVdeOqFPzlQlyvkeDEPBHboXL+mgqk1s2KvVW0j8TW/qPxVb1HxFR9zxqnqeLP1M8vUu30eFmoV4SfqPpvCxYsjSxpY0NCxK2V/Yp6Ub+5FoUdDKSXYy8kPKupxH02R0ivsf5X/7IhsT14yqyl5ioS5XyPBnbFC259MLaX/b8ktDhpupw8Jv0t/bluXLl8GxszGczszszsdd3sePI/ESXY/Ez9CXENrVCqfwbe4qthcW7Wsfin6D4hPseOvTHsQ8qXU4j6VheVfY/y4/7iOiP/wAmr9/+CluyoPlkuZnbGmtTZ9HN8mT3v1LFuXY+H8Q4vwZeV7YXLlxvBYXGxsvhfBsk/mbIyRCEpu0UeDFK0nZkqEkrrVWF9PHMtjMjMuSOy6nEeRIWyH5IL3uL0E71qr/1MpdyoPle3I8OxssYrTD7YX6VuvSn4c4z9Gh/9YXLjxuXGy/LJkn8xsUq0qfl0JPPqxNwvbawtYWxVCvL5oxdiUJw86sZlyLZdTiPLFe4h7QQilrOo/cpd2VB8tuRiOw9sFukdujf8oihLNQg3/SsLlxsuXL9CRLzFsIysJpoSwsUuIlSVuxxFeNWnltqy0cULZdSu9YoQ/NBeiP0/sUPLKX+opeVlQfRYjsPCC+bpJaflEcFPNRy/wBL/wDGFy42XwvzMRLYl5nyJ2KfznhsyMyji2eDit11a/ngsH54/wC0fl/Yr0oUbRgtHqU9IFQfM8WLB4U+jY7fleBnas49msLl10dhiRJaEvMztyKo6flPHqex48zxpnjTPGl7f2xjuurW+rDBq1Vf7bH6Ti38yj6Ip+QqD6LxZ2IqyF0Fg8Ft0XguehLLWg/cZfpPCJLYl53yvC2FuSHmXVq/Wj7IQ/q/ZI7HF/V0IfTKg+mtsGLRWF0EPBC2/IoTytP0L6X6bwgS2J+Zj7YolpjGEpbLQ8J+1vXseG8Yebq1Prr7C3P86XtYqz8Km5/0q5Kr4v8AE9SP07FQfW7IXReCNlgukubsUpZqUX03hDYk9CXmfIiWEVditszT/wBdi698afm6svr/ALEd0L6sn7nGPLws2vT/ANEFalEXkKg+Xt0Fv03j2wX5Hg3ejb06F8XgtiWxLzclyQjbYzMuXeNLzdWX139iHmRHWpL7nH/4Sf7C0ppex+hIqD5e3Qjv0VisHtgui+hwD0lHo35ZbD3fKxb89JavqOSRG7qyZDzIp+d/c+If4SX7I/Sl7I/QvsVB9WPSeCwe3VXLscE7VcvqnzX6Eth+YtyMXPS79SpJuTF5SmrzQlaTPiLtw1v9Q1okPyr7FQeN0i7exbn7EcFtg+Z8j2F+R7HDyyVYv3H1FsS2H5sLYvoUtum9ifmI+VFHzH6mfE/oRX+oe6RLSP7FTDYbb2LC6MdsO2D5mLBDF+R7CdtfQ3V+k8IktiXmeLWDxthbGlt05eV/Yl5rC2SKO4vMz4nbLTj6yJeb9yexUY5X2LepZFixYfPHbDtg+dYIYvyPY7FN3pxft0nhElsS8z5LDxvhrjCSjHUzw9TPD1M8PUzw9TxIep4sDxYHiwPGieNEdWOVoek0xFEW7Z8RldwUezueJmld6alWvfSCGm9WW5nh25Y4LbB86wQxfkex2KStSiv9K6TwgS2JeZnbHsPCCT3MiPDV7Pf0PDj6YyepdF0XRdF0XXoXRdGZGZGZEpJrQVe3YhxCUH9iFeUU7JEt9e5ZGVdiyLGUylixYe+CHyRw7dND/JIhHNNRRokl7c1i2Fh4QRLYl5nyIlhTsvY2/wBP/Z/p2/0lvbGSuyxYyliyLFixYsWLFhLCW/RsPfnjth26aHiuutDg4XnftHbptaDKaJLQl52dixYtoSwo6X7Frf6f+y1vltb/AEll/Ti9+hdGmF1hdCasXQxdF7862w7dNci0O2PbqcGkqKfTYyDsOWhLzMzMzMzMzMeEZOGwqskeJJKx4j9MXv1lsIlvYXQei6C2/Jduvwkl4Vn26Fy+DGRGifmZazthpg8EixYth2O/W7HY9xD5blyT+X9uhHbBfkHtj26l7baHC15ZvDl0uwyBLYn5mVYXV1imMQuV7YXw1wuampqa8t9DsZXtcSfLfGo9Lcj5FgtvyHbHt1aV1Ui12aPFZ4jPEZ4r9DxWeJKxHPJ5UXqZsuXU8PiLXseJIc2Ko0eLJkn8xnY13XKtC5cvg9jTrLB4WLY2LYVfNj9uVYLb8h2x7dWi8r0LsvI+Yipt2RGlFL5icadtENKm07bf9Faq4UlUe70RS4iamm3oVVrnp7M+b0FTqy0ijw6ql4eXX0J0asXdwaLlx9F+X8hpjpy3wqRvG/Ki6wW35Ltj26jKfmI2NfQtZFHclOMVpqXu7SKl3Sdt4tf2Zx+nhLtlItlH5qUoe2hCDtmeyEqcdJX/AGKtRUopbysUuIk/llqcXGMa0sqstMGi3Ql5ev26NljUhbVc6/JdsV1k7bEHeCbJ6aexSdmOK3Ra2pTklLXZ6P7HxBJKn7IppuSSKUqVN2b19jNCT+W/27ElaVOXbNZnGSceJa9hVraoh/Gg4y3GtbehYa5dMZbdd9hvp2TVmVIZXzL8quvHy29DdIu4vQjO+wxbHEZWln29hunTj/DvdiY5NL5fQ4WaqRcZa31X3OPa/EadkQU5eVXOHc6bTcX/AGOMp5KudbNFrqxYeCRYyosjsS262gtWW6GnI7NWY6S7DpyXYyv0MsvQVKb7DhKG/wCRRLFdeHlTRa2qJRvqiMmnYTTQiUIzjlJcJVjsjwKy/SzwatvLYoNxg2t4lV0K78SXyv0PElF2p6JFLia6W/7FW1bhlUX6f/8ACEd32sNXJEVcsWLFsJ7cl+n9i2FixYsWRYyosWLFkWRYsiyNkV1p1bNmVrtit0TVptffFc2V2LWEixbFIjFfqISp5UkaD01RKFnYV47iZFisXJvQ4d2nKLKtKUJN2wpFHzKnK6g3qkVcq/h09ImWxU0ZSScblixYthPbrbdO+N8bi3HscQvl6ii2bLQvoWi0OK7CjqTWaV0OLQ4tCT9DKzJIyGVI0Mxe6Lly5fC5cuKQqklsePNu7PFTWoqqjsKvA/Fr0PxUSXE37EZZZZkePK1nqOafYzegqjWxGu1uKrFla2bQoawLGUymUZLmt0HoiG2vV05ILUexxPkfTitR6K6G9DsX7FzQu1sXL6l/QuXZfG/RXNf2Ll16cl+RbFyhbLZFixYsMl6YXw0NC5dF0XLouXLpE3ci9NC7wvhd4X6VMexxD/h9OCsrslI7C2xtyWYi/Jp0r4Xxv0kbEJum7oXzRTLYWJtRRKSbvhoLUs+iyZDbltyW6EEdjiPLbpJdxt4LY++N+S4jTradNYX5eHneOUsWwnK7G7C1RYk8pGd1hYsW5JVFHQ8RtkndIgtMLl+hbCxYthEexxGy6KVx+w9hLuLfodhfyGlPJO/J2JL5blN3iVKigtNxzk3diqNWE1Zc1WWWNh6iLlJ/Lhbq3wiPY4jZdD2LWx7ERj51iuosdOnc7cnDyzU16rG1h2yik4qyJa6lkWRmYqskfiFbVCqp7GYv6HEPbBYU9tC7wuXEy5fo2Ediu9LdCK78t7D/AD2nT2OHlkn98ZbIew8YK5kRJWwTtscNTU43kKEVsiVOEvMivw8ILNDQQmUvp4bmVFkJIsWFhYsW5UMr9BbcrPQ786wv+VXTg7NfcWqTw//EAB8RAAIBBQEBAQEAAAAAAAAAAAERABAgMEBQAhJgcP/aAAgBAgEBPwCo545454/ihMccBj5TwnE444DsE0AiiitJoKC02DXJoLVUwCKouUUVBqmowGCgoMJoNM2OOgt9YHHHBU1FjjjxnCLCKiptFhoMAOuoLQMBoIMAvMWFweo6mw0FBcaixRVGBRYwY7TlGAYlqDOch2xFp+qiKfMI3TpHYFp0HHvH9URFxhhUUUUUUWqKKKKKKKKLSPQI0hu+tIbvrn+tEbx0RvHRG96GiN5T5nzPmLKOEco4XrKOF6yjhERY1FxFFPmKKKKKKLunGOIbBzxzxzx2Dzz/AFgVX4Z7R1Dzzzzzzv8A/8QAIBEAAgEFAQEAAwAAAAAAAAAAAAERAhAgMEBQEjGAkP/aAAgBAwEBPwD9JEj5FSOkdOEEEeIkLF3WlI+T5II6Ertn0J2dkhUkEEDWKwY+ZK7uib04vOSRFS5Urt6KVd61ZrjVOECps8acHaBIdJBA1dWgawSPkjXStqd3dYvBWauhXga0JC0vBCwi0iZJONN2rrF5oWn5Pkauh3ps0JDRA7QQU3eEkis9CE9bRAiLrOCCBaVZ6k+J65HiiNa5HobzVmhojRTgmSJ8sEZ07FkuOMIGiMKeCD5I6oIPkSweheO9C8d6E/HelMkkkkkkRHG7STaSSSSeJcj7FxPtp4n20cL7qeF9y4X3L8cL7qeF9/0fR9Ce1+FTtfhU7X4VO1+Eidj8SST6JJJJJJ3rz6V56X8GY6lyIfnLz159I+7/2Q==', time: new Date().toISOString() },
			]
		}
      ]);
      setDemoInjected(true);
    }
		if ((!isConnected || !walletClient || !registered) && !isInstalled) return;
		console.log("Wallet connected, fetching contacts...");
		fetchContacts();
		
		const interval = setInterval(() => {
			fetchContacts();
		}, 10000);
		return () => clearInterval(interval);
    };
    initalize();
  }, [walletClient, isConnected, status, registered, demoInjected, pathname]);

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
				// @todo fix iv
				const decryptedMessage = await decrypt(ciphertextArrayBuffer, new Uint8Array([119, 89, 120, 213, 240, 241, 182, 85, 42, 241, 164, 2]), derivedAesKey);
				const [signature, rawMessage] = decryptedMessage.split(": ");
				const recoveredPublicKey = recoverPublicKey(rawMessage, signature);
				const isSignatureValid = verifySignature(rawMessage, signature, recoveredPublicKey);
				if (!isSignatureValid) {
					console.log("Invalid Signature found, skipping message...");
					continue;
				}

				const ensPublicKey = recoveredPublicKey.startsWith("04") || recoveredPublicKey.startsWith("0x") ? recoveredPublicKey.slice(2) : recoveredPublicKey;
				const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ens/${ensPublicKey}`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
				})
				let resolvedName = "";
				if (response.ok) {
					resolvedName = (await response.json())["subdomain"];
				} else {
					resolvedName = `0x${recoveredPublicKey.slice(-40)}`;
				}

				decryptedMessages.push({ message: rawMessage, submit_time: message.submit_time, sender: recoveredPublicKey, name: resolvedName });
			}
		}
	}

	/* -------------------------- Load Sent Messages ---------------------------- */
	const sentMessages = await getSentMessages();

	/* ------------------------------ Add Messages ------------------------------ */
	setContacts(prev => {
		const newContacts = [...prev];

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
					name: newContacts[contactId].name,
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
					name: newContacts[contactId].name,
					avatar: 'None',
					address: message.sender,
					messages: [...existingMessages, { fromMe: false, text: message.message, time: message.submit_time, unread: true }]
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
			chainId: mainnet.id,
		}) as string;
		console.log("address", address);
		if (!address) return null;
	} else {
		address = textInput;
	}
	address = address.startsWith('0x') ? `04${address.slice(2)}` : address;
	address = !address.startsWith('04') ? `04${address}` : address;

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
	console.log("recipient", recipient, isConnected, walletClient, registered);
    if ((!isConnected || !walletClient || !registered) && !isInstalled) return;

	/* ----------------------------- Read MyKeyPair ----------------------------- */
	const privateKey = localStorage.getItem('com.dankchat.privateKey');
	if (!privateKey) return;
	const keyPair = ec.keyFromPrivate(privateKey, 'hex');
	console.log("keyPair", keyPair.getPublic().getX().toString("hex"), keyPair.getPublic().getY().toString("hex"));

	/* --------------------------- Create New Keypair --------------------------- */
	const messageKeyPair = ec.genKeyPair();

	/* -------------------------- Derive Shared Secret -------------------------- */
	let recipientPublicKey = "";
	let recipientName = "";
	let recipientAddress = "";
	if (!recipient.startsWith('0x') && !recipient.startsWith('04')) {
		const resolvedAddress = await getEnsText(config, {
			key: "com.dankchat.publicKey",
			chainId: mainnet.id,
			name: recipient,
		}) as string;
		console.log("resolvedAddress", resolvedAddress);
		if (resolvedAddress) {
			if (resolvedAddress.startsWith('0x')) {
				recipientPublicKey = resolvedAddress.slice(2);
				recipientAddress = `04${resolvedAddress.slice(2)}`;
			} else {
				recipientPublicKey = resolvedAddress;
				recipientAddress = `04${resolvedAddress}`;
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
    <ChatContext.Provider value={{ contacts, setContacts, sendMessage, startNewChat, registered, setRegistered }}>
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
