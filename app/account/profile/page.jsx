"use client";

import { useEffect, useState } from "react";
import { Ban, Building2, CheckCircle2, Crown, KeyRound, Loader2, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { clearStoredAuth, getStoredAuth } from "@/lib/auth";

const accessGroups = [
  { level: 1, title: "User", description: "Standard access", icon: UserRound, tone: "info" },
  { level: 2, title: "Super User", description: "Elevated access", icon: ShieldCheck, tone: "success" },
  { level: 3, title: "Admin", description: "Administrator access", icon: Crown, tone: "warning" },
  { level: 4, title: "Access Denied", description: "Level 0, empty, or revoked", icon: Ban, tone: "danger" },
];

const initialsFor = (name) => (name || "GT").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

export default function AccountProfilePage() {
  const [auth, setAuth] = useState(null);
  const [profile, setProfile] = useState(null);
  const [access, setAccess] = useState([]);
  const [pages, setPages] = useState([]);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = getStoredAuth();
      setAuth(stored);
      if (!stored?.employeeId) {
        setIsProfileLoading(false);
        return;
      }

      Promise.all([
        fetch(`/api/users/profile?empId=${encodeURIComponent(stored.employeeId)}`).then((response) => response.ok ? response.json() : null),
        fetch("/api/access/user-access", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ empId: stored.employeeId }) }).then((response) => response.ok ? response.json() : []),
        fetch("/api/access/getPages").then((response) => response.ok ? response.json() : []),
      ]).then(([profileData, accessData, pageData]) => {
        setProfile(profileData);
        setAccess(Array.isArray(accessData) ? accessData : []);
        setPages(Array.isArray(pageData) ? pageData : []);
      }).catch((error) => {
        console.error("Failed to load profile data:", error);
      }).finally(() => {
        setIsProfileLoading(false);
      });
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const name = profile?.Username || profile?.username || auth?.fullName || auth?.employeeId || "Account";
  const role = profile?.Position || profile?.position || auth?.role || "Team member";
  const department = profile?.department || profile?.Department || auth?.department || "Not specified";
  const pageName = (item) => pages.find((page) => page.id === item.page_id)?.page || item.page || item.url || `Page ${item.page_id}`;
  const accessLevel = (item) => item.access === null || item.access === undefined || item.access === "" || Number(item.access) === 0 ? 4 : Number(item.access);
  const groupedAccess = accessGroups.map((group) => ({
    ...group,
    items: access.filter((item) => accessLevel(item) === group.level),
  }));

  if (isProfileLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="size-8 animate-spin text-primary" aria-label="Loading profile" /></div>;
  }

  return (
    <div className="@container/main flex-1 space-y-4 px-2 pt-2">
      <PageHeader
        title="Profile"
        description="Your account identity and workspace access."
      >
        <Button variant="outline" size="sm" onClick={() => { clearStoredAuth(); window.location.replace("/"); }}><LogOut className="size-4" />Sign out</Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4">
        <Card className="gap-4 overflow-hidden border-primary/10 bg-card/55 p-0 py-0 shadow-lg shadow-primary/5">
          <CardContent className="flex items-center gap-3 px-4 pb-4 pt-4">
            <Avatar className="size-12">
              <AvatarFallback className="bg-primary/10 font-semibold text-primary">{initialsFor(name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{role} · {department}</p>
            </div>
            <Badge variant="success" className="ml-auto"><CheckCircle2 />Active</Badge>
          </CardContent>
        </Card>

        <Card className="gap-4 p-0 py-0">
          <CardContent className="space-y-4 px-4 pb-4 pt-4">
            <h3 className="flex items-center gap-2 text-sm font-medium"><UserRound className="size-4 text-primary" />Account details</h3>
            <div className="grid grid-cols-1 gap-3 @3xl:grid-cols-2">
              {[{ label: "Employee ID", value: auth?.employeeId, icon: KeyRound }, { label: "Full name", value: name, icon: UserRound }, { label: "Role", value: role, icon: ShieldCheck }, { label: "Department", value: department, icon: Building2 }].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl border bg-muted/20 px-3 py-3"><Icon className="size-4 text-primary" /><div><p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p><p className="text-sm font-medium">{value || "Not available"}</p></div></div>
              ))}
            </div>
            <Separator />
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-3"><KeyRound className="size-4 text-emerald-600" /><div><p className="text-[11px] uppercase tracking-wider text-muted-foreground">Credential status</p><p className="text-sm font-medium">Stored securely for session verification</p></div></div>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-3"><div className="flex items-center justify-between"><div><h3 className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="size-4 text-primary" />Page access by level</h3><p className="text-xs text-muted-foreground">Every page is grouped by its current permission level.</p></div><Badge variant="secondary">{access.length} records</Badge></div><div className="grid grid-cols-1 gap-3 @xl:grid-cols-2 @5xl:grid-cols-3">{groupedAccess.map(({ level, title, description, icon: Icon, tone, items }) => <Card key={String(level)} className="overflow-hidden border-foreground/8 bg-card/45 p-0 py-0 shadow-sm"><CardContent className="p-4"><div className="mb-3 flex items-start justify-between gap-3"><div className="flex items-center gap-2.5"><div className={`grid size-9 place-items-center rounded-xl ${tone === "danger" ? "bg-destructive/10 text-destructive" : tone === "success" ? "bg-emerald-500/10 text-emerald-600" : tone === "warning" ? "bg-amber-500/10 text-amber-600" : tone === "info" ? "bg-sky-500/10 text-sky-600" : "bg-muted text-muted-foreground"}`}><Icon className="size-4" /></div><div><p className="text-sm font-semibold">{title}</p><p className="text-[11px] text-muted-foreground">{description}</p></div></div><Badge variant={tone === "danger" ? "destructive" : tone === "success" ? "success" : tone === "warning" ? "warning" : tone === "info" ? "info" : "secondary"}>{items.length}</Badge></div>{items.length ? <div className="space-y-1.5">{items.map((item) => <div key={`${item.page_id}-${item.url}`} className="flex items-center justify-between gap-3 rounded-lg border border-foreground/6 bg-muted/20 px-2.5 py-2"><div className="min-w-0"><p className="truncate text-xs font-medium">{pageName(item)}</p><p className="truncate text-[10px] text-muted-foreground">{item.url || "Workspace page"}</p></div><span className="shrink-0 text-[10px] font-medium text-muted-foreground">Level {item.access ?? 0}</span></div>)}</div> : <p className="rounded-lg border border-dashed border-foreground/10 px-3 py-4 text-center text-xs text-muted-foreground">No pages in this level</p>}</CardContent></Card>)}</div></section>
    </div>
  );
}