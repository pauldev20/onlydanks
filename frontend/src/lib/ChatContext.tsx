// lib/ChatContext.tsx
'use client';

import { createContext, useContext, useState } from 'react';

interface Message {
  fromMe: boolean;
  text: string;
  unread: boolean;
}

interface Contact {
  id: number;
  name: string;
  messages: Message[];
}

interface ChatContextType {
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
}

const initialData = [
  { id: 1, name: 'Alice', messages: [ { fromMe: false, text: 'hi there', unread: false }, { fromMe: true, text: 'hey!', unread: false } ] },
  { id: 2, name: 'Bob', messages: [ { fromMe: false, text: 'yo', unread: true } ] },
];

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [contacts, setContacts] = useState(initialData);
  return (
    <ChatContext.Provider value={{ contacts, setContacts }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
