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
      const newChatId = await startNewChat(ens); // create or retrieve chat ID
      setSearch('');
      if (newChatId) router.push(`/chat/${newChatId}`);
    }
  };

  const sortedContacts = useMemo(() => {
    return [...contacts].sort((a, b) => {
      const aUnread = a.messages.some((m) => !m.fromMe && m.unread);
      const bUnread = b.messages.some((m) => !m.fromMe && m.unread);
  
      if (aUnread && !bUnread) return -1;
      if (!aUnread && bUnread) return 1;
  
      // fallback: sort by message index (most recent activity)
      return b.messages.length - a.messages.length;
    });
  }, [contacts]);

  return (

    <div className="h-screen overflow-y-auto ">
        <div className="flex flex-col p-4 space-y-2">
      <input
        type="text"
        placeholder="Search ENS name..."
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
            <div className="p-1 px-1" key={c.id}>
            <ListItem 
              description={last?.text}
              label={c.name}
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
        );
      })}
    </div>
  );
}
