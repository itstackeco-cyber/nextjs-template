"use client";

import { useState, useEffect } from "react";

type Session = {
  userId: string;
  email: string;
} | null;

export function useSession() {
  const [session, setSession] = useState<Session>(
    undefined as unknown as Session
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: Session) => setSession(data))
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, []);

  return { session, loading };
}
