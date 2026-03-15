# Next.js Template

A CRUD blog management system built with Next.js 15, Prisma, PostgreSQL, and Tailwind CSS. Follows Atomic Design, REST API routes, server actions, Axios service layer, and i18n.

## Prerequisites

- Node.js (v24.13.0 — see `.nvmrc`)
- Docker (for a local PostgreSQL database)

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables — copy `.env.example` to `.env.local` and fill in the values:

   ```bash
   cp .env.example .env.local
   ```

   ```env
   # Server-only
   DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb"

   # Public runtime (injected into the browser at runtime, not build time)
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

3. Start the database (Docker):

   ```bash
   docker run --name blog-postgres \
     -e POSTGRES_PASSWORD=randompassword \
     -e POSTGRES_USER=johndoe \
     -e POSTGRES_DB=mydb \
     -p 5432:5432 -d postgres
   ```

4. Sync the database schema:

   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. Start the dev server:

   ```bash
   npm run dev
   ```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Architecture Overview

```
nextjs-template/
├── prisma/
│   └── schema.prisma                 # Prisma schema
├── public/                           # Static assets (Next.js convention)
│   ├── icons/
│   │   └── alert-triangle.svg
│   └── locales/
│       ├── en.json                   # English translations
│       └── de.json                   # German translations
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── blogs/
│   │   │       ├── route.ts          # GET /api/blogs, POST /api/blogs
│   │   │       └── [id]/route.ts     # DELETE /api/blogs/:id
│   │   ├── error.tsx                 # Route-level error boundary
│   │   ├── global-error.tsx          # Root-level error boundary
│   │   ├── not-found.tsx             # 404 page
│   │   └── page.tsx                  # Main page (force-dynamic)
│   ├── components/
│   │   ├── atoms/
│   │   │   ├── LanguageSwitcher.tsx
│   │   │   ├── Toast.tsx             # Toast notification component
│   │   │   └── RuntimeEnvScript.tsx  # Injects runtime env into window
│   │   ├── molecules/
│   │   │   └── BlogCard.tsx
│   │   ├── organisms/
│   │   │   ├── BlogForm.tsx
│   │   │   └── CreateBlogButton.tsx
│   │   └── templates/
│   │       └── HomeTemplate.tsx
│   ├── i18n/
│   │   └── request.ts                # next-intl server config (cookie-based)
│   ├── lib/
│   │   ├── actions/
│   │   │   └── blog.ts               # Server action: createBlogAction
│   │   ├── constants/
│   │   │   ├── global.ts             # COOKIE_EXPIRES_DAYS, TOAST_AUTO_DISMISS_MS, BLOG_DRAFT_KEY, UUID_REGEX
│   │   │   ├── http.ts               # HTTP_STATUS codes
│   │   │   └── index.ts              # API_ROUTES
│   │   ├── context/
│   │   │   └── AppContext.tsx        # AppProvider (toast state)
│   │   ├── env/
│   │   │   ├── server.ts             # Server-only env vars (DATABASE_URL)
│   │   │   └── public.ts             # Public runtime env + window.__RUNTIME_CONFIG__ type
│   │   ├── hooks/
│   │   │   ├── useFormDraft.ts       # Generic localStorage form draft hook
│   │   │   └── useToast.ts           # Hook to access toast context
│   │   ├── services/
│   │   │   ├── base.service.ts       # Generic CRUD BaseService
│   │   │   └── blog.service.ts       # BlogService extending BaseService
│   │   ├── types/
│   │   │   └── index.ts              # Shared TypeScript types (Blog, Toast, etc.)
│   │   ├── utils/
│   │   │   ├── base-url.ts           # getBaseUrl() utility
│   │   │   ├── url.ts                # isSafeUrl / safeUrl — URL injection prevention
│   │   │   └── rate-limit.ts         # In-memory sliding-window rate limiter
│   │   ├── axios.ts                  # Axios instance with interceptors
│   │   ├── prisma.ts                 # Prisma client singleton
│   │   └── schemas.ts                # Zod validation schemas
│   └── proxy.ts                      # CSP nonce generation (runs on every request)
├── __mocks__/                        # Jest manual mocks
├── .env.example                      # Environment variable template
├── next.config.ts
├── tsconfig.json
└── jest.config.js
```

---

## Project Structure: Atomic Design

Components are organized into atomic design levels under `src/components/`:

| Level         | Folder             | Examples                                        |
| ------------- | ------------------ | ----------------------------------------------- |
| **Atoms**     | `atoms/`           | `LanguageSwitcher`, `Toast`, `RuntimeEnvScript` |
| **Molecules** | `molecules/`       | `BlogCard`                                      |
| **Organisms** | `organisms/`       | `BlogForm`, `CreateBlogButton`                  |
| **Templates** | `templates/`       | `HomeTemplate`                                  |
| **Pages**     | `src/app/page.tsx` | Connects data to templates                      |

---

## Data Flow

```
Browser
  └── Client Components (BlogCard, BlogForm, CreateBlogButton)
        ├── blogService.delete()  ─────────────────────────────┐
        └── createBlogAction() (Server Action)                  │
              └── blogService.create()  ──────────────────────┐ │
                                                              ↓ ↓
                                               Next.js API Routes (/api/blogs)
                                                    └── Prisma → PostgreSQL
```

- **Client components** never call Prisma directly
- **API routes** are the only place Prisma is used
- **Server actions** call API routes via `blogService` (Axios)
- **Server components** (`page.tsx`) also call API routes via `blogService`

---

## API Routes

### `GET /api/blogs`

Returns all blog posts ordered by `createdAt` descending.

### `POST /api/blogs`

Creates a new blog post. Validates body with Zod schema. Calls `revalidatePath("/")`.

**Body:**

```json
{ "title": "string", "content": "string", "author": "string" }
```

### `DELETE /api/blogs/:id`

Deletes a blog post by ID. Returns `204 No Content`. Calls `revalidatePath("/")`.
Returns `404` if the post does not exist.

All routes return `500` with `{ error: string }` on unexpected errors.

---

## Server Actions

`src/lib/actions/blog.ts` — `createBlogAction(data: BlogSchema)`

- Validates input with Zod
- Calls `blogService.create()` → `POST /api/blogs`
- Returns `{ success: boolean; error?: string }`

---

## Error Handling

| File                       | Covers                                                         |
| -------------------------- | -------------------------------------------------------------- |
| `src/app/error.tsx`        | Runtime errors in any route segment (client-side recovery)     |
| `src/app/global-error.tsx` | Root layout errors (full-page fallback, no Tailwind available) |
| `src/app/not-found.tsx`    | `notFound()` calls or unmatched URLs                           |
| API routes (try/catch)     | Returns `{ error }` with appropriate HTTP status codes         |

---

## Toast Notifications

A lightweight, accessible toast system built with React Context and Tailwind CSS.

### Usage

```tsx
import { useToast } from "@/lib/hooks/useToast";

const { addToast } = useToast();

addToast({ type: "success", message: "Saved!" });
addToast({ type: "error", message: "Something went wrong." });
addToast({ type: "warning", message: "Check your input." });
addToast({ type: "info", message: "Update available." });
```

### Features

- 4 variants: `success`, `error`, `warning`, `info`
- Slide-in animation on mount, fade-out on dismiss
- Auto-dismisses after 6 seconds
- Manual close button
- Accessible: `role="alert"` + `aria-live="polite"`
- Translated titles via `next-intl` (`public/locales/*.json` → `toast.*`)

### Architecture

| File                             | Role                                       |
| -------------------------------- | ------------------------------------------ |
| `src/lib/context/AppContext.tsx` | State provider (`addToast`, `removeToast`) |
| `src/lib/hooks/useToast.ts`      | Hook to consume the context                |
| `src/components/atoms/Toast.tsx` | Renders the notification stack             |

---

## Constants

Constants are split into two files:

**`src/lib/constants/index.ts`** — API route paths:

```ts
export const API_ROUTES = {
  blogs: "/api/blogs",
} as const;
```

**`src/lib/constants/global.ts`** — shared UI/behaviour constants:

```ts
export const COOKIE_EXPIRES_DAYS = 365; // js-cookie expires option (1 year)
export const TOAST_AUTO_DISMISS_MS = 5_000; // Toast auto-dismiss duration
export const BLOG_DRAFT_KEY = "blog-form-draft"; // localStorage key for form drafts
export const UUID_REGEX = /^[0-9a-f]{8}-...-[0-9a-f]{12}$/i; // UUID validation
```

**`src/lib/constants/http.ts`** — HTTP status codes:

```ts
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;
```

Add new constants here instead of hardcoding magic strings or numbers in components.

---

## HTTP Client: Axios + BaseService

### Axios Instance (`src/lib/axios.ts`)

- `baseURL`: full `NEXT_PUBLIC_APP_URL` server-side (read from runtime env), relative on client
- 10-second timeout
- Response interceptor extracts error messages from API responses

### BaseService (`src/lib/services/base.service.ts`)

Generic class with full CRUD:

```ts
class BaseService<TEntity, TCreate, TUpdate> {
  getAll(config?); // GET /endpoint
  getById(id, config?); // GET /endpoint/:id
  create(payload, config?); // POST /endpoint
  update(id, payload, config?); // PATCH /endpoint/:id
  delete(id, config?); // DELETE /endpoint/:id
}
```

### BlogService (`src/lib/services/blog.service.ts`)

```ts
class BlogService extends BaseService<Blog, BlogSchema> {
  constructor() {
    super(API_ROUTES.blogs);
  }
}
export const blogService = new BlogService();
```

---

## Forms: react-hook-form + Zod

Forms use `react-hook-form` with Zod validation via `zodResolver`.

**Schema** (`src/lib/schemas.ts`):

```ts
export const blogSchema = z.object({
  author: z.string().min(2).max(100).trim(),
  title: z.string().min(2).max(200).trim(),
  content: z.string().min(10).max(10_000).trim(),
});
```

---

## Custom Hook: useFormDraft

`src/lib/hooks/useFormDraft.ts` — persists form state in `localStorage` so drafts survive page refreshes.

```ts
const { clearDraft } = useFormDraft(DRAFT_KEY, watch, reset);
```

- On mount: loads saved draft via `reset()`
- On change: saves to `localStorage` via `watch()` subscription (no re-renders)
- `clearDraft()`: removes draft after successful submit

---

## Runtime Environment Variables (Docker)

This project uses a **Build Once, Deploy Anywhere** pattern — environment variables are **not** baked into the bundle at build time. Instead, public vars are injected into `window.__RUNTIME_CONFIG__` at runtime by a server component.

### How it works

```
Docker container starts
  └── Next.js server reads process.env
        └── <RuntimeEnvScript /> renders in <head>:
              <script>window.__RUNTIME_CONFIG__ = { APP_URL: "..." };</script>
                    └── Client JS reads window.__RUNTIME_CONFIG__ via getPublicEnv()
```

### Files

| File                                        | Purpose                                                            |
| ------------------------------------------- | ------------------------------------------------------------------ |
| `src/lib/env/server.ts`                     | Server-only vars (`DATABASE_URL`). Never sent to browser.          |
| `src/lib/env/public.ts`                     | Public vars + `getPublicEnv()` isomorphic accessor + `Window` type |
| `src/components/atoms/RuntimeEnvScript.tsx` | Server component — injects public vars into `<head>`               |

### Environment Variables

| Variable              | Side   | Required | Description                                                              |
| --------------------- | ------ | -------- | ------------------------------------------------------------------------ |
| `DATABASE_URL`        | Server | Yes      | PostgreSQL connection string                                             |
| `NEXT_PUBLIC_APP_URL` | Public | No       | Full app URL injected into the client (default: `http://localhost:3000`) |

### Adding a new public variable

1. Add the variable to `PublicEnv` interface in `src/lib/env/public.ts`
2. Add it to `getPublicEnvForRuntime()` return object
3. Pass it to your container at runtime — no rebuild required

### Docker example

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXT_PUBLIC_APP_URL="https://myapp.com" \
  myapp:latest
```

---

## Security

### HTTP Security Headers

Configured in `next.config.ts`, applied to every response:

| Header                      | Value                                          | Purpose                          |
| --------------------------- | ---------------------------------------------- | -------------------------------- |
| `X-Frame-Options`           | `DENY`                                         | Prevent clickjacking via iframes |
| `X-Content-Type-Options`    | `nosniff`                                      | Prevent MIME-type sniffing       |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`              | Limit referrer leakage           |
| `Permissions-Policy`        | `camera=(), microphone=(), geolocation=()`     | Disable unused browser features  |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Enforce HTTPS for 1 year         |

### Content Security Policy (CSP) with Nonces

`src/proxy.ts` runs on every request and:

1. Generates a cryptographically random nonce (`crypto.getRandomValues`)
2. Sets a `Content-Security-Policy` header scoped to that nonce
3. Forwards the nonce to the layout via the `x-nonce` request header

`src/app/layout.tsx` reads the nonce and passes it to `<RuntimeEnvScript nonce={nonce} />`.

**Production CSP:**

```
default-src 'self';
script-src 'self' 'nonce-{nonce}';
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
font-src 'self';
connect-src 'self';
frame-ancestors 'none';
form-action 'self';
base-uri 'self';
object-src 'none';
upgrade-insecure-requests;
```

**Development CSP** also adds `'unsafe-eval' 'unsafe-inline'` to `script-src` for Next.js HMR.

### RuntimeEnvScript — XSS Prevention

`JSON.stringify` alone does not escape `<`, `>`, or `&`, which allows a malicious env value to break out of a `<script>` tag. The component escapes these characters before embedding:

```ts
const json = JSON.stringify(config)
  .replace(/</g, "\\u003c")
  .replace(/>/g, "\\u003e")
  .replace(/&/g, "\\u0026");
```

### Input Validation

- All API bodies are validated with **Zod** before touching the database
- Schemas enforce `min` + `max` lengths and `.trim()` — prevents oversized payload / DoS:
  - `author`: 2–100 chars
  - `title`: 2–200 chars
  - `content`: 10–10 000 chars
- Data is always read from `request.json()` — **never from URL params**

### ID Validation

The `DELETE /api/blogs/:id` route validates the `id` against a UUID regex before querying the database, returning `400` for malformed input:

```ts
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-...-[0-9a-f]{12}$/i;
if (!UUID_REGEX.test(id))
  return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
```

### Rate Limiting

`src/lib/utils/rate-limit.ts` implements a sliding-window in-memory rate limiter applied to all API routes. Returns `429 Too Many Requests` when exceeded.

| Route                   | Limit        |
| ----------------------- | ------------ |
| `GET /api/blogs`        | 120 / minute |
| `POST /api/blogs`       | 20 / minute  |
| `DELETE /api/blogs/:id` | 30 / minute  |

> **Note:** The in-memory limiter works per process. For multi-instance deployments replace with a Redis-backed solution (e.g. `@upstash/ratelimit`).

### URL Validation

`src/lib/utils/url.ts` provides helpers to prevent `javascript:` and `data:` URL injection:

```tsx
import { isSafeUrl, safeUrl } from "@/lib/utils/url";

// Guard a dynamic href
<a href={safeUrl(userProvidedUrl)}>Link</a>;

// Check programmatically
if (!isSafeUrl(url)) throw new Error("Unsafe URL");
```

Only `https:` and `http:` protocols are allowed. All others return `false` / fallback.

### ESLint Security Plugin

`eslint-plugin-security` is configured in `eslint.config.mjs` and runs as part of `npm run lint`. It detects:

| Rule                                    | Severity | Detects                                      |
| --------------------------------------- | -------- | -------------------------------------------- |
| `detect-unsafe-regex`                   | error    | ReDoS-vulnerable regular expressions         |
| `detect-eval-with-expression`           | error    | `eval()` with dynamic input                  |
| `detect-new-buffer`                     | error    | Unsafe `new Buffer()` usage                  |
| `detect-pseudoRandomBytes`              | error    | `crypto.pseudoRandomBytes` (deprecated/weak) |
| `detect-disable-mustache-escape`        | error    | Disabled template escaping                   |
| `detect-no-csrf-before-method-override` | error    | Missing CSRF protection                      |
| `detect-object-injection`               | warn     | Bracket notation with user input             |
| `detect-non-literal-regexp`             | warn     | Dynamic RegExp construction                  |
| `detect-child-process`                  | warn     | `child_process` usage                        |
| `detect-possible-timing-attacks`        | warn     | String comparison timing vulnerabilities     |

### Security Tests

Security-focused unit tests live alongside their modules:

| File                                         | Tests                                            |
| -------------------------------------------- | ------------------------------------------------ |
| `src/lib/utils/__tests__/url.test.ts`        | Safe/unsafe protocols, fallback behavior         |
| `src/lib/utils/__tests__/rate-limit.test.ts` | Limit enforcement, window reset, key isolation   |
| `src/lib/__tests__/schemas.test.ts`          | Min/max lengths, trim, missing fields, DoS input |

---

## Accessibility (a11y)

This project follows WCAG 2.1 AA guidelines. Key implementations:

### Semantic HTML Landmarks

| Element    | Location        | Purpose                                      |
| ---------- | --------------- | -------------------------------------------- |
| `<header>` | `HomeTemplate`  | Site header with title and language switcher |
| `<main>`   | `HomeTemplate`  | Primary page content (blog list)             |
| `<main>`   | `error.tsx`     | Error page content                           |
| `<main>`   | `not-found.tsx` | 404 page content                             |

### Dialog (Modal) Accessibility

`CreateBlogButton` implements full dialog a11y:

- `role="dialog"` + `aria-modal="true"` on the modal container
- `aria-labelledby` pointing to the modal heading (`id="blog-modal-title"`)
- `aria-expanded` + `aria-haspopup="dialog"` on the trigger button
- **Keyboard**: `Escape` closes the dialog
- **Backdrop**: clicking outside closes the dialog
- **Focus management**: focus moves into the dialog on open, returns to the trigger button on close

### Form Accessibility

`BlogForm` uses proper label/input association:

```tsx
<label htmlFor="author">Author</label>
<input id="author" {...register("author")} />
```

All three fields (`author`, `title`, `content`) have matching `htmlFor` / `id` pairs.

`LanguageSwitcher` select has an explicit `aria-label="Select language"`.

### Decorative Icons

All Lucide icons used for visual decoration alongside text are marked `aria-hidden="true"` so screen readers skip them:

```tsx
<BookOpen size={22} aria-hidden="true" />
```

Icon-only interactive elements use `aria-label`:

```tsx
<button aria-label={t("delete")}><Trash2 /></button>
<button aria-label={t("closeModal")}><X /></button>
```

### Toast Notifications

Toasts use `role="alert"` and `aria-live="polite"` so assistive technologies announce new notifications without disrupting reading flow.

### Heading Hierarchy

| Page / Component   | Heading level | Text                  |
| ------------------ | ------------- | --------------------- |
| `page.tsx`         | `<h1>`        | Blog Manager          |
| `page.tsx`         | `<h2>`        | Recent Posts          |
| `CreateBlogButton` | `<h2>`        | New Blog Post (modal) |
| `error.tsx`        | `<h1>`        | Something went wrong! |
| `not-found.tsx`    | `<h1>`        | Page not found        |
| `global-error.tsx` | `<h1>`        | Something went wrong! |

---

## Internationalisation (i18n)

Uses [`next-intl`](https://next-intl-docs.vercel.app/) with **cookie-based locale** (no URL changes).

### Supported Languages

| Code | Language |
| ---- | -------- |
| `en` | English  |
| `de` | Deutsch  |

### How It Works

1. `src/i18n/request.ts` reads the `NEXT_LOCALE` cookie (falls back to `"en"`)
2. Messages are loaded from `public/locales/{locale}.json`
3. `src/app/layout.tsx` wraps the app in `NextIntlClientProvider`
4. `LanguageSwitcher` atom sets the `NEXT_LOCALE` cookie via [`js-cookie`](https://github.com/js-cookie/js-cookie) with `SameSite=Strict; Secure` flags and calls `router.refresh()`

### Usage in Components

**Server components:**

```ts
import { getTranslations } from "next-intl/server";
const t = await getTranslations("nav");
t("title");
```

**Client components:**

```ts
import { useTranslations } from "next-intl";
const t = useTranslations("blogCard");
t("delete");
```

### Adding a New Language

1. Add a new file `public/locales/{code}.json` matching the structure of `en.json`
2. Add the language to the `languages` array in `LanguageSwitcher.tsx`

---

## Icons

Uses [lucide-react](https://lucide.dev/icons).

```tsx
import { Trash2, User, Calendar } from "lucide-react";

<Trash2 size={16} className="text-gray-400" />;
```

| Prop          | Type             | Default        |
| ------------- | ---------------- | -------------- |
| `size`        | number \| string | 24             |
| `color`       | string           | `currentColor` |
| `strokeWidth` | number           | 2              |
| `className`   | string           | —              |

---

## UI Stack

- **Tailwind CSS v4** — utility-first styling
- **Theme** configured inline in `src/app/globals.css` via `@theme` block
- **Dark mode** supported via CSS variables (`prefers-color-scheme`)

---

## State Management

- **Server state**: fetched in server components via `blogService.getAll()`
- **UI state**: local component state (`useState`)
- **Form drafts**: `localStorage` via `useFormDraft` hook
- **Toasts**: React Context via `AppProvider` + `useToast`
- **Locale**: `NEXT_LOCALE` cookie (readable on both server and client)

---

## Testing

Uses **Jest** with `ts-jest` and `@testing-library/react`.

```bash
npm test
```

### Notes

- `next-intl` is ESM — mocked via `moduleNameMapper` in `jest.config.js`
- Async server components (e.g. `HomeTemplate`) are mocked in page tests
- Test IDs for QA automation:

```tsx
<button data-testid="your_test_id_here" />
```

---

## Performance

### CSS Bundle — Tailwind v4 Cleanup

`src/app/globals.css` only defines custom design tokens. All standard Tailwind color utilities (`gray`, `indigo`, `red`, etc.) are provided automatically by `@import "tailwindcss"` and do not need to be redeclared. Removing ~500 lines of redundant `@theme` color variables reduces both file size and CSS output.

```css
/* ✅ Only custom tokens live here */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

### Code Splitting — `next/dynamic`

`BlogForm` (which pulls in `react-hook-form` + `@hookform/resolvers`) is **lazy-loaded** via `next/dynamic`. The form bundle is only downloaded when the user opens the modal for the first time, keeping it out of the initial page load.

```tsx
// CreateBlogButton.tsx
const BlogForm = dynamic(() => import("./BlogForm"), {
  loading: () => <Loader2 className="animate-spin" />,
});
```

### Memoization

**`React.memo`** on `BlogCard` and `ToastItem` — prevents re-render when the parent re-renders but a given item's data has not changed (e.g. a different card was deleted, or a new toast was added).

**`useCallback`** is applied to event handlers that are passed as props or belong to memoized components:

| Component          | Handler         | Dependency                  |
| ------------------ | --------------- | --------------------------- |
| `BlogCard`         | `handleDelete`  | `blog.id, router`           |
| `CreateBlogButton` | `handleOpen`    | —                           |
| `CreateBlogButton` | `handleClose`   | —                           |
| `CreateBlogButton` | `handleKeyDown` | `handleClose`               |
| `ToastItem`        | `dismiss`       | `onRemove, notification.id` |
| `LanguageSwitcher` | `handleChange`  | `router`                    |

### Compression

`compress: true` in `next.config.ts` enables Gzip/Brotli for all responses. `poweredByHeader: false` removes the `X-Powered-By: Next.js` header (fewer bytes + less information exposure).

### Bundle Analysis

Visualise the full JS bundle breakdown with an interactive treemap:

```bash
npm run analyze
```

Opens two reports in the browser — one for the client bundle, one for the server bundle. Use it to identify large dependencies and find further splitting opportunities.

---

## Code Quality

### Pre-commit Hook (Husky)

Runs on every commit:

```bash
npm run check  # lint + test + build
```

### Prettier

Format all files:

```bash
npx prettier --write .
```

Install the Prettier VS Code extension and enable **Format on Save**.

### ESLint

```bash
npm run lint
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
