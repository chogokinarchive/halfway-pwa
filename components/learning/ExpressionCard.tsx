import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ExpressionItem } from "@/types";

export function ExpressionCard({ item }: { item: ExpressionItem }) {
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <Badge variant="outline">{item.context}</Badge>
        <div className="grid gap-1 sm:grid-cols-2">
          <p className="font-medium">{item.italian}</p>
          <div>
            <p className="font-medium">{item.japanese}</p>
            {item.reading && <p className="text-xs text-muted-foreground">{item.reading}</p>}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{item.english}</p>
      </CardContent>
    </Card>
  );
}
