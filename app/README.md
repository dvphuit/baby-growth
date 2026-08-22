# Kinly web app

This directory contains the Kinly React and Vite progressive web app.

## Local development

Install dependencies and start the HTTPS development server:

```bash
npm install
npm run dev
```

The default local origin is `https://localhost:5173`.

## Validation

Run the core checks before opening or updating a pull request:

```bash
npm test
npm run lint
npm run build
```

Run browser-level critical-flow coverage with:

```bash
npm run test:e2e
```

The E2E command builds the application before running the Playwright suite in `e2e/`.

## Environment

Copy the example environment file for local Google Drive integration:

```bash
cp .env.example .env.local
```

Set the OAuth browser client ID:

```text
VITE_GOOGLE_CLIENT_ID=<your web OAuth client ID>
```

Do not commit `.env.local`, service account files, access tokens, or other credentials.

## Source layout

```text
src/
├── app/          # Routes, composition, lifecycle, onboarding
├── features/     # Product domains and their public entry points
├── shared/       # Reusable UI, hooks, libraries, and styles
└── data/         # Physical local persistence boundary
```

Cross-feature production imports must go through `features/<feature>/index.ts`. Architecture tests enforce the dependency rules documented in `../ARCHITECTURE.md`.

## Persistence compatibility

The Kinly rebrand does not rename existing storage or backup identifiers. Values such as `babygrowth-local`, `babygrowth_v4_*`, and `babygrowth-sync*.json` are historical compatibility contracts used by existing installations and Google Drive backups.

Do not rename those identifiers without an explicit migration that preserves existing user data.

## Deployment

Firebase Hosting serves `dist/`.

```bash
npm run deploy:test
npm run deploy:production
```

See the repository-level `../README.md` for product setup and `../DESIGN.md` for UI conventions.
