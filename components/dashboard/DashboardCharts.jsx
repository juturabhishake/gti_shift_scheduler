"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { monthlyActivity, statusData, trendData } from "@/lib/mock-data";

const axisTick = { fill: "var(--muted-foreground)", fontSize: 11 };

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md backdrop-blur-xl">
      <p className="mb-1 font-medium text-muted-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-2">
          <span
            className="size-2 rounded-full"
            style={{ background: entry.color || entry.payload?.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

export function DashboardCharts() {
  const total = statusData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="grid grid-cols-1 gap-4 @2xl:grid-cols-2">
      <Card className="gap-4 p-0 py-0">
        <CardHeader className="px-4 pt-4">
          <CardTitle className="text-sm">Task Completion Trend</CardTitle>
          <CardDescription>Completed vs created, last 7 days</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="gCreated" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gDone" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-3)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--chart-3)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={axisTick} />
                <YAxis tickLine={false} axisLine={false} tick={axisTick} width={40} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="created" stroke="var(--primary)" strokeWidth={2} fill="url(#gCreated)" name="Created" />
                <Area type="monotone" dataKey="completed" stroke="var(--chart-3)" strokeWidth={2} fill="url(#gDone)" name="Completed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card className="gap-4 p-0 py-0">
        <CardHeader className="px-4 pt-4">
          <CardTitle className="text-sm">Monthly Activity</CardTitle>
          <CardDescription>Tasks created per month</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyActivity} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={axisTick} />
                <YAxis tickLine={false} axisLine={false} tick={axisTick} width={40} />
                <Tooltip cursor={{ fill: "var(--muted)" }} content={<ChartTooltip />} />
                <Bar dataKey="tasks" name="Tasks" radius={[6, 6, 0, 0]} className="fill-primary/80" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card className="gap-4 p-0 py-0">
        <CardHeader className="px-4 pt-4">
          <CardTitle className="text-sm">Status Distribution</CardTitle>
          <CardDescription>Breakdown of all tasks</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4 px-4 pb-4">
          <div className="relative size-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={46}
                  outerRadius={70}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-semibold">{total}</span>
              <span className="text-[11px] text-muted-foreground">Total</span>
            </div>
          </div>
          <ul className="flex min-w-0 flex-1 flex-col gap-2">
            {statusData.map((entry) => (
              <li key={entry.name} className="flex items-center gap-2 text-sm">
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: entry.color }} />
                <span className="text-muted-foreground">{entry.name}</span>
                <span className="ml-auto font-medium">{entry.value}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card className="gap-4 p-0 py-0">
        <CardHeader className="px-4 pt-4">
          <CardTitle className="text-sm">Focus Areas</CardTitle>
          <CardDescription>Where your team spends time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4">
          {[
            { label: "Billing & Invoicing", value: 34, tone: "bg-primary" },
            { label: "Data Migration", value: 22, tone: "bg-sky-500" },
            { label: "Security Review", value: 18, tone: "bg-emerald-500" },
            { label: "UX Refinement", value: 12, tone: "bg-amber-500" },
          ].map((d) => (
            <div key={d.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{d.label}</span>
                <span className="font-medium">{d.value}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className={`h-full rounded-full ${d.tone}`} style={{ width: `${d.value}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}