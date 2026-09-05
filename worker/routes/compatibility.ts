import { Hono } from "hono";
import { getPartById } from "../domain/parts";
import {
  checkChainVsCassette,
  checkRDvsCassette,
  checkShifterRearDerailleur,
  summarize,
} from "../domain/compatibility";
import type { CompatibilitySelection, Env } from "../types";

const compatibility = new Hono<{ Bindings: Env }>();

compatibility.post("/check", async (c) => {
  const body = await c
    .req.json<Partial<CompatibilitySelection>>()
    .catch((): Partial<CompatibilitySelection> => ({}));
  const { shifterId, rearDerailleurId, cassetteId, chainId } = body;

  if (!shifterId || !rearDerailleurId || !cassetteId || !chainId) {
    return c.json(
      { error: "shifterId, rearDerailleurId, cassetteId, chainId は全て必須です" },
      400
    );
  }

  const [shifter, rearDerailleur, cassette, chain] = await Promise.all([
    getPartById(c.env.DB, shifterId),
    getPartById(c.env.DB, rearDerailleurId),
    getPartById(c.env.DB, cassetteId),
    getPartById(c.env.DB, chainId),
  ]);

  if (!shifter || !rearDerailleur || !cassette || !chain) {
    return c.json({ error: "指定された part ID が見つかりません" }, 400);
  }

  const summary = summarize([
    checkShifterRearDerailleur(shifter, rearDerailleur),
    checkRDvsCassette(rearDerailleur, cassette),
    checkChainVsCassette(chain, cassette),
  ]);

  return c.json(summary);
});

export default compatibility;
