# PyPhos ☀️

The web client for PyPhos, a solar energy yield estimation tool. Lets users create projects, configure scenarios, and view generated energy production reports.

Talks to the [PyPhos backend API](../backend/README.md) for authentication, project/scenario management, and report calculations.

## How it works

1. A user signs up / logs in and lands on their **projects** list
2. They create a **project** for a specified location (geocoded via the backend)
3. Within a project, they add one or more **scenarios**, each with a module type, quantity, tilt, and azimuth
4. Triggering a calculation fetches irradiance data through the backend and returns an energy yield **report**, rendered as charts and summary stats

## Stack

- **React 19** + **Vite**: UI and build tooling
- **React Router**: client-side routing
- **Tailwind CSS 4**: styling
- **shadcn/ui** (Base UI primitives): component library
- **Recharts**: yield report charts
- **Leaflet**: interactive location map
- **jwt-decode**: token validation on the client

## Screens

| Screen | Route | Description |
|---|---|---|
| `Login` | `/login` | Sign in |
| `Signup` | `/signup` | Create an account |
| `AllProjects` | `/projects` | List and create projects |
| `Project` | `/projects/:projectId` | View a project's details, its scenarios and their reports |
| `CreateScenario` | `/projects/:projectId/scenarios/create` | Configure a new scenario |
| `Scenario` | `/projects/:projectId/scenarios/:scenarioId` | Edit scenario details |
| `Settings` | `/settings` | Manage account settings |

All routes except `/login` and `/signup` are behind `PrivateRoute`, which checks for a valid JWT and redirects to `/login` otherwise.

## Setup

**Requirements:** Node 18+, the [backend](../backend/README.md) running locally on port 8000

```bash
# install
cd frontend
npm install

# start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`. Requests to `/api/*` are proxied to `http://localhost:8000` in development (see `vite.config.js`), and to the deployed backend in production (see `vercel.json`).