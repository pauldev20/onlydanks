# OnlyDanks

Private end-to-end encrypted messenger built on blobs, fully anonymous and censorship-resistant.

## Description

### What Is It?

OnlyDanks is a messaging system that lives entirely on the Ethereum blockchain. There are no apps, no servers, and no middlemen. Messages are written directly to Ethereum’s new **blob** storage, making them:
- **Invisible to third parties** (no one can read them),
- **Unlinkable** (no one can tell who’s talking to whom),
- **Censorship-resistant** (no one can delete or block them).

It works like a **fully private postbox**, where only the intended recipient has the key—and no one even knows the box exists.

### How It Works (Conceptually)

- You create a **public identity** using an Ethereum Name like `yourname.onlydanks.eth`.
- This name links to a **public key**, like sharing your digital mailbox.
- When someone wants to message you:
  - They use your public key to encrypt a message.
  - They publish it into Ethereum’s blob space.
- You periodically check for new messages by scanning the blockchain.
- If a message is meant for you, you can **decrypt and read it**.

### Why It's Special

- **Privacy by design**: No servers or apps know who you are.
- **Stealthy delivery**: Only you can find and read your messages.
- **Globally accessible**: Anyone with an Ethereum wallet can use it.
- **No central control**: Can't be taken down, blocked, or censored.
- **No history or tracking**: All data is ephemeral and unlinkable.


## Technical

### Identity & Registration
```mermaid
sequenceDiagram
    participant User
    participant ENS
    participant L2Registrar
    participant L2Registry

    User->>L2Registrar: Register subname (e.g. user.onlydanks.eth)
    L2Registrar->>ENS: Link subname to L2 registry
    L2Registrar->>L2Registry: Store secp256k1 public key (text record)
    ENS-->>User: ENS now resolves to public key
```
- Users register ENS subnames (e.g., `user.onlydanks.eth`) through an L2 registrar on **World-Seoplia**.
- Each subname links to a **secp256k1 public key** via ENS text record.
- ENS’s L1 resolver points to our L2 registry.

### Message Sending Flow
```mermaid
sequenceDiagram
    participant Sender
    participant ENS
    participant Backend
    participant Ethereum

    Sender->>ENS: Lookup recipient ENS (e.g. alice.onlydanks.eth)
    ENS-->>Sender: Return recipient's public key

    Sender->>Sender: Generate ephemeral key pair
    Sender->>Sender: Compute shared secret (ECDH)
    Sender->>Sender: Sign and encrypt message

    Sender->>Ethereum: Submit blob data:

```
1. **Look up ENS subname** → get public key.
2. **Generate ephemeral private key**.
3. Use **ECDH** (Diffie-Hellman) to create shared secret.
4. **Sign the message** with sender's private key.
5. **Encrypt** the signed message with the shared secret.
6. Publish to blob:
   - Ephemeral public key
   - Initialization vector (IV)
   - `hash(shared_secret)` (used for message lookup)
   - Encrypted message

### Backend Service
- Stateless, self-hostable.
- Indexes blobs and provides:
  - List of `ephemeral public keys + IV`
  - Messages by `hash(shared_secret)`
- Does **not store any private info** or user data.

### Message Receiving Flow
```mermaid
sequenceDiagram
    participant Recipient
    participant Backend

    Recipient->>Backend: Fetch ephemeral pubkeys + IVs
    loop For each ephemeral pubkey
        Recipient->>Recipient: Compute shared secret (ECDH)
        Recipient->>Backend: Search messages by hash(shared secret)
        Backend-->>Recipient: Return matching blobs
        Recipient->>Recipient: Try decrypting
        alt If decryption works
            Recipient->>Recipient: Verify signature, read message
        end
    end
```
- The recipient downloads **ephemeral public keys + IVs** from the backend.
- Tries to compute shared secrets from each.
- For each derived `hash(shared_secret)`, queries backend for matching blobs.
- If found, decrypts the message and verifies the sender via signature.
