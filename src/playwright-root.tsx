import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { TravelerProfileFormPage } from '@/features/traveler-profile';
import { AccountLayout } from '@/features/users';
import { PasswordPage } from '@/features/users/components/password-page';
import { ProfilePage } from '@/features/users/components/profile-page';
import PreferencesPage from '@/features/users/components/preferences-page';
import ProfileLayout from '@/features/users/profile-layout';
import { TrpcProvider } from '@/providers/trpc-provider';

/**
 * Router harness for Playwright only (`VITE_PLAYWRIGHT=1`).
 * Mirrors shell profile URLs + standalone App paths used by `App.tsx`.
 */
export const PlaywrightRoot = () => {
  return (
    <React.Fragment>
      <BrowserRouter>
        <Routes>
          <Route path="profile">
            <Route
              path="onboarding"
              element={
                <TrpcProvider>
                  <TravelerProfileFormPage />
                </TrpcProvider>
              }
            />
            <Route
              path="settings"
              element={
                <TrpcProvider>
                  <AccountLayout initialSection="preferences" />
                </TrpcProvider>
              }
            />
            <Route
              path="wrapped-account"
              element={
                <TrpcProvider>
                  <AccountLayout />
                </TrpcProvider>
              }
            />

            <Route element={<ProfileLayout />}>
              <Route index element={<Navigate to="about" replace />} />
              <Route path="about" element={<ProfilePage />} />
              <Route path="password" element={<PasswordPage />} />
              <Route path="preferences" element={<PreferencesPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </React.Fragment>
  );
};
