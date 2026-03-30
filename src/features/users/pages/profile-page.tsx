import { Button, Input, Label, Textarea } from '@gsrosa/atlas-ui';
import { UserIcon } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

import { AccountSectionHeader } from '../components/account-section-header';

const LOCAL_KEY = 'atlas-user-profile-local';

type ProfileState = {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  phone: string;
  country: string;
  bio: string;
  avatarUrl: string;
};

const defaultProfile: ProfileState = {
  firstName: 'Alex',
  lastName: 'Torres',
  email: 'alex.torres@email.com',
  gender: 'Non-binary',
  phone: '+1 555 0123',
  country: 'United States',
  bio: 'Solo traveler. Mountain lover. Always seeking the road less traveled.',
  avatarUrl: '',
};

function loadProfile(): ProfileState {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return { ...defaultProfile };
    return { ...defaultProfile, ...JSON.parse(raw) };
  } catch {
    return { ...defaultProfile };
  }
}

export function ProfilePage() {
  const [profile, setProfile] = React.useState<ProfileState>(() => loadProfile());

  React.useEffect(() => {
    setProfile(loadProfile());
  }, []);

  const initials = React.useMemo(() => {
    const a = profile.firstName.trim().charAt(0) || profile.email.charAt(0) || '?';
    const b =
      profile.lastName.trim().charAt(0) ||
      (profile.firstName ? '' : profile.email.charAt(1) || '');
    return (a + b).toUpperCase();
  }, [profile.firstName, profile.lastName, profile.email]);

  const handleSave = () => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(profile));
    toast.success('Profile updated successfully');
  };

  return (
    <div className="account-fade-in-up space-y-10">
      <AccountSectionHeader
        icon={UserIcon}
        title="Profile"
        description="Manage your personal information"
      />

      <div className="flex items-center gap-5">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-full border border-[var(--atlas-surface-border)] bg-[var(--atlas-surface-container-highest)]">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt=""
              className="size-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-xl font-semibold text-[var(--atlas-surface-foreground)]">
              {initials}
            </div>
          )}
        </div>
        <div>
          <p className="font-medium text-[var(--atlas-surface-foreground)]">
            {profile.firstName} {profile.lastName}
          </p>
          <p className="text-sm text-[var(--atlas-surface-muted-foreground)]">{profile.email}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first-name" className="text-xs uppercase tracking-wider">
              First name
            </Label>
            <Input
              id="first-name"
              value={profile.firstName}
              onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name" className="text-xs uppercase tracking-wider">
              Last name
            </Label>
            <Input
              id="last-name"
              value={profile.lastName}
              onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs uppercase tracking-wider">
            Email
          </Label>
          <Input
            id="email"
            value={profile.email}
            disabled
            className="cursor-not-allowed opacity-70"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="avatar-url" className="text-xs uppercase tracking-wider">
            Avatar URL
          </Label>
          <Input
            id="avatar-url"
            value={profile.avatarUrl}
            onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
            placeholder="https://…"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="gender" className="text-xs uppercase tracking-wider">
              Gender
            </Label>
            <Input
              id="gender"
              value={profile.gender}
              onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-xs uppercase tracking-wider">
              Phone
            </Label>
            <Input
              id="phone"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country" className="text-xs uppercase tracking-wider">
            Country
          </Label>
          <Input
            id="country"
            value={profile.country}
            onChange={(e) => setProfile({ ...profile, country: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio" className="text-xs uppercase tracking-wider">
            Bio
          </Label>
          <Textarea
            id="bio"
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            rows={3}
            className="min-h-[88px]"
          />
        </div>

        <Button
          type="button"
          variant="primary"
          className="rounded-full px-8 font-semibold"
          onClick={handleSave}
        >
          Save changes
        </Button>
      </div>
    </div>
  );
}
