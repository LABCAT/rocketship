# Rocketship Monorepo (Payload + Astro)

This repository is a pnpm workspace that hosts both the Payload CMS backend and an Astro 6 frontend.

- **Backend:** Next.js + Payload CMS (Cloudflare Worker build) in the repository root.
- **Frontend:** Astro app in `apps/frontend`, pointed at the Payload backend via `PUBLIC_PAYLOAD_URL`.

> Node 24 is required—`.nvmrc` is provided. Use `pnpm` for all commands.

## Monorepo quick start

```bash
nvm use                  # install/use Node 24
pnpm install             # install workspace deps (root + apps + packages)
pnpm env:payload-secret  # generate/update PAYLOAD_SECRET in .env
pnpm dev:backend         # Payload/Next API + admin (http://localhost:3000)
pnpm dev:frontend        # Astro frontend (http://localhost:4321)
pnpm dev:storybook       # Storybook for Rocketship components (http://localhost:6006)
pnpm dev:all             # backend + frontend in parallel
```

Set `PUBLIC_PAYLOAD_URL` (e.g. `http://localhost:3000`) when running the frontend so its links target the correct backend.

## Workspace layout

- **Root:** Payload/Next backend and workspace config.
- **`apps/`:** `frontend` (Astro site + Storybook for Rocketship UI; see below).
- **`packages/`:** `base` — `@rocketship/base`, minimal scaffold (package.json, tsconfig, SCSS entry at `src/styles/index.scss`). No components exported yet. Consume via `@rocketship/base/styles` or workspace dependency.

## Storybook

Storybook runs inside `apps/frontend` (Astro + `@storybook-astro/framework`), wired to `@rocketship/base` Astro components and styles. Run `pnpm dev:storybook` for dev (http://localhost:6006) or `pnpm build:storybook` for a static build (output: `apps/frontend/storybook-static`).

## Frontend: Astro 6

The public site lives in `apps/frontend`. Run `pnpm dev:frontend` (optionally `--host --port 4321`) and set `PUBLIC_PAYLOAD_URL` to point at your running Payload instance. Build and preview with `pnpm run build:frontend` / `pnpm run preview:frontend`.

## Backend: Payload Cloudflare Template

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/payloadcms/payload/tree/main/templates/with-cloudflare-d1)

**This can only be deployed on Paid Workers right now due to size limits.** This template comes configured with the bare minimum to get started on anything you need.

### Local Development

Use the monorepo quick start above; `pnpm dev:backend` runs the Payload/Next server locally while Wrangler provides local bindings for R2 and D1.

## How it works

Out of the box, using [`Wrangler`](https://developers.cloudflare.com/workers/wrangler/) will automatically create local bindings for you to connect to the remote services and it can even create a local mock of the services you're using with Cloudflare.

We've pre-configured Payload for you with the following:

### Collections

See the [Collections](https://payloadcms.com/docs/configuration/collections) docs for details on how to extend this functionality.

- #### Users (Authentication)

  Users are auth-enabled collections that have access to the admin panel.

  For additional help, see the official [Auth Example](https://github.com/payloadcms/payload/tree/main/examples/auth) or the [Authentication](https://payloadcms.com/docs/authentication/overview#authentication-overview) docs.

- #### Media

  This is the uploads enabled collection.

### Image Storage (R2)

Images will be served from an R2 bucket which you can then further configure to use a CDN to serve for your frontend directly.

### D1 Database

The Worker will have direct access to a D1 SQLite database which Wrangler can connect locally to, just note that you won't have a connection string as you would typically with other providers.

You can enable read replicas by adding `readReplicas: 'first-primary'` in the DB adapter and then enabling it on your D1 Cloudflare dashboard. Read more about this feature on [our docs](https://payloadcms.com/docs/database/sqlite#d1-read-replicas).

## Working with Cloudflare

Firstly, after installing dependencies locally you need to authenticate with Wrangler by running:

```bash
pnpm wrangler login
```

This will take you to Cloudflare to login and then you can use the Wrangler CLI locally for anything, use `pnpm wrangler help` to see all available options.

Wrangler is pretty smart so it will automatically bind your services for local development just by running `pnpm dev`.

## Deployments

When you're ready to deploy, first make sure you have created your migrations:

```bash
pnpm payload migrate:create
```

Then run the following command:

```bash
pnpm run deploy
```

This will spin up Wrangler in `production` mode, run any created migrations, build the app and then deploy the bundle up to Cloudflare.

That's it! You can if you wish move these steps into your CI pipeline as well.

## Enabling logs

By default logs are not enabled for your API, we've made this decision because it does run against your quota so we've left it opt-in. But you can easily enable logs in one click in the Cloudflare panel, [see docs](https://developers.cloudflare.com/workers/observability/logs/workers-logs/#enable-workers-logs).

### Logger Configuration

This template includes a custom console-based logger compatible with Cloudflare Workers. Payload's default logger uses `pino-pretty`, which relies on Node.js APIs not available in Workers and would cause `fs.write is not implemented` errors.

The custom logger in `payload.config.ts`:

- Routes logs through `console.*` methods which Workers handles correctly
- Outputs JSON-formatted logs for Cloudflare observability
- Only active in production (development uses the default `pino-pretty` for better DX)

You can control the log level via the `PAYLOAD_LOG_LEVEL` environment variable (e.g., `debug`, `info`, `warn`, `error`).

### Diagnostic Channel Errors

If you see "Failed to publish diagnostic channel message" errors in your observability logs, these typically come from the `undici` HTTP client library. The template includes `skipSafeFetch: true` in the Media collection to use native fetch instead of undici for file uploads, which helps reduce these errors.

Cloudflare Workers runs in an [isolated environment that cannot access private IP ranges](https://developers.cloudflare.com/workers-vpc/examples/route-across-private-services/) by default, providing built-in SSRF protection. This makes `skipSafeFetch` safe to use.

## Known issues

### GraphQL

We are currently waiting on some issues with GraphQL to be [fixed upstream in Workers](https://github.com/cloudflare/workerd/issues/5175) so full support for GraphQL is not currently guaranteed when deployed.

### Worker size limits

We currently recommend deploying this template to the Paid Workers plan due to bundle [size limits](https://developers.cloudflare.com/workers/platform/limits/#worker-size) of 3mb. We're actively trying to reduce our bundle footprint over time to better meet this metric.

This also applies to your own code, in the case of importing a lot of libraries you may find yourself limited by the bundle.

## Questions

If you have any issues or questions, reach out to us on [Discord](https://discord.com/invite/payload) or start a [GitHub discussion](https://github.com/payloadcms/payload/discussions).
