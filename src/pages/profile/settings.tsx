import dynamic from 'next/dynamic';

import { UserAppFrame } from '@/components/user-app-frame';

const AccountLayout = dynamic(
  () => import('@/features/users').then((mod) => mod.AccountLayout),
  { ssr: false },
);

export default function ProfileSettingsRoute() {
  return (
    <UserAppFrame>
      <AccountLayout initialSection="preferences" />
    </UserAppFrame>
  );
}
