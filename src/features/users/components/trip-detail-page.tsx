import { TripDayStepper, TripStatBar } from '@gsrosa/atlas-ui';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeftIcon,
  BedDoubleIcon,
  PencilIcon,
  PlaneTakeoffIcon,
  SendIcon,
  XIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { trpc } from '@/lib/trpc';

import { applyPlanModification, type ItineraryDoc } from '../services/gemini-edit';
import { AccountShell } from './account-shell';

// ─── Edit form schema ─────────────────────────────────────────────────────────

const editSchema = z.object({
  title: z.string().max(500),
  departureAt: z.string(),
  arrivalAt: z.string(),
  flightNumbers: z.array(z.object({ value: z.string().max(32) })),
  lodgingPlaces: z.array(z.object({ value: z.string().max(500) })),
});

type EditValues = z.infer<typeof editSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function parseDays(
  itinerary: Record<string, unknown>,
): Array<Record<string, unknown>> {
  return Array.isArray(itinerary.days)
    ? (itinerary.days as Array<Record<string, unknown>>)
    : [];
}

function getUniqueCities(days: Array<Record<string, unknown>>): string[] {
  return [
    ...new Set(
      days
        .map((d) => (typeof d.city === 'string' ? d.city : null))
        .filter((c): c is string => c !== null),
    ),
  ];
}

function computeTotalCost(days: Array<Record<string, unknown>>): number {
  return days.reduce((total, day) => {
    const attrs = Array.isArray(day.attractions)
      ? (day.attractions as Array<{ price?: { amount: number } }>)
      : [];
    return total + attrs.reduce((s, a) => s + (a.price?.amount ?? 0), 0);
  }, 0);
}

function parseAttractions(
  day: Record<string, unknown>,
): Array<{
  name: string;
  address?: string;
  notes?: string;
  averageMinutesSpent?: number;
  price?: { amount: number; currency: string };
  openingHours?: string;
}> {
  if (!Array.isArray(day.attractions)) return [];
  return (day.attractions as Array<Record<string, unknown>>).map((a) => ({
    name: typeof a.name === 'string' ? a.name : '',
    address: typeof a.address === 'string' ? a.address : undefined,
    notes: typeof a.notes === 'string' ? a.notes : undefined,
    averageMinutesSpent:
      typeof a.averageMinutesSpent === 'number' ? a.averageMinutesSpent : undefined,
    price:
      a.price != null &&
      typeof (a.price as Record<string, unknown>).amount === 'number'
        ? {
            amount: (a.price as { amount: number; currency: string }).amount,
            currency:
              typeof (a.price as Record<string, unknown>).currency === 'string'
                ? ((a.price as { currency: string }).currency)
                : 'USD',
          }
        : undefined,
    openingHours:
      typeof a.openingHours === 'string' ? a.openingHours : undefined,
  }));
}

// ─── Edit panel ───────────────────────────────────────────────────────────────

interface EditPanelProps {
  tripId: string;
  currentItinerary: ItineraryDoc;
  initialValues: EditValues;
  stayPlaces: string[];
  onItineraryChange: (updated: ItineraryDoc) => void;
  onClose: () => void;
}

function EditPanel({
  tripId,
  currentItinerary,
  initialValues,
  onItineraryChange,
  onClose,
}: EditPanelProps) {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const utils = trpc.useUtils();

  const updatePlan = trpc.plans.update.useMutation({
    onSuccess: () => {
      toast.success('Trip saved!');
      void utils.plans.getById.invalidate({ id: tripId });
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: initialValues,
  });

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = form;

  const { fields: flightFields, append: appendFlight, remove: removeFlight } =
    useFieldArray({ control: form.control, name: 'flightNumbers' });

  const { fields: lodgingFields, append: appendLodging, remove: removeLodging } =
    useFieldArray({ control: form.control, name: 'lodgingPlaces' });

  async function handleApplyAi() {
    const prompt = aiPrompt.trim();
    if (!prompt || isApplying) return;
    setIsApplying(true);
    try {
      const updated = await applyPlanModification(currentItinerary, prompt);
      onItineraryChange(updated);
      setAiPrompt('');
      toast.success('Plan updated — review the changes on the left.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to apply changes');
    } finally {
      setIsApplying(false);
    }
  }

  const onSave = handleSubmit((values) => {
    const updatedItinerary: ItineraryDoc = {
      ...currentItinerary,
      meta: {
        ...((currentItinerary.meta as Record<string, unknown>) ?? {}),
        stayPlaces: values.lodgingPlaces.map((l) => l.value).filter(Boolean),
      },
    };

    updatePlan.mutate({
      id: tripId,
      title: values.title || undefined,
      departureAt: values.departureAt || undefined,
      arrivalAt: values.arrivalAt || undefined,
      flightNumbers: values.flightNumbers.map((f) => f.value).filter(Boolean),
      itinerary: updatedItinerary,
    });
  });

  const inputClass =
    'w-full rounded-xl border border-[var(--atlas-surface-border)] bg-[var(--atlas-surface-background)] px-3 py-2 text-sm text-[var(--atlas-surface-foreground)] placeholder:text-[var(--atlas-surface-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--atlas-color-primary-400)]';

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto px-1 py-1">
      {/* AI prompt */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-[var(--atlas-surface-foreground)]">
          Modify with AI
        </h3>
        <textarea
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="e.g. Add a cooking class on day 2, replace the museum with an outdoor market…"
          rows={4}
          className={`${inputClass} resize-none`}
          disabled={isApplying}
        />
        <button
          type="button"
          onClick={() => void handleApplyAi()}
          disabled={isApplying || !aiPrompt.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,var(--atlas-color-primary-300),var(--atlas-color-primary-500))] py-2.5 text-sm font-semibold text-[var(--atlas-color-neutral-700)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SendIcon className="size-4" aria-hidden />
          {isApplying ? 'Applying…' : 'Apply changes'}
        </button>
        <p className="text-[11px] text-[var(--atlas-surface-muted-foreground)]">
          The plan on the left updates instantly. Hit "Save" below to persist.
        </p>
      </section>

      <div className="h-px bg-[var(--atlas-surface-border)]" aria-hidden />

      {/* Details form */}
      <form onSubmit={(e) => void onSave(e)} className="space-y-5">
        <h3 className="text-sm font-semibold text-[var(--atlas-surface-foreground)]">
          Trip details
        </h3>

        {/* Title */}
        <div className="space-y-1">
          <label
            className="block text-xs font-medium text-[var(--atlas-surface-muted-foreground)]"
            htmlFor="edit-title"
          >
            Trip name
          </label>
          <input
            id="edit-title"
            type="text"
            placeholder="My amazing trip"
            {...register('title')}
            className={inputClass}
          />
          {errors.title && (
            <p className="text-xs text-red-500">{errors.title.message}</p>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label
              className="block text-xs font-medium text-[var(--atlas-surface-muted-foreground)]"
              htmlFor="edit-departure"
            >
              Departure
            </label>
            <input
              id="edit-departure"
              type="date"
              {...register('departureAt')}
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label
              className="block text-xs font-medium text-[var(--atlas-surface-muted-foreground)]"
              htmlFor="edit-return"
            >
              Return
            </label>
            <input
              id="edit-return"
              type="date"
              {...register('arrivalAt')}
              className={inputClass}
            />
          </div>
        </div>

        {/* Flights */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--atlas-surface-muted-foreground)]">
              Flights
            </span>
            <button
              type="button"
              onClick={() => appendFlight({ value: '' })}
              className="text-xs font-medium text-[var(--atlas-color-primary-400)] hover:underline"
            >
              + Add
            </button>
          </div>
          {flightFields.length === 0 && (
            <p className="text-xs italic text-[var(--atlas-surface-muted-foreground)]">
              No flights added.
            </p>
          )}
          {flightFields.map((field, idx) => (
            <div key={field.id} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. AA 1234"
                {...register(`flightNumbers.${idx}.value`)}
                className={`${inputClass} flex-1`}
              />
              <button
                type="button"
                onClick={() => removeFlight(idx)}
                className="p-1 text-[var(--atlas-surface-muted-foreground)] transition-colors hover:text-red-500"
                aria-label="Remove flight"
              >
                <XIcon className="size-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Stay places */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--atlas-surface-muted-foreground)]">
              Stay places
            </span>
            <button
              type="button"
              onClick={() => appendLodging({ value: '' })}
              className="text-xs font-medium text-[var(--atlas-color-primary-400)] hover:underline"
            >
              + Add
            </button>
          </div>
          {lodgingFields.length === 0 && (
            <p className="text-xs italic text-[var(--atlas-surface-muted-foreground)]">
              No stays added.
            </p>
          )}
          {lodgingFields.map((field, idx) => (
            <div key={field.id} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Hotel name or address"
                {...register(`lodgingPlaces.${idx}.value`)}
                className={`${inputClass} flex-1`}
              />
              <button
                type="button"
                onClick={() => removeLodging(idx)}
                className="p-1 text-[var(--atlas-surface-muted-foreground)] transition-colors hover:text-red-500"
                aria-label="Remove stay place"
              >
                <XIcon className="size-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            type="submit"
            disabled={updatePlan.isPending}
            className="w-full rounded-xl bg-[linear-gradient(135deg,var(--atlas-color-primary-300),var(--atlas-color-primary-500))] py-2.5 text-sm font-semibold text-[var(--atlas-color-neutral-700)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {updatePlan.isPending ? 'Saving…' : 'Save changes'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-[var(--atlas-surface-border)] py-2.5 text-sm font-medium text-[var(--atlas-surface-muted-foreground)] transition-colors hover:text-[var(--atlas-surface-foreground)]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Plan view ────────────────────────────────────────────────────────────────

interface PlanViewProps {
  itinerary: Record<string, unknown>;
  flightNumbers: string[];
  stayPlaces: string[];
  daysCount: number | null;
  departureAt: string | null;
  arrivalAt: string | null;
}

function PlanView({
  itinerary,
  flightNumbers,
  stayPlaces,
  daysCount,
  departureAt,
  arrivalAt,
}: PlanViewProps) {
  const days = parseDays(itinerary);
  const cities = getUniqueCities(days);
  const totalCost = computeTotalCost(days);
  const weather = itinerary.weather as
    | { temperatureRangeCelsius?: string; bestMonth?: string }
    | undefined;
  const bestMonth =
    typeof itinerary.bestTravelMonth === 'string'
      ? itinerary.bestTravelMonth
      : (weather?.bestMonth ?? null);

  return (
    <div className="space-y-6">
      {/* Stat bar */}
      <TripStatBar
        daysCount={daysCount ?? days.length}
        cities={cities}
        totalCostUsd={totalCost}
        tempRange={weather?.temperatureRangeCelsius ?? null}
        bestMonth={bestMonth}
      />

      {/* Dates */}
      {(departureAt ?? arrivalAt) && (
        <div className="flex flex-wrap items-center gap-6 rounded-xl border border-[var(--atlas-surface-border)] bg-[var(--atlas-surface-background)] px-5 py-4">
          {departureAt && (
            <div>
              <p className="text-xs text-[var(--atlas-surface-muted-foreground)]">
                Departure
              </p>
              <p className="text-sm font-medium text-[var(--atlas-surface-foreground)]">
                {formatDate(departureAt)}
              </p>
            </div>
          )}
          {departureAt && arrivalAt && (
            <div className="h-8 w-px bg-[var(--atlas-surface-border)]" aria-hidden />
          )}
          {arrivalAt && (
            <div>
              <p className="text-xs text-[var(--atlas-surface-muted-foreground)]">
                Return
              </p>
              <p className="text-sm font-medium text-[var(--atlas-surface-foreground)]">
                {formatDate(arrivalAt)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Flights + Stays chips */}
      {(flightNumbers.length > 0 || stayPlaces.length > 0) && (
        <div className="space-y-3">
          {flightNumbers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {flightNumbers.map((num) => (
                <span
                  key={num}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--atlas-surface-border)] bg-[var(--atlas-surface-container)] px-3 py-1.5 text-xs font-medium text-[var(--atlas-surface-foreground)]"
                >
                  <PlaneTakeoffIcon className="size-3" aria-hidden />
                  {num}
                </span>
              ))}
            </div>
          )}
          {stayPlaces.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {stayPlaces.map((place) => (
                <span
                  key={place}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--atlas-surface-border)] bg-[var(--atlas-surface-container)] px-3 py-1.5 text-xs font-medium text-[var(--atlas-surface-foreground)]"
                >
                  <BedDoubleIcon className="size-3" aria-hidden />
                  {place}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stepper itinerary */}
      {days.length > 0 && (
        <section className="space-y-0">
          {days.map((day, i) => (
            <TripDayStepper
              key={typeof day.dayNumber === 'number' ? day.dayNumber : i}
              dayNumber={typeof day.dayNumber === 'number' ? day.dayNumber : i + 1}
              city={typeof day.city === 'string' ? day.city : ''}
              region={typeof day.region === 'string' ? day.region : undefined}
              title={typeof day.dayTitle === 'string' ? day.dayTitle : undefined}
              isLast={i === days.length - 1}
              attractions={parseAttractions(day)}
            />
          ))}
        </section>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

interface TripDetailPageProps {
  tripId: string;
}

export function TripDetailPage({ tripId }: TripDetailPageProps) {
  const { data, isLoading, error } = trpc.plans.getById.useQuery({ id: tripId });
  const plan = data?.plan;

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [localItinerary, setLocalItinerary] = useState<ItineraryDoc | null>(null);

  if (isLoading) {
    return (
      <AccountShell>
        <div className="flex min-h-[60dvh] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="size-8 animate-spin rounded-full border-2 border-[var(--atlas-color-primary-400)] border-t-transparent" />
            <p className="text-sm text-[var(--atlas-surface-muted-foreground)]">
              Loading trip…
            </p>
          </div>
        </div>
      </AccountShell>
    );
  }

  if (error || !plan) {
    return (
      <AccountShell>
        <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 text-center">
          <p className="text-sm text-[var(--atlas-surface-foreground)]">
            Trip not found.
          </p>
          <button
            type="button"
            onClick={() => window.location.assign('/trips')}
            className="text-sm text-[var(--atlas-color-primary-400)] hover:underline"
          >
            ← Back to plans
          </button>
        </div>
      </AccountShell>
    );
  }

  const savedItinerary = plan.itinerary as ItineraryDoc;
  const activeItinerary = localItinerary ?? savedItinerary;

  const meta = activeItinerary.meta as Record<string, unknown> | undefined;
  const stayPlaces = Array.isArray(meta?.stayPlaces)
    ? (meta.stayPlaces as string[])
    : [];

  const displayTitle =
    plan.title ?? plan.ai_suggested_title ?? plan.destination ?? 'My Trip';

  const editInitialValues: EditValues = {
    title: plan.title ?? '',
    departureAt: plan.departure_at ?? '',
    arrivalAt: plan.arrival_at ?? '',
    flightNumbers: plan.flight_numbers.map((v) => ({ value: v })),
    lodgingPlaces: stayPlaces.map((v) => ({ value: v })),
  };

  function handleOpenEdit() {
    setLocalItinerary(null); // reset local draft
    setIsEditOpen(true);
  }

  function handleCloseEdit() {
    setLocalItinerary(null);
    setIsEditOpen(false);
  }

  return (
    <AccountShell>
      <div
        className={`account-fade-in-up mx-auto w-full px-4 py-8 sm:px-6 ${
          isEditOpen ? 'max-w-6xl' : 'max-w-2xl'
        }`}
      >
        {/* Page header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => window.location.assign('/trips')}
              className="mt-1 flex items-center gap-1 text-sm text-[var(--atlas-surface-muted-foreground)] transition-colors hover:text-[var(--atlas-surface-foreground)]"
            >
              <ArrowLeftIcon className="size-4" aria-hidden />
              My plans
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {isEditOpen ? (
              <button
                type="button"
                onClick={handleCloseEdit}
                className="flex items-center gap-1.5 rounded-xl border border-[var(--atlas-surface-border)] px-3 py-1.5 text-sm font-medium text-[var(--atlas-surface-muted-foreground)] transition-colors hover:border-[var(--atlas-color-primary-400)] hover:text-[var(--atlas-color-primary-400)]"
              >
                <XIcon className="size-4" aria-hidden />
                Close editor
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenEdit}
                className="flex items-center gap-1.5 rounded-xl border border-[var(--atlas-surface-border)] px-3 py-1.5 text-sm font-medium text-[var(--atlas-surface-foreground)] transition-colors hover:border-[var(--atlas-color-primary-400)] hover:text-[var(--atlas-color-primary-400)]"
              >
                <PencilIcon className="size-4" aria-hidden />
                Edit plan
              </button>
            )}
          </div>
        </div>

        {/* Destination title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--atlas-surface-foreground)]">
            {displayTitle}
          </h1>
          {plan.title && plan.destination && (
            <p className="mt-1 text-sm text-[var(--atlas-surface-muted-foreground)]">
              {plan.destination}
            </p>
          )}
        </div>

        {/* Two-column layout when edit mode is open */}
        {isEditOpen ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
            {/* Left: plan view */}
            <div className="min-w-0 rounded-2xl border border-[var(--atlas-surface-border)] bg-[var(--atlas-surface-background)] p-6">
              <PlanView
                itinerary={activeItinerary}
                flightNumbers={plan.flight_numbers}
                stayPlaces={stayPlaces}
                daysCount={plan.days_count}
                departureAt={plan.departure_at}
                arrivalAt={plan.arrival_at}
              />
            </div>

            {/* Right: edit panel */}
            <div className="rounded-2xl border border-[var(--atlas-surface-border)] bg-[var(--atlas-surface-background)] p-6">
              <EditPanel
                tripId={tripId}
                currentItinerary={activeItinerary}
                initialValues={editInitialValues}
                stayPlaces={stayPlaces}
                onItineraryChange={setLocalItinerary}
                onClose={handleCloseEdit}
              />
            </div>
          </div>
        ) : (
          <PlanView
            itinerary={activeItinerary}
            flightNumbers={plan.flight_numbers}
            stayPlaces={stayPlaces}
            daysCount={plan.days_count}
            departureAt={plan.departure_at}
            arrivalAt={plan.arrival_at}
          />
        )}
      </div>
    </AccountShell>
  );
}
