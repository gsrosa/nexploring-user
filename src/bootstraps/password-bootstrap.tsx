import { Toaster } from 'sonner';

import { PasswordPage } from '@/features/password';

import { TrpcProvider } from '@/providers/trpc-provider';

import '@/lib/i18n';

const PasswordBootstrap = () => {
  return (
    <TrpcProvider>
      <PasswordPage />
      <Toaster richColors position="top-center" theme="dark" />
    </TrpcProvider>
  );
};

export default PasswordBootstrap;
