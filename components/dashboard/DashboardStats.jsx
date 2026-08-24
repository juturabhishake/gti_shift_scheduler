import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  ListTodo,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { taskStats } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const icons = {
  total: ListTodo,
  completed: CheckCircle2,
  pending: Clock3,
  inProgress: Loader2,
};

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2 @3xl:grid-cols-4">
      {taskStats.map((stat) => {
        const Icon = icons[stat.key];
        return (
          <Card
            key={stat.key}
            className="group flex-row items-center gap-4 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-muted-foreground">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-semibold tracking-tight">{stat.value}</span>
                <span
                  className={cn(
                    "flex items-center gap-0.5 text-xs font-medium",
                    stat.up ? "text-emerald-500" : "text-rose-500"
                  )}
                >
                  {stat.up ? (
                    <ArrowUpRight className="size-3.5" />
                  ) : (
                    <ArrowDownRight className="size-3.5" />
                  )}
                  {stat.change}
                </span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}