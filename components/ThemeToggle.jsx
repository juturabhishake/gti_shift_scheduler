"use client";

import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Toggle theme" className="relative">
          <Sun className="size-4 scale-100 rotate-0 transition-all duration-300 dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute size-4 scale-0 rotate-90 transition-all duration-300 dark:scale-100 dark:rotate-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {[
          { value: "light", label: "Light", icon: Sun },
          { value: "dark", label: "Dark", icon: Moon },
          { value: "system", label: "System", icon: Monitor },
        ].map((mode) => (
          <DropdownMenuItem key={mode.value} onClick={() => setTheme(mode.value)}>
            <mode.icon className="size-4 text-muted-foreground" />
            {mode.label}
            {theme === mode.value && <Check className="ml-auto size-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}