import { PencilIcon } from "lucide-react";
import { Button, cn } from "@gsrosa/atlas-ui";

import { trpc } from "@/lib/trpc";

import { TIER1_STEPS } from "./tier1-data";
import type { Tier1Step } from "./tier1-data";

// ─── Shared types ─────────────────────────────────────────────────────────────

type StepValueProps = {
  step: Tier1Step;
  prefs: Record<string, unknown>;
};

// ─── Value display atoms ──────────────────────────────────────────────────────

const Unset = () => (
  <span className="text-xs italic text-(--atlas-surface-muted-foreground)">—</span>
);

const SingleChip = ({ step, prefs }: StepValueProps) => {
  const raw = prefs[step.field];
  if (typeof raw !== "string") return <Unset />;
  const opt = step.options?.find((o) => o.value === raw);
  if (!opt) return <Unset />;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-(--atlas-surface-border) bg-(--atlas-surface-container) px-2.5 py-1 text-sm font-medium text-(--atlas-surface-foreground)">
      {opt.emoji && <span className="text-base leading-none">{opt.emoji}</span>}
      {opt.label}
    </span>
  );
};

const ScaleDots = ({ step, prefs }: StepValueProps) => {
  const raw = prefs[step.field];
  if (typeof raw !== "number") return <Unset />;
  return (
    <span className="inline-flex items-center gap-1">
      {([1, 2, 3, 4, 5] as const).map((n) => (
        <span
          key={n}
          className={cn(
            "size-2.5 rounded-full",
            n <= raw ? "bg-(--atlas-color-primary-500)" : "bg-(--atlas-surface-border)",
          )}
        />
      ))}
      <span className="ml-1.5 text-xs text-(--atlas-surface-muted-foreground)">{raw}/5</span>
    </span>
  );
};

const BoolBadge = ({ step, prefs }: StepValueProps) => {
  const raw = prefs[step.field];
  if (typeof raw !== "boolean") return <Unset />;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        raw
          ? "bg-[color-mix(in_oklab,var(--atlas-color-primary-500)_12%,transparent)] text-(--atlas-color-primary-500)"
          : "bg-(--atlas-surface-container) text-(--atlas-surface-muted-foreground)",
      )}
    >
      {raw ? "Yes" : "No"}
    </span>
  );
};

const MultiChips = ({ step, prefs }: StepValueProps) => {
  const raw = prefs[step.field];
  const selected = Array.isArray(raw) ? (raw as string[]) : [];
  if (selected.length === 0) return <Unset />;
  const SHOW = 5;
  const visible = selected.slice(0, SHOW);
  const rest = selected.length - SHOW;
  return (
    <span className="flex flex-wrap gap-1">
      {visible.map((val) => {
        const opt = step.options?.find((o) => o.value === val);
        return (
          <span
            key={val}
            className="inline-flex items-center gap-1 rounded-full bg-(--atlas-surface-container) px-2 py-0.5 text-xs font-medium text-(--atlas-surface-foreground)"
          >
            {opt?.emoji && <span className="leading-none">{opt.emoji}</span>}
            {opt?.label ?? val}
          </span>
        );
      })}
      {rest > 0 && (
        <span className="inline-flex items-center rounded-full bg-(--atlas-surface-container) px-2 py-0.5 text-xs text-(--atlas-surface-muted-foreground)">
          +{rest} more
        </span>
      )}
    </span>
  );
};

const FieldValue = ({ step, prefs }: StepValueProps) => {
  if (step.type === "single") return <SingleChip step={step} prefs={prefs} />;
  if (step.type === "scale" || step.type === "discrete-slider")
    return <ScaleDots step={step} prefs={prefs} />;
  if (step.type === "toggle") return <BoolBadge step={step} prefs={prefs} />;
  if (step.type === "multi") return <MultiChips step={step} prefs={prefs} />;
  return <Unset />;
};

// ─── Section grouping (module-level, no side-effects) ─────────────────────────

const buildSections = (): Map<string, Tier1Step[]> => {
  const map = new Map<string, Tier1Step[]>();
  for (const step of TIER1_STEPS) {
    const existing = map.get(step.sectionTitle);
    if (existing) {
      existing.push(step);
    } else {
      map.set(step.sectionTitle, [step]);
    }
  }
  return map;
};

const SECTIONS = buildSections();

// ─── Page ─────────────────────────────────────────────────────────────────────

export const TravelerProfileSettingsPage = () => {
  const { data, isLoading } = trpc.travelerProfile.get.useQuery();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-(--atlas-surface-muted-foreground)">
        Loading…
      </div>
    );
  }

  const prefs = (data?.preferences ?? {}) as Record<string, unknown>;
  const hasAny = TIER1_STEPS.some(
    (s) => prefs[s.field] !== undefined && prefs[s.field] !== null,
  );

  return (
    <div className="account-fade-in-up space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-(--atlas-surface-foreground) sm:text-xl">
            Travel preferences
          </h1>
          <p className="mt-1 text-sm text-(--atlas-surface-muted-foreground)">
            Atlas uses these to personalise every trip plan to your style.
          </p>
        </div>
        <Button variant="secondary" size="sm" className="shrink-0" asChild>
          <a href="/profile/onboarding" className="inline-flex items-center gap-1.5 no-underline">
            <PencilIcon aria-hidden size={13} strokeWidth={2} />
            Edit
          </a>
        </Button>
      </div>

      {!hasAny && (
        <div className="rounded-2xl border border-(--atlas-surface-border) bg-(--atlas-surface-container-low) px-5 py-10 text-center">
          <p className="text-sm text-(--atlas-surface-muted-foreground)">No preferences saved yet.</p>
          <Button variant="primary" size="md" className="mt-4" asChild>
            <a href="/profile/onboarding" className="no-underline">
              Start quick setup
            </a>
          </Button>
        </div>
      )}

      {hasAny && (
        <div className="space-y-4">
          {Array.from(SECTIONS.entries()).map(([sectionTitle, steps]) => {
            const filled = steps.filter(
              (s) => prefs[s.field] !== undefined && prefs[s.field] !== null,
            );
            if (filled.length === 0) return null;
            return (
              <section
                key={sectionTitle}
                className="rounded-2xl border border-(--atlas-surface-border) bg-(--atlas-surface-container-low) px-5 py-4 sm:px-6"
              >
                <h2 className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-(--atlas-color-primary-500)">
                  {sectionTitle}
                </h2>
                <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {filled.map((step) => (
                    <div
                      key={step.field}
                      className="flex min-w-0 items-center justify-between gap-3"
                    >
                      <span className="shrink-0 text-xs text-(--atlas-surface-muted-foreground)">
                        {step.shortLabel}
                      </span>
                      <span className="flex min-w-0 flex-1 justify-end">
                        <FieldValue step={step} prefs={prefs} />
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
