import { Button, Input, Label } from '@gsrosa/atlas-ui';
import { LockIcon } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

import { AccountSectionHeader } from '../components/account-section-header';

export function PasswordPage() {
  const [current, setCurrent] = React.useState('');
  const [newPass, setNewPass] = React.useState('');
  const [confirm, setConfirm] = React.useState('');

  const handleSave = () => {
    if (newPass !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPass.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    toast.success('Password updated successfully');
    setCurrent('');
    setNewPass('');
    setConfirm('');
  };

  const canSubmit = Boolean(current && newPass && confirm);

  return (
    <div className="account-fade-in-up space-y-10">
      <AccountSectionHeader
        icon={LockIcon}
        title="Password"
        description="Update your password to keep your account secure"
      />

      <div className="max-w-md space-y-6">
        <div className="space-y-2">
          <Label htmlFor="pwd-current" className="text-xs uppercase tracking-wider">
            Current password
          </Label>
          <Input
            id="pwd-current"
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pwd-new" className="text-xs uppercase tracking-wider">
            New password
          </Label>
          <Input
            id="pwd-new"
            type="password"
            autoComplete="new-password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pwd-confirm" className="text-xs uppercase tracking-wider">
            Confirm new password
          </Label>
          <Input
            id="pwd-confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        <Button
          type="button"
          variant="primary"
          className="rounded-full px-8 font-semibold"
          disabled={!canSubmit}
          onClick={handleSave}
        >
          Update password
        </Button>
      </div>
    </div>
  );
}
