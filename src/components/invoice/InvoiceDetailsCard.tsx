
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { InvoiceStatus } from "@/lib/types";
import type { Invoice } from "@/lib/types";

interface InvoiceDetailsCardProps {
  invoice: Invoice;
}

export const InvoiceDetailsCard = ({ invoice }: InvoiceDetailsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Details</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="font-medium">Status:</dt>
            <dd>
              <InvoiceStatusBadge status={invoice.status} />
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium">Invoice Date:</dt>
            <dd>{format(new Date(invoice.invoiceDate), "MMM dd, yyyy")}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium">Due Date:</dt>
            <dd>{format(new Date(invoice.dueDate), "MMM dd, yyyy")}</dd>
          </div>
          {invoice.paymentDate && (
            <div className="flex justify-between">
              <dt className="font-medium">Payment Date:</dt>
              <dd>{format(new Date(invoice.paymentDate), "MMM dd, yyyy")}</dd>
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  );
};
