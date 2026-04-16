import React from 'react';

import { Toaster } from 'sonner';

import { TravelerProfileFormPage } from '@/features/traveler-profile';
import { AccountLayout } from '@/features/users';
import { TrpcProvider } from '@/providers/trpc-provider';

// ─── MFE root — exposed to the shell via Module Federation ────────────────────

type View =
  | { type: 'account' }
  | { type: 'traveler-profile-form' }
  | { type: 'traveler-settings' };

const resolveView = (): View => {
  const path = window.location.pathname;
  if (/^\/profile\/onboarding\/?$/.test(path)) return { type: 'traveler-profile-form' };
  if (path === '/profile' || /^\/profile\/settings\/?$/.test(path)) return { type: 'traveler-settings' };
  return { type: 'account' };
};

export const App = () => {
  const [view, setView] = React.useState<View>(resolveView);

  React.useEffect(() => {
    const handleNavigation = () => setView(resolveView());

    window.addEventListener('popstate', handleNavigation);

    const originalPush = history.pushState.bind(history);
    const originalReplace = history.replaceState.bind(history);

    history.pushState = (...args) => {
      originalPush(...args);
      handleNavigation();
    };
    history.replaceState = (...args) => {
      originalReplace(...args);
      handleNavigation();
    };

    return () => {
      window.removeEventListener('popstate', handleNavigation);
      history.pushState = originalPush;
      history.replaceState = originalReplace;
    };
  }, []);

  return (
    <TrpcProvider>
      <div className="flex min-h-full w-full min-w-0 flex-col bg-transparent font-sans">
        <div className="flex min-h-0 flex-1 flex-col">
          {view.type === 'traveler-profile-form' && <TravelerProfileFormPage />}
          {view.type === 'traveler-settings' && <AccountLayout initialSection="preferences" />}
          {view.type === 'account' && <AccountLayout />}
        </div>
        <Toaster richColors position="top-center" theme="dark" />
      </div>
    </TrpcProvider>
  );
};
