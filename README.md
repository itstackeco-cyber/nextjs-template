# Next.js Template

A full-stack Next.js application with authentication (email/password + forgot password), blog CRUD, Prisma/PostgreSQL, Tailwind CSS, and Docker support. Follows Atomic Design, REST API routes, server actions, Axios service layer, and i18n.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start — Local Dev](#quick-start--local-dev)
- [Quick Start — Docker (full stack)](#quick-start--docker-full-stack)
- [Environment Variables](#environment-variables)
- [Authentication](#authentication)
- [Architecture Overview](#architecture-overview)
- [Docker](#docker)
- [API Routes](#api-routes)
- [Server Actions](#server-actions)
- [Security](#security)
- [Forms](#forms-react-hook-form--zod)
- [Toast Notifications](#toast-notifications)
- [Internationalization](#internationalisation-i18n)
- [Testing](#testing)
- [Performance](#performance)
- [Code Quality](#code-quality)
- [Branch Naming](#branch-naming-convention)

---

## Prerequisites

- Node.js v24.13.0 (see `.nvmrc`) — use `nvm use`
- Docker & Docker Compose

---

## Quick Start — Local Dev

Runs PostgreSQL in Docker, the Next.js app on your machine via `npm run dev`.

**1. Install dependencies**

```bash
npm install
```

**2. Start PostgreSQL**

```bash
docker compose -f docker-compose.dev.yml up -d
```

**3. Configure environment**

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app_dev"
BASE_URL="http://localhost:3000"

JWT_SECRET="any-random-string-minimum-32-characters-long"
RESEND_API_KEY="re_xxxxxxxxxxxx"
EMAIL_FROM="noreply@yourdomain.com"
```

> For testing forgot-password locally, get a free API key at [resend.com](https://resend.com). You can also leave `RESEND_API_KEY` as a placeholder and the action will return an error instead of sending an email.

**4. Run database migrations**

```bash
npx prisma migrate dev --name init
```

**5. Start the dev server**

```bash
npm run dev
```

App is at [http://localhost:3000](http://localhost:3000).

---

## Quick Start — Docker (full stack)

Runs PostgreSQL + the Next.js app entirely in Docker. No local Node.js needed at runtime.

**1. Start everything**

```bash
docker compose up --build
```

This will:
1. Start PostgreSQL and wait until it is healthy
2. Run `prisma migrate deploy` (the `migrate` service)
3. Start the Next.js app once migrations complete

App is at [http://localhost:3000](http://localhost:3000).

**2. Stop**

```bash
docker compose down
```

**3. Stop and delete database data**

```bash
docker compose down -v
```

### Overriding environment variables

The `docker-compose.yml` has placeholder secrets. Before sharing or deploying, override them:

```bash
JWT_SECRET="real-secret" RESEND_API_KEY="re_xxx" docker compose up --build
```

Or create a `.env` file in the project root (Docker Compose picks it up automatically):

```env
JWT_SECRET=real-secret-min-32-chars
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

---

## Environment Variables

| Variable         | Side   | Required | Description                                      |
| ---------------- | ------ | -------- | ------------------------------------------------ |
| `DATABASE_URL`   | Server | Yes      | PostgreSQL connection string                     |
| `BASE_URL`       | Server | No       | Full app URL (default: `http://localhost:3000`)  |
| `JWT_SECRET`     | Server | Yes      | Secret for signing JWT session tokens (min 32 chars) |
| `RESEND_API_KEY` | Server | Yes      | Resend API key for sending emails                |
| `EMAIL_FROM`     | Server | No       | From address for auth emails (default: `noreply@example.com`) |
| `APP_URL`        | Public | No       | Injected into the browser via `window.__RUNTIME_CONFIG__` |

Server-only variables are validated at startup in `src/lib/env/server.ts` — the app crashes with a clear message if any required variable is missing.

---

## Authentication

Full email/password auth with JWT session and forgot-password flow. Google OAuth is not included but the schema is ready for it (`googleId` field).

### Routes

| Route                        | Description                                      |
| ---------------------------- | ------------------------------------------------ |
| `/register`                  | Create a new account                             |
| `/login`                     | Sign in with email and password                  |
| `/forgot-password`           | Request a password reset email                   |
| `/reset-password/[token]`    | Set a new password using the token from the email |

All routes under `(auth)/` are public. Everything else is protected by middleware — unauthenticated requests are redirected to `/login?from=<original-path>`.

### Session

Sessions are stored as **HS256 JWT tokens** in an `httpOnly` cookie named `session`. They expire after 7 days.

```
┌──────────────────────────────────────────────────────────┐
│  createSession({ userId, email })  →  sets cookie        │
│  getSession()                      →  verifies + returns │
│  deleteSession()                   →  clears cookie      │
└──────────────────────────────────────────────────────────┘
src/lib/session.ts
```

### Forgot / Reset Password Flow

```
1. User submits email on /forgot-password
2. Server generates rawToken = crypto.randomBytes(32).hex()
3. tokenHash = sha256(rawToken) stored in DB with 1h expiry
4. Email sent with link: /reset-password/<rawToken>
5. User clicks link → rawToken is hashed → matched against DB
6. If valid and not expired → new bcrypt hash saved, token deleted
```

The raw token is never stored in the database — only its SHA-256 hash.

### Server Actions

All auth logic lives in `src/lib/actions/auth.ts`:

| Action                              | Description                                      |
| ----------------------------------- | ------------------------------------------------ |
| `registerAction(data)`              | Validate → hash password → create user → session |
| `loginAction(data)`                 | Validate → find user → compare hash → session   |
| `logoutAction()`                    | Delete session cookie                            |
| `forgotPasswordAction(data)`        | Generate token → save hash → send email          |
| `resetPasswordAction(token, data)`  | Verify token → hash new password → clear token  |

### Reading the session

**Server component / server action:**

```ts
import { getSession } from "@/lib/session";

const session = await getSession(); // { userId, email } | null
```

**Client component:**

```tsx
import { useSession } from "@/lib/hooks/useSession";

const { session, loading } = useSession();
// session: { userId: string, email: string } | null
```

`useSession` calls `GET /api/auth/session` which reads the httpOnly cookie server-side and returns the payload.

### Logout

Call `logoutAction()` from any server action or a form's `action` attribute:

```tsx
import { logoutAction } from "@/lib/actions/auth";

// In a server component:
<form action={logoutAction}>
  <button type="submit">Logout</button>
</form>
```

### Prisma Schema

```prisma
model User {
  id               String    @id @default(cuid())
  email            String    @unique
  passwordHash     String?
  resetToken       String?        // SHA-256 hash of the raw token
  resetTokenExpiry DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}
```

### Packages

| Package     | Purpose                       |
| ----------- | ----------------------------- |
| `jose`      | JWT sign / verify (Edge-safe) |
| `bcryptjs`  | Password hashing (cost 12)    |
| `resend`    | Transactional email           |
| `zod`       | Input validation              |
| `crypto`    | Reset token generation (built-in Node.js) |

---

## Architecture Overview

```
nextjs-template/
├── prisma/
│   └── schema.prisma                   # User + Blog models
├── public/
│   ├── icons/
│   └── locales/
│       ├── en.json
│       └── de.json
├── src/
│   ├── app/
│   │   ├── (auth)/                     # Auth route group (no shared layout with app)
│   │   │   ├── layout.tsx              # Centered auth shell
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/[token]/page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── session/route.ts    # GET — returns current session payload
│   │   │   └── blogs/
│   │   │       ├── route.ts            # GET /api/blogs, POST /api/blogs
│   │   │       └── [id]/route.ts       # DELETE /api/blogs/:id
│   │   ├── error.tsx
│   │   ├── global-error.tsx
│   │   ├── not-found.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── atoms/
│   │   │   ├── LanguageSwitcher/
│   │   │   ├── Toast/
│   │   │   └── RuntimeEnvScript/
│   │   ├── molecules/
│   │   │   └── BlogCard/
│   │   ├── organisms/
│   │   │   ├── BlogForm/
│   │   │   ├── CreateBlogButton/
│   │   │   ├── LoginForm/              # email + password + forgot link
│   │   │   ├── RegisterForm/           # email + password + confirm
│   │   │   ├── ForgotPasswordForm/     # email input + success state
│   │   │   └── ResetPasswordForm/      # new password + confirm + success state
│   │   └── templates/
│   │       └── HomeTemplate/
│   ├── i18n/
│   │   └── request.ts
│   ├── lib/
│   │   ├── actions/
│   │   │   ├── auth.ts                 # register, login, logout, forgotPassword, resetPassword
│   │   │   ├── blog.ts
│   │   │   └── index.ts
│   │   ├── constants/
│   │   ├── context/
│   │   │   └── AppContext.tsx
│   │   ├── env/
│   │   │   ├── server.ts               # DATABASE_URL, JWT_SECRET, RESEND_API_KEY, EMAIL_FROM
│   │   │   └── public.ts
│   │   ├── hooks/
│   │   │   ├── useFormDraft.ts
│   │   │   ├── useSession.ts           # Client hook — fetches /api/auth/session
│   │   │   ├── useToast.ts
│   │   │   └── index.ts
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── axios.ts
│   │   ├── prisma.ts
│   │   ├── schemas.ts                  # Blog + auth Zod schemas
│   │   └── session.ts                  # createSession / getSession / deleteSession
│   ├── middleware.ts                   # CSP nonce + auth redirect
│   └── proxy.ts                        # CSP header builder (used by middleware)
├── Dockerfile
├── docker-compose.yml                  # Full stack: db + migrate + app
├── docker-compose.dev.yml              # Postgres only (for npm run dev)
├── .dockerignore
├── .env.example
├── next.config.ts
├── tsconfig.json
└── jest.config.js
```

---

## Docker

### Files

| File                     | Purpose                                                  |
| ------------------------ | -------------------------------------------------------- |
| `Dockerfile`             | 3-stage build: `dependencies` → `builder` → `runner`    |
| `docker-compose.yml`     | Full stack — db + migrate service + app                  |
| `docker-compose.dev.yml` | Postgres only — for use alongside `npm run dev`          |
| `.dockerignore`          | Excludes `node_modules`, `.env`, `.next`, etc.           |

### Dockerfile stages

```
dependencies  — npm ci (installs all deps, copies prisma schema)
     │
builder       — prisma generate + next build (standalone output)
     │
runner        — copies .next/standalone + .next/static + public
                runs as non-root user (node)
```

The `output: "standalone"` in `next.config.ts` produces a self-contained `server.js` with only the minimum Node.js code needed — no `node_modules` in the runner image.

### docker-compose services

```
db       — postgres:16-alpine, healthcheck, persistent volume
migrate  — builder stage, runs: npx prisma migrate deploy
app      — runner stage, starts after migrate completes
```

The `migrate` service uses the `builder` stage (which has Prisma CLI and all deps) to run `prisma migrate deploy` against the database. The `app` service depends on `migrate: service_completed_successfully` so the app only starts after migrations are applied.

### Useful commands

```bash
# First start (or after schema changes)
docker compose up --build

# Subsequent starts (no rebuild)
docker compose up

# View logs
docker compose logs -f app
docker compose logs -f migrate

# Rebuild only the app image
docker compose build app

# Stop
docker compose down

# Stop and wipe database
docker compose down -v

# Open a psql shell
docker compose exec db psql -U postgres -d app_dev
```

### Adding a new migration in Docker workflow

1. Change `prisma/schema.prisma`
2. Generate a migration locally:
   ```bash
   npx prisma migrate dev --name your_migration_name
   ```
3. Rebuild and restart:
   ```bash
   docker compose up --build
   ```
   The `migrate` service will apply the new migration automatically.

---

## Project Structure: Atomic Design

Components are organized into atomic design levels under `src/components/`:

| Level         | Folder             | Examples                                                              |
| ------------- | ------------------ | --------------------------------------------------------------------- |
| **Atoms**     | `atoms/`           | `LanguageSwitcher`, `Toast`, `RuntimeEnvScript`                       |
| **Molecules** | `molecules/`       | `BlogCard`                                                            |
| **Organisms** | `organisms/`       | `BlogForm`, `LoginForm`, `RegisterForm`, `ForgotPasswordForm`, `ResetPasswordForm` |
| **Templates** | `templates/`       | `HomeTemplate`                                                        |
| **Pages**     | `src/app/`         | Connects data to templates                                            |

---

## Data Flow

```
Browser
  └── Client Components
        ├── loginAction() / registerAction()  →  createSession()  →  httpOnly cookie
        ├── blogService.delete()  ──────────────────────────────────────────────────┐
        └── createBlogAction() (Server Action)                                      │
              └── blogService.create()  ─────────────────────────────────────────┐  │
                                                                                 ↓  ↓
                                                              Next.js API Routes (/api/*)
                                                                   └── Prisma → PostgreSQL
```

- **Client components** never call Prisma directly
- **Auth server actions** call `createSession` / `deleteSession` directly (no API round-trip)
- **Blog server actions** call API routes via `blogService` (Axios)
- **Middleware** verifies the JWT on every request (Edge runtime — uses `jose`, not `bcryptjs`)

---

## API Routes

### `GET /api/auth/session`

Returns the current user's session payload. Used by `useSession()` hook.

**Response:** `{ userId: string, email: string }` or `null` with `401`.

### `GET /api/blogs`

Returns all blog posts ordered by `createdAt` descending.

### `POST /api/blogs`

Creates a new blog post. Validates body with Zod schema.

**Body:** `{ "title": "string", "content": "string", "author": "string" }`

### `DELETE /api/blogs/:id`

Deletes a blog post by ID. Returns `204 No Content` or `404`.

All routes return `500` with `{ error: string }` on unexpected errors.

---

## Server Actions

### Auth (`src/lib/actions/auth.ts`)

| Action | Returns | Description |
| ------ | ------- | ----------- |
| `registerAction(data: RegisterSchema)` | `{ success, error? }` | Hash password → create User → set session cookie |
| `loginAction(data: LoginSchema)` | `{ success, error? }` | Find user → compare bcrypt → set session cookie |
| `logoutAction()` | `void` | Delete session cookie |
| `forgotPasswordAction(data)` | `{ success, error? }` | Generate token → store SHA-256 hash → send email via Resend |
| `resetPasswordAction(token, data)` | `{ success, error? }` | Verify token + expiry → hash new password → clear token |

### Blog (`src/lib/actions/blog.ts`)

`createBlogAction(data: BlogSchema)` — validates input, calls `blogService.create()`.

---

## Error Handling

| File                       | Covers                                                         |
| -------------------------- | -------------------------------------------------------------- |
| `src/app/error.tsx`        | Runtime errors in any route segment (client-side recovery)     |
| `src/app/global-error.tsx` | Root layout errors (full-page fallback, no Tailwind available) |
| `src/app/not-found.tsx`    | `notFound()` calls or unmatched URLs                           |
| API routes (try/catch)     | Returns `{ error }` with appropriate HTTP status codes         |

---

## Security

### Authentication Security

- Passwords hashed with **bcrypt cost 12**
- Reset tokens: raw token sent in email, only **SHA-256 hash** stored in DB
- Reset tokens expire after **1 hour**
- Forgot password action returns `success: true` even when email not found (prevents email enumeration)
- JWT signed with **HS256**, stored in **httpOnly** cookie (inaccessible to JavaScript)
- Middleware runs JWT verification in **Edge runtime** using `jose` (not `bcryptjs`)

### HTTP Security Headers

| Header                      | Value                                          | Purpose                          |
| --------------------------- | ---------------------------------------------- | -------------------------------- |
| `X-Frame-Options`           | `DENY`                                         | Prevent clickjacking via iframes |
| `X-Content-Type-Options`    | `nosniff`                                      | Prevent MIME-type sniffing       |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`              | Limit referrer leakage           |
| `Permissions-Policy`        | `camera=(), microphone=(), geolocation=()`     | Disable unused browser features  |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Enforce HTTPS for 1 year         |

### Content Security Policy (CSP) with Nonces

`src/proxy.ts` runs on every request (via `src/middleware.ts`) and:

1. Generates a cryptographically random nonce (`crypto.getRandomValues`)
2. Sets a `Content-Security-Policy` header scoped to that nonce
3. Forwards the nonce to the layout via the `x-nonce` request header

**Production CSP:**

```
default-src 'self'; script-src 'self' 'nonce-{nonce}'; style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:; font-src 'self'; connect-src 'self';
frame-ancestors 'none'; form-action 'self'; base-uri 'self'; object-src 'none';
upgrade-insecure-requests;
```

**Development CSP** also adds `'unsafe-eval' 'unsafe-inline'` to `script-src` for Next.js HMR.

### Input Validation

All auth and blog inputs are validated with **Zod** before touching the database. Auth schemas enforce email format, password min 8 / max 100 chars, and matching password confirmation.

### Rate Limiting

`src/lib/utils/rate-limit.ts` — sliding-window in-memory limiter on API routes.

| Route                   | Limit        |
| ----------------------- | ------------ |
| `GET /api/blogs`        | 120 / minute |
| `POST /api/blogs`       | 20 / minute  |
| `DELETE /api/blogs/:id` | 30 / minute  |

> For multi-instance deployments replace with a Redis-backed solution (e.g. `@upstash/ratelimit`).

### ESLint Security Plugin

`eslint-plugin-security` runs as part of `npm run lint` and detects ReDoS-vulnerable regex, dynamic eval, unsafe Buffer usage, missing CSRF protection, and more.

---

## Forms: react-hook-form + Zod

Forms use `react-hook-form` with `zodResolver`. All schemas are in `src/lib/schemas.ts`.

```ts
// Auth schemas
registerSchema      // email, password (min 8), confirmPassword (must match)
loginSchema         // email, password
forgotPasswordSchema // email
resetPasswordSchema // password (min 8), confirmPassword (must match)

// Blog schema
blogSchema          // author (2-100), title (2-200), content (10-10000)
```

---

## Toast Notifications

```tsx
import { useToast } from "@/lib/hooks/useToast";

const { addToast } = useToast();

addToast({ type: "success", message: "Account created!" });
addToast({ type: "error", message: "Invalid credentials." });
addToast({ type: "warning", message: "Session expiring soon." });
addToast({ type: "info", message: "Update available." });
```

- 4 variants: `success`, `error`, `warning`, `info`
- Auto-dismisses after 6 seconds, manual close button
- `role="alert"` + `aria-live="polite"` for accessibility
- Translated titles via `next-intl`

---

## Custom Hook: useFormDraft

Persists form state in `localStorage` so drafts survive page refreshes.

```ts
const { clearDraft } = useFormDraft(DRAFT_KEY, watch, reset);
// On mount: loads saved draft
// On change: saves to localStorage (no re-renders)
// clearDraft(): removes draft after successful submit
```

---

## Runtime Environment Variables (Docker)

**Build Once, Deploy Anywhere** — public vars are injected into `window.__RUNTIME_CONFIG__` at runtime, not baked into the bundle at build time.

```
Docker container starts
  └── Next.js server reads process.env
        └── <RuntimeEnvScript /> renders in <head>:
              <script>window.__RUNTIME_CONFIG__ = { APP_URL: "..." };</script>
                    └── Client JS reads via getPublicEnv()
```

### Adding a new public variable

1. Add to `PublicEnv` interface in `src/lib/env/public.ts`
2. Add to `getPublicEnvForRuntime()` return object
3. Pass it to the container at runtime — no rebuild required

---

## Internationalisation (i18n)

Uses [`next-intl`](https://next-intl-docs.vercel.app/) with **cookie-based locale** (no URL changes).

| Code | Language |
| ---- | -------- |
| `en` | English  |
| `de` | Deutsch  |

`src/i18n/request.ts` reads the `NEXT_LOCALE` cookie (falls back to `"en"`). Messages are loaded from `public/locales/{locale}.json`.

**Usage:**

```ts
// Server component
const t = await getTranslations("nav");

// Client component
const t = useTranslations("blogCard");
```

**Adding a language:** add `public/locales/{code}.json` + add to the `languages` array in `LanguageSwitcher.tsx`.

---

## HTTP Client: Axios + BaseService

- `src/lib/axios.ts` — Axios instance with 10s timeout, error message extraction
- `src/lib/services/base.service.ts` — generic `getAll / getById / create / update / delete`
- `src/lib/services/blog.service.ts` — `BlogService extends BaseService`

---

## Testing

```bash
npm test
npm run test:watch
```

Uses **Jest** with `ts-jest` and `@testing-library/react`. Security-focused tests:

| File                                         | Tests                                            |
| -------------------------------------------- | ------------------------------------------------ |
| `src/lib/utils/__tests__/url.test.ts`        | Safe/unsafe protocols, fallback behavior         |
| `src/lib/utils/__tests__/rate-limit.test.ts` | Limit enforcement, window reset, key isolation   |
| `src/lib/__tests__/schemas.test.ts`          | Min/max lengths, trim, missing fields, DoS input |

---

## Performance

### Standalone Docker Build

`output: "standalone"` in `next.config.ts` produces a minimal `server.js` with zero `node_modules` in the production image — typically 100–200 MB vs. 500+ MB for a full install.

### Code Splitting

`BlogForm` is lazy-loaded via `next/dynamic` — only downloaded when the user opens the create modal.

### Bundle Analysis

```bash
npm run analyze
```

Opens interactive treemaps for client and server bundles.

---

## Code Quality

### Pre-commit Hook (Husky)

Runs `npm run check` (lint + test + build) on every commit.

```bash
# Initialize hooks after cloning:
npm run prepare
```

### Prettier

```bash
npx prettier --write .
```

### ESLint

```bash
npm run lint       # check
npm run lint:fix   # auto-fix
```

---

## Branch Naming Convention

```
<type>/<JIRA-TICKET>-<short-description>
```

| Type         | Purpose                  |
| ------------ | ------------------------ |
| `feature/*`  | New features             |
| `fix/*`      | Bug fixes                |
| `hotfix/*`   | Urgent production fixes  |
| `chore/*`    | Config, deps, cleanup    |
| `refactor/*` | Code restructuring       |
| `test/*`     | Adding or updating tests |
