import dynamic from 'next/dynamic';

import { UserAppFrame } from '@/components/user-app-frame';

const PasswordPage = dynamic(
  () => import('@/features/password').then((mod) => mod.PasswordPage),
  { ssr: false },
);

export default function ProfilePasswordRoute() {
  return (
    <UserAppFrame>
      <PasswordPage />
    </UserAppFrame>
  );
}
