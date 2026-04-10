import { SlidersHorizontalIcon } from 'lucide-react';

import { AccountSectionHeader } from './account-section-header';

export function PreferencesPage() {
  return (
    <div className="account-fade-in-up space-y-10">
      <AccountSectionHeader
        icon={SlidersHorizontalIcon}
        title="Travel preferences"
        description="Help us personalize your experience — coming soon"
      />

      <div className="rounded-2xl border border-[var(--atlas-surface-border)] bg-[var(--atlas-surface-container)] px-6 py-12 text-center sm:px-10">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-[color-mix(in_oklab,var(--atlas-color-primary-500)_18%,transparent)] text-[var(--atlas-color-primary-400)] ring-1 ring-[color-mix(in_oklab,var(--atlas-color-primary-500)_22%,transparent)]">
          <SlidersHorizontalIcon className="size-9" strokeWidth={1.25} aria-hidden />
        </div>
        <p className="text-lg font-semibold text-[var(--atlas-surface-foreground)]">
          Preferences form coming soon
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--atlas-surface-muted-foreground)]">
          This section will let you define your travel style, pace, budget range, and more to generate
          highly personalized plans.
        </p>
      </div>
    </div>
  );
}
