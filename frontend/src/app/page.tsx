import { Page } from '@/components/PageLayout';
import { AuthButton } from '../components/AuthButton';
import { TopBar } from '@worldcoin/mini-apps-ui-kit-react';
import Image from 'next/image';

export default function Home() {
  return (
    <Page>
      <Page.Header className="p-0">
        <TopBar
          title="OnlyDanks"
          className="text-black font-medium bg-white/80 backdrop-blur-xl border-b border-black/5"
          startAdornment={
            <Image 
            src="/odlogo.png" 
            alt="OnlyDanks" 
            width={128}
            height={128}
            className="w-8 h-8 rounded-full"
            />
          }
        />
      </Page.Header>
      <Page.Main className="flex flex-col items-center justify-start gap-5 mb-16 px-4 py-12">
        {/* meme goes here */}
        <div className="relative">
          <Image
            src="/chat-meme.png" // <-- drop a dank meme here
            alt="Encrypted chat meme"
            width={400}
            height={300}
            className="rounded-2xl"
          />
          <div className="absolute rounded-xl -z-10"></div>
        </div>

        {/* one-liner tagline */}
        <div className="text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-light text-black leading-tight tracking-tight">
            the most private chat experience 
            <span className="block font-medium">the world has to offer</span>
          </h1>
        </div>

        {/* high-level project desc */}
        <div className="max-w-3xl">
          <div className="grid gap-8 md:gap-12">
            <div className="space-y-6 text-gray-600 text-base leading-relaxed">
              <div className="flex gap-4">
                <div className="w-1.5 h-1.5 bg-black rounded-full mt-2.5 flex-shrink-0"></div>
                <p>
                  <span className="text-black font-medium">backend</span> receives encrypted messages, buys blob space, and publishes them to Ethereum. ensures sender privacy.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="w-1.5 h-1.5 bg-black rounded-full mt-2.5 flex-shrink-0"></div>
                <p>
                  messages are written to the blockchain. anyone can browse the blobspace and fetch the encrypted content, but only the intended receiver can decrypt.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="w-1.5 h-1.5 bg-black rounded-full mt-2.5 flex-shrink-0"></div>
                <p>
                  even the act of <em className="text-black font-medium not-italic">reading</em> remains private — the receiver blends in with everyone else passively scanning blobs.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-2">
          <AuthButton />
        </div>
      </Page.Main>
    </Page>
  );
}
