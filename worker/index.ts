import { Hono } from "hono";
import parts from "./routes/parts";
import compatibility from "./routes/compatibility";
import type { Env } from "./types";

const app = new Hono<{ Bindings: Env }>();

app.route("/api/parts", parts);
app.route("/api/compatibility", compatibility);

app.notFound((c) => c.json({ error: "Not Found" }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

export default app;
