import { useNavigate, useParams } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PartDetailContent } from "@/components/part-detail-content";
import { useParts } from "@/hooks/use-parts";

export default function PartDetailSheet() {
  const navigate = useNavigate();
  const { partId } = useParams();
  const { parts } = useParts();
  const part = parts.find((p) => p.id === partId);

  return (
    <Sheet open onOpenChange={(open) => !open && navigate(-1)}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>パーツ詳細</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-4">
          {part ? (
            <PartDetailContent part={part} />
          ) : (
            <p className="text-sm text-muted-foreground">パーツが見つかりませんでした。</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
