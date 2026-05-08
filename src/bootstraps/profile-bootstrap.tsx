import { Toaster } from 'sonner';

import { ProfilePage } from '@/features/profile';

import { TrpcProvider } from '@/providers/trpc-provider';

import '@/lib/i18n';

const ProfileBootstrap = () => {
  return (
    <TrpcProvider>
      <ProfilePage />
      <Toaster richColors position="top-center" theme="dark" />
    </TrpcProvider>
  );
};

export default ProfileBootstrap;
