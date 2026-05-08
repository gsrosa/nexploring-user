import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

import { TrpcProvider } from '@/providers/trpc-provider';

type UserAppFrameProps = {
  children: ReactNode;
};

export function UserAppFrame({ children }: UserAppFrameProps) {
  return (
    <TrpcProvider>
      <div className="flex min-h-full w-full min-w-0 flex-col bg-transparent font-sans">
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        <Toaster richColors position="top-center" theme="dark" />
      </div>
    </TrpcProvider>
  );
}
