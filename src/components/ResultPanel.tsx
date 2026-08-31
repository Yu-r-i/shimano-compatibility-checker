/**
 * src/components/ResultPanel.tsx
 */

import type { CompatibilityResult } from "../types";
import styles from "../styles/ResultPanel.module.css";

interface ResultPanelProps {
  summary: CompatibilityResult | null;
  loading?: boolean;
  error?: string | null;
}

export default function ResultPanel({ summary, loading = false, error = null }: ResultPanelProps) {
  if (loading) {
    return <p className={styles.placeholder}>判定中...</p>;
  }

  if (error) {
    return (
      <div className={`${styles.panel} ${styles.ng}`}>
        <h3 className={styles.title}>結果: エラー ⚠️</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!summary) {
    return <p className={styles.placeholder}>パーツを選択すると結果が表示されます。</p>;
  }

  return (
    <div
      className={`${styles.panel} ${
        summary.ok ? styles.ok : styles.ng
      }`}
    >
      <h3 className={styles.title}>
        結果: {summary.ok ? "互換OK ✅" : "互換NG ❌"}
      </h3>
      {!summary.ok && summary.reasons.length > 0 && (
        <ul className={styles.reasons}>
          {summary.reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
