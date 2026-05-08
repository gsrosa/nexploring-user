import type { AppProps } from 'next/app';

import { NexploringProvider } from '@gsrosa/nexploring-ui';

import '@gsrosa/nexploring-ui/styles/base';
import '@/lib/i18n';

export default function UserNextApp({ Component, pageProps }: AppProps) {
  return (
    <NexploringProvider defaultMode="dark">
      <Component {...pageProps} />
    </NexploringProvider>
  );
}
