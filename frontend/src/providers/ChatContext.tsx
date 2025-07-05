// lib/ChatContext.tsx
'use client';

import { createContext, useContext, useState } from 'react';

interface Message {
  fromMe: boolean;
  text: string;
  unread: boolean;
  time: string;
}

interface Contact {
  id: number;
  name: string;
  avatar: string;
  address: string;
  messages: Message[];
}

interface ChatContextType {
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
}

const initialData = [
  { id: 1, 
    name: 'Patrick',
    avatar: '/avatar.png',
    address: '0x1234567890',
    messages: [ { fromMe: false, text: 'hi there', unread: false, time: '12:00' }, { fromMe: true, text: 'hey!', unread: false, time: '12:01' } ] },
  { id: 2, name: 'Paul',
    avatar: '/avatar.png', 
    address: '0x1234567890',
    messages: [ { fromMe: false, text: 'yo', unread: true, time: '12:02' } ] },
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
