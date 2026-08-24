"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PanelLeftClose, PanelLeftOpen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems, navSecondaryItems } from "@/app/config/navigation";
import { NavRecursive } from "./NavRecursive";
import { SidebarProfile } from "./SidebarProfile";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getStoredAuth, redirectToLogin } from "@/lib/auth";

export function AppSidebar({ collapsed = false, onToggle, onNavigate, embedded = false }) {
  const pathname = usePathname();
  const [items, setItems] = useState([]);
  const [secondaryItems, setSecondaryItems] = useState([]);
  const [user, setUser] = useState({ name: "", role: "", initials: "GT" });

  useEffect(() => {
    let active = true;
    const loadNavigation = async () => {
      try {
        const auth = getStoredAuth();
        const { employeeId, fullName, role } = auth || {};
        if (!employeeId || !auth.password) {
          redirectToLogin();
          return;
        }
        if (active) {
          setUser({
            name: fullName || employeeId,
            role: role || "Team member",
            initials: (fullName || employeeId).split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
          });
        }
        const response = await fetch("/api/access/user-access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ empId: employeeId }),
        });
        if (response.status === 401) {
          redirectToLogin();
          return;
        }
        const accessList = await response.json();
        const canOpen = (url, adminOnly = false) => {
          const entry = accessList.find((access) => access.url === url);
          return entry && (adminOnly ? entry.access === 3 : entry.access !== 4);
        };
        const filterTree = (tree) => tree.reduce((result, item) => {
          const children = item.items ? filterTree(item.items) : [];
          if (children.length || (!item.items && canOpen(item.url))) {
            result.push(children.length ? { ...item, items: children } : item);
          }
          return result;
        }, []);
        if (active) {
          setItems(filterTree(navItems));
          setSecondaryItems(navSecondaryItems.filter((item) => canOpen(item.url, item.adminOnly)));
        }
      } catch (error) {
        console.warn("Unable to load navigation access", error);
        redirectToLogin();
      }
    };
    loadNavigation();
    return () => { active = false; };
  }, []);

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "glass-sidebar flex flex-col border-r transition-all duration-300 ease-in-out",
          embedded
            ? "h-full w-full"
            : "fixed inset-y-0 left-0 z-40",
          !embedded && (collapsed ? "w-16" : "w-64")
        )}
        aria-label="Primary navigation"
      >
        {!embedded && (
          <button
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "absolute top-4 -right-3 z-50 grid size-6 place-items-center rounded-full border border-sidebar-border bg-background/90 text-muted-foreground shadow-md ring-1 ring-black/5 backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:border-primary/30 hover:bg-accent hover:text-primary",
              collapsed && "rotate-180"
            )}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-3.5 transition-transform duration-300" />
            ) : (
              <PanelLeftClose className="size-3.5 transition-transform duration-300" />
            )}
          </button>
        )}

        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-3">
          <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
            <Sparkles className="size-4" />
          </div>
          <span
            className={cn(
              "truncate text-sm font-bold tracking-tight transition-all duration-300",
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}
          >
            <span className="hidden min-[390px]:inline">Greentech Industries</span><span className="min-[390px]:hidden">GTI</span>
          </span>
        </div>

        <nav className={cn("flex-1 overflow-y-auto py-3", collapsed ? "px-2" : "px-3")}>
          <NavRecursive items={items} collapsed={collapsed} pathname={pathname} onNavigate={onNavigate} />
          {secondaryItems.length > 0 && (
            <div className="mt-4 border-t border-sidebar-border pt-3">
              <NavRecursive items={secondaryItems} collapsed={collapsed} pathname={pathname} onNavigate={onNavigate} />
            </div>
          )}
        </nav>

        <SidebarProfile collapsed={collapsed} user={user} />
      </aside>
    </TooltipProvider>
  );
}