# Security Policy

## Supported versions

Annadaan is at demo stage. Only the current `main` branch is supported. Older commits and tags receive no security fixes.

## Reporting a vulnerability

Please do not open a public issue for security problems.

Instead, contact the maintainer, Soumya, privately:

- Email: [add contact]
- Or open a private security advisory through GitHub (repository **Security** tab, then **Report a vulnerability**).

Include a clear description, steps to reproduce, and the affected file or endpoint if you know it. We will acknowledge receipt and work on a fix as time allows.

## Scope

In scope:

- **Groq API key handling.** The key must stay server-side. Any path that exposes `GROQ_API_KEY` to the browser, logs, or the repository is in scope.
- **The `api/parse` endpoint.** Input validation, error handling, and abuse of the endpoint as a proxy to Groq.
- **Data exposure.** Any way for one user's view or data to leak to another, or for stored data to be read without intent.

Out of scope: issues that need physical access to a user's device, and social engineering.

## Demo data

The app uses synthetic demo data only. It does not hold real personal, health or payment data. Do not enter real personal information into the demo.
