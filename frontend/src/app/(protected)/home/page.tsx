import { Page } from '@/components/PageLayout';
import { Login } from '@/components/Login';
import { TopBar } from '@worldcoin/mini-apps-ui-kit-react';
import Image from 'next/image';

export default async function Home() {

  return (
    <>
      <Page.Header className="p-0">
        <TopBar
          title="OnlyDanks"
          className="text-black font-extrabold"
          startAdornment={
            <Image 
            src="/odlogo.png" 
            alt="OnlyDanks" 
            width={24} 
            height={24}
            className="w-12 h-12 rounded-full"
            />
          }
        />
      </Page.Header>
      <Page.Main className="flex flex-col items-center justify-start gap-4 mb-16">
        {/* meme goes here */}
        <Image
          src="/chat-meme.png" // <-- drop a dank meme here
          alt="Encrypted chat meme"
          width={400}
          height={300}
          className="rounded-xl shadow-md"
        />

        {/* one-liner tagline */}
        <h2 className="text-xl font-bold text-center text-black">
          the most private chat experience the world has to offer
        </h2>

        {/* high-level project desc */}
        <div className="bg-gray-100 p-4 rounded-lg max-w-xl text-sm leading-relaxed text-gray-800">
          <p>
            <span className="font-semibold">blobber backend</span> — receives encrypted messages, buys blob space, and publishes them to Ethereum. ensures sender privacy.
          </p>
          <p className="mt-2">
            messages are written to chain with a <code className="bg-white px-1 py-0.5 rounded text-xs">0xXX</code> prefix. anyone can browse the blobspace and fetch the encrypted content, but only the intended receiver can decrypt.
          </p>
          <p className="mt-2">
            even the act of *reading* remains private — the receiver blends in with everyone else passively scanning blobs.
          </p>
        </div>
        <Login />
      </Page.Main>
    </>
  );
}
