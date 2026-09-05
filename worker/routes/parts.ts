import { Hono } from "hono";
import { getAllParts, getPartsByCategory } from "../domain/parts";
import type { Env } from "../types";

const parts = new Hono<{ Bindings: Env }>();

parts.get("/", async (c) => c.json(await getAllParts(c.env.DB)));

parts.get("/:category", async (c) => {
  const category = c.req.param("category");
  return c.json(await getPartsByCategory(c.env.DB, category));
});

export default parts;
