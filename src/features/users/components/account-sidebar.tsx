import { CreditCardIcon, LockIcon, MapIcon, MenuIcon, SlidersHorizontalIcon, UserIcon } from 'lucide-react';

import type { AccountSectionId } from '../account-section';

const items: { id: AccountSectionId; title: string; icon: typeof UserIcon }[] = [
  { id: 'profile', title: 'Profile', icon: UserIcon },
  { id: 'password', title: 'Password', icon: LockIcon },
  { id: 'payments', title: 'Payments', icon: CreditCardIcon },
  { id: 'plans', title: 'My Plans', icon: MapIcon },
  { id: 'preferences', title: 'Preferences', icon: SlidersHorizontalIcon },
];

interface AccountSidebarProps {
  activeSection: AccountSectionId;
  onSelectSection: (id: AccountSectionId) => void;
  onNavigate?: () => void;
}

export function AccountSidebar({ activeSection, onSelectSection, onNavigate }: AccountSidebarProps) {
  return (
    <aside className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto px-3 py-5 md:h-full md:px-4 md:py-6">
      <p className="mb-3 px-2 text-xs font-medium uppercase tracking-[0.15em] text-[var(--atlas-surface-muted-foreground)]">
        Account
      </p>
      <nav className="flex flex-col gap-1" aria-label="Account sections">
        {items.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectSection(item.id);
                onNavigate?.();
              }}
              aria-current={isActive ? 'page' : undefined}
              className={[
                'flex w-full items-center gap-3 rounded-[var(--atlas-radius-md)] px-3 py-2.5 text-left text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[color-mix(in_oklab,var(--atlas-color-primary-500)_22%,transparent)] text-[var(--atlas-color-primary-400)]'
                  : 'text-[var(--atlas-surface-muted-foreground)] hover:bg-[var(--atlas-surface-container)] hover:text-[var(--atlas-surface-foreground)]',
              ].join(' ')}
            >
              <item.icon className="size-4 shrink-0" aria-hidden />
              {item.title}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

interface AccountMobileBarProps {
  sectionTitle: string;
  onOpenNav: () => void;
}

export function AccountMobileBar({ sectionTitle, onOpenNav }: AccountMobileBarProps) {
  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-[var(--atlas-surface-border)] bg-[var(--atlas-surface-background)] px-3 py-3 md:hidden">
      <button
        type="button"
        onClick={onOpenNav}
        className="flex size-10 shrink-0 items-center justify-center rounded-[var(--atlas-radius-md)] text-[var(--atlas-surface-foreground)] ring-1 ring-[var(--atlas-surface-border)] transition-colors hover:bg-[var(--atlas-surface-container)]"
        aria-label="Open account menu"
      >
        <MenuIcon className="size-5" aria-hidden />
      </button>
      <div className="min-w-0 flex-1 text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--atlas-surface-muted-foreground)]">
          Account
        </p>
        <p className="truncate text-sm font-semibold text-[var(--atlas-surface-foreground)]">
          {sectionTitle}
        </p>
      </div>
      <div className="size-10 shrink-0" aria-hidden />
    </div>
  );
}
