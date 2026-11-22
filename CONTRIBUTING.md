# Contributing to Annadaan

Thanks for helping. This is a demo-stage project, so keep changes small and focused.

## Setup

1. Use Node 20. The version is pinned in `.nvmrc` (`nvm use` reads it).
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy the environment template and add your key locally:

   ```bash
   cp .env.example .env
   ```

   Set `GROQ_API_KEY` in your local `.env`. Never commit `.env`; it is git-ignored and must stay that way.

## Scripts

- `npm run dev` - start the Vite dev server.
- `npm run build` - type-check with `tsc -b` and produce a production build.
- `npm run preview` - serve the production build locally.
- `npm test` - run the unit tests with Vitest (no API key needed).
- `npm run lint` - run ESLint.
- `npm run format` - format sources with Prettier.
- `npm run format:check` - check formatting without changing files.
- `npm run eval` - run the golden-set AI parsing eval. It needs `GROQ_API_KEY` and takes several minutes because of rate-limit pacing.

## Code layout

- `src/components/` - React UI components.
- `src/components/_internal/` - development-only helpers; not part of the user-facing app.
- `src/lib/` - shared logic, including matching, filters and the allergen map.
- `src/data/` - synthetic demo data.
- `api/parse.ts` - serverless function that calls Groq for AI post parsing. Server-side only.
- `tests/unit/` - unit tests.
- `tests/golden/` - golden-set fixtures for parsing.
- `tests/eval/` - eval runner used by `npm run eval`.

## Before opening a PR

Run these and make sure they pass:

```bash
npm test
npm run lint
npm run build
```

Also run `npm run format:check` if your change touches sources.

## Rules

- **No banned wording in the UI.** Claims are checked by `containsBannedClaims` in `src/lib/rules.ts`. Do not bypass it.
- **The disclaimer must stay visible** on every screen where it currently appears.
- **No secrets in source.** Keys, tokens and passwords belong in `.env` only.
- **No `VITE_` prefix for server keys.** Any `VITE_` variable is bundled into the browser. `GROQ_API_KEY` must never use that prefix.
- **Use synthetic data only** in demos, tests and fixtures. Do not add real personal data.

## Licence

By contributing, you agree that your contributions are licensed under the Apache License 2.0 (see `LICENSE`).
