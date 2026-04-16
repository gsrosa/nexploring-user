/// <reference types="vite/client" />

declare module '@gsrosa/atlas-ui/styles';
declare module '@gsrosa/atlas-ui/tokens';
declare module '@gsrosa/atlas-ui/theme';

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** When `"1"`, `main.tsx` mounts `PlaywrightRoot` for E2E (see `playwright.config.ts`). */
  readonly VITE_PLAYWRIGHT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
