import { AtlasProvider } from '@gsrosa/atlas-ui';
import '@gsrosa/atlas-ui/styles';
import { Toaster } from 'sonner';

import { AccountLayout } from './features/users/account-layout';
import './features/users/styles/account.css';

// ─── MFE root — exposed to the shell via Module Federation ────────────────────
// AtlasProvider + design-system CSS are here so the remote works when the shell
// does not wrap this entry with the design system.

export default function App() {
  return (
    <AtlasProvider defaultMode="dark">
      <div className="flex min-h-screen w-full min-w-0 flex-col bg-[var(--atlas-surface-background)] font-[family-name:var(--atlas-font-sans)]">
        <div className="flex min-h-0 flex-1 flex-col">
          <AccountLayout />
        </div>
        <Toaster richColors position="top-center" theme="dark" />
      </div>
    </AtlasProvider>
  );
}
