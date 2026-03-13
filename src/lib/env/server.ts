/**
 * Server-only environment variables.
 * These are NEVER exposed to the browser.
 * Import this file only in server components, API routes, or server actions.
 */

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const serverEnv = {
  DATABASE_URL: requireEnv("DATABASE_URL", process.env["DATABASE_URL"]),

  BASE_URL: process.env["BASE_URL"] ?? "http://localhost:3000",

  NODE_ENV: process.env["NODE_ENV"] ?? "development",
} as const;
