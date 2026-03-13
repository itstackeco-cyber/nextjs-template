import { getPublicEnv } from "@/lib/env/public";

export function getBaseUrl(): string {
  return getPublicEnv().NEXT_PUBLIC_APP_URL;
}
