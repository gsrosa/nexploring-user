export type AccountSectionId =
  | 'profile'
  | 'password'
  | 'payments'
  | 'preferences';

export const ACCOUNT_SECTION_LABELS: Record<AccountSectionId, string> = {
  profile: 'Profile',
  password: 'Password',
  payments: 'Payments',
  preferences: 'Preferences',
};
