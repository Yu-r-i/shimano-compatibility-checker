import { Hono } from "hono";
import { getPartsByIds } from "../domain/parts";
import { evaluateSelection } from "../domain/compatibility";
import type { CompatibilitySelection, Env, Part, PartCategory } from "../types";

const compatibility = new Hono<{ Bindings: Env }>();

const CATEGORIES: PartCategory[] = [
  "shifter",
  "brake_lever",
  "front_derailleur",
  "rear_derailleur",
  "crankset",
  "bottom_bracket",
  "cassette",
  "freewheel",
  "chain",
  "brake_caliper",
  "disc_rotor",
  "hub",
  "pedal",
];

compatibility.post("/check", async (c) => {
  const body = await c
    .req.json<CompatibilitySelection>()
    .catch((): CompatibilitySelection => ({}));

  const entries = CATEGORIES
    .map((category) => [category, body[category]] as const)
    .filter((entry): entry is [PartCategory, string] => Boolean(entry[1]));

  if (entries.length < 2) {
    return c.json(
      { error: "互換性チェックには2カテゴリ以上のパーツ選択が必要です" },
      400
    );
  }

  const ids = entries.map(([, id]) => id);
  const partsById = await getPartsByIds(c.env.DB, ids);

  const missing = ids.filter((id) => !partsById.has(id));
  if (missing.length > 0) {
    return c.json({ error: `指定された part ID が見つかりません: ${missing.join(", ")}` }, 400);
  }

  const selected: Partial<Record<PartCategory, Part>> = {};
  for (const [category, id] of entries) {
    selected[category] = partsById.get(id);
  }

  const summary = evaluateSelection(selected);
  return c.json(summary);
});

export default compatibility;
