import { Hono } from "hono";
import { getAllParts, getPartsByCategory } from "../domain/parts";

const parts = new Hono();

parts.get("/", (c) => c.json(getAllParts()));

parts.get("/:category", (c) => {
  const category = c.req.param("category");
  return c.json(getPartsByCategory(category));
});

export default parts;
