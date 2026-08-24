import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { activityFeed } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const toneClasses = {
  emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  sky: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  violet: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  rose: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
};

export function DashboardActivity() {
  return (
    <Card className="gap-4 p-0 py-0">
      <CardHeader className="flex-row items-center justify-between px-4 pt-4">
        <CardTitle className="text-sm">Recent Activity</CardTitle>
        <Link
          href="/tasks/board"
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          View all <ArrowRight className="size-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <ul className="space-y-1">
          {activityFeed.map((activity) => (
            <li key={activity.id} className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold",
                  toneClasses[activity.tone]
                )}
              >
                {activity.initials}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm">
                <span className="font-medium">{activity.user}</span>{" "}
                <span className="text-muted-foreground">{activity.action}</span>{" "}
                <span className="font-medium">{activity.target}</span>
              </span>
              <Badge variant="outline" className="hidden shrink-0 sm:inline-flex">
                {activity.time}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}