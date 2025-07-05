'use client';

import { TabItem, Tabs } from '@worldcoin/mini-apps-ui-kit-react';
import { Bank, Home, ChatBubble } from 'iconoir-react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * This component uses the UI Kit to navigate between pages
 * Bottom navigation is the most common navigation pattern in Mini Apps
 * We require mobile first design patterns for mini apps
 * Read More: https://docs.world.org/mini-apps/design/app-guidelines#mobile-first
 */

export const Navigation = () => {

  const pathname = usePathname();
  const router = useRouter();

  // extract tab from pathname: /chat → chat
  const currentTab = pathname.split('/')[1] || 'home';

  const handleTabChange = (val: string) => {
    router.push(`/${val}`);
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="pt-2">
      <TabItem value="home" icon={<Home />} label="Home" />
      <TabItem value="contacts" icon={<ChatBubble />} label="Chat" />
      {/* // TODO: These currently don't link anywhere */}
      <TabItem value="wallet" icon={<Bank />} label="Wallet" />
      {/* <TabItem value="profile" icon={<User />} label="Profile" /> */}
    </Tabs>
  );
};
