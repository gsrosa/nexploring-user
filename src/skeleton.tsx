import { TravelerProfileFormPageSkeleton } from '@/features/traveler-profile/components/traveler-profile-form-page-skeleton';
import { TravelerProfileSettingsPageSkeleton } from '@/features/traveler-profile/components/traveler-profile-settings-page-skeleton';

const resolveRoute = (p: string) => {
  if (/^\/profile\/onboarding\/?$/.test(p)) return 'onboarding';
  if (p === '/profile' || /^\/profile\/settings\/?$/.test(p)) return 'profile';
  return 'profile';
};

export default function UserAppSkeleton() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const route = resolveRoute(path);

  if (route === 'onboarding') return <TravelerProfileFormPageSkeleton />;
  return <TravelerProfileSettingsPageSkeleton />;
}
