/**
 * src/api/client.ts
 *
 * Worker (Hono API) との通信を担う薄いクライアント。
 * パーツデータと互換性判定ロジックは Worker 側が唯一の正であり、
 * ここでは結果をそのまま返すだけで判定ロジックは持たない。
 */

import type { CompatibilityResult, CompatibilitySelection, Part, PartCategory } from "../types";

async function getJson<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = body?.error ?? `Request failed: ${res.status}`;
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export function getParts(): Promise<Part[]> {
  return getJson<Part[]>("/api/parts");
}

export function getPartsByCategory(category: PartCategory): Promise<Part[]> {
  return getJson<Part[]>(`/api/parts/${category}`);
}

export function checkCompatibility(selection: CompatibilitySelection): Promise<CompatibilityResult> {
  return getJson<CompatibilityResult>("/api/compatibility/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(selection),
  });
}
