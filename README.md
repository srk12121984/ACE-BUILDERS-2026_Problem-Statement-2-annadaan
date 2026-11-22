# Annadaan

Annadaan is a website being built to support the Annadaan initiative. The full product requirements are documented in [Annadaan-PRD.md](Annadaan-PRD.md), which is the source of truth for scope and decisions.

## Overview

Annadaan is a web-based platform. This repository contains the product requirements, brand assets, and a React + Vite web application.

## Product Requirements

See [Annadaan-PRD.md](Annadaan-PRD.md) for the full product requirements document, including version history.

## Project Structure

- `Annadaan-PRD.md` - Product requirements document (source of truth)
- `public/Annadaan-logo.png` - Project logo
- `public/` - Static assets served by the web application
- `src/` - Application source code
- `.codebenders/` - Tool-generated planning and build data

## Status

- Demo UI is complete, with state held in memory and persisted to localStorage.
- AI post parsing via Groq, with a deterministic allergen map.
- Unit tests and a golden-set eval.
- Licensed under Apache-2.0.

A public deployment URL will be added here once the site is deployed.

### Running locally

```bash
npm install
npm run dev
npm run build
```

## Testing

- `npm test` - unit tests (no API key needed).
- `npm run eval` - golden-set AI parsing eval. Needs `GROQ_API_KEY` in `.env`. Takes several minutes because of rate-limit pacing.
- `npm run lint` - lint the source.
- `npm run format:check` - check formatting without changing files.

## Documentation

- [CONTRIBUTING.md](CONTRIBUTING.md) - setup, scripts, code layout and PR checklist.
- [CHANGELOG.md](CHANGELOG.md) - release history.
- [SECURITY.md](SECURITY.md) - how to report a vulnerability.
- [LICENSE](LICENSE) - Apache-2.0 licence text.

## License

Code: Apache-2.0. The Annadaan name and logo are not covered by the licence.
