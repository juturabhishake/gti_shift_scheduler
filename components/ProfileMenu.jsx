"use client";

import {
  LayoutDashboard,
  LogOut,
  Info,
  ShieldCheck,
  User,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { clearStoredAuth, getStoredAuth, redirectToLogin } from "@/lib/auth";

const menuItems = [
  { label: "Profile", href: "/account/profile", icon: User },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Access Management", href: "/access_management", icon: ShieldCheck },
  { label: "Information", href: "/information", icon: Info },
];

export function ProfileMenuContent({ onSelect }) {
  const [user, setUser] = useState({ name: "Account", role: "Team member", initials: "GT" });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const auth = getStoredAuth();
      const name = auth?.fullName || auth?.employeeId;
      const role = auth?.role;
      if (!auth?.employeeId || !auth.password) {
        redirectToLogin();
        return;
      }
      if (name) setUser({ name, role: role || "Team member", initials: name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      <DropdownMenuLabel className="flex items-center gap-3 p-2">
        <Avatar className="size-9 rounded-lg">
          <AvatarFallback className="rounded-lg bg-primary/10 font-semibold text-primary">
            {user.initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col">
          <span className="text-sm font-medium text-foreground">{user.name}</span>
          <span className="truncate text-[11px] text-muted-foreground">{user.role}</span>
        </div>
      </DropdownMenuLabel>

      <DropdownMenuSeparator />

      {menuItems.map((item) => (
        <DropdownMenuItem key={item.label} asChild>
          <Link href={item.href} onClick={onSelect} className="flex w-full items-center gap-2.5">
            <item.icon className="size-4 text-muted-foreground" />
            {item.label}
          </Link>
        </DropdownMenuItem>
      ))}

      <DropdownMenuSeparator />

      <DropdownMenuItem asChild className="text-destructive focus:bg-destructive/10 focus:text-destructive">
        <Link href="/" onClick={() => { clearStoredAuth(); onSelect?.(); }} className="flex w-full items-center gap-2.5">
          <LogOut className="size-4" />
          Logout
        </Link>
      </DropdownMenuItem>
    </>
  );
}

export function ProfileMenu() {
  const [user, setUser] = useState({ name: "Account", initials: "GT" });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const auth = getStoredAuth();
      const name = auth?.fullName || auth?.employeeId;
      if (!auth?.employeeId || !auth.password) {
        redirectToLogin();
        return;
      }
      if (name) setUser({ name, initials: name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-full p-1 transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
          aria-label="Account menu"
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <span className="hidden items-center gap-1 pr-1 text-sm font-medium lg:flex">
            {user.name}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <ProfileMenuContent />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}