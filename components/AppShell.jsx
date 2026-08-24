"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "./AppSidebar";
import { AppNavbar } from "./AppNavbar";
import { cn } from "@/lib/utils";
import { getStoredAuth, redirectToLogin } from "@/lib/auth";

export function AppShell({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/") return;

    let active = true;
    const verifyCredentials = async () => {
      const auth = getStoredAuth();
      if (!auth?.employeeId || !auth.password) {
        redirectToLogin();
        return;
      }

      try {
        const response = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employeeId: auth.employeeId, password: auth.password, DB: "GTI_PM" }),
        });
        if (response.status === 401 && active) redirectToLogin();
      } catch (error) {
        console.warn("Unable to verify credentials", error);
      }
    };

    verifyCredentials();
    return () => { active = false; };
  }, [pathname]);

  if (pathname === "/") {
    return children;
  }

  return (
    <div className="min-h-dvh bg-transparent">
      <div className="hidden md:block">
        <AppSidebar collapsed={collapsed} />
      </div>

      <div
        className={cn(
          "flex h-dvh min-h-0 flex-col transition-all duration-300",
          collapsed ? "md:pl-[5.5rem]" : "md:pl-[17.5rem]"
        )}
      >
        <AppNavbar collapsed={collapsed} onToggleSidebar={() => setCollapsed((v) => !v)} />
        <main key={pathname} className="animate-fade-up mt-[4.0rem] h-[calc(100dvh-5.25rem)] min-h-0 flex-none overflow-y-auto px-4 pb-4 pt-4 md:px-1 md:pb-5">
          {children}
        </main>
      </div>
    </div>
  );
}