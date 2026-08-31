/**
 * src/pages/CompatibilityPage.tsx
 */

import { useEffect, useState } from "react";
import PartSelector from "../components/PartSelector";
import ResultPanel from "../components/ResultPanel";
import { checkCompatibility, getParts } from "../api/client";
import type { CompatibilityResult, Part } from "../types";
import styles from "../styles/CompatibilityPage.module.css";

export default function CompatibilityPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [shifter, setShifter] = useState<Part | null>(null);
  const [rd, setRd] = useState<Part | null>(null);
  const [cassette, setCassette] = useState<Part | null>(null);
  const [chain, setChain] = useState<Part | null>(null);

  const [summary, setSummary] = useState<CompatibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getParts().then(setParts);
  }, []);

  useEffect(() => {
    if (!shifter || !rd || !cassette || !chain) {
      setSummary(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    checkCompatibility({
      shifterId: shifter.id,
      rearDerailleurId: rd.id,
      cassetteId: cassette.id,
      chainId: chain.id,
    })
      .then((result) => {
        if (!cancelled) setSummary(result);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setSummary(null);
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [shifter, rd, cassette, chain]);

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Compatibility Checker</h2>
      <div className={styles.selectorGrid}>
        <PartSelector
          parts={parts}
          category="shifter"
          value={shifter}
          onChange={setShifter}
          label="Shifter"
        />
        <PartSelector
          parts={parts}
          category="rear_derailleur"
          value={rd}
          onChange={setRd}
          label="Rear Derailleur"
        />
        <PartSelector
          parts={parts}
          category="cassette"
          value={cassette}
          onChange={setCassette}
          label="Cassette"
        />
        <PartSelector
          parts={parts}
          category="chain"
          value={chain}
          onChange={setChain}
          label="Chain"
        />
      </div>
      <ResultPanel summary={summary} loading={loading} error={error} />
    </div>
  );
}
