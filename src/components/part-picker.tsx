import { useMemo, useState } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { Part, PartCategory } from "@/types";
import { CATEGORY_META } from "@/components/slot-card";

interface PartPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: PartCategory;
  parts: Part[];
  onSelect: (part: Part) => void;
}

function specLine(part: Part) {
  const bits: string[] = [];
  if (part.speed) bits.push(`${part.speed}s`);
  if (part.actuation) bits.push(part.actuation);
  if (part.freehub) bits.push(part.freehub);
  return bits.join(" · ");
}

export function PartPicker({ open, onOpenChange, category, parts, onSelect }: PartPickerProps) {
  const [query, setQuery] = useState("");
  const meta = CATEGORY_META[category];

  const candidates = useMemo(() => parts.filter((p) => p.category === category), [parts, category]);

  return (
    <CommandDialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setQuery("");
      }}
      title={`${meta.label}を選択`}
      description="ID・シリーズで検索できます"
      showCloseButton
    >
      <Command>
        <CommandInput placeholder={`${meta.label}を検索...`} value={query} onValueChange={setQuery} />
        <CommandList>
          <CommandEmpty>該当するパーツが見つかりません。</CommandEmpty>
          <CommandGroup heading={meta.label}>
            {candidates.map((part) => (
              <CommandItem
                key={part.id}
                value={`${part.id} ${part.series ?? ""} ${part.brand ?? ""}`}
                onSelect={() => {
                  onSelect(part);
                  onOpenChange(false);
                  setQuery("");
                }}
              >
                <div className="flex flex-col">
                  <span className="font-mono text-sm">{part.id}</span>
                  <span className="text-xs text-muted-foreground">
                    {part.series ?? "-"}
                    {specLine(part) ? ` · ${specLine(part)}` : ""}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
