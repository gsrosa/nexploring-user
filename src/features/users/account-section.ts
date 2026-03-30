export type AccountSectionId =
  | 'profile'
  | 'password'
  | 'payments'
  | 'plans'
  | 'preferences';

export const ACCOUNT_SECTION_LABELS: Record<AccountSectionId, string> = {
  profile: 'Profile',
  password: 'Password',
  payments: 'Payments',
  plans: 'My Plans',
  preferences: 'Preferences',
};
