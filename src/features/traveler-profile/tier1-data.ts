/** Tier 1 onboarding — field keys and options must match atlas-bff `traveler-profile` Zod enums. */

export interface Tier1Section {
  index: number;
  title: string;
  subtitle: string;
  icon: string;
}

export const TIER1_SECTIONS: Tier1Section[] = [
  { index: 1, title: 'Food & Diet',          subtitle: 'How you fuel your adventures',      icon: '🍜' },
  { index: 2, title: 'Your Environment',      subtitle: 'Where you feel most alive',         icon: '🌄' },
  { index: 3, title: 'How You Explore',       subtitle: 'Your discovery personality',        icon: '🧭' },
  { index: 5, title: 'What You Love',         subtitle: 'Activities that light you up',      icon: '✨' },
  { index: 6, title: 'Budget & Comfort',      subtitle: 'Your travel spending philosophy',   icon: '💎' },
  { index: 7, title: 'Pace & Body',           subtitle: 'Your real-world travel abilities',  icon: '🏔️' },
  { index: 8, title: 'Language & Culture',    subtitle: 'How you connect abroad',            icon: '🌍' },
  { index: 9, title: 'The Closer',            subtitle: 'The most important question',       icon: '💫' },
];

export type Tier1StepType = 'single' | 'scale' | 'multi' | 'discrete-slider' | 'toggle';

export interface Tier1Option {
  value: string;
  label: string;
  /** Short text shown below the label on the tile. */
  description?: string;
  /** Emoji shown large above the label on the tile. */
  emoji?: string;
}

export interface Tier1Step {
  field: string;
  sectionIndex: number;
  sectionTitle: string;
  title: string;
  /** Short label used in the preferences summary view. */
  shortLabel: string;
  subtitle?: string;
  type: Tier1StepType;
  options?: Tier1Option[];
  /** For scale / discrete-slider */
  minLabel?: string;
  maxLabel?: string;
  /** Decorative emoji shown above the question title for scale/slider steps. */
  stepEmoji?: string;
}

export const INTEREST_OPTIONS: Tier1Option[] = [
  { value: 'history-heritage', label: 'History & Heritage', emoji: '🏛️' },
  { value: 'art-culture', label: 'Art & Culture', emoji: '🎨' },
  { value: 'nature-wildlife', label: 'Nature & Wildlife', emoji: '🌿' },
  { value: 'adventure-sports', label: 'Adventure & Sports', emoji: '🏄' },
  { value: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { value: 'nightlife', label: 'Nightlife & Music', emoji: '🎭' },
  { value: 'wellness', label: 'Wellness & Spa', emoji: '🧘' },
  { value: 'food-drink', label: 'Food & Drink', emoji: '🍷' },
  { value: 'water-activities', label: 'Water Activities', emoji: '🤿' },
  { value: 'photography', label: 'Photography', emoji: '📸' },
  { value: 'local-events', label: 'Local Festivals', emoji: '🎪' },
  { value: 'urban-exploration', label: 'Urban Exploration', emoji: '🏙️' },
  { value: 'beach-relaxation', label: 'Beach & Relaxation', emoji: '🌅' },
];

export const TIER1_STEPS: Tier1Step[] = [
  {
    field: 'diet',
    sectionIndex: 1,
    sectionTitle: 'Food & diet',
    shortLabel: 'Diet',
    title: 'What best describes your diet?',
    type: 'single',
    options: [
      { value: 'omnivore', label: 'Omnivore', emoji: '🍖', description: 'Eat everything' },
      { value: 'vegetarian', label: 'Vegetarian', emoji: '🥦', description: 'No meat or fish' },
      { value: 'vegan', label: 'Vegan', emoji: '🌱', description: 'No animal products' },
      { value: 'pescatarian', label: 'Pescatarian', emoji: '🐟', description: 'Fish, no meat' },
      { value: 'flexitarian', label: 'Flexitarian', emoji: '🥗', description: 'Mostly plant-based' },
      { value: 'halal', label: 'Halal', emoji: '🌙', description: 'Halal only' },
      { value: 'kosher', label: 'Kosher', emoji: '✡️', description: 'Kosher only' },
    ],
  },
  {
    field: 'foodAdventurousness',
    sectionIndex: 1,
    sectionTitle: 'Food & diet',
    shortLabel: 'Adventurousness',
    title: 'How adventurous are you with food?',
    subtitle: '1 = stick to familiar · 5 = try anything',
    type: 'scale',
    stepEmoji: '🌶️',
    minLabel: 'Familiar',
    maxLabel: 'Try anything',
  },
  {
    field: 'foodImportance',
    sectionIndex: 1,
    sectionTitle: 'Food & diet',
    shortLabel: 'Food importance',
    title: 'How important is food to your trips?',
    subtitle: '1 = just fuel · 5 = food IS the trip',
    type: 'scale',
    stepEmoji: '🍽️',
    minLabel: 'Just fuel',
    maxLabel: 'Food IS the trip',
  },
  {
    field: 'drinksAlcohol',
    sectionIndex: 1,
    sectionTitle: 'Food & diet',
    shortLabel: 'Drinks alcohol',
    title: 'Do you drink alcohol?',
    type: 'toggle',
  },
  {
    field: 'urbanVsNature',
    sectionIndex: 2,
    sectionTitle: 'Your environment',
    shortLabel: 'Setting',
    title: 'City buzz or wide open nature?',
    type: 'discrete-slider',
    stepEmoji: '🌍',
    minLabel: '🏙️ Pure city',
    maxLabel: '🌿 Pure nature',
  },
  {
    field: 'stimulationPreference',
    sectionIndex: 2,
    sectionTitle: 'Your environment',
    shortLabel: 'Energy',
    title: 'Busy places or calm?',
    subtitle: '1 = need calm · 5 = love the buzz',
    type: 'scale',
    stepEmoji: '⚡',
    minLabel: 'Need calm',
    maxLabel: 'Love the chaos',
  },
  {
    field: 'discoveryStyle',
    sectionIndex: 3,
    sectionTitle: 'How you explore',
    shortLabel: 'Trip approach',
    title: 'How do you approach a trip?',
    type: 'single',
    options: [
      {
        value: 'researcher',
        label: 'I research everything',
        emoji: '🔍',
        description: 'Detailed plans and bookings upfront',
      },
      {
        value: 'loose-planner',
        label: 'Loose plans, discover the rest',
        emoji: '🗺️',
        description: 'Skeleton itinerary, room for spontaneity',
      },
      {
        value: 'wanderer',
        label: 'I arrive and wander',
        emoji: '🌀',
        description: 'Minimal planning — follow the moment',
      },
    ],
  },
  {
    field: 'interests',
    sectionIndex: 5,
    sectionTitle: 'What you love',
    shortLabel: 'Interests',
    title: 'Which activities excite you most?',
    subtitle: 'Pick everything that resonates — you can refine later.',
    type: 'multi',
    options: INTEREST_OPTIONS,
  },
  {
    field: 'budgetStyle',
    sectionIndex: 6,
    sectionTitle: 'Budget & comfort',
    shortLabel: 'Budget',
    title: 'How do you travel budget-wise?',
    type: 'single',
    options: [
      { value: 'budget', label: 'Budget traveler', emoji: '💰', description: 'Deals and value first' },
      { value: 'value', label: 'Value seeker', emoji: '⚖️', description: 'Quality for the price' },
      { value: 'comfort', label: 'Comfort first', emoji: '🛋️', description: 'Willing to pay for ease' },
      { value: 'luxury', label: 'Luxury', emoji: '💎', description: 'Top-tier when it matters' },
    ],
  },
  {
    field: 'fitnessLevel',
    sectionIndex: 7,
    sectionTitle: 'Pace & body',
    shortLabel: 'Activity level',
    title: 'How active are you when you travel?',
    type: 'single',
    options: [
      {
        value: 'sedentary',
        label: 'Easy-going',
        emoji: '🧘',
        description: 'Relaxed days, minimal hiking',
      },
      {
        value: 'active',
        label: 'Active',
        emoji: '🚶',
        description: 'Walking, light hikes, cycling',
      },
      {
        value: 'athletic',
        label: 'Athletic',
        emoji: '🏃',
        description: 'Challenging trails and long days',
      },
    ],
  },
  {
    field: 'languageComfort',
    sectionIndex: 8,
    sectionTitle: 'Language & culture',
    shortLabel: 'Language',
    title: 'How comfortable are you with language barriers?',
    type: 'single',
    options: [
      { value: 'english-only', label: 'English only', emoji: '🇬🇧', description: 'Prefer English-friendly places' },
      { value: 'gestures-ok', label: 'Gestures OK', emoji: '👋', description: 'Point-and-smile traveler' },
      { value: 'adventurous', label: 'Adventurous', emoji: '🗣️', description: 'Phrasebook energy' },
      { value: 'multilingual', label: 'Multilingual', emoji: '🌍', description: 'Comfortable in several languages' },
    ],
  },
  {
    field: 'tripMemorableBy',
    sectionIndex: 9,
    sectionTitle: 'The closer',
    shortLabel: 'What makes it unforgettable',
    title: 'What makes a trip truly unforgettable for you?',
    type: 'single',
    options: [
      {
        value: 'transcendent-experience',
        label: 'A once-in-a-lifetime moment',
        emoji: '✨',
        description: 'One peak experience you still talk about',
      },
      {
        value: 'consistent-quality',
        label: 'Consistent comfort',
        emoji: '🏆',
        description: 'Everything worked — no weak days',
      },
      {
        value: 'unexpected-discoveries',
        label: 'Unexpected finds',
        emoji: '🎲',
        description: 'Places that were not in any guide',
      },
      { value: 'food-drink', label: 'Food & drink', emoji: '🍷', description: 'Meals that defined the trip' },
      {
        value: 'human-connections',
        label: 'Human connections',
        emoji: '🤝',
        description: 'Conversations and locals you remember',
      },
      {
        value: 'being-lost-in-place',
        label: 'Feeling lost in the best way',
        emoji: '🧭',
        description: 'Immersion — the rhythm of a place',
      },
    ],
  },
];
