# atlas-user

User/account microfrontend. Loaded by atlas-shell via Module Federation.

## Dev
```bash
pnpm dev    # check vite.config for port
pnpm build  # tsc -b && vite build
```

## Module Federation
Remote — exposes `App` to the shell. Registered in shell as `userApp`.
Feature-flagged via `enableUserApp` in shell's `feature-flags.ts`.
Route: `requireAuth: true` — shell blocks access without a valid session.

## Notes
- Handles profile, saved trip plans, account settings
- Auth context comes from the shell — use `atlas:request-login` event if session expires
