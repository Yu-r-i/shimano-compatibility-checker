import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useParts } from "@/hooks/use-parts";
import { PartsTable } from "@/components/parts-table";
import { PartDetailContent } from "@/components/part-detail-content";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CATEGORY_META } from "@/components/slot-card";
import type { Part, PartCategory } from "@/types";

const SEARCH_DEBOUNCE_MS = 300;

export default function CatalogPage() {
  const { parts, loading } = useParts();
  const { partId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "all";
  const speed = searchParams.get("speed") ?? "all";

  const [qInput, setQInput] = useState(q);

  useEffect(() => {
    setQInput(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (qInput === q) return;
      const next = new URLSearchParams(searchParams);
      if (qInput) next.set("q", qInput);
      else next.delete("q");
      setSearchParams(next, { replace: true });
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qInput]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (value === "all") next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: true });
  }

  const categories = useMemo(() => {
    const set = new Set(parts.map((p) => p.category));
    return ["all", ...Array.from(set)] as (PartCategory | "all")[];
  }, [parts]);

  const speeds = useMemo(() => {
    const set = new Set(parts.map((p) => p.speed).filter((s): s is number => Boolean(s)));
    return ["all", ...Array.from(set).sort((a, b) => a - b).map(String)];
  }, [parts]);

  const filtered = useMemo(() => {
    return parts.filter((p) => {
      const byCat = category === "all" || p.category === category;
      const bySpeed = speed === "all" || String(p.speed) === speed;
      const byQ =
        !q ||
        [p.id, p.series, p.brand, p.category]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q.toLowerCase());
      return byCat && bySpeed && byQ;
    });
  }, [parts, q, category, speed]);

  const detailPart: Part | undefined = partId ? parts.find((p) => p.id === partId) : undefined;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">カタログ</h1>

      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="ID / シリーズ / ブランドで検索"
          value={qInput}
          onChange={(e) => setQInput(e.target.value)}
          className="max-w-xs"
        />
        <Select value={category} onValueChange={(v) => updateParam("category", v ?? "all")}>
          <SelectTrigger>
            <SelectValue>
              {(v: string) => (v === "all" || !v ? "すべてのカテゴリ" : CATEGORY_META[v as PartCategory].label)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c === "all" ? "すべてのカテゴリ" : CATEGORY_META[c].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={speed} onValueChange={(v) => updateParam("speed", v ?? "all")}>
          <SelectTrigger>
            <SelectValue>{(v: string) => (v === "all" || !v ? "すべての速度段数" : `${v}s`)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {speeds.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "all" ? "すべての速度段数" : `${s}s`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <PartsTable
          parts={filtered}
          onRowClick={(part) =>
            navigate(`/catalog/${encodeURIComponent(part.id)}${location.search}`, {
              state: { backgroundLocation: location },
            })
          }
        />
      )}

      {partId && (
        <Sheet open onOpenChange={(open) => !open && navigate("/catalog" + location.search)}>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>パーツ詳細</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-4">
              {detailPart ? (
                <PartDetailContent part={detailPart} />
              ) : (
                <p className="text-sm text-muted-foreground">パーツが見つかりませんでした。</p>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
