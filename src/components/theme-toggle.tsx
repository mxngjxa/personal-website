"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (
        e.key === "d" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        setTheme(theme === "dark" ? "light" : "dark");
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [theme, setTheme]);

  return (
    <Button
      className="size-8 print:hidden"
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle dark mode (D)"
      title="Toggle dark mode (D)"
    >
      <SunIcon className="size-4 dark:hidden" aria-hidden="true" />
      <MoonIcon className="hidden size-4 dark:block" aria-hidden="true" />
    </Button>
  );
}
