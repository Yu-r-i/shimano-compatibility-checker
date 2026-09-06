import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";
import { checkCompatibility } from "@/api/client";
import type { CompatibilityResult, CompatibilitySelection, Part, PartCategory } from "@/types";
import { useParts } from "@/hooks/use-parts";
import { SlotCard } from "@/components/slot-card";
import { PartPicker } from "@/components/part-picker";
import { ResultRail } from "@/components/result-rail";
import { CATEGORY_ORDER } from "@/components/slot-card";
import { computeDisabledSlots, resolveExclusiveConflicts } from "@/lib/exclusive-rules";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

const MIN_SELECTION_FOR_CHECK = 2;

export default function DiagnosisPage() {
  const { parts, loading: partsLoading } = useParts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [openPicker, setOpenPicker] = useState<PartCategory | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const warnedIds = useRef<Set<string>>(new Set());

  const selection = useMemo(() => {
    const result = {} as Record<PartCategory, Part | null>;
    for (const category of CATEGORY_ORDER) {
      const id = searchParams.get(category);
      result[category] = null;
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

  const selectedEntries = CATEGORY_ORDER.filter((category) => selection[category]);
  const selectedCount = selectedEntries.length;
  const selectionKey = selectedEntries.map((c) => `${c}:${selection[c]!.id}`).join("|");

  const disabledSlots = useMemo(() => computeDisabledSlots(selection), [selection]);

  // URL共有・直接編集等でUIの事前防止をすり抜けた「あり得ない組み合わせ」を自己修復する。
  useEffect(() => {
    if (partsLoading) return;
    const next = new URLSearchParams(searchParams);
    const findPart = (category: PartCategory, id: string) =>
      parts.find((p) => p.category === category && p.id === id);
    const { changed, messages } = resolveExclusiveConflicts(next, findPart);
    if (changed) {
      setSearchParams(next, { replace: true });
      for (const message of messages) toast(message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, parts, partsLoading]);

  const [summary, setSummary] = useState<CompatibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCount < MIN_SELECTION_FOR_CHECK) {
      setSummary(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const payload: CompatibilitySelection = {};
    for (const category of selectedEntries) {
      payload[category] = selection[category]!.id;
    }

    checkCompatibility(payload)
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
  }, [selectionKey]);

  function handleSelect(category: PartCategory, part: Part) {
    const next = new URLSearchParams(searchParams);
    next.set(category, part.id);
    setSearchParams(next, { replace: true });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px] lg:items-start">
      <div className="grid grid-cols-2 gap-4 pb-20 sm:grid-cols-3 xl:grid-cols-4 lg:pb-0">
        {CATEGORY_ORDER.map((category) =>
          partsLoading ? (
            <Skeleton key={category} className="h-32 w-full rounded-xl" />
          ) : (
            <SlotCard
              key={category}
              category={category}
              part={selection[category]}
              onOpenPicker={() => setOpenPicker(category)}
              disabledReason={disabledSlots[category]}
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
        {selectedCount < MIN_SELECTION_FOR_CHECK ? (
          <span className="text-muted-foreground">{selectedCount}/{CATEGORY_ORDER.length}選択済み</span>
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

      {CATEGORY_ORDER.map((category) => (
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
