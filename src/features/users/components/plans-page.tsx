import { CalendarIcon, ChevronRightIcon, MapIcon, MapPinIcon, PlusIcon } from 'lucide-react';
import { Button } from '@gsrosa/atlas-ui';

import { trpc } from '@/lib/trpc';

import { AccountSectionHeader } from './account-section-header';

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function PlansPage() {
  const { data, isLoading, error } = trpc.plans.list.useQuery({ limit: 50 });
  const plans = data?.plans;

  function handleNewPlan() {
    window.location.assign('/assistant');
  }

  function handleOpenPlan(id: string) {
    window.location.assign(`/my-trips/${id}`);
  }

  return (
    <div className="account-fade-in-up space-y-10">
      <AccountSectionHeader
        icon={MapIcon}
        title="My plans"
        description="Your generated travel itineraries"
        action={
          <Button
            type="button"
            variant="primary"
            className="gap-2 rounded-full font-semibold"
            onClick={handleNewPlan}
          >
            <PlusIcon className="size-4" aria-hidden />
            New plan
          </Button>
        }
      />

      {isLoading && (
        <ul className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <li
              key={i}
              className="h-20 animate-pulse rounded-xl bg-[var(--atlas-surface-container)]"
            />
          ))}
        </ul>
      )}

      {error && (
        <p className="text-sm text-red-500">Failed to load plans. Please try again.</p>
      )}

      {!isLoading && !error && plans?.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <MapPinIcon
            className="size-10 text-[var(--atlas-surface-muted-foreground)] opacity-40"
            strokeWidth={1.25}
            aria-hidden
          />
          <p className="text-sm text-[var(--atlas-surface-muted-foreground)]">
            No plans yet. Generate your first trip!
          </p>
          <button
            type="button"
            onClick={handleNewPlan}
            className="text-sm font-medium text-[var(--atlas-color-primary-400)] hover:underline"
          >
            Plan a trip →
          </button>
        </div>
      )}

      {!isLoading && !error && plans && plans.length > 0 && (
        <ul className="space-y-3">
          {plans.map((plan) => {
            const displayName =
              plan.title ?? plan.ai_suggested_title ?? plan.destination ?? 'Untitled trip';
            const subtitle = plan.title && plan.destination ? plan.destination : null;

            return (
              <li key={plan.id}>
                <button
                  type="button"
                  className="group flex w-full items-center justify-between gap-4 rounded-xl border border-[var(--atlas-surface-border)] bg-[var(--atlas-surface-background)] p-5 text-left transition-colors hover:bg-[var(--atlas-surface-container-high)]"
                  onClick={() => handleOpenPlan(plan.id)}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--atlas-color-primary-300),var(--atlas-color-primary-500))] text-[var(--atlas-color-neutral-700)] shadow-[var(--atlas-shadow-sm)]">
                      <MapPinIcon className="size-5" strokeWidth={1.75} aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[var(--atlas-surface-foreground)]">
                        {displayName}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                        {subtitle && (
                          <span className="truncate text-xs text-[var(--atlas-surface-muted-foreground)]">
                            {subtitle}
                          </span>
                        )}
                        {plan.departure_at && (
                          <span className="flex items-center gap-1 text-xs text-[var(--atlas-surface-muted-foreground)]">
                            <CalendarIcon className="size-3 shrink-0" aria-hidden />
                            {formatDate(plan.departure_at)}
                          </span>
                        )}
                        {plan.days_count && (
                          <span className="text-xs text-[var(--atlas-surface-muted-foreground)]">
                            {plan.days_count} days
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRightIcon
                    className="size-4 shrink-0 text-[var(--atlas-surface-muted-foreground)] transition-colors group-hover:text-[var(--atlas-color-primary-400)]"
                    aria-hidden
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
