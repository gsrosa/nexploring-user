import { UserPreferencesFormPageSkeleton } from '@/features/user-preferences/components/user-preferences-form-page-skeleton';
import { UserPreferencesSettingsPageSkeleton } from '@/features/user-preferences/components/user-preferences-settings-page-skeleton';


const resolveRoute = (p: string) => {
  if (/^\/profile\/onboarding\/?$/.test(p)) return 'onboarding';
  if (p === '/profile' || /^\/profile\/settings\/?$/.test(p)) return 'profile';
  return 'profile';
};

export default function UserAppSkeleton() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const route = resolveRoute(path);

  if (route === 'onboarding') return <UserPreferencesFormPageSkeleton />;
  return <UserPreferencesSettingsPageSkeleton />;
}
