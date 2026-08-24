import { Boxes, Database, FileText, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const facts = [
  { icon: Boxes, label: "Modules", value: "6 active" },
  { icon: Database, label: "Data Sources", value: "12 connected" },
  { icon: FileText, label: "Documentation", value: "v2.4.0" },
  { icon: ShieldCheck, label: "Compliance", value: "SOC2 ready" },
];

export default function InformationPage() {
  return (
    <div className="@container/main flex-1 px-2 pt-2">
      <PageHeader
        title="Information"
        description="Platform status, versions, and supporting details."
      >
        <Badge variant="success">All systems operational</Badge>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2 @3xl:grid-cols-4">
        {facts.map((fact) => (
          <Card key={fact.label} className="gap-3 p-0 py-0">
            <CardContent className="flex items-center gap-3 px-4 py-4">
              <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <fact.icon className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs text-muted-foreground">{fact.label}</p>
                <p className="truncate text-sm font-medium">{fact.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}