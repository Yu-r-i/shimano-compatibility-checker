/**
 * src/components/RuleBadge.tsx
 */

import styles from "../styles/RuleBadge.module.css";

interface RuleBadgeProps {
  ok: boolean;
  label?: string;
}

export default function RuleBadge({ ok, label }: RuleBadgeProps) {
  return (
    <span
      className={`${styles.badge} ${ok ? styles.ok : styles.ng}`}
      title={ok ? "互換あり" : "互換なし"}
    >
      {label ?? (ok ? "OK" : "NG")}
    </span>
  );
}
