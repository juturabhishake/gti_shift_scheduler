"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/* Is `pathname` equal to or inside this item's subtree? */
export function isInActiveTree(pathname, item) {
  if (item.url && item.url !== "#" && (pathname === item.url || pathname.startsWith(item.url + "/"))) {
    return true;
  }
  if (item.items?.some((child) => isInActiveTree(pathname, child))) {
    return true;
  }
  return false;
}

function isActive(pathname, item) {
  return !!item.url && item.url !== "#" && pathname === item.url;
}

/* ---------------------------------------------------------------------------
 * Expanded sidebar: collapsible folder tree
 * ------------------------------------------------------------------------- */
function ExpandedItem({ item, pathname, onNavigate }) {
  const hasChildren = !!item.items?.length;
  const active = isActive(pathname, item);
  const activeInTree = hasChildren && isInActiveTree(pathname, item);
  const [open, setOpen] = useState(activeInTree);

  if (!hasChildren) {
    return (
      <li>
        <Link
          href={item.url}
          onClick={onNavigate}
          aria-current={active ? "page" : undefined}
          className={cn(
            "group relative flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-all duration-150",
            active
              ? "bg-primary/10 font-medium text-primary"
              : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          {item.icon && <item.icon className="size-4 shrink-0 text-current" />}
          <span className="truncate">{item.title}</span>
          {active && <span className="accent-dot" aria-hidden="true" />}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "flex h-9 w-full items-center gap-3 rounded-md px-3 text-sm transition-all duration-150",
              activeInTree || active
                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            {item.icon && <item.icon className="size-4 shrink-0 text-current" />}
            <span className="flex-1 truncate text-left">{item.title}</span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                open && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <ul className="relative ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-2.5">
            {item.items.map((child) => (
              <ExpandedItem
                key={child.title}
                item={child}
                pathname={pathname}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}

function ExpandedNav({ items, pathname, onNavigate }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <ExpandedItem key={item.title} item={item} pathname={pathname} onNavigate={onNavigate} />
      ))}
    </ul>
  );
}

/* ---------------------------------------------------------------------------
 * Collapsed sidebar: floating flyout menus (nested dropdown submenus)
 * ------------------------------------------------------------------------- */
function FlyoutItems({ items, pathname, onNavigate }) {
  return items.map((item) => {
    const hasChildren = !!item.items?.length;
    const active = isActive(pathname, item);
    const activeInTree = isInActiveTree(pathname, item);

    if (hasChildren) {
      return (
        <DropdownMenuSub key={item.title}>
          <DropdownMenuSubTrigger
            className={cn(activeInTree && "bg-accent font-medium text-accent-foreground")}
          >
            {item.icon && <item.icon className="size-4" />}
            <span className="truncate">{item.title}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-64">
            <FlyoutItems items={item.items} pathname={pathname} onNavigate={onNavigate} />
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      );
    }

    return (
      <DropdownMenuItem
        key={item.title}
        asChild
        onClick={onNavigate}
        data-active={active || undefined}
        className="data-[active=true]:bg-primary/10 data-[active=true]:font-medium data-[active=true]:text-primary"
      >
        <Link href={item.url} className="flex w-full items-center gap-2">
          {item.icon && <item.icon className="size-4" />}
          <span className="truncate">{item.title}</span>
        </Link>
      </DropdownMenuItem>
    );
  });
}

function FlyoutTopLevel({ item, pathname, onNavigate }) {
  const hasChildren = !!item.items?.length;
  const active = isActive(pathname, item);
  const activeInTree = isInActiveTree(pathname, item);
  const triggerClasses = cn(
    "flex h-10 w-full items-center justify-center rounded-md transition-colors",
    active || activeInTree
      ? "bg-primary/10 text-primary"
      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
  );

  return (
    <li>
      <Tooltip>
        <TooltipTrigger asChild>
          {hasChildren ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={triggerClasses} aria-label={item.title}>
                  {item.icon && <item.icon className="size-5" />}
                  <span className="sr-only">{item.title}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className="w-64">
                <DropdownMenuLabel className="flex items-center gap-2">
                  {item.icon && <item.icon className="size-4" />}
                  <span className="truncate">{item.title}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <FlyoutItems items={item.items} pathname={pathname} onNavigate={onNavigate} />
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href={item.url}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={triggerClasses}
            >
              {item.icon && <item.icon className="size-5" />}
              <span className="sr-only">{item.title}</span>
            </Link>
          )}
        </TooltipTrigger>
        <TooltipContent side="right">{item.title}</TooltipContent>
      </Tooltip>
    </li>
  );
}

function FlyoutNav({ items, pathname, onNavigate }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <FlyoutTopLevel key={item.title} item={item} pathname={pathname} onNavigate={onNavigate} />
      ))}
    </ul>
  );
}

/* ---------------------------------------------------------------------------
 * Public entry: pick the renderer based on collapse state
 * ------------------------------------------------------------------------- */
export function NavRecursive({ items, collapsed, pathname, onNavigate }) {
  if (collapsed) {
    return <FlyoutNav items={items} pathname={pathname} onNavigate={onNavigate} />;
  }
  return <ExpandedNav items={items} pathname={pathname} onNavigate={onNavigate} />;
}