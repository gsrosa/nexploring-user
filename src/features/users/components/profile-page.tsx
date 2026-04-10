import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@gsrosa/atlas-ui';
import { UserIcon } from 'lucide-react';
import { Controller } from 'react-hook-form';

import { AccountSectionHeader } from './account-section-header';
import { useProfileForm } from '../hooks/use-profile-form';
import { FormField } from './form-field';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const;

export function ProfilePage() {
  const { form, profile, isLoadingProfile, isSubmitting, onSubmit } = useProfileForm();
  const { register, control, formState: { errors } } = form;

  const firstName = form.watch('first_name');
  const lastName = form.watch('last_name');
  const avatarUrl = form.watch('avatar_url');

  const initials = (() => {
    const a = firstName?.trim().charAt(0) || profile?.email?.charAt(0) || '?';
    const b = lastName?.trim().charAt(0) ?? '';
    return (a + b).toUpperCase();
  })();

  return (
    <div className="account-fade-in-up space-y-10">
      <AccountSectionHeader
        icon={UserIcon}
        title="Profile"
        description="Manage your personal information"
      />

      <div className="flex items-center gap-5">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-full border border-[var(--atlas-surface-border)] bg-[var(--atlas-surface-container-highest)]">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <div className="flex size-full items-center justify-center text-xl font-semibold text-[var(--atlas-surface-foreground)]">
              {isLoadingProfile ? '…' : initials}
            </div>
          )}
        </div>
        <div>
          {isLoadingProfile ? (
            <div className="h-4 w-32 animate-pulse rounded bg-[var(--atlas-surface-border)]" />
          ) : (
            <>
              <p className="font-medium text-[var(--atlas-surface-foreground)]">
                {firstName} {lastName}
              </p>
              <p className="text-sm text-[var(--atlas-surface-muted-foreground)]">
                {profile?.email ?? ''}
              </p>
            </>
          )}
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="First name" htmlFor="first-name" error={errors.first_name?.message}>
            <Input
              id="first-name"
              disabled={isLoadingProfile}
              {...register('first_name')}
            />
          </FormField>
          <FormField label="Last name" htmlFor="last-name" error={errors.last_name?.message}>
            <Input
              id="last-name"
              disabled={isLoadingProfile}
              {...register('last_name')}
            />
          </FormField>
        </div>

        <FormField label="Email" htmlFor="email">
          <Input
            id="email"
            value={profile?.email ?? ''}
            disabled
            className="cursor-not-allowed opacity-70"
            readOnly
          />
        </FormField>

        <FormField
          label="Avatar URL"
          htmlFor="avatar-url"
          error={errors.avatar_url?.message}
        >
          <Input
            id="avatar-url"
            placeholder="https://…"
            disabled={isLoadingProfile}
            {...register('avatar_url')}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="Gender" htmlFor="gender" error={errors.gender?.message}>
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <Select
                  value={field.value ?? ''}
                  onValueChange={(val) =>
                    field.onChange(val === '' ? undefined : val)
                  }
                  disabled={isLoadingProfile}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDER_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField label="Phone" htmlFor="phone" error={errors.phone?.message}>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 555 0123"
              disabled={isLoadingProfile}
              {...register('phone')}
            />
          </FormField>
        </div>

        <FormField
          label="Country"
          htmlFor="country"
          error={errors.country?.message}
          hint="2-letter ISO code (e.g. US, BR, PT)"
        >
          <Input
            id="country"
            placeholder="US"
            maxLength={2}
            disabled={isLoadingProfile}
            {...register('country')}
          />
        </FormField>

        <FormField label="Bio" htmlFor="bio" error={errors.bio?.message}>
          <Textarea
            id="bio"
            rows={3}
            className="min-h-[88px]"
            disabled={isLoadingProfile}
            {...register('bio')}
          />
        </FormField>

        <Button
          type="submit"
          variant="primary"
          className="rounded-full px-8 font-semibold"
          disabled={isSubmitting || isLoadingProfile}
        >
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </Button>
      </form>
    </div>
  );
}
