// app/chat/[id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useChat } from '@/providers/ChatContext';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ChatPage() {
  const { id } = useParams();
  const { contacts, setContacts } = useChat();
  const contactId = Number(id);

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
        messages: [...c.messages, { fromMe: true, text: input, unread: false }],
      };
    });
    setContacts(updated);
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen">
      {/* profile */}
      {selected && (
      <div className="flex items-center gap-4 px-4 py-3 border-b bg-white shadow-sm">
        <Image
            src={selected.avatar}
            alt={selected.name}
            width={48}
            height={48}
            className="rounded-full object-cover mr-4"
            />
        <span className="font-medium text-lg">{selected.name}</span>
      </div>
    )}
    {/* messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {selected?.messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-xs px-4 py-2 rounded-lg ${
              m.fromMe ? 'ml-auto bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      {/* input */}
      {selected && (
        <div className="p-4 border-t flex gap-2">
          <input
            type="text"
            className="flex-1 border rounded px-3 py-2"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
