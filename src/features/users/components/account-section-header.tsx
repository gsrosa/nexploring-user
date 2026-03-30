import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface AccountSectionHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Optional right slot (e.g. primary action) */
  action?: ReactNode;
}

export function AccountSectionHeader({ icon: Icon, title, description, action }: AccountSectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_oklab,var(--atlas-color-primary-500)_18%,transparent)] text-[var(--atlas-color-primary-400)] ring-1 ring-[color-mix(in_oklab,var(--atlas-color-primary-500)_22%,transparent)]"
          aria-hidden
        >
          <Icon className="size-6" strokeWidth={1.75} />
        </div>
        <div>
          <h1 className="mb-1 text-3xl font-semibold tracking-tight text-[var(--atlas-surface-foreground)]">
            {title}
          </h1>
          <p className="text-sm text-[var(--atlas-surface-muted-foreground)]">{description}</p>
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
