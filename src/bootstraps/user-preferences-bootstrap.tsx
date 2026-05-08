import { Toaster } from 'sonner';

import { UserPreferencesPage } from '@/features/user-preferences';

import { TrpcProvider } from '@/providers/trpc-provider';

import '@/lib/i18n';

const UserPreferencesBootstrap = () => {
  return (
    <TrpcProvider>
      <UserPreferencesPage />
      <Toaster richColors position="top-center" theme="dark" />
    </TrpcProvider>
  );
};

export default UserPreferencesBootstrap;
