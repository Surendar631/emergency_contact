# Emergency Contact Manager

Care Circle is a simple emergency contact manager for saving, finding, editing, and removing the people you would call first.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/emergency-contact-manager run dev` — run the web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — PostgreSQL connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Frontend: React + Vite + Wouter + TanStack Query
- Build: esbuild (API bundle) and Vite (frontend bundle)

## Where things live

- `artifacts/emergency-contact-manager/` — web app pages, shell, contact form, and theme
- `artifacts/api-server/src/routes/contacts.ts` — contact CRUD, search, and summary endpoints
- `lib/api-spec/openapi.yaml` — source of truth for the contact API
- `lib/db/src/schema/contacts.ts` — PostgreSQL table and insert model
- `lib/api-client-react/src/generated/` — generated React Query client
- `lib/api-zod/src/generated/` — generated request and response validators

## Architecture decisions

- The app uses the existing shared API service and PostgreSQL database so the frontend and backend remain separate and easy to follow.
- OpenAPI is the source of truth; client hooks and server validators are regenerated instead of hand-maintained.
- Search is performed server-side across name, phone number, relationship, and address.
- The home page uses a read-only summary endpoint so the overview reflects real stored data.

## Product

- View a calm overview of the emergency contact circle and relationship counts.
- Search contacts by name, phone number, relationship, or address.
- Add, edit, and delete contacts with validation and confirmation feedback.
- Persist contact data in PostgreSQL so changes survive reloads.

## User preferences

- Keep the project easy to run and understand for a college-project audience.

## Gotchas

- Run API codegen after changing `lib/api-spec/openapi.yaml`.
- Restart both managed artifact workflows after backend or frontend changes.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
