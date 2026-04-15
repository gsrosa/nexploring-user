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

## AI Engineering Infrastructure (.ai/)

See `.ai/README.md` for the full overview. Key sections:

### Rules — read before writing any code
- `.ai/rules/core.md` — non-negotiable rules (imports, naming, YAGNI)
- `.ai/rules/react.md` — React & TypeScript patterns
- `.ai/rules/state.md` — state management decision matrix
- `.ai/rules/naming.md` — naming conventions
- `.ai/rules/structure.md` — folder structure rules
- `.ai/rules/forms.md` — react-hook-form + zod patterns
- `.ai/rules/api.md` — tRPC client usage
- `.ai/rules/styling.md` — tokens, CVA, cn() usage
- `.ai/rules/testing.md` — testing conventions
- `.ai/rules/skeletons.md` — skeleton required for every page and MFE

### Architecture Decisions — read when touching affected areas
- `.ai/decisions/index.md` — table of all ADRs
- `.ai/decisions/001-mf-communication.md` — how MFs communicate via shell
- `.ai/decisions/003-state-per-layer.md` — state solution per layer

### Templates — use when scaffolding new code
- `.ai/templates/feature.md` — new feature checklist + folder scaffold
- `.ai/templates/component.md` — component pattern
- `.ai/templates/hook.md` — hook pattern

### Active Context — read when continuing an in-progress feature
- `.ai/context/current.md` — last session state, next steps, open decisions
