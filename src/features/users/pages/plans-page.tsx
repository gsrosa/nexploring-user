import { Button } from '@gsrosa/atlas-ui';
import { CalendarIcon, ChevronRightIcon, MapIcon, MapPinIcon, PlusIcon } from 'lucide-react';
import { toast } from 'sonner';

import { AccountSectionHeader } from '../components/account-section-header';

const MOCK_PLANS = [
  {
    id: '1',
    destination: 'Kyoto, Japan',
    date: 'Mar 25, 2026',
    days: 3,
    status: 'completed' as const,
  },
  {
    id: '2',
    destination: 'Patagonia, Argentina',
    date: 'Feb 14, 2026',
    days: 5,
    status: 'completed' as const,
  },
  {
    id: '3',
    destination: 'Reykjavik, Iceland',
    date: 'Jan 8, 2026',
    days: 4,
    status: 'draft' as const,
  },
];

const statusClass: Record<(typeof MOCK_PLANS)[number]['status'], string> = {
  completed:
    'bg-[color-mix(in_oklab,var(--atlas-color-auxiliary-500)_14%,transparent)] text-[var(--atlas-color-auxiliary-500)]',
  draft: 'bg-[var(--atlas-surface-container-highest)] text-[var(--atlas-surface-muted-foreground)]',
};

export function PlansPage() {
  const handleNewPlan = () => {
    toast.message('Plan creation will open from the main app when connected.');
  };

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

      <ul className="space-y-3">
        {MOCK_PLANS.map((plan) => (
          <li key={plan.id}>
            <button
              type="button"
              className="group flex w-full items-center justify-between gap-4 rounded-xl border border-[var(--atlas-surface-border)] bg-[var(--atlas-surface-background)] p-5 text-left transition-colors hover:bg-[var(--atlas-surface-container-high)]"
              onClick={() => toast.message('Plan detail will open when connected.')}
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--atlas-color-primary-300),var(--atlas-color-primary-500))] text-[var(--atlas-color-neutral-700)] shadow-[var(--atlas-shadow-sm)]">
                  <MapPinIcon className="size-5" strokeWidth={1.75} aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-[var(--atlas-surface-foreground)]">{plan.destination}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="flex items-center gap-1 text-xs text-[var(--atlas-surface-muted-foreground)]">
                      <CalendarIcon className="size-3 shrink-0" aria-hidden />
                      {plan.date}
                    </span>
                    <span className="text-xs text-[var(--atlas-surface-muted-foreground)]">
                      {plan.days} days
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusClass[plan.status]}`}
                    >
                      {plan.status}
                    </span>
                  </div>
                </div>
              </div>
              <ChevronRightIcon
                className="size-4 shrink-0 text-[var(--atlas-surface-muted-foreground)] transition-colors group-hover:text-[var(--atlas-color-primary-400)]"
                aria-hidden
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
