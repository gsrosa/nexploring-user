import React from 'react';

import { NexploringProvider } from '@gsrosa/nexploring-ui';
import { createRoot } from 'react-dom/client';

import { App } from '@/App';
import { PlaywrightRoot } from '@/playwright-root';

import '@/styles/standalone.css';
import '@/lib/i18n';

const root = document.getElementById('root');
if (root) {
  const appTree =
    process.env.NEXT_PUBLIC_PLAYWRIGHT === '1' ? <PlaywrightRoot /> : <App />;

  createRoot(root).render(
    <React.StrictMode>
      <NexploringProvider defaultMode="dark">{appTree}</NexploringProvider>
    </React.StrictMode>,
  );
}
