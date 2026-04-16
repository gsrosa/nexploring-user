import { AtlasProvider } from '@gsrosa/atlas-ui';
import '@/styles/standalone.css';
import React from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/App';
import { PlaywrightRoot } from '@/playwright-root';

const root = document.getElementById('root');
if (root) {
  const appTree =
    import.meta.env.VITE_PLAYWRIGHT === '1' ? <PlaywrightRoot /> : <App />;

  createRoot(root).render(
    <React.StrictMode>
      <AtlasProvider defaultMode="dark">{appTree}</AtlasProvider>
    </React.StrictMode>,
  );
}
