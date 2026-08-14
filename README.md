# BabyGrowth AI

BabyGrowth AI is a web application that helps families track a baby’s development and support the mother’s well-being in one place. The application provides an overview dashboard, daily logs, growth tracking, expense management, family profiles, and care-support interactions.

> **Current status:** This is a frontend prototype/working demo built with React and TypeScript. The current implementation loads local seed data; the service layer is separated so it can be replaced with a real backend API in a later phase.

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

The application currently does not require environment variables or a separate backend to run the demo. Functions in `app/src/services/api.ts` currently return data from `app/src/data/seedData.ts`. When a backend becomes available, the current implementations can be replaced with `fetch()` calls without changing the interfaces used by the UI.

For clarity, the current seed data is intended only for development and demonstration. It must not be treated as real medical or financial data, and the application does not replace advice from a doctor or qualified healthcare professional.

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
