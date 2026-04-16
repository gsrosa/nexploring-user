import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ProfilePage } from '@/features/users/components/profile-page';
import * as useProfileFormModule from '@/features/users/hooks/use-profile-form';

vi.mock('@/features/users/hooks/use-profile-form', () => ({
  useProfileForm: vi.fn(),
}));

vi.mock('react-hook-form', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-hook-form')>();
  return {
    ...actual,
    Controller: ({
      render,
      name,
    }: {
      render: (args: {
        field: { name: string; value: string; onChange: () => void; onBlur: () => void; ref: () => void };
      }) => React.ReactNode;
      name: string;
    }) =>
      render({
        field: {
          name,
          value: '',
          onChange: vi.fn(),
          onBlur: vi.fn(),
          ref: vi.fn(),
        },
      }),
  };
});

type ProfileFormHookValue = ReturnType<typeof useProfileFormModule.useProfileForm>;

describe('ProfilePage', () => {
  const mockOnSubmit = vi.fn();
  const mockRegister = vi
    .fn()
    .mockImplementation((name: string) => ({
      name,
      onChange: vi.fn(),
      onBlur: vi.fn(),
      ref: vi.fn(),
    }));
  const mockWatch = vi.fn();

  const defaultHookValue: ProfileFormHookValue = {
    form: {
      register: mockRegister,
      control: {},
      formState: { errors: {} },
      watch: mockWatch,
    },
    profile: { id: '1', email: 'test@example.com' },
    isLoadingProfile: false,
    isSubmitting: false,
    onSubmit: mockOnSubmit,
  } as unknown as ProfileFormHookValue;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useProfileFormModule.useProfileForm).mockReturnValue(defaultHookValue);
  });

  it('should show the profile heading and main fields when the profile is ready', () => {
    render(<ProfilePage />);

    expect(screen.getByRole('heading', { name: /Profile/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/First name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save changes/i })).toBeInTheDocument();
  });

  it('should disable editable fields when the profile is still loading', () => {
    vi.mocked(useProfileFormModule.useProfileForm).mockReturnValueOnce({
      ...defaultHookValue,
      profile: null,
      isLoadingProfile: true,
    } as unknown as ProfileFormHookValue);

    render(<ProfilePage />);

    expect(screen.getByLabelText(/First name/i)).toBeDisabled();
    expect(screen.getByLabelText(/Last name/i)).toBeDisabled();
  });

  it('should surface field validation messages from the form state', () => {
    vi.mocked(useProfileFormModule.useProfileForm).mockReturnValueOnce({
      ...defaultHookValue,
      profile: null,
      form: {
        register: mockRegister,
        control: {},
        formState: {
          errors: {
            first_name: { type: 'required', message: 'First name is required' },
          },
        },
        watch: mockWatch,
      },
    } as unknown as ProfileFormHookValue);

    render(<ProfilePage />);
    expect(screen.getByText('First name is required')).toBeInTheDocument();
  });

  it('should invoke the submit handler when the user submits the form', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockImplementation((e: React.FormEvent) => {
      e.preventDefault();
    });

    render(<ProfilePage />);
    const submitButton = screen.getByRole('button', { name: /Save changes/i });

    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalled();
  });
});
