import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { App } from '@/App';

vi.mock('@/providers/trpc-provider', () => ({
  TrpcProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@/features/traveler-profile', () => ({
  TravelerProfileFormPage: () => <div>Traveler profile form</div>,
}));

vi.mock('@/features/users', () => ({
  AccountLayout: ({ initialSection }: { initialSection?: string }) => (
    <div>
      {initialSection === 'preferences'
        ? 'Account layout — preferences'
        : 'Account layout — default'}
    </div>
  ),
}));

vi.mock('sonner', () => ({
  Toaster: () => null,
}));

const setPath = (pathname: string) => {
  window.history.pushState({}, '', pathname);
};

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setPath('/');
  });

  it('should show the traveler onboarding form when the path is /profile/onboarding', () => {
    setPath('/profile/onboarding');
    render(<App />);
    expect(screen.getByText('Traveler profile form')).toBeInTheDocument();
  });

  it('should show account preferences when the path is /profile/settings', () => {
    setPath('/profile/settings');
    render(<App />);
    expect(screen.getByText('Account layout — preferences')).toBeInTheDocument();
  });

  it('should show account preferences when the path is exactly /profile', () => {
    setPath('/profile');
    render(<App />);
    expect(screen.getByText('Account layout — preferences')).toBeInTheDocument();
  });

  it('should show the default account layout when the path is a profile sub-route other than onboarding or settings', () => {
    setPath('/profile/about');
    render(<App />);
    expect(screen.getByText('Account layout — default')).toBeInTheDocument();
  });

  it('should show the traveler form after in-app navigation to onboarding via pushState', async () => {
    setPath('/profile/about');
    render(<App />);
    expect(screen.getByText('Account layout — default')).toBeInTheDocument();

    window.history.pushState({}, '', '/profile/onboarding');

    await waitFor(() => {
      expect(screen.getByText('Traveler profile form')).toBeInTheDocument();
    });
  });
});
