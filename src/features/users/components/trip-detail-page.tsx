import { type LodgingEvent, TripDayStepper, TripStatBar } from '@gsrosa/atlas-ui';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeftIcon,
  BedDoubleIcon,
  CalendarClockIcon,
  PencilIcon,
  PlaneTakeoffIcon,
  SparklesIcon,
  XIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { trpc } from '@/lib/trpc';

import { applyPlanModification, type ItineraryDoc } from '../services/gemini-edit';
import { AccountShell } from './account-shell';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const flightSchema = z.object({
  flightNumber: z.string().max(32),
  departureDate: z.string(),
  arrivalDate: z.string(),
});

const hotelSchema = z.object({
  name: z.string().max(500),
  checkinDate: z.string(),
  checkoutDate: z.string(),
});

const editSchema = z.object({
  title: z.string().max(500),
  departureAt: z.string(),
  arrivalAt: z.string(),
  flights: z.array(flightSchema),
  hotels: z.array(hotelSchema),
  aiPrompt: z.string().max(2000),
});

type EditValues = z.infer<typeof editSchema>;
type FlightValue = z.infer<typeof flightSchema>;
type HotelValue = z.infer<typeof hotelSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function parseDays(itinerary: Record<string, unknown>): Array<Record<string, unknown>> {
  return Array.isArray(itinerary.days) ? (itinerary.days as Array<Record<string, unknown>>) : [];
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

function parseAttractions(day: Record<string, unknown>) {
  if (!Array.isArray(day.attractions)) return [];
  return (day.attractions as Array<Record<string, unknown>>).map((a) => ({
    name: typeof a.name === 'string' ? a.name : '',
    address: typeof a.address === 'string' ? a.address : undefined,
    notes: typeof a.notes === 'string' ? a.notes : undefined,
    averageMinutesSpent: typeof a.averageMinutesSpent === 'number' ? a.averageMinutesSpent : undefined,
    price:
      a.price != null && typeof (a.price as Record<string, unknown>).amount === 'number'
        ? {
            amount: (a.price as { amount: number; currency: string }).amount,
            currency:
              typeof (a.price as Record<string, unknown>).currency === 'string'
                ? (a.price as { currency: string }).currency
                : 'USD',
          }
        : undefined,
    openingHours: typeof a.openingHours === 'string' ? a.openingHours : undefined,
  }));
}

interface MetaFlight { flightNumber: string; departureDate?: string; arrivalDate?: string }
interface MetaHotel  { name: string; checkinDate?: string; checkoutDate?: string; neighborhood?: string }

function isoToDayNumber(iso: string, base: Date): number {
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - base.getTime()) / 86_400_000) + 1;
}

function getHotelDayRange(
  hotel: { checkinDate: string; checkoutDate: string },
  departureAt: string,
): { checkinDay: number; checkoutDay: number } | null {
  if (!hotel.checkinDate || !hotel.checkoutDate) return null;
  const base = new Date(departureAt);
  base.setHours(0, 0, 0, 0);
  return {
    checkinDay: isoToDayNumber(hotel.checkinDate, base),
    checkoutDay: isoToDayNumber(hotel.checkoutDate, base),
  };
}

/** Maps each day number to its lodging events (check-in, staying, check-out). */
function buildHotelDayEvents(
  hotels: MetaHotel[],
  departureAt: string | null,
): Record<number, LodgingEvent[]> {
  const events: Record<number, LodgingEvent[]> = {};
  if (!departureAt) return events;
  const base = new Date(departureAt);
  base.setHours(0, 0, 0, 0);

  const push = (n: number, ev: LodgingEvent) => {
    if (n < 1) return;
    if (!events[n]) events[n] = [];
    events[n].push(ev);
  };

  for (const hotel of hotels) {
    if (!hotel.checkinDate || !hotel.checkoutDate) continue;
    const checkinDay = isoToDayNumber(hotel.checkinDate, base);
    const checkoutDay = isoToDayNumber(hotel.checkoutDate, base);
    const label = hotel.neighborhood ? `${hotel.name} · ${hotel.neighborhood}` : hotel.name;

    push(checkinDay, { text: `Check in — ${label}`, type: 'checkin' });
    for (let d = checkinDay + 1; d < checkoutDay; d++) {
      push(d, { text: `Staying at ${label}`, type: 'staying' });
    }
    if (checkoutDay !== checkinDay) {
      push(checkoutDay, { text: `Check out — ${hotel.name}`, type: 'checkout' });
    }
  }
  return events;
}

// ─── Edit panel ───────────────────────────────────────────────────────────────

interface EditPanelProps {
  tripId: string;
  currentItinerary: ItineraryDoc;
  initialValues: EditValues;
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
  const [isAdapting, setIsAdapting] = useState(false);

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

  const { register, formState: { errors }, handleSubmit, watch } = form;

  const watchedDeparture = watch('departureAt');
  const watchedArrival = watch('arrivalAt');
  const datesChanged =
    watchedDeparture !== initialValues.departureAt ||
    watchedArrival !== initialValues.arrivalAt;

  const { fields: flightFields, append: appendFlight, remove: removeFlight } =
    useFieldArray({ control: form.control, name: 'flights' });

  const { fields: hotelFields, append: appendHotel, remove: removeHotel } =
    useFieldArray({ control: form.control, name: 'hotels' });

  function buildAdaptPrompt(values: EditValues): string | null {
    const parts: string[] = [];

    const datesChanged =
      values.departureAt !== initialValues.departureAt ||
      values.arrivalAt !== initialValues.arrivalAt;

    if (datesChanged) {
      parts.push(
        `Trip dates changed. New departure: ${values.departureAt || 'flexible'}, new return: ${values.arrivalAt || 'flexible'}. ` +
        `Adjust the number of days to fit the new range. Preserve all existing day content exactly — only add or remove days at the end as needed.`,
      );
    }

    const filledHotels = values.hotels.filter((h) => h.name.trim() && h.checkinDate && h.checkoutDate);

    if (filledHotels.length > 0) {
      const lines = filledHotels.map((h) => {
        const range = values.departureAt ? getHotelDayRange(h, values.departureAt) : null;
        if (!range) return `- ${h.name}: check-in ${h.checkinDate}, check-out ${h.checkoutDate}`;
        const stayEnd = range.checkoutDay - 1;
        const dayLabel = range.checkinDay === stayEnd
          ? `Day ${range.checkinDay}`
          : `Days ${range.checkinDay}–${stayEnd}`;
        return `- "${h.name}": check-in Day ${range.checkinDay}, check-out Day ${range.checkoutDay} → set lodging = "${h.name}" for ${dayLabel}`;
      });
      parts.push(
        `Update ONLY the "lodging" field for the days below. Do NOT change attractions, meals, transportation, city, title, or any other field:\n${lines.join('\n')}`,
      );
    }

    if (values.aiPrompt.trim()) parts.push(values.aiPrompt.trim());

    return parts.length > 0 ? parts.join('\n\n') : null;
  }

  function doSave(values: EditValues, itinerary: ItineraryDoc) {
    updatePlan.mutate({
      id: tripId,
      title: values.title || undefined,
      departureAt: values.departureAt || undefined,
      arrivalAt: values.arrivalAt || undefined,
      flights: values.flights.filter((f) => f.flightNumber.trim()),
      itinerary: {
        ...itinerary,
        meta: { ...((itinerary.meta as Record<string, unknown>) ?? {}), hotels: values.hotels.filter((h) => h.name.trim()) },
      },
    });
  }

  const onSave = handleSubmit((values) => doSave(values, currentItinerary));

  const onSaveAdapt = handleSubmit(async (values) => {
    const prompt = buildAdaptPrompt(values);
    if (!prompt) { doSave(values, currentItinerary); return; }

    setIsAdapting(true);
    let adapted = currentItinerary;
    try {
      const updated = await applyPlanModification(currentItinerary, prompt);
      onItineraryChange(updated as ItineraryDoc);
      adapted = updated as ItineraryDoc;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to adapt plan');
      setIsAdapting(false);
      return;
    }
    setIsAdapting(false);
    doSave(values, adapted);
  });

  const isBusy = isAdapting || updatePlan.isPending;

  const cls = {
    input:
      'w-full rounded-xl border border-[var(--atlas-surface-border)] bg-[var(--atlas-surface-background)] px-3 py-2 text-sm text-[var(--atlas-surface-foreground)] placeholder:text-[var(--atlas-surface-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--atlas-color-primary-400)]',
    label: 'block text-xs font-medium text-[var(--atlas-surface-muted-foreground)]',
    section: 'space-y-2',
    sectionHeader: 'flex items-center justify-between',
    sectionTitle: 'text-xs font-medium text-[var(--atlas-surface-muted-foreground)]',
    addBtn: 'text-xs font-medium text-[var(--atlas-color-primary-400)] hover:underline',
    removeBtn: 'p-1 text-[var(--atlas-surface-muted-foreground)] transition-colors hover:text-red-500',
    card: 'space-y-2 rounded-xl border border-[var(--atlas-surface-border)] p-3',
  };

  return (
    <form onSubmit={(e) => void onSave(e)} className="flex h-full flex-col gap-5 overflow-y-auto px-1 py-1">
      {/* Title */}
      <div className="space-y-1">
        <label className={cls.label} htmlFor="edit-title">Trip name</label>
        <input id="edit-title" type="text" placeholder="My amazing trip" {...register('title')} className={cls.input} />
        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
      </div>

      {/* Dates */}
      <div className="space-y-1">
        <span className={cls.label}>Trip dates</span>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className={cls.label} htmlFor="edit-departure">Departure</label>
            <input id="edit-departure" type="date" {...register('departureAt')} className={cls.input} />
          </div>
          <div className="space-y-1">
            <label className={cls.label} htmlFor="edit-return">Return</label>
            <input id="edit-return" type="date" {...register('arrivalAt')} className={cls.input} />
          </div>
        </div>
        {datesChanged && (
          <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            <CalendarClockIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            Dates changed — use <span className="font-semibold">"Save &amp; Adapt Plan"</span> to let AI replan the itinerary for the new dates.
          </div>
        )}
      </div>

      <div className="h-px bg-[var(--atlas-surface-border)]" aria-hidden />

      {/* Flights */}
      <div className={cls.section}>
        <div className={cls.sectionHeader}>
          <span className={cls.sectionTitle}>Flights</span>
          <button type="button" onClick={() => appendFlight({ flightNumber: '', departureDate: '', arrivalDate: '' })} className={cls.addBtn}>+ Add</button>
        </div>
        {flightFields.length === 0 && (
          <p className="text-xs italic text-[var(--atlas-surface-muted-foreground)]">No flights added.</p>
        )}
        {flightFields.map((field, idx) => (
          <div key={field.id} className={cls.card}>
            <div className="flex gap-2">
              <input type="text" placeholder="Flight number — e.g. AA 1234" {...register(`flights.${idx}.flightNumber`)} className={`${cls.input} flex-1`} />
              <button type="button" onClick={() => removeFlight(idx)} className={cls.removeBtn} aria-label="Remove flight"><XIcon className="size-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className={cls.label}>Departure date</label>
                <input type="date" {...register(`flights.${idx}.departureDate`)} className={cls.input} />
              </div>
              <div className="space-y-1">
                <label className={cls.label}>Arrival date</label>
                <input type="date" {...register(`flights.${idx}.arrivalDate`)} className={cls.input} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hotels */}
      <div className={cls.section}>
        <div className={cls.sectionHeader}>
          <span className={cls.sectionTitle}>Hotels</span>
          <button type="button" onClick={() => appendHotel({ name: '', checkinDate: '', checkoutDate: '' })} className={cls.addBtn}>+ Add</button>
        </div>
        {hotelFields.length === 0 && (
          <p className="text-xs italic text-[var(--atlas-surface-muted-foreground)]">No hotels added.</p>
        )}
        {hotelFields.map((field, idx) => (
          <div key={field.id} className={cls.card}>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Hotel or hostel name"
                {...register(`hotels.${idx}.name`)}
                className={`${cls.input} flex-1`}
              />
              <button type="button" onClick={() => removeHotel(idx)} className={cls.removeBtn} aria-label="Remove hotel"><XIcon className="size-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className={cls.label}>Check-in</label>
                <input type="date" {...register(`hotels.${idx}.checkinDate`)} className={cls.input} />
              </div>
              <div className="space-y-1">
                <label className={cls.label}>Check-out</label>
                <input type="date" {...register(`hotels.${idx}.checkoutDate`)} className={cls.input} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-px bg-[var(--atlas-surface-border)]" aria-hidden />

      {/* AI modifications */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <SparklesIcon className="size-3.5 text-[var(--atlas-color-primary-400)]" aria-hidden />
          <span className={cls.sectionTitle}>Additional modifications (optional)</span>
        </div>
        <textarea
          {...register('aiPrompt')}
          placeholder="e.g. Add a cooking class on day 2, swap the museum for an outdoor market…"
          rows={3}
          className={`${cls.input} resize-none`}
          disabled={isBusy}
        />
        <p className="text-[11px] text-[var(--atlas-surface-muted-foreground)]">
          Only used when you click "Save &amp; Adapt Plan".
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-1">
        <button
          type="button"
          onClick={() => void onSaveAdapt()}
          disabled={isBusy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,var(--atlas-color-primary-300),var(--atlas-color-primary-500))] py-2.5 text-sm font-semibold text-[var(--atlas-color-neutral-700)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SparklesIcon className="size-4" aria-hidden />
          {isAdapting ? 'Adapting plan…' : updatePlan.isPending ? 'Saving…' : 'Save & Adapt Plan'}
        </button>
        <button
          type="submit"
          disabled={isBusy}
          className="w-full rounded-xl border border-[var(--atlas-surface-border)] py-2.5 text-sm font-medium text-[var(--atlas-surface-foreground)] transition-colors hover:border-[var(--atlas-color-primary-400)] hover:text-[var(--atlas-color-primary-400)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onClose}
          disabled={isBusy}
          className="w-full rounded-xl py-2 text-xs text-[var(--atlas-surface-muted-foreground)] transition-colors hover:text-[var(--atlas-surface-foreground)] disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Plan view ────────────────────────────────────────────────────────────────

interface PlanViewProps {
  itinerary: Record<string, unknown>;
  flightNumbers: string[];
  daysCount: number | null;
  departureAt: string | null;
  arrivalAt: string | null;
}

function PlanView({ itinerary, flightNumbers, daysCount, departureAt, arrivalAt }: PlanViewProps) {
  const days = parseDays(itinerary);
  const cities = getUniqueCities(days);
  const totalCost = computeTotalCost(days);
  const weather = itinerary.weather as { temperatureRangeCelsius?: string; bestMonth?: string } | undefined;
  const bestMonth = typeof itinerary.bestTravelMonth === 'string' ? itinerary.bestTravelMonth : (weather?.bestMonth ?? null);

  const meta = itinerary.meta as Record<string, unknown> | undefined;
  const metaFlights = Array.isArray(meta?.flights) ? (meta.flights as MetaFlight[]) : null;
  const metaHotels = Array.isArray(meta?.hotels) ? (meta.hotels as MetaHotel[]) : [];

  const displayFlights: MetaFlight[] = metaFlights ?? flightNumbers.map((n) => ({ flightNumber: n }));
  const hotelDayEvents = buildHotelDayEvents(metaHotels, departureAt);

  return (
    <div className="space-y-6">
      <TripStatBar
        daysCount={daysCount ?? days.length}
        cities={cities}
        totalCostUsd={totalCost}
        tempRange={weather?.temperatureRangeCelsius ?? null}
        bestMonth={bestMonth}
      />

      {/* Trip dates */}
      {(departureAt ?? arrivalAt) && (
        <div className="flex flex-wrap items-center gap-6 rounded-xl border border-[var(--atlas-surface-border)] bg-[var(--atlas-surface-background)] px-5 py-4">
          {departureAt && (
            <div>
              <p className="text-xs text-[var(--atlas-surface-muted-foreground)]">Departure</p>
              <p className="text-sm font-medium text-[var(--atlas-surface-foreground)]">{formatDate(departureAt)}</p>
            </div>
          )}
          {departureAt && arrivalAt && <div className="h-8 w-px bg-[var(--atlas-surface-border)]" aria-hidden />}
          {arrivalAt && (
            <div>
              <p className="text-xs text-[var(--atlas-surface-muted-foreground)]">Return</p>
              <p className="text-sm font-medium text-[var(--atlas-surface-foreground)]">{formatDate(arrivalAt)}</p>
            </div>
          )}
        </div>
      )}

      {/* Flights + hotels chips */}
      {(displayFlights.length > 0 || metaHotels.length > 0) && (
        <div className="space-y-2">
          {displayFlights.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {displayFlights.map((f, i) => (
                <span key={`${f.flightNumber}-${i}`} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--atlas-surface-border)] bg-[var(--atlas-surface-container)] px-3 py-1.5 text-xs font-medium text-[var(--atlas-surface-foreground)]">
                  <PlaneTakeoffIcon className="size-3" aria-hidden />
                  {f.flightNumber}
                  {(f.departureDate ?? f.arrivalDate) && (
                    <span className="text-[var(--atlas-surface-muted-foreground)]">
                      {f.departureDate && f.arrivalDate ? ` ${f.departureDate} → ${f.arrivalDate}` : f.departureDate ? ` ${f.departureDate}` : ` → ${f.arrivalDate}`}
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}
          {metaHotels.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {metaHotels.map((h, i) => (
                <span key={`${h.name}-${i}`} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--atlas-surface-border)] bg-[var(--atlas-surface-container)] px-3 py-1.5 text-xs font-medium text-[var(--atlas-surface-foreground)]">
                  <BedDoubleIcon className="size-3" aria-hidden />
                  {h.name}
                  {(h.checkinDate ?? h.checkoutDate) && (
                    <span className="text-[var(--atlas-surface-muted-foreground)]">
                      {h.checkinDate && h.checkoutDate ? ` ${h.checkinDate} → ${h.checkoutDate}` : h.checkinDate ? ` from ${h.checkinDate}` : ` until ${h.checkoutDate}`}
                    </span>
                  )}
                  {h.neighborhood && <span className="text-[var(--atlas-surface-muted-foreground)]"> · {h.neighborhood}</span>}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Day stepper */}
      {days.length > 0 && (
        <section className="space-y-0">
          {days.map((day, i) => {
            const dayNum = typeof day.dayNumber === 'number' ? day.dayNumber : i + 1;
            return (
              <TripDayStepper
                key={dayNum}
                dayNumber={dayNum}
                city={typeof day.city === 'string' ? day.city : ''}
                region={typeof day.region === 'string' ? day.region : undefined}
                title={typeof day.dayTitle === 'string' ? day.dayTitle : undefined}
                isLast={i === days.length - 1}
                attractions={parseAttractions(day)}
                lodgingEvents={hotelDayEvents[dayNum]}
              />
            );
          })}
        </section>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function TripDetailPage({ tripId }: { tripId: string }) {
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
            <p className="text-sm text-[var(--atlas-surface-muted-foreground)]">Loading trip…</p>
          </div>
        </div>
      </AccountShell>
    );
  }

  if (error || !plan) {
    return (
      <AccountShell>
        <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 text-center">
          <p className="text-sm text-[var(--atlas-surface-foreground)]">Trip not found.</p>
          <button type="button" onClick={() => window.location.assign('/my-trips')} className="text-sm text-[var(--atlas-color-primary-400)] hover:underline">
            ← Back to plans
          </button>
        </div>
      </AccountShell>
    );
  }

  const savedItinerary = plan.itinerary as ItineraryDoc;
  const activeItinerary = localItinerary ?? savedItinerary;
  const meta = activeItinerary.meta as Record<string, unknown> | undefined;
  const metaFlights = Array.isArray(meta?.flights) ? (meta.flights as FlightValue[]) : [];
  const metaHotels = Array.isArray(meta?.hotels) ? (meta.hotels as HotelValue[]) : [];
  const displayTitle = plan.title ?? plan.ai_suggested_title ?? plan.destination ?? 'My Trip';

  const editInitialValues: EditValues = {
    title: plan.title ?? '',
    departureAt: plan.departure_at ?? '',
    arrivalAt: plan.arrival_at ?? '',
    flights: metaFlights.length > 0
      ? metaFlights
      : plan.flight_numbers.map((n) => ({ flightNumber: n, departureDate: '', arrivalDate: '' })),
    hotels: metaHotels,
    aiPrompt: '',
  };

  return (
    <AccountShell>
      <div className={`account-fade-in-up mx-auto w-full px-4 py-8 sm:px-6 ${isEditOpen ? 'max-w-6xl' : 'max-w-2xl'}`}>
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <button type="button" onClick={() => window.location.assign('/my-trips')} className="mt-1 flex items-center gap-1 text-sm text-[var(--atlas-surface-muted-foreground)] transition-colors hover:text-[var(--atlas-surface-foreground)]">
            <ArrowLeftIcon className="size-4" aria-hidden />
            My plans
          </button>
          {isEditOpen ? (
            <button type="button" onClick={() => { setLocalItinerary(null); setIsEditOpen(false); }} className="flex items-center gap-1.5 rounded-xl border border-[var(--atlas-surface-border)] px-3 py-1.5 text-sm font-medium text-[var(--atlas-surface-muted-foreground)] transition-colors hover:border-[var(--atlas-color-primary-400)] hover:text-[var(--atlas-color-primary-400)]">
              <XIcon className="size-4" aria-hidden />
              Close editor
            </button>
          ) : (
            <button type="button" onClick={() => { setLocalItinerary(null); setIsEditOpen(true); }} className="flex items-center gap-1.5 rounded-xl border border-[var(--atlas-surface-border)] px-3 py-1.5 text-sm font-medium text-[var(--atlas-surface-foreground)] transition-colors hover:border-[var(--atlas-color-primary-400)] hover:text-[var(--atlas-color-primary-400)]">
              <PencilIcon className="size-4" aria-hidden />
              Edit plan
            </button>
          )}
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--atlas-surface-foreground)]">{displayTitle}</h1>
          {plan.title && plan.destination && (
            <p className="mt-1 text-sm text-[var(--atlas-surface-muted-foreground)]">{plan.destination}</p>
          )}
        </div>

        {isEditOpen ? (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
            <div className="min-w-0 rounded-2xl border border-[var(--atlas-surface-border)] bg-[var(--atlas-surface-background)] p-6">
              <PlanView itinerary={activeItinerary} flightNumbers={plan.flight_numbers} daysCount={plan.days_count} departureAt={plan.departure_at} arrivalAt={plan.arrival_at} />
            </div>
            <div className="rounded-2xl border border-[var(--atlas-surface-border)] bg-[var(--atlas-surface-background)] p-6">
              <EditPanel
                tripId={tripId}
                currentItinerary={activeItinerary}
                initialValues={editInitialValues}
                onItineraryChange={setLocalItinerary}
                onClose={() => { setLocalItinerary(null); setIsEditOpen(false); }}
              />
            </div>
          </div>
        ) : (
          <PlanView itinerary={activeItinerary} flightNumbers={plan.flight_numbers} daysCount={plan.days_count} departureAt={plan.departure_at} arrivalAt={plan.arrival_at} />
        )}
      </div>
    </AccountShell>
  );
}
