import {
  Cog,
  Hand,
  GitFork,
  GitBranch,
  Settings2,
  CircleDotDashed,
  Disc3,
  Disc2,
  Link2,
  Octagon,
  Disc,
  CircleGauge,
  Footprints,
  type LucideIcon,
} from "lucide-react";
import type { Part, PartCategory } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const CATEGORY_META: Record<PartCategory, { label: string; icon: LucideIcon }> = {
  shifter: { label: "Shifter", icon: Cog },
  brake_lever: { label: "Brake Lever", icon: Hand },
  front_derailleur: { label: "Front Derailleur", icon: GitFork },
  rear_derailleur: { label: "Rear Derailleur", icon: GitBranch },
  crankset: { label: "Crankset", icon: Settings2 },
  bottom_bracket: { label: "Bottom Bracket", icon: CircleDotDashed },
  cassette: { label: "Cassette", icon: Disc3 },
  freewheel: { label: "Freewheel", icon: Disc2 },
  chain: { label: "Chain", icon: Link2 },
  brake_caliper: { label: "Brake Caliper", icon: Octagon },
  disc_rotor: { label: "Disc Rotor", icon: Disc },
  hub: { label: "Hub / Wheel", icon: CircleGauge },
  pedal: { label: "Pedal", icon: Footprints },
};

export const CATEGORY_ORDER: PartCategory[] = [
  "shifter",
  "brake_lever",
  "front_derailleur",
  "rear_derailleur",
  "crankset",
  "bottom_bracket",
  "cassette",
  "freewheel",
  "chain",
  "brake_caliper",
  "disc_rotor",
  "hub",
  "pedal",
];

function specBadges(part: Part) {
  const badges: string[] = [];
  if (part.speed) badges.push(`${part.speed}s`);
  if (part.actuation) badges.push(part.actuation);
  if (part.freehub) badges.push(part.freehub);
  if (part.brake_type) badges.push(part.brake_type);
  if (part.disc_mount) badges.push(part.disc_mount);
  if (part.crank_spindle) badges.push(part.crank_spindle);
  if (part.cleat_type) badges.push(part.cleat_type);
  if (typeof part.rotor_size === "number") badges.push(`${part.rotor_size}mm`);
  if (typeof part.max_sprocket === "number") badges.push(`max ${part.max_sprocket}T`);
  return badges;
}

interface SlotCardProps {
  category: PartCategory;
  part: Part | null;
  onOpenPicker: () => void;
  disabledReason?: string;
}

export function SlotCard({ category, part, onOpenPicker, disabledReason }: SlotCardProps) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;
  const disabled = Boolean(disabledReason);

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onOpenPicker}
      disabled={disabled}
      aria-disabled={disabled}
      className={cn(
        "w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        disabled && "cursor-not-allowed"
      )}
    >
      <Card
        className={cn(
          "h-full transition-colors",
          !disabled && "hover:bg-accent/40",
          !part && !disabled && "border border-dashed border-muted-foreground/30 bg-transparent shadow-none ring-0",
          disabled && "border border-dashed border-muted-foreground/20 bg-muted/30 shadow-none ring-0 opacity-60"
        )}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="size-4" />
            {meta.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {disabled ? (
            <p className="text-xs text-muted-foreground">{disabledReason}</p>
          ) : part ? (
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
