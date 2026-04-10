import { TripStatBar } from '@gsrosa/atlas-ui';
import { ChevronRightIcon, MapPinIcon, PlusIcon } from 'lucide-react';

import { trpc } from '@/lib/trpc';

import { AccountShell } from './account-shell';

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function parsePlanStats(itinerary: Record<string, unknown>) {
  const days = Array.isArray(itinerary.days)
    ? (itinerary.days as Array<Record<string, unknown>>)
    : [];

  const cities = [
    ...new Set(
      days
        .map((d) => (typeof d.city === 'string' ? d.city : null))
        .filter((c): c is string => c !== null),
    ),
  ];

  const totalCostUsd = days.reduce((total, day) => {
    const attractions = Array.isArray(day.attractions)
      ? (day.attractions as Array<{ price?: { amount: number } }>)
      : [];
    return (
      total +
      attractions.reduce((sum, a) => sum + (a.price?.amount ?? 0), 0)
    );
  }, 0);

  const weather = itinerary.weather as
    | { temperatureRangeCelsius?: string }
    | undefined;

  return {
    cities,
    totalCostUsd,
    tempRange: weather?.temperatureRangeCelsius ?? null,
  };
}

export function TripsListPage() {
  const { data, isLoading, error } = trpc.plans.list.useQuery({ limit: 50 });
  const plans = data?.plans;

  return (
    <AccountShell>
      <div className="account-fade-in-up mx-auto w-full max-w-2xl space-y-8 px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[var(--atlas-surface-foreground)]">
            My plans
          </h1>
          <button
            type="button"
            onClick={() => window.location.assign('/assistant')}
            className="flex items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,var(--atlas-color-primary-300),var(--atlas-color-primary-500))] px-4 py-2 text-sm font-semibold text-[var(--atlas-color-neutral-700)] transition-opacity hover:opacity-90"
          >
            <PlusIcon className="size-4" aria-hidden />
            New plan
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <ul className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <li
                key={i}
                className="h-24 animate-pulse rounded-2xl bg-[var(--atlas-surface-container)]"
              />
            ))}
          </ul>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500">
            Failed to load plans. Please try again.
          </p>
        )}

        {/* Empty */}
        {!isLoading && !error && plans?.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-[var(--atlas-surface-container)]">
              <MapPinIcon
                className="size-8 text-[var(--atlas-surface-muted-foreground)] opacity-40"
                strokeWidth={1.25}
                aria-hidden
              />
            </div>
            <div className="space-y-1">
              <p className="font-medium text-[var(--atlas-surface-foreground)]">
                No plans yet
              </p>
              <p className="text-sm text-[var(--atlas-surface-muted-foreground)]">
                Generate your first AI-powered trip itinerary
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.location.assign('/assistant')}
              className="rounded-full bg-[linear-gradient(135deg,var(--atlas-color-primary-300),var(--atlas-color-primary-500))] px-5 py-2 text-sm font-semibold text-[var(--atlas-color-neutral-700)] transition-opacity hover:opacity-90"
            >
              Plan a trip
            </button>
          </div>
        )}

        {/* Plan list */}
        {!isLoading && !error && plans && plans.length > 0 && (
          <ul className="space-y-3">
            {plans.map((plan) => {
              const itinerary = plan.itinerary as Record<string, unknown>;
              const { cities, totalCostUsd, tempRange } = parsePlanStats(itinerary);
              const displayName =
                plan.title ??
                plan.ai_suggested_title ??
                plan.destination ??
                'Untitled trip';
              const subtitle =
                plan.title && plan.destination ? plan.destination : null;
              const departureLabel = formatDate(plan.departure_at);

              return (
                <li key={plan.id}>
                  <button
                    type="button"
                    onClick={() => window.location.assign(`/trips/${plan.id}`)}
                    className="group flex w-full items-center gap-4 rounded-2xl border border-[var(--atlas-surface-border)] bg-[var(--atlas-surface-background)] p-5 text-left transition-colors hover:bg-[var(--atlas-surface-container-high)]"
                  >
                    {/* Icon */}
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--atlas-color-primary-300),var(--atlas-color-primary-500))] text-[var(--atlas-color-neutral-700)] shadow-[var(--atlas-shadow-sm)]">
                      <MapPinIcon className="size-5" strokeWidth={1.75} aria-hidden />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1 space-y-2">
                      <div>
                        <p className="truncate font-semibold text-[var(--atlas-surface-foreground)]">
                          {displayName}
                        </p>
                        {subtitle && (
                          <p className="truncate text-xs text-[var(--atlas-surface-muted-foreground)]">
                            {subtitle}
                          </p>
                        )}
                        {departureLabel && (
                          <p className="text-xs text-[var(--atlas-surface-muted-foreground)]">
                            {departureLabel}
                          </p>
                        )}
                      </div>
                      <TripStatBar
                        daysCount={plan.days_count}
                        cities={cities}
                        totalCostUsd={totalCostUsd}
                        tempRange={tempRange}
                      />
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
    </AccountShell>
  );
}
