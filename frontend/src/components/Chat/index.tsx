'use client';

import { useState } from 'react';

const contactsData = [
  {
    id: 1,
    name: 'Alice',
    messages: [
      { fromMe: false, text: 'hi there', unread: false },
      { fromMe: true, text: 'hey!', unread: false },
    ],
  },
  {
    id: 2,
    name: 'Bob',
    messages: [
      { fromMe: false, text: 'yo', unread: true },
    ],
  },
];

export const Chat = () => {
  const [contacts, setContacts] = useState(contactsData);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [input, setInput] = useState('');

  const selected = contacts.find(c => c.id === selectedId);

  const handleSend = () => {
    if (!selected || input.trim() === '') return;
    const updated = contacts.map(c => {
      if (c.id !== selected.id) return c;
      return {
        ...c,
        messages: [...c.messages, { fromMe: true, text: input, unread: false }],
      };
    });
    setContacts(updated);
    setInput('');
  };

  const handleSelect = (id: number) => {
    const updated = contacts.map(c => {
      if (c.id !== id) return c;
      return {
        ...c,
        messages: c.messages.map(m => ({ ...m, unread: false })),
      };
    });
    setContacts(updated);
    setSelectedId(id);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/3 bg-gray-100 border-r overflow-y-auto">
        {contacts.map(c => {
          const last = c.messages[c.messages.length - 1];
          const unread = c.messages.some(m => !m.fromMe && m.unread);
          return (
            <div
              key={c.id}
              onClick={() => handleSelect(c.id)}
              className={`p-4 border-b cursor-pointer ${
                selectedId === c.id ? 'bg-white' : ''
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold">{c.name}</span>
                {unread && (
                  <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">new</span>
                )}
              </div>
              <div className="text-sm text-gray-600 truncate">
                {last?.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Chat */}
      <div className="flex flex-col w-2/3 h-full">
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {selected ? (
            selected.messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  m.fromMe
                    ? 'ml-auto bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                {m.text}
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center mt-10">Select a chat</div>
          )}
        </div>

        {/* Input */}
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
    </div>
  );
}
