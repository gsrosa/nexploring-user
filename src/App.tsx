import { Toaster } from 'sonner';

import { AccountLayout } from './features/users/account-layout';
import { TripDetailPage } from './features/users/components/trip-detail-page';
import { TripsListPage } from './features/users/components/trips-list-page';
import './features/users/styles/account.css';
import { TrpcProvider } from './providers/trpc-provider';

// ─── MFE root — exposed to the shell via Module Federation ────────────────────

type View =
  | { type: 'detail'; tripId: string }
  | { type: 'list' }
  | { type: 'account' };

function resolveView(): View {
  const path = window.location.pathname;
  const idMatch = /^\/trips\/([\w-]+)$/.exec(path);
  if (idMatch?.[1]) return { type: 'detail', tripId: idMatch[1] };
  if (/^\/trips\/?$/.test(path)) return { type: 'list' };
  return { type: 'account' };
}

export default function App() {
  const view = resolveView();

  return (
    <TrpcProvider>
      <div className="flex min-h-full w-full min-w-0 flex-col bg-transparent font-[family-name:var(--atlas-font-sans)]">
        <div className="flex min-h-0 flex-1 flex-col">
          {view.type === 'detail' && <TripDetailPage tripId={view.tripId} />}
          {view.type === 'list' && <TripsListPage />}
          {view.type === 'account' && <AccountLayout />}
        </div>
        <Toaster richColors position="top-center" theme="dark" />
      </div>
    </TrpcProvider>
  );
}
