"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { navItems, navSecondaryItems } from "@/app/config/navigation";
import { NavRecursive } from "./NavRecursive";
import { SidebarProfile } from "./SidebarProfile";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getStoredAuth, redirectToLogin } from "@/lib/auth";

export function AppSidebar({ collapsed = false, onNavigate, embedded = false }) {
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
          "glass-sidebar flex flex-col transition-all duration-300 ease-in-out",
          embedded
            ? "h-full w-full"
            : "fixed inset-y-3 left-3 z-40 h-[calc(100dvh-1.5rem)] rounded-3xl",
          !embedded && (collapsed ? "w-16" : "w-64")
        )}
        aria-label="Primary navigation"
      >
        <div className="mx-2 mt-2 flex h-14 shrink-0 items-center gap-2 px-2">
          <Image
            src="/icon.png"
            alt="Greentech Industries"
            width={32}
            height={32}
            className={cn("shrink-0 object-contain transition-all duration-300", collapsed ? "size-8" : "size-6")}
          />
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
            <div className="mx-1 mt-4 border-t border-sidebar-border/70 pt-3">
              <NavRecursive items={secondaryItems} collapsed={collapsed} pathname={pathname} onNavigate={onNavigate} />
            </div>
          )}
        </nav>

        <SidebarProfile collapsed={collapsed} user={user} />
      </aside>
    </TooltipProvider>
  );
}