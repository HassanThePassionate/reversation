# PrimeWave Lab: Resource Reservation Management System — Execution Plan

**Deadline:** Thursday 15 Oct 2026, 11:59 PM Sri Lanka time = **11:29 PM Pakistan time (PKT)**.
Form midnight SLT pe band hota hai = 11:30 PM PKT. **Apna target: Thursday dopahar 3 PM PKT tak submit.**
Aaj Monday 12 Oct hai, yani 3.5 din. Plan isi hisaab se hai.

---

## 1. Problem ko samajhna (assessment kya dekhna chahta hai)

Scenario: ek organization ke paas shared resources hain (meeting rooms, projectors, vehicles, labs). Reservations WhatsApp/manual records se hoti hain, is liye **overlapping bookings** aur **availability confusion** hota hai.

Asal sawal jo reviewers check karenge:

1. Kya double booking **kisi bhi surat mein** nahi ho sakti? (concurrency bhi)
2. Kya resources organize hain (type, location, capacity, active/inactive)?
3. Kya availability clear nazar aati hai (kaun si cheez kab free hai)?
4. Kya DB design aur code clean/maintainable hai?
5. Kya tum apne decisions explain kar sakte ho?

**Sab se bada differentiator:** overlap prevention ko sirf app code mein nahi, **PostgreSQL exclusion constraint** se enforce karna. "Organization expects the solution to remain reliable as day-to-day activities grow" is line ka seedha jawab yehi hai.

---

## 2. Scope (MoSCoW)

### Must have

- Login + 2 roles: **ADMIN** (resources manage kare), **MEMBER** (book kare)
- Resource CRUD (name, type, location, capacity, description, operating hours, active/inactive)
- Resource types/categories
- Reservation create / reschedule / cancel
- **Overlap prevention** (app-level check + DB-level constraint)
- Availability view: kisi resource ka din-bhar ka timeline (booked vs free)
- My Reservations page
- Seed data + README + ER diagram + demo video

### Should have

- Dashboard: aaj ki reservations, upcoming, resource utilization (is hafte ke booked hours)
- "Find available resources" — date/time + duration do, free resources milein
- Team ke naam par booking (optional `teamId`)
- Filters + pagination (resources aur reservations list)
- Toasts / loading / empty states / friendly error messages

### Could have (agar time bacha)

- Week view calendar
- Vercel + Neon deploy
- Audit/history of changes

### Won't do (scope se bahar, README mein "future improvements" mein likho)

- Email notifications, recurring bookings, approval workflow, payments, multi-tenant

> Assessment khud kehta hai: "extensive platform mat banao, thoughtful prioritization chahiye". Zyada features se behtar hai kam features **bilkul reliable**.

---

## 3. Tech stack (final decision)

| Layer      | Choice                                                       | Wajah                                                                                                     |
| ---------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Framework  | Next.js 15/16 App Router + TypeScript                        | Required                                                                                                  |
| DB         | PostgreSQL 16 (Docker Compose)                               | Required; reviewer ek command mein DB chala le                                                            |
| ORM        | Prisma **v6** (pin karo)                                     | Fast schema + migrations. Prisma 7 mein setup alag hai (config file + adapter), deadline mein risk mat lo |
| Validation | Zod                                                          | Server + form dono mein same schema                                                                       |
| Auth       | Custom lightweight session: `jose` (JWT cookie) + `bcryptjs` | Library surprises nahi, ~60 lines. Alternative: Auth.js credentials                                       |
| UI         | Tailwind CSS + shadcn/ui                                     | Jaldi clean UI                                                                                            |
| Dates      | `date-fns` + `date-fns-tz`                                   | Timezone safe                                                                                             |
| Tests      | Vitest                                                       | Overlap logic + race condition test                                                                       |
| Mutations  | Server Actions (thin) → `lib/services/*` (business logic)    | Clean layering                                                                                            |

**Timezone rule:** DB mein sab kuch `timestamptz` (UTC). Org timezone env se (`NEXT_PUBLIC_ORG_TIMEZONE`, default `Asia/Karachi` ya jo tum chaho). UI mein org timezone mein dikhao.

---

## 4. Database design

### ER diagram (Mermaid)

```mermaid
erDiagram
  TEAM ||--o{ USER : "has members"
  TEAM |o--o{ RESERVATION : "booked for"
  USER ||--o{ RESERVATION : "makes"
  RESOURCE_TYPE ||--o{ RESOURCE : "categorizes"
  RESOURCE ||--o{ RESERVATION : "is reserved in"

  TEAM { string id PK string name UK }
  USER { string id PK string name string email UK string passwordHash enum role string teamId FK }
  RESOURCE_TYPE { string id PK string name UK string description }
  RESOURCE { string id PK string name string typeId FK string location int capacity string description string openTime string closeTime bool isActive }
  RESERVATION { string id PK string resourceId FK string userId FK string teamId FK string title string notes timestamptz startTime timestamptz endTime enum status timestamptz cancelledAt }
```

**Shareable link kaise banao:** `schema.dbml` ka content https://dbdiagram.io mein paste karo → **Share** → link copy karo → submission form mein do (aur README mein bhi lagao). Mermaid diagram README mein backup hai.

### Prisma schema (copy-paste: `prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  MEMBER
}

enum ReservationStatus {
  CONFIRMED
  CANCELLED
}

model Team {
  id           String        @id @default(cuid())
  name         String        @unique
  users        User[]
  reservations Reservation[]
  createdAt    DateTime      @default(now()) @db.Timestamptz(3)

  @@map("teams")
}

model User {
  id           String        @id @default(cuid())
  name         String
  email        String        @unique
  passwordHash String
  role         Role          @default(MEMBER)
  teamId       String?
  team         Team?         @relation(fields: [teamId], references: [id], onDelete: SetNull)
  reservations Reservation[]
  createdAt    DateTime      @default(now()) @db.Timestamptz(3)

  @@map("users")
}

model ResourceType {
  id          String     @id @default(cuid())
  name        String     @unique
  description String?
  resources   Resource[]

  @@map("resource_types")
}

model Resource {
  id           String        @id @default(cuid())
  name         String
  typeId       String
  type         ResourceType  @relation(fields: [typeId], references: [id], onDelete: Restrict)
  location     String?
  capacity     Int?
  description  String?
  openTime     String        @default("08:00") // HH:mm in org timezone
  closeTime    String        @default("20:00")
  isActive     Boolean       @default(true)
  reservations Reservation[]
  createdAt    DateTime      @default(now()) @db.Timestamptz(3)
  updatedAt    DateTime      @updatedAt @db.Timestamptz(3)

  @@index([typeId])
  @@map("resources")
}

model Reservation {
  id          String            @id @default(cuid())
  resourceId  String
  resource    Resource          @relation(fields: [resourceId], references: [id], onDelete: Restrict)
  userId      String
  user        User              @relation(fields: [userId], references: [id], onDelete: Restrict)
  teamId      String?
  team        Team?             @relation(fields: [teamId], references: [id], onDelete: SetNull)
  title       String
  notes       String?
  startTime   DateTime          @db.Timestamptz(3)
  endTime     DateTime          @db.Timestamptz(3)
  status      ReservationStatus @default(CONFIRMED)
  cancelledAt DateTime?         @db.Timestamptz(3)
  createdAt   DateTime          @default(now()) @db.Timestamptz(3)
  updatedAt   DateTime          @updatedAt @db.Timestamptz(3)

  @@index([resourceId, startTime])
  @@index([userId, startTime])
  @@map("reservations")
}
```

### Overlap constraint (sab se important step)

```bash
npx prisma migrate dev --name init --create-only
```

Phir generated `migration.sql` ke **end mein ye add karo**, aur `npx prisma migrate dev` chalao:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- end hamesha start ke baad ho
ALTER TABLE "reservations"
  ADD CONSTRAINT "reservations_end_after_start" CHECK ("endTime" > "startTime");

-- Ek resource pe do CONFIRMED reservations overlap nahi kar sakti.
-- '[)' matlab 10:00-11:00 aur 11:00-12:00 back-to-back allowed hain.
-- Cancelled reservations constraint se bahar hain, yani slot dobara free ho jata hai.
ALTER TABLE "reservations"
  ADD CONSTRAINT "reservations_no_overlap"
  EXCLUDE USING gist (
    "resourceId" WITH =,
    tstzrange("startTime", "endTime", '[)') WITH &&
  ) WHERE ("status" = 'CONFIRMED');
```

**App mein error handling:** insert fail ho to error message mein `reservations_no_overlap` / code `23P01` check karo → user ko friendly "Ye slot abhi kisi aur ne book kar liya, doosra time chunein" (HTTP 409 jaisa) dikhao. Pehle app-level check bhi karo taake normal case mein achha message + conflicting booking ki detail mile; DB constraint **last line of defence** hai (race condition).

---

## 5. Business rules (README mein "Assumptions" mein likho)

1. Sirf **active** resource book ho sakta hai.
2. Start < End, aur start **past mein nahi** ho sakta.
3. Duration: min 15 min, max 8 ghante. Time 15-minute steps mein.
4. Booking resource ke operating hours (`openTime`–`closeTime`) ke andar honi chahiye.
5. Zyada se zyada 90 din aage tak booking.
6. Back-to-back bookings allowed (end == next start).
7. Member sirf **apni** reservation edit/cancel kare; admin sab ki.
8. Cancel = soft (status `CANCELLED`, record rehta hai, history safe).
9. Resource delete nahi hota agar reservations hain → **deactivate** karo. Deactivate karne par future confirmed reservations ka warning dikhao.
10. "Completed" status store nahi karte, `endTime < now` se derive karte hain (kam data inconsistency).

---

## 6. Pages / routes

| Route                                    | Kaam                                                                        | Role             |
| ---------------------------------------- | --------------------------------------------------------------------------- | ---------------- |
| `/login`                                 | Login                                                                       | Public           |
| `/` → redirect `/dashboard`              |                                                                             |                  |
| `/dashboard`                             | Aaj ki bookings, upcoming, utilization cards                                | All              |
| `/resources`                             | Grid/list, filter by type, search, availability badge ("Free now"/"In use") | All              |
| `/resources/new`, `/resources/[id]/edit` | Resource form                                                               | Admin            |
| `/resources/[id]`                        | Details + **day timeline** + "Book" form                                    | All              |
| `/reservations`                          | Sab reservations: filter (resource, date, status, user), pagination         | All (admin: sab) |
| `/reservations/mine`                     | Meri upcoming/past                                                          | Member           |
| `/availability`                          | "Find free resource": date + time + duration + type                         | All              |

## 7. Folder structure

```
.
├── prisma/
│   ├── schema.prisma
│   ├── migrations/            # init + overlap constraint SQL
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (auth)/login/page.tsx
│   │   ├── (app)/
│   │   │   ├── layout.tsx            # navbar + session guard
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── resources/...
│   │   │   ├── reservations/...
│   │   │   └── availability/page.tsx
│   │   └── api/                      # sirf agar zarurat ho (e.g. availability JSON)
│   ├── components/ (ui/, resources/, reservations/, layout/)
│   ├── lib/
│   │   ├── db.ts                     # Prisma singleton
│   │   ├── auth/ (session.ts, password.ts, guards.ts)
│   │   ├── validation/ (resource.ts, reservation.ts)   # Zod
│   │   ├── services/
│   │   │   ├── reservation.service.ts   # create/update/cancel + overlap + rules
│   │   │   ├── resource.service.ts
│   │   │   └── availability.service.ts  # free slots, "free now", utilization
│   │   ├── time.ts                   # timezone helpers
│   │   └── errors.ts                 # AppError (ConflictError, ValidationError...)
│   └── actions/ (reservation.actions.ts, resource.actions.ts, auth.actions.ts)
├── tests/ (overlap.test.ts, rules.test.ts)
├── docker-compose.yml
├── .env.example
├── schema.dbml
└── README.md
```

**Rule:** UI → actions (thin, auth + Zod) → services (business logic) → Prisma. Business logic components mein mat likho.

---

## 8. Day-by-day timeline (PKT)

### Day 1 — Mon 12 Oct: Foundation (aaj)

- [ ] GitHub repo banao (public ya reviewer ko access), `.gitignore`, first commit
- [ ] `npx create-next-app@latest` (TypeScript, Tailwind, App Router, ESLint, src dir)
- [ ] `docker-compose.yml` (Postgres) + `.env.example`
- [ ] Prisma install (v6), schema, migration + **overlap constraint SQL**
- [ ] Seed script (users, teams, types, resources, kuch reservations)
- [ ] Auth: login, session cookie, route guards, role helper
- [ ] Resource CRUD (admin) + resources list page
- **Din ka goal:** login karke resources dikhein aur manage hon. Commit karo.

### Day 2 — Tue 13 Oct: Core reservation logic

- [ ] `reservation.service.ts`: validation rules + overlap check + DB error mapping
- [ ] Create / reschedule / cancel actions
- [ ] Resource detail page: **day timeline** (booked blocks vs free) + booking form
- [ ] `/reservations` list + filters + pagination, `/reservations/mine`
- [ ] **Race condition test** (do parallel inserts, ek hi pass ho)
- **Din ka goal:** double booking har tareeqe se block. Commit karo.

### Day 3 — Wed 14 Oct: Features + polish + docs

- [ ] Dashboard + utilization
- [ ] `/availability` find-free-resource
- [ ] Toasts, loading/empty/error states, mobile responsive check
- [ ] Vitest tests chalao, lint + `npm run build` pass karo
- [ ] README final (screenshots), `schema.dbml` → dbdiagram.io share link
- [ ] Fresh clone test: naye folder mein clone → README ke steps follow karo → app chale (**zaroor karo**)
- [ ] Shaam ko demo video record

### Day 4 — Thu 15 Oct: Buffer + submit

- [ ] Video re-record agar zarurat (3–5 min strictly)
- [ ] Links check (repo public? video "anyone with link"? ER link khulta hai?)
- [ ] **Submit by 3 PM PKT** (form mein CV wala **exact same email** use karo)

---

## 9. Quality checklist (reviewers ke criteria ke mutabiq)

- [ ] Overlap: app check + DB exclusion constraint + race test
- [ ] Zod validation server side par (client par bharosa nahi)
- [ ] Authorization check har action mein (member kisi aur ki booking cancel na kar sake)
- [ ] Indexes: `(resourceId, startTime)`, `(userId, startTime)`
- [ ] Dates UTC mein store, org timezone mein display
- [ ] Error messages user-friendly, stack trace UI mein nahi
- [ ] `.env` commit nahi, `.env.example` hai
- [ ] README se fresh machine par 5 commands mein app chale
- [ ] Meaningful commits (`feat: ...`, `fix: ...`), ek hi giant commit nahi
- [ ] No dead code / console.log leftover

---

## 10. Demo video script (3–5 min)

| Time      | Kya dikhana hai                                                                                                                    |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 0:00–0:30 | Problem: informal booking → overlaps. Solution ka one-liner                                                                        |
| 0:30–1:15 | Admin login → resource banao/edit, deactivate warning                                                                              |
| 1:15–2:30 | Member login → resource timeline dekho → booking karo → **overlap try karo** → friendly error. Back-to-back booking allowed dikhao |
| 2:30–3:15 | Reschedule + cancel → slot wapas free; "Find available resources"                                                                  |
| 3:15–4:00 | Dashboard / utilization                                                                                                            |
| 4:00–4:45 | **Technical decisions:** layering, Zod, timestamptz, **exclusion constraint** (SQL file khol ke dikhao), race test                 |
| 4:45–5:00 | Future improvements (recurring, notifications, approvals)                                                                          |

Tip: seed data ready rakho, pehle ek dry-run karo, mic check, 1080p screen record (OBS ya Loom).

---

## 11. Viva / explanation prep (AI use allowed, lekin samjhana zaroori hai)

1. **Race condition kaise handle kiya?** → DB exclusion constraint; do users ek saath submit karein to PostgreSQL ek ko reject karta hai.
2. **`[)` range kyun?** → back-to-back bookings valid hon.
3. **Cancelled bookings constraint mein kyun nahi?** → `WHERE status='CONFIRMED'` se slot reusable.
4. **timestamptz kyun?** → timezone/DST bugs se bachne ke liye UTC store.
5. **Resource delete kyun nahi?** → history aur FK integrity; deactivate use karo.
6. **Scale kaise hoga?** → indexes, pagination, service layer; zarurat par caching aur read replicas.
7. **Agar zyada time hota?** → recurring bookings, notifications, approval flow, calendar sync.

---

## 12. Bootstrap commands (copy-paste)

```bash
npx create-next-app@latest resource-reservation --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd resource-reservation

npm i prisma@6 @prisma/client@6 zod date-fns date-fns-tz jose bcryptjs sonner
npm i -D tsx vitest @types/bcryptjs
npx shadcn@latest init

npx prisma init
# schema.prisma paste karo, phir:
npx prisma migrate dev --name init --create-only
# migration.sql mein overlap SQL add karo, phir:
npx prisma migrate dev
npx prisma db seed
```

`package.json` mein:

```json
"prisma": { "seed": "tsx prisma/seed.ts" },
"scripts": { "test": "vitest run", "db:up": "docker compose up -d", "db:reset": "prisma migrate reset --force" }
```

`docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: reservations
    ports: ["5432:5432"]
    volumes: [pgdata:/var/lib/postgresql/data]
volumes:
  pgdata:
```

`.env.example`:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/reservations?schema=public"
SESSION_SECRET="change-me-to-a-long-random-string-32chars+"
NEXT_PUBLIC_ORG_TIMEZONE="Asia/Karachi"
```

---

## 13. AI assistant ke liye master prompt (Claude Code / Codex / Copilot mein paste karo)

```
Build a "Resource Reservation Management System" with Next.js (App Router), TypeScript, PostgreSQL, Prisma 6, Tailwind + shadcn/ui, Zod.

Follow the PLAN.md and README.md in the repo root exactly (data model, business rules, folder structure, layering: actions -> services -> Prisma).

Critical requirements:
- Overlap prevention at BOTH app level and DB level (PostgreSQL EXCLUDE USING gist with tstzrange '[)', WHERE status='CONFIRMED'). Map Postgres error 23P01 to a friendly ConflictError.
- All timestamps timestamptz (UTC); display in NEXT_PUBLIC_ORG_TIMEZONE.
- Roles ADMIN/MEMBER; members may only modify their own reservations.
- Zod validation on server for every mutation.
- Pages: login, dashboard, resources (list/detail with day timeline/new/edit), reservations (list + filters + pagination), my reservations, availability finder.
- Seed script with 2 users, 3 teams, 4 resource types, ~8 resources, sample reservations.
- Vitest tests: business-rule validation and a parallel-insert race test proving only one booking succeeds.

Work in small steps, commit-sized, and run lint + build + tests at the end of each step.
```

---

## 14. Final submission checklist

- [ ] GitHub repo link (public / reviewer access)
- [ ] README complete (setup, credentials, decisions, ER, video link)
- [ ] Demo video 3–5 min, link accessible ("Anyone with the link")
- [ ] ER diagram shareable link (dbdiagram.io Share)
- [ ] Fresh-clone test pass
- [ ] Form mein **wahi email** jo CV bhejte waqt use ki thi
- [ ] Submit **before** Thu 15 Oct, 3 PM PKT (hard limit 11:29 PM PKT)
