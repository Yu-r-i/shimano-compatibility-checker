import { Fragment } from "react";
import type { Part } from "@/types";
import { Badge } from "@/components/ui/badge";

const CATEGORY_LABEL: Record<Part["category"], string> = {
  shifter: "Shifter",
  rear_derailleur: "Rear Derailleur",
  cassette: "Cassette",
  chain: "Chain",
};

export function PartDetailContent({ part }: { part: Part }) {
  const rows: [string, string][] = [];
  rows.push(["カテゴリ", CATEGORY_LABEL[part.category]]);
  if (part.brand) rows.push(["ブランド", part.brand]);
  if (part.series) rows.push(["シリーズ", part.series]);
  if (part.speed) rows.push(["速度段数", `${part.speed}s`]);
  if (part.actuation) rows.push(["アクチュエーション", part.actuation]);
  if (part.brake_type) rows.push(["ブレーキ種別", part.brake_type]);
  if (part.mount_type) rows.push(["マウント", part.mount_type]);
  if (part.brake_pull) rows.push(["レバー引き量", part.brake_pull]);
  if (part.segment) rows.push(["セグメント", part.segment]);
  if (typeof part.max_sprocket === "number") rows.push(["最大スプロケット", String(part.max_sprocket)]);
  if (typeof part.capacity === "number") rows.push(["キャパシティ", String(part.capacity)]);
  if (part.cage) rows.push(["ケージ", part.cage]);
  if (part.freehub) rows.push(["フリーハブ", part.freehub]);
  if (Array.isArray(part.range)) rows.push(["歯数レンジ", `${part.range[0]}–${part.range[1]}`]);
  if (part.chain_type) rows.push(["チェーンタイプ", part.chain_type]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-mono text-lg font-semibold break-all">{part.id}</h2>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <Badge variant="secondary">{CATEGORY_LABEL[part.category]}</Badge>
          {part.speed ? <Badge variant="outline">{part.speed}s</Badge> : null}
        </div>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        {rows.map(([label, value]) => (
          <Fragment key={label}>
            <dt className="text-muted-foreground">{label}</dt>
            <dd>{value}</dd>
          </Fragment>
        ))}
      </dl>
    </div>
  );
}
