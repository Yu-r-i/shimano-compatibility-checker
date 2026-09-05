import { Outlet, Link, NavLink, useLocation } from "react-router-dom";
import { Bike } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ModeToggle } from "@/app/mode-toggle";
import { cn } from "@/lib/utils";

/**
 * PartsProvider is mounted higher up (in App.tsx), not here — the modal-route
 * overlays (PartDetailSheet) render as siblings of AppShell, not inside its
 * <Outlet/>, and still need access to the shared parts list.
 */
export function AppShell() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <Bike className="size-5" />
            <span>Shimano Compatibility Checker</span>
          </Link>
          <nav className="flex items-center gap-2">
            <NavLink
              to="/catalog"
              className={({ isActive }) =>
                cn(buttonVariants({ variant: isActive ? "secondary" : "ghost", size: "sm" }))
              }
            >
              カタログ
            </NavLink>
            <ModeToggle />
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t px-4 py-4">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <Link
            to="/about"
            state={{ backgroundLocation: location }}
            className="underline-offset-4 hover:underline"
          >
            このツールについて
          </Link>
          <p>本アプリはShimano社と提携していません。</p>
        </div>
      </footer>
    </div>
  );
}
