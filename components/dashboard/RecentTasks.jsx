import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { recentTasks } from "@/lib/mock-data";

const statusVariant = {
  "In Progress": "info",
  Pending: "warning",
  Completed: "success",
};

const priorityClass = {
  High: "text-rose-500",
  Medium: "text-amber-500",
  Low: "text-muted-foreground",
};

export function RecentTasks() {
  return (
    <Card className="gap-4 p-0 py-0">
      <CardHeader className="flex-row items-center justify-between px-4 pt-4">
        <CardTitle className="text-sm">Recent Tasks</CardTitle>
        <Link
          href="/tasks/board"
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          View board <ArrowRight className="size-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="overflow-x-auto px-4 pb-4">
        <table className="w-full min-w-[480px] text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="pb-2 pr-4 font-medium">ID</th>
              <th className="pb-2 pr-4 font-medium">Title</th>
              <th className="pb-2 pr-4 font-medium">Status</th>
              <th className="pb-2 pr-4 font-medium">Priority</th>
              <th className="pb-2 font-medium">Due</th>
            </tr>
          </thead>
          <tbody>
            {recentTasks.map((task) => (
              <tr key={task.id} className="border-b last:border-0">
                <td className="py-2.5 pr-4 font-mono text-xs text-muted-foreground">{task.id}</td>
                <td className="py-2.5 pr-4 font-medium">{task.title}</td>
                <td className="py-2.5 pr-4">
                  <Badge variant={statusVariant[task.status]}>{task.status}</Badge>
                </td>
                <td className={`py-2.5 pr-4 text-xs font-medium ${priorityClass[task.priority]}`}>
                  {task.priority}
                </td>
                <td className="py-2.5 text-xs text-muted-foreground">{task.due}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}