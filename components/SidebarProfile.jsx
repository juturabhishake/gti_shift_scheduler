"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ProfileMenuContent } from "./ProfileMenu";

export function SidebarProfile({ collapsed, user }) {
  return (
    <div className={cn("shrink-0 border-t border-sidebar-border", collapsed ? "p-0" : "p-2")}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex w-full items-center gap-3 rounded-lg p-2 transition-colors hover:bg-sidebar-accent",
              collapsed && "justify-center gap-0 p-2"
            )}
            aria-label={`${user.name || "Account"} — open account menu`}
          >
            <Avatar className="size-8 shrink-0">
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {user.initials || "GT"}
              </AvatarFallback>
            </Avatar>
            <span
              className={cn(
                "flex min-w-0 flex-col items-start transition-all duration-300",
                collapsed && "w-0 overflow-hidden opacity-0"
              )}
            >
              <span className="truncate text-sm font-medium text-sidebar-foreground">
                {user.name || "Account"}
              </span>
              <span className="truncate text-[11px] text-muted-foreground">
                {user.role || "Team member"}
              </span>
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" sideOffset={8} className="w-60">
          <ProfileMenuContent />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}