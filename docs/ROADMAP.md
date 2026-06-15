# Product Roadmap

This roadmap keeps the project ambitious while staying safe, demo-focused, and maintainable.

## Phase 1: Make It Reliable

- Fix startup and build issues.
- Load `.env.local` correctly.
- Add basic server tests.
- Add scenario reset and seed data controls.
- Add visible status for API, AI, and frontend health.

## Phase 2: Make It Usable

- Add scenario save/load using localStorage first.
- Add a settings drawer for API state, model selection, and simulation speed.
- Improve mobile layouts for the dashboard and module panels.
- Add operator-friendly empty, loading, and error states.
- Reduce visual clutter in dense panels.

## Phase 3: Make It Advanced

- Introduce typed scenario entities for tracks, systems, nodes, logs, overlays, and simulated events.
- Add a replay timeline for synthetic events.
- Add scenario import/export as JSON.
- Add AI-generated simulation summaries with explicit safety limits.
- Add cross-module search and filtering.

## Phase 4: Make It Product-Grade

- Add automated tests for API routes and core UI behavior.
- Add build checks and formatting.
- Add persistent storage with SQLite or Postgres.
- Add authentication for local operator profiles.
- Add deployment instructions.

## Safety Boundary

The software should remain a simulation and training dashboard. It should not provide real-world targeting, weapons employment, evasion, intrusion, or operational military instructions.
