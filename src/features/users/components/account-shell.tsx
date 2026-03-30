import type { ReactNode } from 'react';

interface AccountShellProps {
  children: ReactNode;
}

export function AccountShell({ children }: AccountShellProps) {
  return (
    <div className="account-user-root relative flex min-h-[calc(100dvh-60px)] w-full min-w-0 flex-col overflow-hidden bg-[var(--atlas-surface-background)] text-[var(--atlas-surface-foreground)] md:min-h-screen">
      <div
        className="stitch-aurora pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[min(52vh,480px)]"
        aria-hidden
      />
      <div className="relative z-[1] flex min-h-[calc(100dvh-60px)] w-full min-w-0 flex-1 flex-col md:min-h-screen">
        {children}
      </div>
    </div>
  );
}
