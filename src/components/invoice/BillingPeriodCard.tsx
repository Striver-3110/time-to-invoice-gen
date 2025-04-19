
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BillingPeriodCardProps {
  startDate: string;
  endDate: string;
}

export const BillingPeriodCard = ({ startDate, endDate }: BillingPeriodCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Billing Period</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="font-medium text-slate-950">Start Date:</dt>
            <dd className="text-slate-950">{format(new Date(startDate), "MMM dd, yyyy")}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-slate-950">End Date:</dt>
            <dd className="text-slate-950">{format(new Date(endDate), "MMM dd, yyyy")}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
};
