import dynamic from 'next/dynamic';

import { UserAppFrame } from '@/components/user-app-frame';

const AccountLayout = dynamic(
  () => import('@/features/users').then((mod) => mod.AccountLayout),
  { ssr: false },
);

export default function ProfileRoute() {
  return (
    <UserAppFrame>
      <AccountLayout />
    </UserAppFrame>
  );
}
