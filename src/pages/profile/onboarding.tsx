import dynamic from 'next/dynamic';

import { UserAppFrame } from '@/components/user-app-frame';

const UserPreferencesFormPage = dynamic(
  () =>
    import('@/features/user-preferences').then(
      (mod) => mod.UserPreferencesFormPage,
    ),
  { ssr: false },
);

export default function ProfileOnboardingRoute() {
  return (
    <UserAppFrame>
      <UserPreferencesFormPage />
    </UserAppFrame>
  );
}
