"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Fragment } from "react";
import { Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { navItems, navSecondaryItems } from "@/app/config/navigation";

function findTrail(items, pathname) {
  for (const item of items) {
    if (item.url && item.url !== "#" && (pathname === item.url || pathname.startsWith(item.url + "/"))) {
      return [item];
    }
    if (item.items?.length) {
      const sub = findTrail(item.items, pathname);
      if (sub) return [item, ...sub];
    }
  }
  return null;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const trail = findTrail([...navItems, ...navSecondaryItems], pathname) || [];

  return (
    <Breadcrumb className="hidden min-w-0 flex-1 md:block">
      <BreadcrumbList className="min-w-0 flex-nowrap">
        <BreadcrumbItem className="shrink-0">
          <BreadcrumbLink asChild>
            <Link href="/dashboard" className="flex items-center gap-1">
              <Home className="size-3.5" />
              <span className="hidden xl:inline">Home</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {trail.map((item, i) => {
          const last = i === trail.length - 1;
          return (
            <Fragment key={item.title}>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="min-w-0">
                {last ? (
                  <BreadcrumbPage className="truncate">{item.title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={item.url} className="truncate">{item.title}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}