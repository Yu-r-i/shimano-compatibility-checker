/**
 * src/components/PartCard.tsx
 */

import type { ReactNode } from "react";
import type { Part } from "../types";
import styles from "../styles/PartCard.module.css";

interface PartCardProps {
  part: Part | null | undefined;
  action?: ReactNode;
}

export default function PartCard({ part, action }: PartCardProps) {
  if (!part) return null;

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <h4 className={styles.id}>{part.id}</h4>
        {part.series && <div className={styles.series}>{part.series}</div>}
      </div>

      <div className={styles.body}>
        <dl className={styles.specs}>
          <div>
            <dt>Category</dt>
            <dd>{part.category}</dd>
          </div>
          {part.brand && (
            <div>
              <dt>Brand</dt>
              <dd>{part.brand}</dd>
            </div>
          )}
          {"speed" in part && (
            <div>
              <dt>Speed</dt>
              <dd>{part.speed ?? "-"}</dd>
            </div>
          )}
          {part.actuation && (
            <div>
              <dt>Actuation</dt>
              <dd>{part.actuation}</dd>
            </div>
          )}
          {part.brake_type && (
            <div>
              <dt>Brake</dt>
              <dd>{part.brake_type}</dd>
            </div>
          )}
          {part.brake_pull && (
            <div>
              <dt>Brake Pull</dt>
              <dd>{part.brake_pull}</dd>
            </div>
          )}
          {Array.isArray(part.range) && (
            <div>
              <dt>Range</dt>
              <dd>{part.range[0]}–{part.range[1]}</dd>
            </div>
          )}
          {"max_sprocket" in part && (
            <div>
              <dt>RD Max</dt>
              <dd>{part.max_sprocket}</dd>
            </div>
          )}
          {"capacity" in part && (
            <div>
              <dt>Capacity</dt>
              <dd>{part.capacity}</dd>
            </div>
          )}
          {part.freehub && (
            <div>
              <dt>Freehub</dt>
              <dd>{part.freehub}</dd>
            </div>
          )}
          {part.chain_type && (
            <div>
              <dt>Chain Type</dt>
              <dd>{part.chain_type}</dd>
            </div>
          )}
        </dl>
      </div>

      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
