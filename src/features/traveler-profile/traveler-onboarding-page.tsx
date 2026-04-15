import { useEffect, useState } from 'react';

import { CheckIcon, ChevronRightIcon, CompassIcon } from 'lucide-react';
import { Button, cn } from '@gsrosa/atlas-ui';
import { TRPCClientError } from '@trpc/client';
import { toast } from 'sonner';

import type { RouterInputs } from 'atlas-bff/trpc';
import { trpc } from '@/lib/trpc';

import { TIER1_SECTIONS, TIER1_STEPS } from './tier1-data';
import type { Tier1Step } from './tier1-data';
import { clearDraft, loadDraft, saveDraft } from './onboarding/draft-storage';
import type { OnboardingDraft } from './onboarding/draft-storage';

type PatchInput = RouterInputs["travelerProfile"]["patch"];

// ─── Grouped sections ─────────────────────────────────────────────────────────

const GROUPED = TIER1_SECTIONS.map((sec) => ({
  ...sec,
  steps: TIER1_STEPS.filter((s) => s.sectionIndex === sec.index),
}));

// ─── ChipSelect ───────────────────────────────────────────────────────────────

type ChipOption = {
  value: string;
  label: string;
  emoji?: string;
  description?: string;
};

type ChipSelectProps = {
  options: ChipOption[];
  selected: string[];
  onToggle: (value: string) => void;
};

const ChipSelect = ({ options, selected, onToggle }: ChipSelectProps) => (
  <div
    className={cn(
      "grid gap-3",
      options.length <= 4 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-3",
    )}
  >
    {options.map((opt) => {
      const active = selected.includes(opt.value);
      return (
        <button
          key={opt.value}
          type="button"
          onClick={() => onToggle(opt.value)}
          className={cn(
            "group relative flex items-start gap-3 rounded-2xl p-4 text-left transition-all duration-300",
            "min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--atlas-color-primary-400)",
            active
              ? "bg-[color-mix(in_oklab,var(--atlas-color-primary-500)_10%,transparent)] ring-1 ring-(--atlas-color-primary-500)/40"
              : "bg-(--atlas-surface-container-low) shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] hover:bg-(--atlas-surface-container)",
          )}
        >
          <span
            className={cn(
              "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300",
              active
                ? "border-(--atlas-color-primary-500) bg-(--atlas-color-primary-500)"
                : "border-(--atlas-surface-muted-foreground)/30",
            )}
          >
            {active && <CheckIcon aria-hidden size={10} strokeWidth={3} className="text-white" />}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {opt.emoji && <span className="shrink-0 text-lg leading-none">{opt.emoji}</span>}
              <span
                className={cn(
                  "font-sans text-sm font-semibold transition-colors",
                  active
                    ? "text-(--atlas-surface-foreground)"
                    : "text-(--atlas-surface-muted-foreground) group-hover:text-(--atlas-surface-foreground)",
                )}
              >
                {opt.label}
              </span>
            </div>
            {opt.description && (
              <p className="mt-1 pl-7 text-xs text-(--atlas-surface-muted-foreground)">
                {opt.description}
              </p>
            )}
          </div>
        </button>
      );
    })}
  </div>
);

// ─── ScaleInput ───────────────────────────────────────────────────────────────

type ScaleInputProps = {
  value: number | undefined;
  minLabel?: string;
  maxLabel?: string;
  onChange: (n: number) => void;
};

const ScaleInput = ({ value, minLabel, maxLabel, onChange }: ScaleInputProps) => (
  <div className="space-y-5">
    <div className="flex items-center justify-between font-sans text-xs text-(--atlas-surface-muted-foreground)">
      <span>{minLabel}</span>
      <span>{maxLabel}</span>
    </div>
    <div className="flex items-center justify-center gap-3">
      {([1, 2, 3, 4, 5] as const).map((n) => {
        const sel = value === n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-pressed={sel}
            className={cn(
              "flex size-10 items-center justify-center rounded-xl font-sans text-sm font-bold transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--atlas-color-primary-400)",
              sel
                ? "scale-110 bg-(--atlas-color-primary-500) text-white shadow-[0_4px_12px_rgba(255,87,34,0.35)]"
                : "bg-(--atlas-surface-container-low) text-(--atlas-surface-muted-foreground) shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] hover:scale-105 hover:text-(--atlas-surface-foreground) active:scale-95",
            )}
          >
            {n}
          </button>
        );
      })}
    </div>
  </div>
);

// ─── Toggle options (boolean) ─────────────────────────────────────────────────

const TOGGLE_OPTIONS: ChipOption[] = [
  { value: "true", label: "Yes", emoji: "✅" },
  { value: "false", label: "No", emoji: "🚫" },
];

// ─── QuestionBlock ────────────────────────────────────────────────────────────

type QuestionBlockProps = {
  step: Tier1Step;
  draft: OnboardingDraft;
  onUpdate: (field: string, value: unknown) => void;
};

const QuestionBlock = ({ step, draft, onUpdate }: QuestionBlockProps) => {
  const raw = draft[step.field];
  const scaleVal = typeof raw === "number" ? raw : undefined;
  const singleVal = typeof raw === "string" ? raw : undefined;
  const boolVal = typeof raw === "boolean" ? raw : undefined;
  const multiVal = Array.isArray(raw) ? (raw as string[]) : [];

  return (
    <div className="space-y-5">
      <h2 className="font-display text-lg font-medium leading-snug text-(--atlas-surface-foreground)/90">
        {step.title}
      </h2>

      {(step.type === "scale" || step.type === "discrete-slider") && (
        <ScaleInput
          value={scaleVal}
          minLabel={step.minLabel}
          maxLabel={step.maxLabel}
          onChange={(n) => onUpdate(step.field, n)}
        />
      )}

      {step.type === "single" && step.options && (
        <ChipSelect
          options={step.options}
          selected={singleVal ? [singleVal] : []}
          onToggle={(val) => onUpdate(step.field, val)}
        />
      )}

      {step.type === "toggle" && (
        <ChipSelect
          options={TOGGLE_OPTIONS}
          selected={boolVal === undefined ? [] : [String(boolVal)]}
          onToggle={(val) => onUpdate(step.field, val === "true")}
        />
      )}

      {step.type === "multi" && step.options && (
        <>
          <ChipSelect
            options={step.options}
            selected={multiVal}
            onToggle={(val) =>
              onUpdate(
                step.field,
                multiVal.includes(val) ? multiVal.filter((v) => v !== val) : [...multiVal, val],
              )
            }
          />
          <p className="font-sans text-xs text-(--atlas-surface-muted-foreground)">
            Select all that apply
          </p>
        </>
      )}
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

export const TravelerOnboardingPage = () => {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.travelerProfile.get.useQuery();
  const patch = trpc.travelerProfile.patch.useMutation({
    onSuccess: () => {
      clearDraft();
      window.dispatchEvent(new CustomEvent("atlas:traveler-profile-updated"));
      void utils.travelerProfile.get.invalidate();
    },
    onError: (err) => {
      const msg =
        err instanceof TRPCClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not save preferences";
      toast.error(msg);
    },
  });

  const [draft, setDraft] = useState<OnboardingDraft>(loadDraft);
  const [sectionIdx, setSectionIdx] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [done, setDone] = useState(false);

  const isEditing = Boolean(data?.tier1Complete);
  const total = GROUPED.length;
  const section = GROUPED[sectionIdx]!;
  const isFirst = sectionIdx === 0;
  const isLast = sectionIdx === total - 1;
  const progressPct = ((sectionIdx + 1) / total) * 100;

  useEffect(() => {
    if (!data?.preferences) return;
    const stored = loadDraft();
    setDraft({ ...data.preferences, ...stored });
  }, [data?.preferences]);

  useEffect(() => {
    if (data?.tier1Complete && Object.keys(loadDraft()).length === 0) {
      clearDraft();
    }
  }, [data?.tier1Complete]);

  const handleDraftUpdate = (field: string, value: unknown) => {
    setDraft((prev) => {
      const next = { ...prev, [field]: value };
      saveDraft(next);
      return next;
    });
  };

  const canProceed = section.steps.every((step) => {
    const val = draft[step.field];
    if (step.type === "multi") return Array.isArray(val) && val.length > 0;
    return val !== undefined && val !== null;
  });

  const handleBack = () => {
    if (isFirst) return;
    setDirection("back");
    setSectionIdx((i) => i - 1);
  };

  const handleNext = async () => {
    if (!isLast) {
      setDirection("forward");
      setSectionIdx((i) => i + 1);
      return;
    }
    try {
      await patch.mutateAsync({ ...draft } as PatchInput);
      setDone(true);
    } catch {
      // error surfaced via onError
    }
  };

  if (done) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-(--atlas-surface-background) px-6 text-center">
        <span className="text-6xl">{isEditing ? "✅" : "🎉"}</span>
        <h1 className="font-display max-w-md text-2xl font-semibold text-(--atlas-surface-foreground) sm:text-3xl">
          {isEditing ? "Preferences updated." : "Atlas knows how you travel now."}
        </h1>
        <p className="max-w-sm text-sm text-(--atlas-surface-muted-foreground)">
          {isEditing
            ? "Your changes are saved. They'll shape every trip plan from here on."
            : "Every trip plan will be tuned to your style. You can come back and adjust anything at any time."}
        </p>
        <Button variant="primary" size="lg" asChild>
          <a href={isEditing ? "/profile/settings" : "/"} className="no-underline">
            {isEditing ? "Back to preferences" : "Start planning"}
          </a>
        </Button>
        {!isEditing && (
          <a
            href="/profile/settings"
            className="text-xs text-(--atlas-surface-muted-foreground) underline-offset-4 hover:underline"
          >
            View profile settings
          </a>
        )}
      </div>
    );
  }

  if (isLoading && Object.keys(draft).length === 0) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-(--atlas-surface-background) text-(--atlas-surface-muted-foreground)">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-(--atlas-surface-background) text-(--atlas-surface-foreground)">
      <header className="sticky top-0 z-50 border-b border-(--atlas-surface-border)/20 bg-(--atlas-surface-background)/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={isFirst}
            className={cn(
              "flex min-h-[44px] items-center gap-1 px-2 font-sans text-sm transition-colors",
              isFirst
                ? "cursor-not-allowed text-(--atlas-surface-muted-foreground)/30"
                : "text-(--atlas-surface-muted-foreground) hover:text-(--atlas-surface-foreground)",
            )}
          >
            ← Back
          </button>

          <div className="flex items-center gap-2">
            <CompassIcon aria-hidden className="size-4 text-(--atlas-color-primary-500)" />
            <span className="font-sans text-xs text-(--atlas-surface-muted-foreground)">
              {sectionIdx + 1} of {total} sections
            </span>
          </div>

          <a
            href="/"
            className="flex min-h-[44px] items-center px-2 font-sans text-xs text-(--atlas-surface-muted-foreground) transition-colors hover:text-(--atlas-surface-foreground)"
          >
            {isEditing ? "Cancel" : "Skip for now"}
          </a>
        </div>

        <div className="h-[2px] bg-(--atlas-surface-container)">
          <div
            className="h-full bg-(--atlas-color-primary-500) transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-6 pb-16 pt-12">
        <div
          key={section.index}
          className={cn(
            "w-full max-w-2xl animate-in fade-in duration-400",
            direction === "forward" ? "slide-in-from-right-4" : "slide-in-from-left-4",
          )}
        >
          <div className="mb-10 text-center">
            <span className="mb-4 block text-5xl">{section.icon}</span>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-(--atlas-surface-foreground) md:text-4xl">
              {section.title}
            </h1>
            <p className="mt-2 font-sans text-sm text-(--atlas-surface-muted-foreground)">
              {section.subtitle}
            </p>
          </div>

          <div className="space-y-10">
            {section.steps.map((step) => (
              <QuestionBlock
                key={step.field}
                step={step}
                draft={draft}
                onUpdate={handleDraftUpdate}
              />
            ))}
          </div>

          <div className="mt-10 flex justify-end">
            <Button
              type="button"
              variant="primary"
              size="lg"
              disabled={!canProceed || patch.isPending}
              onClick={() => void handleNext()}
              className="flex items-center gap-2"
            >
              {isLast ? (isEditing ? "Save changes" : "Save profile") : "Continue"}
              {!isLast && <ChevronRightIcon aria-hidden size={16} strokeWidth={2.5} />}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};
