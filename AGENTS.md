# Project: Resource Reservation Management System

Next.js (App Router) + TypeScript + PostgreSQL + Prisma. Read PLAN.md and README.md before coding.

## Principles

- Follow DRY, SOLID, KISS. Keep code simple and easy to read.
- No unnecessary code: no speculative abstractions, no dead code, no unused exports, no comments that restate code. Comment only the "why".
- Use the latest stable, actively maintained packages. Check docs for the INSTALLED version; never use deprecated APIs.

## Files & structure

- Small files: components ~80 lines max, other files ~120 lines max. One component per file.
- Separate UI from logic: components only render. Business logic lives in `src/lib/services`, validation in `src/lib/validation`, server actions in `src/actions` (thin: authorize -> validate -> call service -> revalidate).
- Layering: UI -> actions -> services -> Prisma. Never call Prisma from components or actions directly.
- Naming: kebab-case files, PascalCase components, camelCase functions, UPPER_SNAKE constants in `src/lib/constants.ts`. No magic numbers or strings. Named exports only (except Next.js page/layout files).

## React / Next.js

- Server Components by default. `"use client"` only on small leaf components that need interactivity.
- Do NOT use `useEffect`, `useMemo`, or `useCallback`. Enable the React Compiler. Use Server Components for data, `useActionState`, `useOptimistic`, `useTransition`, form actions, and URL searchParams for filter/pagination state instead.
- Every route that fetches data has `loading.tsx` and `error.tsx`. Use Suspense for slow sections.

## TypeScript

- `strict` plus `noUncheckedIndexedAccess`. No `any`, no non-null assertions (`!`), no unjustified `as` casts.
- Derive types from Zod (`z.infer`) and Prisma instead of duplicating them.

## Data & performance

- Select only needed columns. No N+1 queries. Run independent queries with `Promise.all`.
- Every list is paginated on the server. Add indexes for every filtered/sorted column.
- Use `React.cache()` for per-request dedupe (e.g. current user). Call `revalidatePath` after mutations.
- Avoid heavy client libraries; prefer native HTML (`<input type="datetime-local">`, `<form method="get">`).
- All timestamps are `timestamptz` (UTC). Convert to the organization timezone only at the edges (input parsing, display).

## Errors & security

- Throw typed `AppError` subclasses (ValidationError, ConflictError, ForbiddenError, NotFoundError) from services. Server actions catch them and return `ActionResult<T>`; never leak stack traces to the UI. Log unexpected errors server-side.
- Authorize inside every server action and service call. Never trust client-provided role/user ids. Validate every input with Zod on the server.
- Validate environment variables with Zod in one `src/lib/env.ts`. No secrets in client code.

## Quality gate (run before finishing EVERY task)

`npm run lint && npm run typecheck && npm test` must pass with zero warnings. Every service function has Vitest tests.

## Workflow

- Before coding: state a 3-5 line plan. After coding: list files changed and how you verified.
- Do not touch unrelated files. Do not add features that were not asked for.
- Conventional Commits (`feat:`, `fix:`, `test:`, `refactor:`, `docs:`, `chore:`). Never commit `.env`.
