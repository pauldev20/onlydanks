// app/chat/layout.tsx
'use client';

import { ReactNode } from 'react';
import ContactsPage from './contacts'; // import directly
import clsx from 'clsx';

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="basis-full sm:basis-1/3 shrink-0 border-r border-gray-200">
        <ContactsPage />
      </div>
      <div className={clsx('flex-1 md:block w-2/3')}>
        {children}
      </div>
    </div>
  );
}
