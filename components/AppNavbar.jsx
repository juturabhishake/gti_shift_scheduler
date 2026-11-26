"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { AppSidebar } from "./AppSidebar";
import { Breadcrumbs } from "./Breadcrumbs";
import { ProfileMenu } from "./ProfileMenu";
import { ThemeToggle } from "./ThemeToggle";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function AppNavbar({ collapsed, onToggleSidebar }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className={cn(
      "fixed left-3 right-3 top-3 z-30 flex h-14 items-center gap-3 rounded-2xl border border-foreground/8 bg-card/75 px-4 shadow-lg shadow-black/20 backdrop-blur-2xl backdrop-saturate-150 transition-[left] duration-300",
      collapsed ? "md:left-[5.5rem]" : "md:left-[17.5rem]"
    )}>
      <button
        className="flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:hidden"
        aria-label="Open navigation"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="size-5" />
      </button>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="hidden size-8 shrink-0 place-items-center rounded-lg border border-foreground/10 bg-background/35 text-muted-foreground shadow-sm transition-all hover:border-primary/30 hover:bg-primary/10 hover:text-primary md:grid"
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>
        <span className="bg-gradient-to-r from-amber-500 to-emerald-500 bg-clip-text text-sm font-bold tracking-tight text-transparent">
          <span className="hidden min-[390px]:inline">Greentech Industries</span><span className="min-[390px]:hidden">GTI</span>
        </span>
      </div>

      <Breadcrumbs />

      <div className="ml-auto flex items-center gap-1.5">
        <ThemeToggle />
        <ProfileMenu />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="glass-sidebar w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">Sidebar navigation</SheetDescription>
          <AppSidebar collapsed={false} onNavigate={() => setMobileOpen(false)} embedded />
        </SheetContent>
      </Sheet>
    </header>
  );
}