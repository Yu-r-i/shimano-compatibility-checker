import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Part } from "@/types";
import { CATEGORY_META } from "@/components/slot-card";

function detailBadges(part: Part): string[] {
  const badges: string[] = [];
  if (part.actuation) badges.push(part.actuation);
  if (part.freehub) badges.push(part.freehub);
  if (part.brake_type) badges.push(part.brake_type);
  if (typeof part.max_sprocket === "number") badges.push(`max ${part.max_sprocket}T`);
  if (Array.isArray(part.range)) badges.push(`${part.range[0]}–${part.range[1]}T`);
  if (part.chain_type) badges.push(part.chain_type);
  return badges;
}

interface PartsTableProps {
  parts: Part[];
  onRowClick: (part: Part) => void;
}

export function PartsTable({ parts, onRowClick }: PartsTableProps) {
  if (parts.length === 0) {
    return <p className="text-sm text-muted-foreground">条件に一致するパーツがありません。</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>カテゴリ</TableHead>
            <TableHead>シリーズ / ブランド</TableHead>
            <TableHead>速度段数</TableHead>
            <TableHead>詳細</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parts.map((part) => (
            <TableRow
              key={part.id}
              onClick={() => onRowClick(part)}
              className="cursor-pointer"
            >
              <TableCell className="font-mono">{part.id}</TableCell>
              <TableCell>{CATEGORY_META[part.category].label}</TableCell>
              <TableCell>
                {part.series ?? "-"}
                {part.brand ? ` / ${part.brand}` : ""}
              </TableCell>
              <TableCell>{part.speed ? `${part.speed}s` : "-"}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {detailBadges(part).map((b) => (
                    <Badge key={b} variant="outline" className="text-xs">
                      {b}
                    </Badge>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
