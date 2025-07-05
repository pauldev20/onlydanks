// app/contacts/page.tsx
'use client';

import { useChat } from '@/providers/ChatContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ListItem } from '@worldcoin/mini-apps-ui-kit-react';
import { useMemo } from 'react';


export default function ContactsPage() {
  const { contacts } = useChat();
  const router = useRouter();

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
      {sortedContacts.map(c => {
        const last = c.messages[c.messages.length - 1];
        const unread = c.messages.some(m => !m.fromMe && m.unread);
        return (
          <>  
            <div className="p-1 px-1">
            <ListItem 
              description={last?.text}
              label={c.name}
              startAdornment={
                <Image
                  src={`https://effigy.im/a/${c.address.slice(0, 40)}.svg`}
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
                  {last?.time}
                </span>
              </div>
              }
            onClick={() => router.push(`/chat/${c.id}`)}
            />
          </div>
          </>
        );
      })}
    </div>
  );
}
