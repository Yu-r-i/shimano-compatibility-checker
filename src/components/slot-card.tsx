import { Cog, GitBranch, Disc3, Link2, type LucideIcon } from "lucide-react";
import type { Part, PartCategory } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const CATEGORY_META: Record<PartCategory, { label: string; icon: LucideIcon }> = {
  shifter: { label: "Shifter", icon: Cog },
  rear_derailleur: { label: "Rear Derailleur", icon: GitBranch },
  cassette: { label: "Cassette", icon: Disc3 },
  chain: { label: "Chain", icon: Link2 },
};

function specBadges(part: Part) {
  const badges: string[] = [];
  if (part.speed) badges.push(`${part.speed}s`);
  if (part.actuation) badges.push(part.actuation);
  if (part.freehub) badges.push(part.freehub);
  if (part.brake_type) badges.push(part.brake_type);
  if (typeof part.max_sprocket === "number") badges.push(`max ${part.max_sprocket}T`);
  return badges;
}

interface SlotCardProps {
  category: PartCategory;
  part: Part | null;
  onOpenPicker: () => void;
}

export function SlotCard({ category, part, onOpenPicker }: SlotCardProps) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={onOpenPicker}
      className="w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card
        className={cn(
          "h-full transition-colors hover:bg-accent/40",
          !part && "border border-dashed border-muted-foreground/30 bg-transparent shadow-none ring-0"
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="size-4" />
            {meta.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {part ? (
            <div className="space-y-2">
              <p className="font-mono text-sm font-semibold break-all">{part.id}</p>
              {part.series && <p className="text-xs text-muted-foreground">{part.series}</p>}
              <div className="flex flex-wrap gap-1">
                {specBadges(part).map((b) => (
                  <Badge key={b} variant="secondary" className="text-xs">
                    {b}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground underline-offset-4 group-hover/card:underline">
                変更する
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">タップして選択</p>
          )}
        </CardContent>
      </Card>
    </button>
  );
}
