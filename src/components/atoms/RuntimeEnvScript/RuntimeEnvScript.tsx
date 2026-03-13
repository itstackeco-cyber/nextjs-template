import { getPublicEnvForRuntime } from "@/lib/env/public";

export default function RuntimeEnvScript({ nonce }: { nonce?: string }) {
  const config = getPublicEnvForRuntime();
  const json = JSON.stringify(config)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

  return (
    <script
      nonce={nonce}
      dangerouslySetInnerHTML={{
        __html: `window.__RUNTIME_CONFIG__ = ${json};`,
      }}
    />
  );
}
