import { Toaster } from 'sonner';

import { AccountLayout } from './features/users/account-layout';
import './features/users/styles/account.css';

// ─── MFE root — exposed to the shell via Module Federation ────────────────────
// Standalone dev: main.tsx loads atlas-ui tokens + one Tailwind v4 pass (app.css).
// When embedded in the shell, the host still provides AtlasProvider; avoid a second provider if you merge trees.

export default function App() {
  return (
    <div className="flex min-h-full w-full min-w-0 flex-col bg-transparent font-[family-name:var(--atlas-font-sans)]">
      <div className="flex min-h-0 flex-1 flex-col">
        <AccountLayout />
      </div>
      <Toaster richColors position="top-center" theme="dark" />
    </div>
  );
}
