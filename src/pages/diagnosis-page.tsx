import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";
import { checkCompatibility } from "@/api/client";
import type { CompatibilityResult, Part, PartCategory } from "@/types";
import { useParts } from "@/hooks/use-parts";
import { SlotCard } from "@/components/slot-card";
import { PartPicker } from "@/components/part-picker";
import { ResultRail } from "@/components/result-rail";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

const SLOTS: { category: PartCategory; param: string }[] = [
  { category: "shifter", param: "shifter" },
  { category: "rear_derailleur", param: "rd" },
  { category: "cassette", param: "cassette" },
  { category: "chain", param: "chain" },
];

export default function DiagnosisPage() {
  const { parts, loading: partsLoading } = useParts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [openPicker, setOpenPicker] = useState<PartCategory | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const warnedIds = useRef<Set<string>>(new Set());

  const selection = useMemo(() => {
    const result: Record<PartCategory, Part | null> = {
      shifter: null,
      rear_derailleur: null,
      cassette: null,
      chain: null,
    };
    for (const { category, param } of SLOTS) {
      const id = searchParams.get(param);
      if (!id) continue;
      const match = parts.find((p) => p.category === category && p.id === id);
      if (match) {
        result[category] = match;
      } else if (parts.length > 0 && !warnedIds.current.has(id)) {
        warnedIds.current.add(id);
        toast.error(`指定されたパーツが見つかりませんでした: ${id}`);
      }
    }
    return result;
  }, [parts, searchParams]);

  const selectedCount = SLOTS.filter(({ category }) => selection[category]).length;

  const [summary, setSummary] = useState<CompatibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { shifter, rear_derailleur, cassette, chain } = selection;
    if (!shifter || !rear_derailleur || !cassette || !chain) {
      setSummary(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    checkCompatibility({
      shifterId: shifter.id,
      rearDerailleurId: rear_derailleur.id,
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
          toast.error("互換性チェックに失敗しました");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection.shifter?.id, selection.rear_derailleur?.id, selection.cassette?.id, selection.chain?.id]);

  function handleSelect(category: PartCategory, part: Part) {
    const param = SLOTS.find((s) => s.category === category)!.param;
    const next = new URLSearchParams(searchParams);
    next.set(param, part.id);
    setSearchParams(next, { replace: true });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px] lg:items-start">
      <div className="grid grid-cols-1 gap-4 pb-20 sm:grid-cols-2 lg:pb-0">
        {SLOTS.map(({ category }) =>
          partsLoading ? (
            <Skeleton key={category} className="h-32 w-full rounded-xl" />
          ) : (
            <SlotCard
              key={category}
              category={category}
              part={selection[category]}
              onOpenPicker={() => setOpenPicker(category)}
            />
          )
        )}
      </div>

      <div className="hidden lg:sticky lg:top-20 lg:block">
        <ResultRail selectedCount={selectedCount} summary={summary} loading={loading} error={error} />
      </div>

      {/* mobile: compact fixed bottom summary bar -> Drawer with full result */}
      <button
        type="button"
        onClick={() => setMobileDrawerOpen(true)}
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 flex items-center justify-between border-t bg-background px-4 py-3 text-sm lg:hidden"
        )}
      >
        {selectedCount < 4 ? (
          <span className="text-muted-foreground">{selectedCount}/4選択済み</span>
        ) : loading ? (
          <span className="text-muted-foreground">判定中...</span>
        ) : error ? (
          <span className="flex items-center gap-1.5 text-destructive">
            <XCircle className="size-4" />
            エラー
          </span>
        ) : summary?.ok ? (
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
            互換OK
          </span>
        ) : (
          <span className="flex items-center gap-1.5 font-medium text-destructive">
            <XCircle className="size-4" />
            互換NG
          </span>
        )}
        <span className="text-xs text-muted-foreground underline-offset-4">詳細を見る</span>
      </button>

      <Drawer open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
        <DrawerContent>
          <DrawerHeader className="sr-only">
            <DrawerTitle>診断結果</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">
            <ResultRail selectedCount={selectedCount} summary={summary} loading={loading} error={error} />
          </div>
        </DrawerContent>
      </Drawer>

      {SLOTS.map(({ category }) => (
        <PartPicker
          key={category}
          open={openPicker === category}
          onOpenChange={(open) => setOpenPicker(open ? category : null)}
          category={category}
          parts={parts}
          onSelect={(part) => handleSelect(category, part)}
        />
      ))}
    </div>
  );
}
