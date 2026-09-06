import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { CompatibilityResult } from "@/types";
import { CATEGORY_ORDER } from "@/components/slot-card";

const MIN_SELECTION_FOR_CHECK = 2;
const TOTAL_CATEGORIES = CATEGORY_ORDER.length;

interface ResultRailProps {
  selectedCount: number;
  summary: CompatibilityResult | null;
  loading: boolean;
  error: string | null;
}

export function ResultRail({ selectedCount, summary, loading, error }: ResultRailProps) {
  const ready = selectedCount >= MIN_SELECTION_FOR_CHECK;

  return (
    <Card>
      <CardHeader>
        <CardTitle>診断結果</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Progress value={(selectedCount / TOTAL_CATEGORIES) * 100} />
          <p className="text-sm text-muted-foreground">
            {selectedCount}/{TOTAL_CATEGORIES}選択済み
            {!ready && ` — あと${MIN_SELECTION_FOR_CHECK - selectedCount}つ選択すると判定できます`}
          </p>
        </div>

        {ready && loading && (
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}

        {ready && !loading && error && (
          <div className="space-y-1 text-destructive">
            <p className="flex items-center gap-2 font-medium">
              <XCircle className="size-5" />
              エラー
            </p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {ready && !loading && !error && summary && (
          <div className="space-y-2">
            {summary.ok ? (
              <p className="flex items-center gap-2 font-medium text-foreground">
                <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                互換OK
              </p>
            ) : (
              <p className="flex items-center gap-2 font-medium text-destructive">
                <XCircle className="size-5" />
                互換NG
              </p>
            )}
            {!summary.ok && summary.reasons.length > 0 && (
              <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                {summary.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            )}
            {summary.ok && summary.reasons.length === 0 && (
              <p className="text-sm text-muted-foreground">
                選択中のパーツ間に既知の互換ルールが定義されているペアはすべて適合しています。
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
