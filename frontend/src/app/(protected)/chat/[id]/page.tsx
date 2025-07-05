// app/chat/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useChat } from '@/providers/ChatContext';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Input } from '@worldcoin/mini-apps-ui-kit-react';
import { Page } from '@/components/PageLayout';
import { MapsArrowDiagonal, DoubleCheck, ArrowLeft } from 'iconoir-react';
import { useRouter } from 'next/navigation';




export default function ChatPage() {
  const { id } = useParams();
  const { contacts, setContacts } = useChat();
  const contactId = Number(id);
  const router = useRouter();
  
  const [input, setInput] = useState('');
  const selected = contacts.find(c => c.id === contactId);

  useEffect(() => {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;

    const hasUnread = contact.messages.some(m => !m.fromMe && m.unread);
    if (!hasUnread) return;
    // mark unread as read on open
    const updated = contacts.map(c =>
      c.id === contactId
        ? { ...c, messages: c.messages.map(m => ({ ...m, unread: false })) }
        : c
    );
    setContacts(updated);
  }, [contactId, contacts, setContacts]);

  const handleSend = () => {
    if (!selected || input.trim() === '') return;
    const updated = contacts.map(c => {
      if (c.id !== contactId) return c;
      return {
        ...c,
        messages: [...c.messages, { fromMe: true, text: input, unread: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) }],
      };
    });
    setContacts(updated);
    setInput('');
  };

  return (
    <>
    <Page.Main className="flex flex-col items-center justify-start mb-16">
    <div className="flex flex-col h-screen w-full">
    {/* top bar */}
    {selected && (
      <div className="flex items-center gap-3 px-4 py-2 bg-white shadow-sm border-b border-gray-200">
        {/* back arrow, only show if mobile layout */}
        <button className="md:hidden" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>

        <Image
          src={selected.avatar}
          alt={selected.name}
          width={40}
          height={40}
          className="rounded-full object-cover"
        />

        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{selected.name}</span>
          <span className="text-sm text-gray-500">{selected.address}</span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* optional icons: call, video, menu */}
          <Image src="/etherscan.png" alt="call" width={12} height={12} className="w-5 h-5 text-gray-600" />
          <Image src="/x.png" alt="x.com" width={12} height={12} className="w-5 h-5 text-gray-600" />
          {/* <DotsVerticalIcon className="w-5 h-5 text-gray-600" /> */}
        </div>
      </div>
    )}

    {/* messages */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {selected?.messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.fromMe ? 'justify-end' : 'justify-start'}`}   >
            <div
             className={`max-w-[70%] px-4 py-2 rounded-lg break-words ${
              m.fromMe ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'
            }`}
            >
            {m.text}
            <div className="flex justify-end text-xs text-gray-400 mt-1 items-center gap-1">
              <span> {m.time}</span>
              {m.fromMe && (
                <DoubleCheck className="w-4 h-4" />
              )}
            </div>
            </div>
          </div>
        ))}
      </div>

      {/* input */}
      {selected && <Input
      label="Type your message..."
      endAdornment={
        <button onClick={handleSend} className="flex items-center">
        <MapsArrowDiagonal 
          aria-label="send"
          className="w-6 h-6"
        />
      </button>}
      value={input}
      onChange={(e) => setInput(e.target.value)}
      showEndDivider={true}
      onKeyDown={(e) => e.key === 'Enter' && handleSend()
      }
      />}
    </div>
    </Page.Main>
    </>
  );
}
