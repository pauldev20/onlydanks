import { ec as EC } from 'elliptic';
import { keccak256 } from 'js-sha3';


const ec = new EC('secp256k1');

export async function deriveAesKey(sharedSecretHex: string): Promise<CryptoKey> {
	const sharedSecretBytes = new Uint8Array(Buffer.from(sharedSecretHex, 'hex'));
	const hash = await crypto.subtle.digest('SHA-256', sharedSecretBytes);
  
	return crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

export async function encrypt(message: string, key: CryptoKey): Promise<{ ciphertext: ArrayBuffer, iv: Uint8Array }> {
	const textEncoder = new TextEncoder();
	// const iv = crypto.getRandomValues(new Uint8Array(12));
	// @todo fix this
	const iv = new Uint8Array([119, 89, 120, 213, 240, 241, 182, 85, 42, 241, 164, 2]);
	const encoded = textEncoder.encode(message);
	const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
	return { ciphertext, iv };
}

export async function decrypt(ciphertext: ArrayBuffer, iv: Uint8Array, key: CryptoKey): Promise<string> {
	const textDecoder = new TextDecoder();
	const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
	return textDecoder.decode(decrypted);
}

export function recoverPublicKey(message: string, signatureHex: string): string {
	const msgHash = Buffer.from(keccak256(Buffer.from(message)), 'hex');

	const r = signatureHex.slice(0, 64);
	const s = signatureHex.slice(64, 128);
	const v = parseInt(signatureHex.slice(128, 130), 16);

	const signature = { r, s };
	const recoveredPub = ec.recoverPubKey(msgHash, signature, v);
	return ec.keyFromPublic(recoveredPub).getPublic(false, 'hex'); // uncompressed
}


export function verifySignature(message: string, signatureHex: string, publicKeyHex: string): boolean {
	const msgHash = Buffer.from(keccak256(Buffer.from(message)), 'hex');
  
	const r = signatureHex.slice(0, 64);
	const s = signatureHex.slice(64, 128);
	const signature = { r, s };
  
	const pubKey = ec.keyFromPublic(publicKeyHex, 'hex');
	return pubKey.verify(msgHash, signature);
}