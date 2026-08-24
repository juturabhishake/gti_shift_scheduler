import { Plus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { matrixLists } from "@/lib/mock-data";

export default function AllListsPage() {
  return (
    <div className="@container/main flex-1">
      <PageHeader
        title="All Lists"
        description="Every product matrix list across your workspace."
      >
        <Button size="sm">
          <Plus className="size-4" />
          New List
        </Button>
      </PageHeader>

      <Card className="gap-4 p-0 py-0">
        <CardContent className="overflow-x-auto px-4 pb-4 pt-4">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">List</th>
                <th className="pb-2 pr-4 font-medium">Owner</th>
                <th className="pb-2 pr-4 font-medium">Items</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {matrixLists.map((list) => (
                <tr key={list.id} className="border-b transition-colors last:border-0 hover:bg-muted/40">
                  <td className="py-2.5 pr-4">
                    <span className="font-mono text-[11px] text-muted-foreground">{list.id}</span>
                    <p className="font-medium">{list.name}</p>
                  </td>
                  <td className="py-2.5 pr-4 text-muted-foreground">{list.owner}</td>
                  <td className="py-2.5 pr-4">
                    <Badge variant="secondary">{list.items}</Badge>
                  </td>
                  <td className="py-2.5 pr-4">
                    <Badge variant={list.items > 30 ? "success" : "info"}>
                      {list.items > 30 ? "Active" : "In Review"}
                    </Badge>
                  </td>
                  <td className="py-2.5 text-xs text-muted-foreground">{list.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}