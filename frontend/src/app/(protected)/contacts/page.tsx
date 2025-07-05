// app/contacts/page.tsx
'use client';

import { useChat } from '@/providers/ChatContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ContactsPage() {
  const { contacts } = useChat();
  const router = useRouter();

  return (
    <div className="h-screen overflow-y-auto">
      {contacts.map(c => {
        const last = c.messages[c.messages.length - 1];
        const unread = c.messages.some(m => !m.fromMe && m.unread);
        return (
          <div
            key={c.id}
            onClick={() => router.push(`/chat/${c.id}`)}
            className="p-3 px-5 flex gap-4 items-center border-b cursor-pointer hover:bg-gray-50"
          >
            <Image
            src={c.avatar}
            alt={c.name}
            width={48}
            height={48}
            className="rounded-full object-cover mr-4"
            />
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-[16px]">{c.name}</span>
              {unread && (
                <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">new</span>
              )}
            </div>
            <div className="text-sm text-gray-600 truncate">{last?.text}</div>
          </div>
          </div>
        );
      })}
    </div>
  );
}
