
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ClientCardProps {
  name: string;
  email: string;
}

export const ClientCard = ({ name, email }: ClientCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Client</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-semibold text-foreground">{name}</p>
        <p className="text-sm text-muted-foreground">{email}</p>
      </CardContent>
    </Card>
  );
};
