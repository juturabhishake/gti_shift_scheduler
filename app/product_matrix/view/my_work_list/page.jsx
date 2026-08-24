import { PageHeader } from "@/components/PageHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { matrixLists } from "@/lib/mock-data";

export default function MyWorkListPage() {
  const mine = [matrixLists[0], matrixLists[1]];

  return (
    <div className="@container/main flex-1">
      <PageHeader
        title="My Work List"
        description="Matrices you own or contribute to."
      />

      <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
        {mine.map((list) => (
          <Card key={list.id} className="gap-4 p-0 py-0">
            <CardContent className="space-y-3 px-4 pb-4 pt-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-mono text-[11px] text-muted-foreground">{list.id}</span>
                  <h3 className="truncate font-medium">{list.name}</h3>
                </div>
                <Badge variant="info">My List</Badge>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Avatar className="size-6">
                  <AvatarFallback className="bg-primary/10 text-[10px] text-primary">AJ</AvatarFallback>
                </Avatar>
                {list.owner} · {list.items} items
              </div>
              <Progress value={Math.min(100, list.items * 2.2)} className="h-1.5" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Updated {list.updated}</span>
                <span className="font-medium">{Math.round(list.items * 2.2)}% complete</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}