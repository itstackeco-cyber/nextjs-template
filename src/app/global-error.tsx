"use client";

const MESSAGES = {
  en: {
    title: "Something went wrong!",
    description: "A critical error occurred. Please try again.",
    tryAgain: "Try again",
  },
  de: {
    title: "Etwas ist schiefgelaufen!",
    description:
      "Ein kritischer Fehler ist aufgetreten. Bitte versuche es erneut.",
    tryAgain: "Erneut versuchen",
  },
} as const;

type Locale = keyof typeof MESSAGES;

function getLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
  const locale = match?.[1];
  return locale && locale in MESSAGES ? (locale as Locale) : "en";
}

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = MESSAGES[getLocale()];

  return (
    <html lang={getLocale()}>
      <head>
        <style>{`
          .ge-body  { margin:0; font-family:system-ui,sans-serif; background:#f9fafb; }
          .ge-wrap  { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1rem; padding:1rem; }
          .ge-icon  { padding:0.75rem; background:#fee2e2; border-radius:0.75rem; display:flex; }
          .ge-title { margin:0; font-size:1.25rem; font-weight:600; color:#111827; }
          .ge-desc  { margin:0; font-size:0.875rem; color:#6b7280; }
          .ge-btn   { padding:0.5rem 1rem; font-size:0.875rem; font-weight:500; color:#fff; background:#4f46e5; border:none; border-radius:0.5rem; cursor:pointer; }
          .ge-btn:hover { background:#4338ca; }
        `}</style>
      </head>
      <body className="ge-body">
        <div className="ge-wrap">
          <div className="ge-icon">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/alert-triangle.svg"
              width={28}
              height={28}
              alt=""
            />
          </div>
          <h1 className="ge-title">{t.title}</h1>
          <p className="ge-desc">{t.description}</p>
          <button type="button" onClick={() => reset()} className="ge-btn">
            {t.tryAgain}
          </button>
        </div>
      </body>
    </html>
  );
}
