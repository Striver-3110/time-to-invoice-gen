
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsListProps {
  title: string;
  items: { label: string; value: number }[];
}

export function StatsList({ title, items }: StatsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
