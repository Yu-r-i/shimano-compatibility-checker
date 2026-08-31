/**
 * src/components/PartSelector.tsx
 */

import { useMemo } from "react";
import type { Part, PartCategory } from "../types";
import styles from "../styles/PartSelector.module.css";

interface PartSelectorProps {
  parts: Part[];
  category: PartCategory;
  value: Part | null;
  onChange: (part: Part | null) => void;
  label?: string;
  compact?: boolean;
}

export default function PartSelector({
  parts,
  category,
  value,
  onChange,
  label,
  compact = false,
}: PartSelectorProps) {
  const list = useMemo(
    () => parts.filter((p) => p.category === category),
    [parts, category]
  );

  return (
    <label className={`${styles.wrapper} ${compact ? styles.compact : ""}`}>
      <span className={styles.label}>
        {label ?? `Select ${category}`}
      </span>
      <select
        className={styles.select}
        value={value?.id || ""}
        onChange={(e) =>
          onChange(list.find((p) => p.id === e.target.value) || null)
        }
      >
        <option value="">-- choose --</option>
        {list.map((p) => (
          <option key={p.id} value={p.id}>
            {p.id} · {p.series}{p.speed ? ` · ${p.speed}s` : ""}
          </option>
        ))}
      </select>

      {value && (
        <div className={styles.meta}>
          <span className={styles.badge}>{value.category}</span>
          {value.speed && <span className={styles.badge}>{value.speed}s</span>}
          {value.brake_type && (
            <span className={styles.badge}>{value.brake_type}</span>
          )}
        </div>
      )}
    </label>
  );
}
