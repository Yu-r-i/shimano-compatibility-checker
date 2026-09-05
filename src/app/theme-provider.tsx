import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export { useTheme } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      storageKey="shimano-ui-theme"
      enableSystem
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
