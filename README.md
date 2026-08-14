# BabyGrowth AI

BabyGrowth AI is a web application that helps families track a baby’s development and support the mother’s well-being in one place. The application provides an overview dashboard, daily logs, growth tracking, expense management, family profiles, and care-support interactions.

> **Current status:** This is a frontend-only, local-first web app built with React and TypeScript. User data is stored in the browser's IndexedDB and can be synchronized to the user's Google Drive `appDataFolder` without a dedicated application backend.

## Key Features

| Area | Description |
| --- | --- |
| Dashboard | Summarizes the baby’s and mother’s status, daily habits, quick metrics, and logging actions. |
| Timeline and journal | Records events, emotions, care activities, and family content by date. |
| Growth tracking | Manages weight, height, head circumference, measurement history, and WHO-style growth charts. |
| Mother care | Tracks postpartum well-being, mood, and pumping sessions. |
| Family expenses | Tracks budgets, category-based expenses, spending charts, and baby-related costs. |
| Baby profile | Displays personal information, current measurements, vaccinations, milestones, and family details. |
| AI support | Provides a chat interface and suggested care questions based on the current sample knowledge base. |
| PWA | Can be installed as an application on supported devices and uses caching/offline mechanisms for precached assets. |
| Local data | Zustand persistence backed by IndexedDB, with lazy migration from the previous localStorage keys. |
| Google sync | Google Identity Services token model + Google Drive API `appDataFolder`; synchronization is initiated from the browser. |

## Technology Stack

| Component | Technology |
| --- | --- |
| UI | React 19, TypeScript |
| Build tool | Vite 7 |
| Routing | React Router 7 |
| State management | Zustand 5 |
| Charts | Chart.js |
| Icons and effects | Lucide React, canvas-confetti |
| PWA | vite-plugin-pwa, Workbox |
| Code quality | ESLint, TypeScript |
| Planned hosting | Firebase Hosting |

## System Requirements

Install the following tools before getting started:

- Node.js 20 or later; Node.js 22 is recommended.
- npm, which is included with Node.js.
- Git if you want to clone the repository from GitHub.

You can check your installed versions with:

```bash
node --version
npm --version
git --version
```

## Installation and Development

The frontend application is located in the `app/` directory. Run the following commands from the repository root:

```bash
git clone https://github.com/dvphuit/baby-growth.git
cd baby-growth/app
npm install
npm run dev
```

After Vite starts, the terminal will display the local address. Because the project enables the SSL plugin for development, the usual address is `https://localhost:5173`. Your browser may display a warning for the self-signed local certificate; this is expected during development.

## Available npm Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Starts the Vite development server with hot module replacement. |
| `npm run build` | Type-checks the project and creates a production build in `app/dist/`. |
| `npm run lint` | Runs ESLint against the project source. |
| `npm run preview` | Serves the production build locally after `npm run build` has completed. |

Example validation workflow before opening a pull request:

```bash
cd app
npm run lint
npm run build
npm run preview
```

## Project Structure

```text
baby-growth/
├── app/
│   ├── public/              # Static assets and PWA icons
│   ├── src/
│   │   ├── components/      # Components grouped by feature area
│   │   ├── data/            # Current seed/mock data
│   │   ├── hooks/           # Shared React hooks
│   │   ├── services/        # Data and API service layer
│   │   ├── store/           # Zustand stores
│   │   ├── styles/           # Component styles and design tokens
│   │   ├── types/            # TypeScript domain types
│   │   ├── App.tsx           # Main application composition and routes
│   │   └── main.tsx          # React entry point
│   ├── firebase.json         # Firebase Hosting configuration
│   ├── package.json          # Scripts and dependencies
│   └── vite.config.ts        # Vite, PWA, alias, and local SSL configuration
├── DESIGN.md                # Design direction and design tokens
└── README.md                # Project documentation
```

## Data and Backend

BabyGrowth is intentionally **local-first** and does not require an application server. The persisted Zustand stores use IndexedDB through `app/src/services/localDb.ts`. Existing values from the old `localStorage` keys are migrated lazily when each store is first opened, so the architecture change does not discard current browser data.

The optional Google integration is implemented in `app/src/services/googleDriveSync.ts`. After the user grants permission, the browser obtains a short-lived access token through Google Identity Services and stores one JSON snapshot in the application's private Drive space, `appDataFolder`. The app does not store a Google refresh token or require a server-side credential. This is device-to-Drive backup/synchronization, not real-time multi-user collaboration.

The `app/src/services/api.ts` module still returns seed data for the read-only demo knowledge and reference content. User-generated state is persisted locally and included in the sync snapshot. The seed data is intended only for development and demonstration; it must not be treated as real medical or financial data, and the application does not replace advice from a doctor or qualified healthcare professional.

## Configure Google Drive Sync

Create an OAuth 2.0 **Web application** client in Google Cloud Console, configure the OAuth consent screen, enable the Google Drive API, and add each development or production origin to the client's Authorized JavaScript origins. The app requests the narrow `https://www.googleapis.com/auth/drive.appdata` scope, which is intended for application-specific data.

Copy `app/.env.example` to `app/.env.local` and replace the placeholder value:

```bash
cd app
cp .env.example .env.local
# Edit .env.local and set VITE_GOOGLE_CLIENT_ID
npm run dev
```

Open the profile page, select **Kết nối Google & đồng bộ**, and approve the Google consent dialog. On later devices using the same Google Account, the app compares the local IndexedDB snapshot with the Drive snapshot. If only one side changed, it automatically downloads or uploads the changed version. If both sides changed, the profile page presents an explicit choice between keeping the local data and using the Drive data.

Never commit `.env.local` or OAuth client secrets. The browser client ID is not a secret, but the authorized origins and requested scopes must be configured deliberately.

## Test Deployment to Firebase Hosting

A test deployment script is available at `app/scripts/deploy-test.sh`. It runs linting and a production build, then deploys a Firebase Hosting preview channel named `test` for seven days. The script includes the public Google OAuth Client ID supplied for BabyGrowth and supports overrides through environment variables.

Install and authenticate the Firebase CLI once:

```bash
npm install --global firebase-tools
firebase login
```

Run the test deployment from the application directory:

```bash
cd app
npm run deploy:test
```

The script defaults to Firebase project `baby-growth-dvphu` and uses the preview channel `test`. To override either value:

```bash
FIREBASE_PROJECT_ID=baby-growth-dvphu \\
FIREBASE_CHANNEL_ID=qa \\
npm run deploy:test
```

Firebase prints a preview URL after deployment. Add the exact preview origin, containing only the scheme and hostname, to **Google Auth Platform → Clients → Authorized JavaScript origins** before testing OAuth. Preview URLs may contain a generated host, so do not add `/profile` or other paths as origins. The preview channel expires after seven days.

## Build and Deploy to Firebase Hosting

Firebase Hosting configuration is stored in `app/firebase.json`. The deployment directory is `app/dist/`, and all routes are rewritten to `index.html` to support SPA routing.

After installing the Firebase CLI and signing in with an account that has access to the Firebase project, build and deploy with:

```bash
cd app
npm install
npm run build
firebase deploy --only hosting
```

Confirm that the active Firebase account has access to the project before deploying. Never commit credentials or secrets to Git. When integrating a backend, use a local `.env` file for development and an appropriate secret-management solution for deployed environments.

## Contributing

When developing a new feature, create a dedicated branch, keep the change focused, and run `npm run lint` and `npm run build` before opening a pull request. New components should be placed in the relevant feature group under `app/src/components/`, while shared state logic should be organized under `app/src/store/`.

## License

The repository currently does not include a `LICENSE` file. Contact the repository owner to confirm the terms of use before distributing or reusing the source code in another product.
