import { Save, Send } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CreatePage() {
  return (
    <div className="@container/main flex-1">
      <PageHeader
        title="Create Matrix"
        description="Draft a new product matrix definition."
      >
        <Button variant="outline" size="sm">
          <Save className="size-4" />
          Save Draft
        </Button>
        <Button size="sm">
          <Send className="size-4" />
          Publish
        </Button>
      </PageHeader>

      <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4">
        <Card className="gap-5 p-0 py-0">
          <CardHeader className="px-4 pt-4">
            <CardTitle className="text-sm">Definition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4 pb-4">
            <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Matrix Name</Label>
                <Input id="name" placeholder="e.g. Product Matrix — Core" defaultValue="Product Matrix — Core" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="owner">Owner</Label>
                <Input id="owner" placeholder="Assign owner" defaultValue="Abhishake Jutur" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 @xl:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="version">Version</Label>
                <Input id="version" placeholder="v1.0.0" defaultValue="v2.4.0" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="h-9 w-full rounded-md border bg-transparent px-3 text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none"
                  defaultValue="staged"
                >
                  <option value="draft">Draft</option>
                  <option value="staged">Staged</option>
                  <option value="review">In Review</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the purpose and scope of this matrix"
                defaultValue="Core product matrix tracking release readiness across billing, data, and UX tracks."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}