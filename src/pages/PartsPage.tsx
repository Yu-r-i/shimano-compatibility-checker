/**
 * src/pages/PartsPage.tsx
 */

import { useEffect, useMemo, useState } from "react";
import { getParts } from "../api/client";
import PartCard from "../components/PartCard";
import type { Part } from "../types";
import styles from "../styles/PartsPage.module.css";

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [speed, setSpeed] = useState<string>("all");

  useEffect(() => {
    getParts().then(setParts);
  }, []);

  const categories = useMemo(() => {
    const set = new Set(parts.map((p) => p.category));
    return ["all", ...Array.from(set)];
  }, [parts]);

  const speeds = useMemo(() => {
    const set = new Set(parts.map((p) => p.speed).filter((s): s is number => Boolean(s)));
    return ["all", ...Array.from(set).sort((a, b) => a - b)];
  }, [parts]);

  const filtered = useMemo(() => {
    return parts.filter((p) => {
      const byCat = category === "all" || p.category === category;
      const bySpeed = speed === "all" || String(p.speed) === String(speed);
      const byQ =
        !q ||
        [p.id, p.series, p.brand, p.category]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q.toLowerCase());
      return byCat && bySpeed && byQ;
    });
  }, [parts, q, category, speed]);

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Parts List</h2>

      <div className={styles.controls}>
        <input
          className={styles.search}
          placeholder="Search id / series / brand"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className={styles.select}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className={styles.select}
          value={speed}
          onChange={(e) => setSpeed(e.target.value)}
        >
          {speeds.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.grid}>
        {filtered.map((p) => (
          <PartCard key={p.id} part={p} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className={styles.empty}>No parts matched your filters.</p>
      )}
    </div>
  );
}
