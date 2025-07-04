// app/contacts/page.tsx
'use client';

import { useChat } from '@/lib/ChatContext';
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
            className="p-4 border-b cursor-pointer hover:bg-gray-50"
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold">{c.name}</span>
              {unread && (
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">new</span>
              )}
            </div>
            <div className="text-sm text-gray-600 truncate">{last?.text}</div>
          </div>
        );
      })}
    </div>
  );
}
