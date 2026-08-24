import { FilePlus2, KanbanSquare, ListChecks, Plus } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const actions = [
  { label: "Create Matrix", href: "/product_matrix/create", icon: FilePlus2 },
  { label: "Open Task Board", href: "/tasks/board", icon: KanbanSquare },
  { label: "All Lists", href: "/product_matrix/view/all_list", icon: ListChecks },
  { label: "My Work List", href: "/product_matrix/view/my_work_list", icon: ListChecks },
];

export function QuickActions() {
  return (
    <Card className="gap-4 p-0 py-0">
      <CardHeader className="px-4 pt-4">
        <CardTitle className="text-sm">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="grid grid-cols-1 gap-2 @lg:grid-cols-2">
          {actions.map((action) => (
            <Button key={action.label} variant="outline" asChild className="justify-start px-3">
              <Link href={action.href} className="flex items-center gap-2.5">
                <action.icon className="size-4 text-muted-foreground" />
                {action.label}
              </Link>
            </Button>
          ))}
        </div>
        <Button size="sm" className="mt-3 w-full">
          <Plus className="size-4" />
          New Task
        </Button>
      </CardContent>
    </Card>
  );
}