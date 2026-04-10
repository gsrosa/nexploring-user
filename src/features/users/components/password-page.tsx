import { Button, Input } from '@gsrosa/atlas-ui';
import { LockIcon } from 'lucide-react';

import { AccountSectionHeader } from './account-section-header';
import { usePasswordForm } from '../hooks/use-password-form';
import { FormField } from './form-field';

export function PasswordPage() {
  const { form, isSubmitting, onSubmit } = usePasswordForm();
  const { register, formState: { errors } } = form;

  return (
    <div className="account-fade-in-up space-y-10">
      <AccountSectionHeader
        icon={LockIcon}
        title="Password"
        description="Update your password to keep your account secure"
      />

      <form onSubmit={onSubmit} className="max-w-md space-y-6">
        <FormField
          label="Current password"
          htmlFor="pwd-current"
          error={errors.currentPassword?.message}
        >
          <Input
            id="pwd-current"
            type="password"
            autoComplete="current-password"
            {...register('currentPassword')}
          />
        </FormField>

        <FormField
          label="New password"
          htmlFor="pwd-new"
          error={errors.newPassword?.message}
          hint="At least 12 characters with uppercase, lowercase and a number"
        >
          <Input
            id="pwd-new"
            type="password"
            autoComplete="new-password"
            {...register('newPassword')}
          />
        </FormField>

        <FormField
          label="Confirm new password"
          htmlFor="pwd-confirm"
          error={errors.confirmPassword?.message}
        >
          <Input
            id="pwd-confirm"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
          />
        </FormField>

        <Button
          type="submit"
          variant="primary"
          className="rounded-full px-8 font-semibold"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </div>
  );
}
