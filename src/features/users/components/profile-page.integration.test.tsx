import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { trpc } from '@/lib/trpc';

import { ProfilePage } from './profile-page';

// Mock trpc
vi.mock('@/lib/trpc', () => {
  return {
    trpc: {
      useUtils: () => ({
        users: {
          me: { setData: vi.fn() },
        },
      }),
      users: {
        me: {
          useQuery: vi.fn().mockReturnValue({
            data: {
              profile: {
                id: '1',
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
              },
            },
            isLoading: false,
          }),
        },
        updateMe: {
          useMutation: vi.fn().mockReturnValue({
            mutate: vi.fn(),
            isPending: false,
          }),
        },
      },
    },
  };
});

describe('ProfilePage integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call updateMe with edited fields when the user saves changes', async () => {
    const user = userEvent.setup();
    const mutateMock = vi.fn();
    vi.mocked(trpc.users.updateMe.useMutation).mockReturnValue({
      mutate: mutateMock,
      isPending: false,
    } as unknown as ReturnType<typeof trpc.users.updateMe.useMutation>);

    render(<ProfilePage />);

    expect(await screen.findByDisplayValue('John')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('Doe')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('john@example.com')).toBeInTheDocument();

    const firstNameInput = screen.getByLabelText(/First name/i);
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Jane');

    const submitBtn = screen.getByRole('button', { name: /Save changes/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          first_name: 'Jane',
          last_name: 'Doe',
        }),
      );
    });
  });
});
