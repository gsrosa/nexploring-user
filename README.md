# Atlas User (Remote MFE)

User account microfrontend for the Atlas shell. Exposes `App` via Module Federation (`userApp`). The layout and Profile screen follow the same information architecture as the [itinerary-idols](https://github.com/gsrosa/itinerary-idols) account area (sidebar: Profile, Password, Payments, My Plans, Preferences; profile form with avatar, name, email, gender, phone, country, bio).

## Stack

- Vite 6 + React 19 + TypeScript (same as `atlas-ai-assistant`)
- Module Federation (`@originjs/vite-plugin-federation`), remote name `userApp`
- Tailwind CSS v4 (`@tailwindcss/vite`)
- `@gsrosa/atlas-ui` + dark `AtlasProvider` (matches the AI Assistant remote)
- TanStack Query + tRPC client (`atlas-bff` types) calling `users.me` / `users.updateMe`
- Supabase JS auth in the browser; access token is sent to the BFF as `Authorization: Bearer …`

## Scripts

- `pnpm dev` — dev server on port **3003**
- `pnpm build` — production build
- `pnpm preview` — serve build on port 3003

Copy `.env.example` to `.env` and set `VITE_SUPABASE_*` and optionally `VITE_API_URL`.

## BFF & CORS

Point `VITE_API_URL` at your Atlas BFF (default `http://localhost:4000`). Ensure the BFF `CORS_ORIGINS` includes the origin that serves this app (e.g. `http://localhost:3003` for local dev).

## Running with the shell

1. Build or run this remote: `pnpm dev` (or `pnpm build && pnpm preview`).
2. Register the remote in `atlas-shell` (same pattern as `aiAssistant`): add `userApp` to `module-federation/remotes.ts`, `vite-env.d.ts`, `load-remote-module.ts`, `microfrontendRegistry`, routes, and feature flag as needed. Point the URL at `http://localhost:3003/assets/remoteEntry.js`.

## Data notes

- **Profile** persists `display_name` and `avatar_url` through the BFF (`users.updateMe`). Email comes from the Supabase session (read-only in the UI).
- **Gender, phone, country, bio** are stored in `localStorage` until you add fields to your API (mirrors the itinerary-idols mock profile without changing `atlas-bff`).
