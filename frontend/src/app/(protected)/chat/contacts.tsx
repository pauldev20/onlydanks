// app/contacts/page.tsx
'use client';

import { useChat } from '@/providers/ChatContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ListItem } from '@worldcoin/mini-apps-ui-kit-react';
import { formatTime } from '@/helpers/time';
import { useMemo, useState } from 'react';


export default function ContactsPage() {
  const { contacts, startNewChat } = useChat(); // assume you have a function to init new chat
  const [search, setSearch] = useState('');
  const router = useRouter();

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search.trim() !== '') {
      const ens = search.trim().toLowerCase();
      const newChatId = await startNewChat(ens);
      setSearch('');
      if (newChatId) router.push(`/chat/${newChatId}`);
    }
  };

  const sortedContacts = useMemo(() => {
    return [...contacts].sort((a, b) => {
      const aLast = a.messages[a.messages.length - 1];
      const bLast = b.messages[b.messages.length - 1];
  
      const aTime = aLast?.time ? new Date(aLast.time).getTime() : 0;
      const bTime = bLast?.time ? new Date(bLast.time).getTime() : 0;
  
      return bTime - aTime;
    });
  }, [contacts]);
  

  return (

    <div className="h-screen overflow-y-auto ">
      
        <div className="flex flex-col p-4 space-y-2">
      <input
        type="text"
        placeholder="Start new chat..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleSearch}
        className="p-2 rounded border border-gray-300 focus:outline-none focus:ring"
      />
      </div>
      {sortedContacts.map(c => {
        const last = c.messages[c.messages.length - 1];
        const unread = c.messages.some(m => !m.fromMe && m.unread);
        return (
          <div className="px-1 py-1 w-full overflow-hidden" key={c.id}>
            <div className="w-full max-w-full overflow-hidden">
            <ListItem 
              description={
                last?.text.length > 55
                ? last.text.slice(0, 52) + '...'
                : last?.text}
              label={
                c.name.startsWith('0x') 
                ? c.name.slice(0, 6) + '...' + c.name.slice(-4) 
                : c.name
              }
              startAdornment={
                <Image
                  src={`https://effigy.im/a/${c.address.slice(-40)}.svg`}
                  alt={c.address}
                  width={48}
                  height={48}
                  className="rounded-full object-cover mr-4"
                />
              }
              endAdornment={
                <div className="flex flex-col items-end gap-1">
                {unread && (
                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                    new
                  </span>
                )}
                <span className=" text-xs text-gray-400 ">
                  {last?.time && formatTime(last.time)}
                </span>
              </div>
              }
            onClick={() => router.push(`/chat/${c.id}`)}
            />
            </div>
          </div>
        );
      })}
    </div>
  );
}
