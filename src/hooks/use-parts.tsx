import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getParts } from "@/api/client";
import type { Part } from "@/types";

interface PartsContextValue {
  parts: Part[];
  loading: boolean;
  error: string | null;
}

const PartsContext = createContext<PartsContextValue | null>(null);

export function PartsProvider({ children }: { children: ReactNode }) {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getParts()
      .then((data) => {
        if (!cancelled) setParts(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <PartsContext.Provider value={{ parts, loading, error }}>{children}</PartsContext.Provider>;
}

export function useParts() {
  const ctx = useContext(PartsContext);
  if (!ctx) throw new Error("useParts must be used within a PartsProvider");
  return ctx;
}
