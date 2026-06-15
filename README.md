# Storm Fire C2 Portal

Storm Fire C2 Portal is a React + Vite + Express simulation dashboard. It is intended for UI prototyping, demo scenarios, training-style workflows, and AI-assisted analysis of synthetic data.

This is not connected to real military systems, live sensors, weapons, or operational networks.

## First Run

Prerequisites:

- Node.js 22 or newer
- A Gemini API key only if you want the AI advisor panel to respond

Install dependencies:

```powershell
npm.cmd install
```

Create your local environment file:

```powershell
Copy-Item .env.example .env.local
```

Open `.env.local` and replace `MY_GEMINI_API_KEY` with your own key. Leave it as-is if you only want to explore the UI.

Run the app:

```powershell
npm.cmd run dev
```

Open:

```text
http://127.0.0.1:3000
```

## Useful Commands

```powershell
npm.cmd run dev
npm.cmd run lint
npm.cmd run build
```

If PowerShell blocks `npm`, use `npm.cmd` exactly as shown above.

## Health Check

With the dev server running, open:

```text
http://127.0.0.1:3000/api/health
```

Expected response without a Gemini key:

```json
{"status":"ok","geminiConfigured":false}
```

Expected response after setting `GEMINI_API_KEY`:

```json
{"status":"ok","geminiConfigured":true}
```

## Project Layout

- `server.ts` runs Express, serves Vite in development, and exposes API routes.
- `src/App.tsx` owns the main dashboard state and view switching.
- `src/components/` contains the C2 simulation modules.
- `.env.example` documents local environment variables.
- `docs/BEGINNER_GUIDE.md` explains the workflow if you are new to Codex.
- `docs/ROADMAP.md` tracks the path toward a more advanced product.

## Current Direction

The best next upgrades are:

- Make the dashboard easier to operate and debug.
- Add persistent scenario save/load.
- Add stronger simulated data models.
- Improve AI advisor UX around safe training briefs.
- Add tests and build checks before larger refactors.
