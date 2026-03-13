# Rocketship Astro Frontend

Astro 6 frontend that links to the Payload CMS backend in this monorepo.

## Commands

Run commands from the repository root so pnpm uses the workspace:

| Command | Action |
| --- | --- |
| `pnpm dev:frontend` | Start the Astro dev server (defaults to `http://localhost:4321`) |
| `pnpm --filter @rocketship/frontend build` | Build the static site to `apps/frontend/dist` |
| `pnpm --filter @rocketship/frontend preview` | Preview the production build locally |

## Backend connection

Set `PUBLIC_PAYLOAD_URL` to the base URL of the Payload backend (for example `http://localhost:3000`). The landing page uses this to link to the admin UI and API.
