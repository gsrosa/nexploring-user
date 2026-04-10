import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import type { ReactNode } from 'react';
import { useState } from 'react';
import superjson from 'superjson';

import { getApiUrl } from '@/lib/env';
import { trpc } from '@/lib/trpc';

type TrpcProviderProps = { children: ReactNode };

export function TrpcProvider({ children }: TrpcProviderProps) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getApiUrl()}/trpc`,
          transformer: superjson,
          fetch: (url, options) => fetch(url, { ...options, credentials: 'include' }),
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
