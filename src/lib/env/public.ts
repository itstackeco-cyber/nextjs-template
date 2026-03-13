/**
 * Public runtime environment variables.
 *
 * How it works:
 * - On the server, values are read directly from process.env.
 * - On the client, values are read from window.__RUNTIME_CONFIG__
 *   which is injected by <RuntimeEnvScript /> in the root layout.
 *
 * This allows Docker images to be built once and configured at runtime
 * without NEXT_PUBLIC_ variables being baked into the bundle at build time.
 */

export interface PublicEnv {
  NEXT_PUBLIC_APP_URL: string;
}

declare global {
  interface Window {
    __RUNTIME_CONFIG__: PublicEnv;
  }
}

export function getPublicEnvForRuntime(): PublicEnv {
  return {
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  };
}

export function getPublicEnv(): PublicEnv {
  if (typeof window === "undefined") {
    // Server
    return getPublicEnvForRuntime();
  }
  // Client
  return window.__RUNTIME_CONFIG__;
}
