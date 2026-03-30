import { Button } from '@gsrosa/atlas-ui';
import { CreditCardIcon, PlusIcon, SparklesIcon } from 'lucide-react';
import { toast } from 'sonner';

import { AccountSectionHeader } from '../components/account-section-header';

const MOCK_CREDITS = 12;

const MOCK_TRANSACTIONS = [
  {
    id: '1',
    date: '2026-03-25',
    description: '10 Credits Pack',
    amount: '$9.99',
    credits: 10,
    type: 'purchase' as const,
  },
  {
    id: '2',
    date: '2026-03-20',
    description: 'Plan Generated — Kyoto, Japan',
    amount: '',
    credits: -2,
    type: 'usage' as const,
  },
  {
    id: '3',
    date: '2026-03-18',
    description: 'Plan Edited — Kyoto, Japan',
    amount: '',
    credits: -1,
    type: 'usage' as const,
  },
  {
    id: '4',
    date: '2026-03-10',
    description: 'Welcome Bonus',
    amount: 'Free',
    credits: 5,
    type: 'bonus' as const,
  },
];

export function PaymentsPage() {
  const handleBuyCredits = () => {
    toast.message('Credit purchase will connect to checkout when ready.');
  };

  return (
    <div className="account-fade-in-up space-y-10">
      <AccountSectionHeader
        icon={CreditCardIcon}
        title="Payments & credits"
        description="Manage your credits and view transaction history"
      />

      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--atlas-surface-border)] bg-[var(--atlas-surface-container)] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--atlas-color-primary-300),var(--atlas-color-primary-500))] text-[var(--atlas-color-neutral-700)] shadow-[var(--atlas-shadow-md)]">
            <SparklesIcon className="size-5" strokeWidth={1.75} aria-hidden />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--atlas-surface-muted-foreground)]">
              Available credits
            </p>
            <p className="text-3xl font-bold tabular-nums text-[var(--atlas-surface-foreground)]">
              {MOCK_CREDITS}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="primary"
          className="w-full shrink-0 gap-2 rounded-full font-semibold sm:w-auto"
          onClick={handleBuyCredits}
        >
          <PlusIcon className="size-4" aria-hidden />
          Buy credits
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--atlas-surface-foreground)]">
          Transaction history
        </h2>
        <ul className="space-y-3">
          {MOCK_TRANSACTIONS.map((tx) => (
            <li
              key={tx.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-[var(--atlas-surface-border)] bg-[var(--atlas-surface-background)] p-4 transition-colors hover:bg-[var(--atlas-surface-container-high)]"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div
                  className={[
                    'flex size-9 shrink-0 items-center justify-center rounded-full',
                    tx.type === 'purchase'
                      ? 'bg-[color-mix(in_oklab,var(--atlas-color-auxiliary-500)_14%,transparent)] text-[var(--atlas-color-auxiliary-500)]'
                      : tx.type === 'bonus'
                        ? 'bg-[color-mix(in_oklab,var(--atlas-color-primary-500)_18%,transparent)] text-[var(--atlas-color-primary-500)]'
                        : 'bg-[var(--atlas-surface-container-highest)] text-[var(--atlas-surface-muted-foreground)]',
                  ].join(' ')}
                >
                  <CreditCardIcon className="size-4" strokeWidth={1.75} aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--atlas-surface-foreground)]">
                    {tx.description}
                  </p>
                  <p className="text-xs text-[var(--atlas-surface-muted-foreground)]">{tx.date}</p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                {tx.amount ? (
                  <p className="text-sm font-medium text-[var(--atlas-surface-foreground)]">{tx.amount}</p>
                ) : null}
                <p
                  className={
                    tx.credits > 0
                      ? 'text-xs font-bold text-[var(--atlas-color-auxiliary-400)]'
                      : 'text-xs font-bold text-[var(--atlas-color-primary-400)]'
                  }
                >
                  {tx.credits > 0 ? `+${tx.credits}` : tx.credits} credits
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
