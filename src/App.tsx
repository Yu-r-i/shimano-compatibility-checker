import { Routes, Route, Navigate, useLocation, type Location } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/app/app-shell";
import { PartsProvider } from "@/hooks/use-parts";
import DiagnosisPage from "@/pages/diagnosis-page";
import CatalogPage from "@/pages/catalog-page";
import AboutPage from "@/pages/about-page";
import AboutDialogOverlay from "@/components/about-dialog-overlay";
import PartDetailSheet from "@/components/part-detail-sheet";

interface LocationState {
  backgroundLocation?: Location;
}

export default function App() {
  const location = useLocation();
  const state = location.state as LocationState | null;
  const backgroundLocation = state?.backgroundLocation;

  return (
    <PartsProvider>
      <TooltipProvider>
        <Routes location={backgroundLocation ?? location}>
          <Route element={<AppShell />}>
            <Route path="/" element={<DiagnosisPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/catalog/:partId" element={<CatalogPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>

        {backgroundLocation && (
          <Routes>
            <Route path="/catalog/:partId" element={<PartDetailSheet />} />
            <Route path="/about" element={<AboutDialogOverlay />} />
          </Routes>
        )}

        <Toaster />
      </TooltipProvider>
    </PartsProvider>
  );
}
