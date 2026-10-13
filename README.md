# Resource Reservation Management System

A reservation manager for shared organizational resources such as meeting rooms, equipment, vehicles, and labs. It supports resource administration, availability search, booking, rescheduling, cancellation, and a calendar dashboard. PostgreSQL is the final authority for preventing conflicting bookings, including concurrent requests.

## Project links

- Repository: [source code](<REPOSITORY_URL>)
- Demo video: [watch the demo](<DEMO_VIDEO_URL>)
- ER diagram: [view the diagram](<ER_DIAGRAM_URL>)

## Requirements

- Node.js 20.9 or later and npm
- Docker Engine with Docker Compose v2.1 or later
- Git, to clone the repository

## Quick start

Run these commands from the repository root. Copy the example environment file before starting the app:

```powershell
Copy-Item .env.example .env
```

On macOS or Linux, use `cp .env.example .env` instead. If `.env` already exists, keep it and check that its values match the variables below rather than overwriting it.

Install the locked dependencies, start PostgreSQL, apply the committed migrations, seed demo data, and start Next.js:

```bash
npm ci
npx prisma generate
npm run db:up
npx prisma migrate deploy
npm run db:seed
npm run dev
```

`prisma generate` creates the Prisma client from the schema; run it explicitly after a clean install. Open <http://localhost:3000>. `npm run db:up` waits until the Compose health check reports PostgreSQL ready. The seeded records include reservations relative to the date the seed runs; run the seed again to refresh the demo accounts and sample records.

## Environment variables

`.env.example` is the complete local configuration template. Next.js and Prisma load `.env` from the project root.

| Variable | Required | Meaning |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string for the Compose database. The example uses the Compose service's local port and credentials. |
| `SESSION_SECRET` | Yes | Secret used to sign session tokens; at least 32 characters. The example value is for local development only. Use a securely generated secret outside local development. |
| `NEXT_PUBLIC_ORG_TIMEZONE` | No | IANA timezone used to parse/display reservation times and enforce operating hours; defaults to `Asia/Karachi`. |
| `LOG_QUERIES` | No | Set to `true` to log Prisma queries. Unset or any other value leaves query logging off. |
| `NODE_ENV` | Set by Next.js | The server environment; validated as `development`, `test`, or `production`. Next.js sets this for the standard npm commands. |

Do not expose `DATABASE_URL` or `SESSION_SECRET` to browser code or commit a real `.env` file.

## Demo accounts

The seed creates one administrator and one member:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@example.com` | `Admin@123` |
| Member | `member@example.com` | `Member@123` |

These are public demo credentials. Do not use them in a deployed or shared environment.

## Features and routes

All application pages require a signed-in user except `/login`. The root route redirects to `/dashboard`.

| Route | Function |
| --- | --- |
| `/login` | Sign in with a seeded account. |
| `/dashboard` | Monthly resource calendar, resource status, today's and upcoming reservations, and utilization over the past seven days. |
| `/resources` | Search, filter by type or active state, and paginate resources. |
| `/resources/new` | Create a resource (admin only). |
| `/resources/[id]` | Resource details, daily availability timeline, and booking form. |
| `/resources/[id]/edit` | Edit a resource (admin only). |
| `/availability` | Find active resources free for a selected date, time, duration, type, and minimum capacity. |
| `/reservations` | Filter and paginate reservations. Admins can inspect all reservations; members can see their own and resource bookings, with other users' notes withheld. |
| `/reservations/mine` | Review your upcoming, past, and cancelled reservations. |

Admins create and edit resources and can activate or deactivate them. Resource types are seeded (`Meeting Room`, `Equipment`, `Vehicle`, and `Lab`); there is no type-management screen. Deactivating a resource does not cancel existing reservations, but prevents new bookings and removes it from availability search. Resources with reservation history are not permanently deleted; deactivate them instead. Members can create bookings and manage their own bookings; admins can manage any booking.

## Reservation and resource rules

- Reservation times are interpreted and displayed in `NEXT_PUBLIC_ORG_TIMEZONE`; timestamps are stored in PostgreSQL as `timestamptz`.
- A reservation must start in the future, last from 15 minutes through 8 hours, start and end on 15-minute boundaries, and begin and end on the same local calendar day.
- The whole reservation must fit within the resource's configured operating hours. Start and end exactly at the opening or closing time are allowed.
- Reservations can be made no more than 90 days in advance. Inactive resources cannot be booked and are excluded from availability search.
- Confirmed reservations for the same resource cannot overlap. Cancelled reservations do not occupy a slot, and adjacent reservations are allowed (one may end exactly when the next begins).
- A reservation cannot be rescheduled or cancelled after it has ended, and cancelled reservations cannot be rescheduled. Only its owner or an admin may reschedule or cancel it.
- Resource names (up to 100 characters) and a resource type are required. Location is optional (up to 100 characters), capacity is optional but must be a positive integer, and description is optional (up to 500 characters). Operating hours use `HH:mm`, with opening time earlier than closing time. New resources are active by default.
- Reservations require a title (up to 150 characters); notes are optional and limited to 500 characters.

## Architecture

The application uses Next.js App Router and TypeScript for server-rendered pages and server actions, PostgreSQL 16 for persistent data, and Prisma 6 for schema access and migrations. Zod schemas validate form data and search parameters. `date-fns-tz` handles organization-local time at input and display boundaries.

The request flow is **UI → server action → service → Prisma → PostgreSQL**. Server actions perform authentication/authorization, validate input, call service functions, and revalidate affected paths. Services own business rules, database access, and typed application errors. React Server Components fetch page data; small client components handle interactive forms and controls. Session state is a signed JWT in an HTTP-only, same-site cookie.

```text
prisma/
  migrations/       PostgreSQL schema, overlap constraint, and indexes
  schema.prisma     Prisma data model
  seed.ts           Idempotent demo data setup
public/             Static assets
src/
  actions/          Thin server actions for authentication and mutations
  app/
    (auth)/login/   Login page and states
    (app)/          Authenticated dashboard, resources, reservations, availability
  components/
    auth/ availability/ dashboard/ layout/
    reservations/ resources/ ui/
  lib/
    auth/           Session handling and authorization guards
    services/       Business logic and Prisma queries
    validation/     Zod input schemas
    constants.ts    Shared policy constants
    db.ts           Prisma client singleton
    env.ts          Environment validation
    errors.ts       Typed application errors
  proxy.ts          Redirect unauthenticated requests
tests/              Unit and PostgreSQL integration tests
docker-compose.yml  Local PostgreSQL service and persistent volume
```

The Prisma data model contains `Team`, `User`, `ResourceType`, `Resource`, and `Reservation`. A user may belong to a team; reservations reference their resource and creator, and may retain the creator's team. Resources reference one type. Foreign-key rules preserve referenced resource and user history.

### Key design decisions

- **Database-enforced overlap prevention:** Application code checks availability first for a helpful conflict message, but that check alone is not race-safe. The initial SQL migration enables PostgreSQL's `btree_gist` extension and adds the `reservations_no_overlap` GiST exclusion constraint. It rejects overlapping `CONFIRMED` rows where `resourceId` matches and `tstzrange(startTime, endTime, '[)')` overlaps. The half-open `[)` interval allows back-to-back reservations; the partial predicate lets cancelled slots be reused. A separate check constraint requires `endTime > startTime`.
- **Concurrency is tested against PostgreSQL:** `tests/reservation.race.test.ts` submits 10 simultaneous service-level attempts for one slot and asserts that exactly one succeeds, the other nine become `ConflictError`s, and exactly one confirmed row is saved. This exercises the database constraint and error mapping, not just an in-memory overlap helper. `tests/db-constraints.test.ts` additionally verifies overlap rejection, adjacent bookings, cancelled-slot reuse, and the positive interval check.
- **UTC instants, local rules:** Reservations use PostgreSQL `timestamptz`; the configured organization timezone is applied when interpreting local form values and enforcing daily operating hours. This avoids relying on the developer machine's timezone for reservation input.
- **Keep resource history:** Resources with reservation history are retained and deactivated rather than deleted, preserving foreign-key integrity and past booking records.

## Database and npm scripts

| Command | Effect |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Build the production app. |
| `npm run start` | Serve a production build. Run `npm run build` first. |
| `npm run lint` | Run ESLint. |
| `npm run typecheck` | Run TypeScript without emitting files. |
| `npm test` | Run Vitest tests. Database integration tests use `DATABASE_URL`; migrate the database first. |
| `npm run db:up` | Start the Compose PostgreSQL service and wait for it to become healthy. |
| `npm run db:down` | Stop and remove the Compose container; preserve its named data volume. |
| `npm run db:reset` | Destructively reset the Prisma database, replay migrations, and run the seed. |
| `npm run db:seed` | Run the idempotent demo-data seed. |
| `npm run format` | Format the repository with Prettier. |
| `npx prisma migrate deploy` | Apply committed migrations to the configured database without creating a development migration. |

For a complete local reset that also deletes the PostgreSQL volume, run `docker compose down --volumes` and then repeat the Quick start database steps. This permanently removes the local database contents.

## Quality checks

Run the production build and project quality gate from the repository root:

```bash
npm run build
npm run lint
npm run typecheck
npm test
```

The project quality gate is `npm run lint && npm run typecheck && npm test`. The database must be available, migrated, and configured in `.env` for the PostgreSQL tests, including the race test.

## Future improvements

Possible follow-ups include recurring reservations, notifications, approval workflows, calendar sync, and deployment to a managed PostgreSQL service. They are not part of the current implementation.
