import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AboutContent } from "@/components/about-content";

export default function AboutDialogOverlay() {
  const navigate = useNavigate();

  return (
    <Dialog open onOpenChange={(open) => !open && navigate(-1)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>このツールについて</DialogTitle>
        </DialogHeader>
        <AboutContent />
      </DialogContent>
    </Dialog>
  );
}
