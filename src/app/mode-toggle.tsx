import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/app/theme-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="テーマ切り替え" />}>
        <Sun className="scale-100 rotate-0 dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute scale-0 rotate-90 dark:scale-100 dark:rotate-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>ライト</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>ダーク</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>システム</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
